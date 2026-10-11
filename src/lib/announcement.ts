import type { Database } from "@/db";
import { getDb } from "@/db";
import { announcement } from "@/db/schema";
import { optionalUrl } from "@/lib/newsletter/types";
import { unstable_cache } from "next/cache";
import { z } from "zod";

/*
 * The announcement banner shown above every public page. The dashboard edits
 * the single row; the public read is cached and expired with the tag.
 */

export const announcementTag = "announcement";

export type Announcement = {
	text: string;
	linkUrl: string;
	linkLabel: string;
	isOn: boolean;
	endsOn: string | undefined;
};

export const emptyAnnouncement: Announcement = {
	text: "",
	linkUrl: "",
	linkLabel: "",
	isOn: false,
	endsOn: undefined,
};

// A full https link, or a path on this site such as /meetings.
const link = z
	.string()
	.trim()
	.max(2000)
	.refine(
		(value) =>
			value === "" ||
			/^\/(?!\/)\S*$/u.test(value) ||
			optionalUrl.safeParse(value).success,
		{
			message:
				"Use a full link starting with https://, or a path like /meetings",
		}
	);

export const announcementSchema = z
	.object({
		text: z.string().trim().min(1, "Write the message").max(200),
		linkUrl: link,
		linkLabel: z.string().trim().max(40),
		isOn: z.boolean(),
		endsOn: z
			.string()
			.trim()
			.refine((value) => value === "" || /^\d{4}-\d{2}-\d{2}$/u.test(value), {
				message: "Pick a date",
			})
			.transform((value) => value || undefined),
	})
	.refine((value) => value.linkUrl === "" || value.linkLabel !== "", {
		message: "Say what the link should read",
		path: ["linkLabel"],
	});

export async function readAnnouncement(db: Database): Promise<Announcement> {
	const rows = await db.select().from(announcement).limit(1);
	const row = rows.at(0);
	return row
		? {
				text: row.text,
				linkUrl: row.linkUrl,
				linkLabel: row.linkLabel,
				isOn: row.isOn,
				endsOn: row.endsOn ?? undefined,
			}
		: emptyAnnouncement;
}

export async function saveAnnouncement(
	db: Database,
	value: Announcement,
	by: string
) {
	const values = {
		text: value.text,
		linkUrl: value.linkUrl,
		linkLabel: value.linkLabel,
		isOn: value.isOn,
		endsOn: value.endsOn ?? null,
		updatedAt: new Date(),
		updatedBy: by,
	};
	await db
		.insert(announcement)
		.values({ id: 1, ...values })
		.onConflictDoUpdate({ target: announcement.id, set: values });
}

/**
What the public site shows: undefined when it's off or empty. The end date is
checked again in the browser, because the pages are cached.
*/
export const getPublicAnnouncement = unstable_cache(
	async (): Promise<Announcement | undefined> => {
		const db = getDb();
		if (!db) {
			return undefined;
		}

		try {
			const current = await readAnnouncement(db);
			return current.isOn && current.text !== "" ? current : undefined;
		} catch (error) {
			console.error("Could not load the announcement", error);
			return undefined;
		}
	},
	["announcement"],
	{ tags: [announcementTag], revalidate: 3600 }
);
