"use server";

import type { ActionResult } from "@/lib/action-guard";
import { actionError, guarded, invalid } from "@/lib/action-guard";
import {
	addClubMeeting,
	clubMeetingSchema,
	meetingsTag,
	updateClubMeeting,
} from "@/lib/club-meetings";
import { canDeleteRow, notYours } from "@/lib/ownership";
import { didMoveToTrash } from "@/lib/trash";
import { revalidatePath, updateTag } from "next/cache";
import { z } from "zod";

/*
 * Meetings added by hand for the departure board. Every change expires the
 * cached list and the pages that show it.
 */

const idSchema = z.uuid();
const missing = actionError("That meeting is no longer on the list.");

function refresh() {
	updateTag(meetingsTag);
	revalidatePath("/meetings", "layout");
	revalidatePath("/");
}

export async function addMeetingAction(input: unknown): Promise<ActionResult> {
	return guarded("meetings", async ({ user, db }) => {
		const parsed = clubMeetingSchema.safeParse(input);
		if (!parsed.success) {
			return invalid(parsed.error);
		}

		await addClubMeeting(db, parsed.data, user.email);
		refresh();
		return { ok: true };
	});
}

export async function updateMeetingAction(
	id: string,
	input: unknown
): Promise<ActionResult> {
	return guarded("meetings", async ({ user, db }) => {
		if (!idSchema.safeParse(id).success) {
			return missing;
		}

		const parsed = clubMeetingSchema.safeParse(input);
		if (!parsed.success) {
			return invalid(parsed.error);
		}

		const updated = await updateClubMeeting(db, id, parsed.data, user.email);
		if (!updated) {
			return missing;
		}

		refresh();
		return { ok: true };
	});
}

export async function deleteMeetingAction(id: string): Promise<ActionResult> {
	return guarded("meetings", async ({ user, db }) => {
		if (!idSchema.safeParse(id).success) {
			return missing;
		}

		if (!(await canDeleteRow(db, user, "meeting", id))) {
			return notYours;
		}

		if (!(await didMoveToTrash(db, "meeting", id, user.email))) {
			return missing;
		}

		refresh();
		return { ok: true };
	});
}
