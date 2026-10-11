"use server";

import type { ActionResult } from "@/lib/action-guard";
import { actionError, guarded, invalid } from "@/lib/action-guard";
import { listingsTag } from "@/lib/listings";
import {
	createListing,
	getListing,
	listingInput,
	setListingStatus,
	updateListing,
} from "@/lib/listings-admin";
import { canDeleteRow, notYours } from "@/lib/ownership";
import { didMoveToTrash } from "@/lib/trash";
import { revalidatePath, updateTag } from "next/cache";
import { z } from "zod";

/*
 * Opportunities and scholarships from the dashboard. Each action re-checks the
 * officer's session (guarded) and validates its input with Zod, then expires
 * the public pages so changes show up without a redeploy.
 */

const idSchema = z.uuid();

function refreshPublicPages() {
	updateTag(listingsTag);
	// "layout" also covers each card's own page below the list.
	revalidatePath("/opportunities", "layout");
	revalidatePath("/scholarships", "layout");
	revalidatePath("/sitemap.xml");
}

const notFound = actionError("That card no longer exists.");

export async function saveListing(
	id: string | undefined,
	input: unknown
): Promise<ActionResult<{ id: string }>> {
	return guarded("listings", async ({ user, db }) => {
		const parsed = listingInput.safeParse(input);
		if (!parsed.success) {
			return invalid(parsed.error);
		}

		if (id === undefined) {
			const created = await createListing(db, parsed.data, user.email);
			refreshPublicPages();
			return { ok: true, id: created.id };
		}

		if (!idSchema.safeParse(id).success) {
			return notFound;
		}

		const existing = await getListing(db, id);
		if (existing?.kind !== parsed.data.kind) {
			return notFound;
		}

		const updated = await updateListing(db, id, parsed.data, user.email);
		if (!updated) {
			return notFound;
		}

		refreshPublicPages();
		return { ok: true, id: updated.id };
	});
}

export async function publishListing(
	id: string,
	isPublished: boolean
): Promise<ActionResult> {
	return guarded("listings", async ({ user, db }) => {
		if (!idSchema.safeParse(id).success) {
			return notFound;
		}

		const updated = await setListingStatus(
			db,
			id,
			isPublished ? "published" : "draft",
			user.email
		);
		if (!updated) {
			return notFound;
		}

		refreshPublicPages();
		return { ok: true };
	});
}

/**
Deleting a card hides it everywhere (it waits in the admin-only trash).
*/
export async function trashListing(id: string): Promise<ActionResult> {
	return guarded("listings", async ({ user, db }) => {
		if (!idSchema.safeParse(id).success) {
			return notFound;
		}

		if (!(await canDeleteRow(db, user, "listing", id))) {
			return notYours;
		}

		if (!(await didMoveToTrash(db, "listing", id, user.email))) {
			return notFound;
		}

		refreshPublicPages();
		return { ok: true };
	});
}
