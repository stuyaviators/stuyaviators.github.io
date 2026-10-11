"use server";

import type { ActionResult } from "@/lib/action-guard";
import { actionError, guarded, invalid } from "@/lib/action-guard";
import { addUser, emailSchema, removeUser, roles, setRole } from "@/lib/users";
import { z } from "zod";

/*
 * Officer management (admins only): the sign-in allowlist and roles. The
 * database refuses to remove or demote the last admin (src/lib/users.ts).
 */

const idSchema = z.uuid();
const roleSchema = z.enum(roles);
const missing = actionError("That person is no longer on the list.");

export async function addOfficer(
	email: string,
	role: string
): Promise<ActionResult> {
	return guarded("admin", async ({ user, db }) => {
		const parsed = z
			.object({ email: emailSchema, role: roleSchema })
			.safeParse({ email, role });
		if (!parsed.success) {
			return invalid(parsed.error);
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
	return guarded("admin", async ({ db }) => {
		const parsed = z
			.object({ id: idSchema, role: roleSchema })
			.safeParse({ id, role });
		if (!parsed.success) {
			return missing;
		}

		const result = await setRole(db, parsed.data.id, parsed.data.role);
		return result.ok ? result : actionError(result.error);
	});
}

export async function removeOfficer(id: string): Promise<ActionResult> {
	return guarded("admin", async ({ db }) => {
		if (!idSchema.safeParse(id).success) {
			return missing;
		}

		const result = await removeUser(db, id);
		return result.ok ? result : actionError(result.error);
	});
}
