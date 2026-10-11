import type { Database } from "@/db";
import { users } from "@/db/schema";
import { adminMask, allPermissions, roleFor } from "@/lib/permissions";
import { asc, eq, sql } from "drizzle-orm";
import { z } from "zod";

/*
 * The dashboard allowlist. Google proves who someone is; this table decides
 * whether they get in and what they can do. Each person has a permission
 * number (the ticked boxes added together, see permissions.ts); `role` is just
 * the preset those boxes match, or "custom". Emails are stored lowercased so
 * "Peter@Stuy.edu" and "peter@stuy.edu" match.
 */

export type User = typeof users.$inferSelect;
export type Role = User["role"];

export const emailSchema = z
	.string()
	.trim()
	.toLowerCase()
	.pipe(z.email({ message: "Enter a valid email address" }).max(254));

export function normalizeEmail(email: string) {
	return email.trim().toLowerCase();
}

/**
Emails listed in ADMIN_EMAILS (comma or whitespace separated).
*/
export function adminEmailsFromEnv(value = process.env.ADMIN_EMAILS): string[] {
	return (value ?? "")
		.split(/[\s,]+/u)
		.map((email) => normalizeEmail(email))
		.filter((email) => emailSchema.safeParse(email).success);
}

export async function findUser(
	db: Database,
	email: string
): Promise<User | undefined> {
	const userRows = await db
		.select()
		.from(users)
		.where(eq(users.email, normalizeEmail(email)))
		.limit(1);
	const user = userRows.at(0);
	return user;
}

export async function listUsers(db: Database): Promise<User[]> {
	return db.select().from(users).orderBy(asc(users.role), asc(users.email));
}

async function adminCount(db: Database): Promise<number> {
	const rowRows = await db
		.select({ count: sql<number>`count(*)::int` })
		.from(users)
		.where(sql`(${users.permissions} & ${adminMask}::int) = ${adminMask}::int`);
	const row = rowRows.at(0);
	return row?.count ?? 0;
}

/**
Decides whether a verified Google account may sign in, and records the visit.

Bootstrapping: while there are no admins at all, anyone in ADMIN_EMAILS is
added as an admin on first sign-in. Once an admin exists the table is the
only source of truth, so removing someone in the dashboard sticks even if
their email is still in ADMIN_EMAILS.
*/
export async function authorizeSignIn(
	db: Database,
	profile: { email: string; name?: string; image?: string },
	adminEmails = adminEmailsFromEnv()
): Promise<User | undefined> {
	const email = normalizeEmail(profile.email);
	let user = await findUser(db, email);

	if (!user && adminEmails.includes(email) && (await adminCount(db)) === 0) {
		const userRows = await db
			.insert(users)
			.values({
				email,
				role: "admin",
				permissions: allPermissions,
				addedBy: "ADMIN_EMAILS",
			})
			.onConflictDoNothing()
			.returning();
		user = userRows.at(0);
		user ??= await findUser(db, email);
	}

	if (!user) {
		return undefined;
	}

	const updatedRows = await db
		.update(users)
		.set({
			name: profile.name ?? user.name,
			image: profile.image ?? user.image,
			lastSignInAt: new Date(),
		})
		.where(eq(users.id, user.id))
		.returning();
	const updated = updatedRows.at(0);
	return updated ?? user;
}

export type UserResult = { ok: true } | { ok: false; error: string };

export async function addUser(
	db: Database,
	input: { email: string; permissions: number },
	addedBy: string
): Promise<UserResult> {
	const email = normalizeEmail(input.email);
	const createdRows = await db
		.insert(users)
		.values({
			email,
			role: roleFor(input.permissions),
			permissions: input.permissions,
			addedBy,
		})
		.onConflictDoNothing()
		.returning({ id: users.id });
	const created = createdRows.at(0);
	return created
		? { ok: true }
		: { ok: false, error: `${email} is already on the list.` };
}

const lastAdmin = "There must always be at least one admin.";

/**
Replaces someone's permission number. A single statement refuses to take the
last admin's settings or people-managing boxes away, so two admins editing
each other at once can't leave the club with none.
*/
export async function setPermissions(
	db: Database,
	id: string,
	permissions: number
): Promise<UserResult> {
	const updated = await db
		.update(users)
		.set({ permissions, role: roleFor(permissions) })
		.where(
			sql`${users.id} = ${id} and ((${permissions}::int & ${adminMask}::int) = ${adminMask}::int or (${users.permissions} & ${adminMask}::int) <> ${adminMask}::int or (select count(*) from ${users} where (${users.permissions} & ${adminMask}::int) = ${adminMask}::int) > 1)`
		)
		.returning({ id: users.id });
	if (updated.length > 0) {
		return { ok: true };
	}

	const isStillListed = (await findUserById(db, id)) !== undefined;
	return {
		ok: false,
		error: isStillListed ? lastAdmin : "That person is no longer on the list.",
	};
}

/**
Removes someone from the allowlist; never the last admin.
*/
export async function removeUser(
	db: Database,
	id: string
): Promise<UserResult> {
	const removed = await db
		.delete(users)
		.where(
			sql`${users.id} = ${id} and ((${users.permissions} & ${adminMask}::int) <> ${adminMask}::int or (select count(*) from ${users} where (${users.permissions} & ${adminMask}::int) = ${adminMask}::int) > 1)`
		)
		.returning({ id: users.id });
	if (removed.length > 0) {
		return { ok: true };
	}

	const isStillListed = (await findUserById(db, id)) !== undefined;
	return isStillListed ? { ok: false, error: lastAdmin } : { ok: true };
}

export async function findUserById(db: Database, id: string) {
	const userRows = await db
		.select()
		.from(users)
		.where(eq(users.id, id))
		.limit(1);
	const user = userRows.at(0);
	return user;
}
