"use server";

import type { ActionResult } from "@/lib/action-guard";
import { guarded, invalid } from "@/lib/action-guard";
import {
	announcementSchema,
	announcementTag,
	saveAnnouncement,
} from "@/lib/announcement";
import { revalidatePath, updateTag } from "next/cache";

/*
 * Saves the site-wide announcement banner. Every public page shows it, so
 * the whole site layout is revalidated.
 */

export type AnnouncementInput = {
	text: string;
	linkUrl: string;
	linkLabel: string;
	isOn: boolean;
	endsOn: string;
};

export async function saveAnnouncementAction(
	input: AnnouncementInput
): Promise<ActionResult> {
	return guarded("announcement", async ({ user, db }) => {
		const parsed = announcementSchema.safeParse(input);
		if (!parsed.success) {
			return invalid(parsed.error);
		}

		await saveAnnouncement(db, parsed.data, user.email);
		updateTag(announcementTag);
		revalidatePath("/", "layout");
		return { ok: true };
	});
}
