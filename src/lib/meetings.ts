import { z } from "zod";

/*
 * Upcoming meetings for the departure board and calendar, read from Epsilon
 * (the Student Union's club platform, a Supabase/PostgREST API).
 *
 * Epsilon only shows meetings to signed-in users, so the request needs an
 * officer's Epsilon session token in EPSILON_ACCESS_TOKEN (server-only, never
 * committed). Those tokens expire after about an hour; when it's missing or
 * expired the board falls back to `manualMeetings` below (later: meetings
 * entered in the dashboard). Only meeting fields are requested, never members.
 */

export type MeetingStatus = "scheduled" | "cancelled" | "moved";

export type Meeting = {
	id: string;
	title: string;
	/**
	Meeting-type code from the Meetings page (FSD, CLP, PCI, ATC, SLC).
	*/
	code?: string;
	start: string; // ISO 8601
	end?: string;
	room?: string;
	status: MeetingStatus;
	description?: string;
};

/**
Hand-entered meetings, used when Epsilon can't be reached.
*/
export const manualMeetings: Meeting[] = [
	{
		id: "epsilon-10069",
		title: "StuyAviators Interest Meeting",
		start: "2026-10-16T19:35:00Z",
		end: "2026-10-16T21:00:00Z",
		room: "313",
		status: "scheduled",
		description:
			"Welcome to StuyAviators! We will be hosting our interest meeting where we will go over club events, future plans, and answer any questions you may have. Pull up!",
	},
];

const epsilonMeeting = z.object({
	id: z.number(),
	title: z.string(),
	description: z.string().nullable().optional(),
	start_time: z.string(),
	end_time: z.string().nullable().optional(),
	is_public: z.boolean().optional(),
	rooms: z.object({ name: z.string() }).nullable().optional(),
});

const meetingList = z.array(z.unknown()).default([]);
const epsilonResponse = z.array(z.object({ meetings: meetingList }));

const codes = ["FSD", "CLP", "PCI", "ATC", "SLC"];

export function parseEpsilonMeetings(data: unknown): Meeting[] {
	const parsed = epsilonResponse.safeParse(data);
	if (!parsed.success) {
		throw new Error("Unexpected Epsilon response");
	}

	const meetings: Meeting[] = [];
	for (const raw of parsed.data[0]?.meetings ?? []) {
		const result = epsilonMeeting.safeParse(raw);
		if (!result.success || result.data.is_public === false) {
			continue;
		}

		const meeting = result.data;
		const title = meeting.title.trim();
		meetings.push({
			id: `epsilon-${meeting.id}`,
			title,
			code: codes.find((code) =>
				new RegExp(String.raw`\b${code}\b`, "u").test(title)
			),
			start: meeting.start_time,
			end: meeting.end_time ?? undefined,
			room: meeting.rooms?.name,
			status: /cancel/iu.test(title) ? "cancelled" : "scheduled",
			description: meeting.description ?? undefined,
		});
	}

	return meetings;
}

async function fetchEpsilonMeetings(): Promise<Meeting[]> {
	const token = process.env.EPSILON_ACCESS_TOKEN;
	if (!token) {
		throw new Error("EPSILON_ACCESS_TOKEN not set");
	}

	const base = process.env.EPSILON_API_URL ?? "https://base.stuysu.org";
	// Epsilon's public "anon" key, shipped in its own web app.
	const apiKey =
		process.env.EPSILON_API_KEY ??
		"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiYW5vbiIsImlzcyI6InN1cGFiYXNlIiwiaWF0IjoxNzg3OTY4Mzk2LCJleHAiOjE5NDU2NDgzOTZ9.Ajo4QUjgnsVUYKjTW7rdDYOUpLI3X-A7SWQFVtFrhmg";
	const slug = process.env.EPSILON_ORG_URL ?? "stuyaviators";
	const url = new URL("/rest/v1/organizations", base);
	url.searchParams.set(
		"select",
		"meetings(id,is_public,title,description,start_time,end_time,rooms(name))"
	);
	url.searchParams.set("url", `ilike.${slug}`);
	const response = await fetch(url, {
		headers: { apikey: apiKey, Authorization: `Bearer ${token}` },
		next: { revalidate: 900, tags: ["meetings"] },
		signal: AbortSignal.timeout(5000),
	});
	if (!response.ok) {
		throw new Error(`Epsilon responded ${response.status}`);
	}

	return parseEpsilonMeetings(await response.json());
}

export async function getUpcomingMeetings(
	now = new Date(),
	limit = 6
): Promise<Meeting[]> {
	let meetings: Meeting[];
	try {
		meetings = await fetchEpsilonMeetings();
	} catch {
		meetings = manualMeetings;
	}

	return meetings
		.filter((meeting) => new Date(meeting.end ?? meeting.start) >= now)
		.toSorted((a, b) => a.start.localeCompare(b.start))
		.slice(0, limit);
}
