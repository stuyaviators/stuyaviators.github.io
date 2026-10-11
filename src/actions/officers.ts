"use server";

import type { ActionResult } from "@/lib/action-guard";
import { actionError, guarded, invalid } from "@/lib/action-guard";
import { grantableMask, isWithin, readMask } from "@/lib/permissions";
import {
	addUser,
	emailSchema,
	findUserById,
	removeUser,
	setPermissions,
} from "@/lib/users";
import { z } from "zod";

/*
 * Managing who can sign in and which boxes are ticked for them (the
 * permission number, see permissions.ts). Nobody can give boxes they aren't
 * allowed to give (grantableMask), or edit someone who holds boxes they can't
 * give, so "Manage people" can't be used to climb past what it holds. The
 * database refuses to remove or reduce the last admin (src/lib/users.ts).
 */

const idSchema = z.uuid();
const missing = actionError("That person is no longer on the list.");
const notAllowed = actionError(
	"You can’t give or change those permissions. Ask an admin."
);
const noBoxes = actionError("Tick at least one box.");

export async function addOfficer(
	email: string,
	permissions: number
): Promise<ActionResult> {
	return guarded("officers", async ({ user, db }) => {
		const parsed = z.object({ email: emailSchema }).safeParse({ email });
		if (!parsed.success) {
			return invalid(parsed.error);
		}

		const mask = readMask(permissions);
		if (mask === undefined || mask === 0) {
			return noBoxes;
		}

		if (!isWithin(mask, grantableMask(user.permissions))) {
			return notAllowed;
		}

		const result = await addUser(
			db,
			{ email: parsed.data.email, permissions: mask },
			user.email
		);
		return result.ok
			? result
			: actionError(result.error, { email: result.error });
	});
}

export async function changeOfficerPermissions(
	id: string,
	permissions: number
): Promise<ActionResult> {
	return guarded("officers", async ({ user, db }) => {
		if (!idSchema.safeParse(id).success) {
			return missing;
		}

		const mask = readMask(permissions);
		if (mask === undefined || mask === 0) {
			return noBoxes;
		}

		const target = await findUserById(db, id);
		if (target === undefined) {
			return missing;
		}

		if (target.id === user.id) {
			return actionError("You can’t change your own permissions.");
		}

		// Both what they hold now and what they would hold.
		const allowed = grantableMask(user.permissions);
		if (!isWithin(target.permissions, allowed) || !isWithin(mask, allowed)) {
			return notAllowed;
		}

		const result = await setPermissions(db, target.id, mask);
		return result.ok ? result : actionError(result.error);
	});
}

export async function removeOfficer(id: string): Promise<ActionResult> {
	return guarded("officers", async ({ user, db }) => {
		if (!idSchema.safeParse(id).success) {
			return missing;
		}

		const target = await findUserById(db, id);
		if (
			target !== undefined &&
			!isWithin(target.permissions, grantableMask(user.permissions))
		) {
			return notAllowed;
		}

		const result = await removeUser(db, id);
		return result.ok ? result : actionError(result.error);
	});
}
