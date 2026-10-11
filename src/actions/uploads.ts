"use server";

import type { ActionResult } from "@/lib/action-guard";
import { guarded } from "@/lib/action-guard";
import { discardUnusedImage } from "@/lib/blob-cleanup";

/*
 * Removes a photo that was uploaded but never used: the officer removed or
 * replaced it, or adding it failed. Anything still used by a card, photo,
 * person or newsletter is left alone, so this can't delete live images.
 */
export async function discardImageAction(url: string): Promise<ActionResult> {
	return guarded("upload", async ({ db }) => {
		try {
			await discardUnusedImage(db, url);
		} catch (error) {
			// Best effort: the daily sweep removes it later.
			console.error("Could not discard an unused image", error);
		}

		return { ok: true };
	});
}
