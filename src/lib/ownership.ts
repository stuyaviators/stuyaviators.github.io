import type { Database } from "@/db";
import type { ActionError } from "@/lib/action-guard";
import type { User } from "@/lib/users";
import {
	crewMembers,
	galleryPhotos,
	listings,
	newsletterPresets,
	newsletters,
	testimonials,
	users,
} from "@/db/schema";
import { canDelete } from "@/lib/permissions";
import { eq } from "drizzle-orm";

/*
 * Who added what. Rows record their creator's email; the dashboard shows it
 * as "Added by …", and roles that may only delete their own work (see
 * permissions.ts) are checked against it here, on the server, before
 * anything is removed.
 */

const tables = {
	listing: listings,
	newsletter: newsletters,
	preset: newsletterPresets,
	gallery: galleryPhotos,
	testimonial: testimonials,
	crew: crewMembers,
} as const;

export const notYours: ActionError = {
	ok: false,
	error:
		"You can only delete things you added. Ask an officer to remove this one.",
};

export type OwnedKind = keyof typeof tables;

/**
The creator recorded for a row. `found` is false when the row is gone;
`owner` is undefined for rows with no creator (imported or older ones).
*/
export async function ownerOf(
	db: Database,
	kind: OwnedKind,
	id: string
): Promise<{ found: boolean; owner: string | undefined }> {
	const table = tables[kind];
	const rows = await db
		.select({ owner: table.createdBy })
		.from(table)
		.where(eq(table.id, id))
		.limit(1);
	const row = rows.at(0);
	return { found: row !== undefined, owner: row?.owner ?? undefined };
}

/**
True when this user may delete the row; a missing row counts as deletable
(there is nothing to protect, and the action reports it as gone).
*/
export async function canDeleteRow(
	db: Database,
	user: User,
	kind: OwnedKind,
	id: string
): Promise<boolean> {
	const { found, owner } = await ownerOf(db, kind, id);
	return !found || canDelete(user, owner);
}

/**
Display names by email, for "Added by …" labels.
*/
export async function namesByEmail(
	db: Database
): Promise<Record<string, string>> {
	const rows = await db
		.select({ email: users.email, name: users.name })
		.from(users);
	return Object.fromEntries(
		rows.map((row) => [row.email, row.name ?? row.email])
	);
}
