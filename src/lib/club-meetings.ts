import type { Database } from "@/db";
import type { Meeting } from "@/lib/meetings";
import { meetings as meetingsContent } from "@/content/meetings";
import { getDb } from "@/db";
import { clubMeetings } from "@/db/schema";
import { instantToNewYork, newYorkToInstant } from "@/lib/ny-time";
import { and, asc, eq, isNull } from "drizzle-orm";
import { unstable_cache } from "next/cache";
import { z } from "zod";

/*
 * Meetings an officer adds by hand in the dashboard. They show on the
 * departure board and the calendar next to the ones read from Epsilon, so the
 * board still works when Epsilon can't be read.
 */

export const meetingsTag = "meetings";

export type ClubMeeting = typeof clubMeetings.$inferSelect;

export const meetingStatuses = ["scheduled", "moved", "cancelled"] as const;
export const meetingStatusLabels: Record<
	(typeof meetingStatuses)[number],
	string
> = {
	scheduled: "On time",
	moved: "Moved",
	cancelled: "Cancelled",
};

/**
The meeting types an officer can pick: the codes from the Meetings page.
*/
export const meetingTypes = meetingsContent.types.flatMap((type) =>
	type.code ? [{ code: type.code, name: type.name }] : []
);

const dateAndTime = "2000-01-01T00:00";

export const clubMeetingSchema = z
	.object({
		title: z.string().trim().min(1, "Give the meeting a title").max(120),
		code: z.string().trim(),
		start: z.string().trim().min(1, "Pick when it starts"),
		end: z.string().trim(),
		room: z.string().trim().max(60),
		status: z.enum(meetingStatuses),
		description: z.string().trim().max(4000),
		linkUrl: z.string().trim().max(500),
		linkLabel: z.string().trim().max(40),
	})
	.superRefine((value, context) => {
		if (
			value.code !== "" &&
			meetingTypes.every((type) => type.code !== value.code)
		) {
			context.addIssue({
				code: "custom",
				path: ["code"],
				message: "Pick a type from the list",
			});
		}

		const start = newYorkToInstant(value.start);
		if (!start && value.start !== "") {
			context.addIssue({
				code: "custom",
				path: ["start"],
				message: "That isn’t a real date and time",
			});
		}

		if (value.end !== "") {
			const end = newYorkToInstant(value.end);
			if (!end) {
				context.addIssue({
					code: "custom",
					path: ["end"],
					message: "That isn’t a real date and time",
				});
			} else if (start && end <= start) {
				context.addIssue({
					code: "custom",
					path: ["end"],
					message: "It has to end after it starts",
				});
			}
		}

		if (value.linkUrl !== "" && !/^https?:\/\/\S+$/iu.test(value.linkUrl)) {
			context.addIssue({
				code: "custom",
				path: ["linkUrl"],
				message: "Use a link that starts with http:// or https://",
			});
		}
	})
	.transform((value) => ({
		title: value.title,
		code: value.code === "" ? null : value.code,
		startsAt: newYorkToInstant(value.start) ?? new Date(dateAndTime),
		endsAt: value.end === "" ? null : (newYorkToInstant(value.end) ?? null),
		room: value.room === "" ? null : value.room,
		status: value.status,
		description: value.description === "" ? null : value.description,
		linkUrl: value.linkUrl === "" ? null : value.linkUrl,
		linkLabel:
			value.linkUrl === "" || value.linkLabel === "" ? null : value.linkLabel,
	}));

export type ClubMeetingValues = z.output<typeof clubMeetingSchema>;

/**
A saved meeting as the form shows it (dates as New York date-and-time text).
*/
export function toFormValues(row: ClubMeeting) {
	return {
		title: row.title,
		code: row.code ?? "",
		start: instantToNewYork(row.startsAt),
		end: row.endsAt ? instantToNewYork(row.endsAt) : "",
		room: row.room ?? "",
		status: z.enum(meetingStatuses).catch("scheduled").parse(row.status),
		description: row.description ?? "",
		linkUrl: row.linkUrl ?? "",
		linkLabel: row.linkLabel ?? "",
	};
}

/**
A saved meeting in the shape the board, the calendar and the meeting page use.
*/
export function toMeeting(row: ClubMeeting): Meeting {
	return {
		id: row.id,
		source: "club",
		title: row.title,
		code: row.code ?? undefined,
		start: row.startsAt.toISOString(),
		end: row.endsAt?.toISOString(),
		room: row.room ?? undefined,
		status: z.enum(meetingStatuses).catch("scheduled").parse(row.status),
		description: row.description ?? undefined,
		linkUrl: row.linkUrl ?? undefined,
		linkLabel: row.linkLabel ?? undefined,
	};
}

/**
Every meeting added by hand that isn't in the trash, soonest first.
*/
export async function listClubMeetings(db: Database): Promise<ClubMeeting[]> {
	return db
		.select()
		.from(clubMeetings)
		.where(isNull(clubMeetings.deletedAt))
		.orderBy(asc(clubMeetings.startsAt));
}

export async function addClubMeeting(
	db: Database,
	values: ClubMeetingValues,
	by: string
) {
	await db.insert(clubMeetings).values({
		...values,
		createdBy: by,
		updatedBy: by,
	});
}

/**
The updated row, or undefined when it was removed meanwhile.
*/
export async function updateClubMeeting(
	db: Database,
	id: string,
	values: ClubMeetingValues,
	by: string
): Promise<ClubMeeting | undefined> {
	const rows = await db
		.update(clubMeetings)
		.set({ ...values, updatedAt: new Date(), updatedBy: by })
		.where(and(eq(clubMeetings.id, id), isNull(clubMeetings.deletedAt)))
		.returning();
	return rows.at(0);
}

const loadClubMeetings = unstable_cache(
	async (): Promise<Meeting[]> => {
		const db = getDb();
		if (!db) {
			return [];
		}

		// A failure throws, so it isn't remembered: the next visit tries again.
		const rows = await listClubMeetings(db);
		return rows.map((row) => toMeeting(row));
	},
	["club-meetings"],
	{ tags: [meetingsTag], revalidate: 900 }
);

/**
Meetings added by hand, for the public board. An unreachable database counts
as none, so the board still shows what Epsilon has.
*/
export async function getPublicClubMeetings(): Promise<Meeting[]> {
	try {
		return await loadClubMeetings();
	} catch (error) {
		console.error("Could not load the club's own meetings", error);
		return [];
	}
}
