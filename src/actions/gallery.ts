"use server";

import type { Database } from "@/db";
import type { ActionError, ActionResult } from "@/lib/action-guard";
import { actionError, guarded, invalid } from "@/lib/action-guard";
import { CaptionError, captionPhoto } from "@/lib/ai-caption";
import {
	addGalleryPhoto,
	deleteGalleryPhoto,
	galleryTag,
	getGalleryRow,
	importStaticGallery,
	moveGalleryPhoto,
	newPhotoSchema,
	optionalAltSchema,
	updateGalleryAlt,
} from "@/lib/gallery";
import { canDeleteRow, notYours } from "@/lib/ownership";
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

/**
The AI description for a photo whose description was left blank.
*/
async function writeCaption(
	db: Database,
	email: string,
	imageUrl: string
): Promise<ActionError | { ok: true; alt: string }> {
	// The free tier is small, so keep one officer from using it all up.
	const limit = await hitRateLimit(db, `caption:${email}`, 40, 3600);
	if (!limit.allowed) {
		return actionError(
			"Too many automatic descriptions this hour. Type one instead.",
			{ alt: "Type a description instead." }
		);
	}

	try {
		return { ok: true, alt: await captionPhoto(imageUrl) };
	} catch (error) {
		if (error instanceof CaptionError) {
			return actionError(error.message, { alt: error.message });
		}

		throw error;
	}
}

export async function addGalleryPhotoAction(
	input: unknown
): Promise<ActionResult> {
	return guarded("gallery", async ({ user, db }) => {
		const parsed = newPhotoSchema.safeParse(input);
		if (!parsed.success) {
			return invalid(parsed.error);
		}

		// Blank description: AI writes it, and the photo is labeled as such.
		const isBlank = parsed.data.alt === "";
		let { alt } = parsed.data;
		if (isBlank) {
			const written = await writeCaption(db, user.email, parsed.data.imageUrl);
			if (!written.ok) {
				return written;
			}

			alt = written.alt;
		}

		await addGalleryPhoto(db, { ...parsed.data, alt }, user.email, isBlank);
		refresh();
		return { ok: true };
	});
}

export async function updateGalleryAltAction(
	id: string,
	alt: string
): Promise<ActionResult> {
	return guarded("gallery", async ({ user, db }) => {
		if (!idSchema.safeParse(id).success) {
			return missing;
		}

		const parsed = optionalAltSchema.safeParse(alt);
		if (!parsed.success) {
			const message = "Keep the description under 300 characters";
			return actionError(message, { alt: message });
		}

		const existing = await getGalleryRow(db, id);
		if (!existing) {
			return missing;
		}

		if (parsed.data === "") {
			// Blank again: have AI write a fresh one (uploaded photos only).
			if (existing.imageUrl === null) {
				const message = "Describe the photo for people who can't see it";
				return actionError(message, { alt: message });
			}

			const written = await writeCaption(db, user.email, existing.imageUrl);
			if (!written.ok) {
				return written;
			}

			await updateGalleryAlt(db, id, written.alt, user.email, true);
			refresh();
			return { ok: true };
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
	return guarded("gallery", async ({ db }) => {
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
	return guarded("gallery", async ({ user, db }) => {
		if (!idSchema.safeParse(id).success) {
			return missing;
		}

		if (!(await canDeleteRow(db, user, "gallery", id))) {
			return notYours;
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
	return guarded("gallery", async ({ db }) => {
		const count = await importStaticGallery(db);
		if (count === 0) {
			return actionError("The photos are already in the dashboard.");
		}

		refresh();
		return { ok: true, count };
	});
}
