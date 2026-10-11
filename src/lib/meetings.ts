import { getDb } from "@/db";
import { epsilonConfig, getEpsilonAccessToken } from "@/lib/epsilon-token";
import { z } from "zod";

/*
 * Upcoming meetings for the departure board and calendar, read from Epsilon
 * (the Student Union's club platform, a Supabase/PostgREST API).
 *
 * Epsilon only shows meetings to signed-in users, so the request needs an
 * officer's Epsilon session. An admin stores a long-lived refresh token in the
 * dashboard (Settings → Epsilon; see epsilon-token.ts), which is exchanged for
 * hourly access tokens. EPSILON_ACCESS_TOKEN (server-only) still works as a
 * short-lived override. With neither, the board falls back to
 * `manualMeetings` below. Only meeting fields are requested, never members.
 */

export const meetingsTag = "meetings";

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

async function accessToken(): Promise<string | undefined> {
	const db = getDb();
	if (db) {
		try {
			const token = await getEpsilonAccessToken(db);
			if (token) {
				return token;
			}
		} catch (error) {
			console.error("Could not load the Epsilon token", error);
		}
	}

	return process.env.EPSILON_ACCESS_TOKEN || undefined;
}

export async function fetchEpsilonMeetings(
	token?: string
): Promise<Meeting[]> {
	const bearer = token ?? (await accessToken());
	if (!bearer) {
		throw new Error("No Epsilon token");
	}

	const { base, apiKey, slug } = epsilonConfig();
	const url = new URL("/rest/v1/organizations", base);
	url.searchParams.set(
		"select",
		"meetings(id,is_public,title,description,start_time,end_time,rooms(name))"
	);
	url.searchParams.set("url", `ilike.${slug}`);
	const response = await fetch(url, {
		headers: { apikey: apiKey, Authorization: `Bearer ${bearer}` },
		next: { revalidate: 900, tags: [meetingsTag] },
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
