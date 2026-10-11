"use server";

import type { ActionResult } from "@/lib/action-guard";
import { actionError, guarded, invalid } from "@/lib/action-guard";
import { CaptionError, captionPhoto } from "@/lib/ai-caption";
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
import { hitRateLimit } from "@/lib/rate-limit";
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

/**
A suggested description for a photo that was just uploaded. Nothing is saved:
the officer reads it, edits it if needed and then adds the photo.
*/
export async function suggestCaptionAction(
	imageUrl: string
): Promise<ActionResult<{ caption: string }>> {
	return guarded("officer", async ({ user, db }) => {
		// The free tier is small, so keep one officer from using it all up.
		const limit = await hitRateLimit(db, `caption:${user.email}`, 40, 3600);
		if (!limit.allowed) {
			return actionError(
				"Too many automatic captions this hour. Type one instead."
			);
		}

		try {
			return { ok: true, caption: await captionPhoto(imageUrl) };
		} catch (error) {
			if (error instanceof CaptionError) {
				return actionError(error.message);
			}

			throw error;
		}
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
