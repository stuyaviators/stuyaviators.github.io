"use server";

import type { ActionResult } from "@/lib/action-guard";
import { actionError, guarded, invalid } from "@/lib/action-guard";
import {
	addCrewMember,
	crewMemberSchema,
	crewTag,
	deleteCrewMember,
	importStaticCrew,
	moveCrewMember,
	updateCrewMember,
} from "@/lib/crew";
import { canDeleteRow, notYours } from "@/lib/ownership";
import { revalidatePath, updateTag } from "next/cache";
import { z } from "zod";

/*
 * Flight crew management. Every change expires the public crew page.
 */

const idSchema = z.uuid();
const missing = actionError("That person is no longer on the list.");

function refresh() {
	updateTag(crewTag);
	revalidatePath("/flight-crew");
}

export async function addCrewMemberAction(
	input: unknown
): Promise<ActionResult> {
	return guarded("crew", async ({ user, db }) => {
		const parsed = crewMemberSchema.safeParse(input);
		if (!parsed.success) {
			return invalid(parsed.error);
		}

		await addCrewMember(db, parsed.data, user.email);
		refresh();
		return { ok: true };
	});
}

export async function updateCrewMemberAction(
	id: string,
	input: unknown
): Promise<ActionResult> {
	return guarded("crew", async ({ user, db }) => {
		if (!idSchema.safeParse(id).success) {
			return missing;
		}

		const parsed = crewMemberSchema.safeParse(input);
		if (!parsed.success) {
			return invalid(parsed.error);
		}

		const updated = await updateCrewMember(db, id, parsed.data, user.email);
		if (!updated) {
			return missing;
		}

		refresh();
		return { ok: true };
	});
}

export async function moveCrewMemberAction(
	id: string,
	direction: string
): Promise<ActionResult> {
	return guarded("crew", async ({ db }) => {
		if (
			!idSchema.safeParse(id).success ||
			(direction !== "up" && direction !== "down")
		) {
			return missing;
		}

		const moved = await moveCrewMember(db, id, direction);
		if (!moved) {
			return missing;
		}

		refresh();
		return { ok: true };
	});
}

export async function deleteCrewMemberAction(
	id: string
): Promise<ActionResult> {
	return guarded("crew", async ({ user, db }) => {
		if (!idSchema.safeParse(id).success) {
			return missing;
		}

		if (!(await canDeleteRow(db, user, "crew", id))) {
			return notYours;
		}

		const removed = await deleteCrewMember(db, id);
		if (removed === 0) {
			return missing;
		}

		refresh();
		return { ok: true };
	});
}

/**
One-time copy of the roster in src/content/crew.ts into the database.
*/
export async function importCrewAction(): Promise<
	ActionResult<{ count: number }>
> {
	return guarded("crew", async ({ db }) => {
		const count = await importStaticCrew(db);
		if (count === 0) {
			return actionError("The crew is already in the dashboard.");
		}

		refresh();
		return { ok: true, count };
	});
}
