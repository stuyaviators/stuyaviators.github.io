"use server";

import type { ActionResult } from "@/lib/action-guard";
import { actionError, guarded, invalid } from "@/lib/action-guard";
import { managedRoles } from "@/lib/permissions";
import {
	addUser,
	emailSchema,
	findUserById,
	removeUser,
	roles,
	setRole,
} from "@/lib/users";
import { z } from "zod";

/*
 * Managing who can sign in, and with which role. Admins manage everyone;
 * managers only Contributors and Media (see managedRoles in permissions.ts),
 * so that role can't promote anyone, itself included. The database refuses
 * to remove or demote the last admin (src/lib/users.ts).
 */

const idSchema = z.uuid();
const roleSchema = z.enum(roles);
const missing = actionError("That person is no longer on the list.");
const notAllowed = actionError("Your role can’t manage that role.");

export async function addOfficer(
	email: string,
	role: string
): Promise<ActionResult> {
	return guarded("officers", async ({ user, db }) => {
		const parsed = z
			.object({ email: emailSchema, role: roleSchema })
			.safeParse({ email, role });
		if (!parsed.success) {
			return invalid(parsed.error);
		}

		if (!managedRoles(user.role).includes(parsed.data.role)) {
			return notAllowed;
		}

		const result = await addUser(db, parsed.data, user.email);
		return result.ok
			? result
			: actionError(result.error, { email: result.error });
	});
}

export async function changeOfficerRole(
	id: string,
	role: string
): Promise<ActionResult> {
	return guarded("officers", async ({ user, db }) => {
		const parsed = z
			.object({ id: idSchema, role: roleSchema })
			.safeParse({ id, role });
		if (!parsed.success) {
			return missing;
		}

		const target = await findUserById(db, parsed.data.id);
		if (target === undefined) {
			return missing;
		}

		if (target.id === user.id) {
			return actionError("You can’t change your own role.");
		}

		// Both the role they have now and the one they would get.
		const allowed = managedRoles(user.role);
		if (!allowed.includes(target.role) || !allowed.includes(parsed.data.role)) {
			return notAllowed;
		}

		const result = await setRole(db, parsed.data.id, parsed.data.role);
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
			!managedRoles(user.role).includes(target.role)
		) {
			return notAllowed;
		}

		const result = await removeUser(db, id);
		return result.ok ? result : actionError(result.error);
	});
}
