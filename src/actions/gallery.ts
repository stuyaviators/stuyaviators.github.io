"use server";

import type { ActionResult } from "@/lib/action-guard";
import { actionError, guarded, invalid } from "@/lib/action-guard";
import {
	addGalleryPhoto,
	altSchema,
	deleteGalleryPhoto,
	galleryTag,
	importStaticGallery,
	moveGalleryPhoto,
	newPhotoSchema,
	updateGalleryAlt,
} from "@/lib/gallery";
import { revalidatePath, updateTag } from "next/cache";
import { z } from "zod";

/*
 * Gallery management. Every change expires the cached gallery and its page.
 */

const idSchema = z.uuid();
const missing = actionError("That photo is no longer in the gallery.");

function refresh() {
	updateTag(galleryTag);
	revalidatePath("/gallery");
}

export async function addGalleryPhotoAction(
	input: unknown
): Promise<ActionResult> {
	return guarded("officer", async ({ user, db }) => {
		const parsed = newPhotoSchema.safeParse(input);
		if (!parsed.success) {
			return invalid(parsed.error);
		}

		await addGalleryPhoto(db, parsed.data, user.email);
		refresh();
		return { ok: true };
	});
}

export async function updateGalleryAltAction(
	id: string,
	alt: string
): Promise<ActionResult> {
	return guarded("officer", async ({ user, db }) => {
		if (!idSchema.safeParse(id).success) {
			return missing;
		}

		const parsed = altSchema.safeParse(alt);
		if (!parsed.success) {
			const message =
				parsed.error.issues.at(0)?.message ?? "Describe the photo";
			return actionError(message, { alt: message });
		}

		const updated = await updateGalleryAlt(db, id, parsed.data, user.email);
		if (!updated) {
			return missing;
		}

		refresh();
		return { ok: true };
	});
}

export async function moveGalleryPhotoAction(
	id: string,
	direction: string
): Promise<ActionResult> {
	return guarded("officer", async ({ db }) => {
		if (
			!idSchema.safeParse(id).success ||
			(direction !== "up" && direction !== "down")
		) {
			return missing;
		}

		const order = await moveGalleryPhoto(db, id, direction);
		if (!order) {
			return missing;
		}

		refresh();
		return { ok: true };
	});
}

export async function deleteGalleryPhotoAction(
	id: string
): Promise<ActionResult> {
	return guarded("officer", async ({ db }) => {
		if (!idSchema.safeParse(id).success) {
			return missing;
		}

		if ((await deleteGalleryPhoto(db, id)) === 0) {
			return missing;
		}

		refresh();
		return { ok: true };
	});
}

/**
One-time copy of the bundled photos into the database.
*/
export async function importGalleryAction(): Promise<
	ActionResult<{ count: number }>
> {
	return guarded("officer", async ({ db }) => {
		const count = await importStaticGallery(db);
		if (count === 0) {
			return actionError("The photos are already in the dashboard.");
		}

		refresh();
		return { ok: true, count };
	});
}
