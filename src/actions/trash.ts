"use server";

import type { ActionResult } from "@/lib/action-guard";
import type { TrashKind } from "@/lib/trash";
import { actionError, guarded } from "@/lib/action-guard";
import { meetingsTag } from "@/lib/club-meetings";
import { crewTag } from "@/lib/crew";
import { galleryTag } from "@/lib/gallery";
import { listingsTag } from "@/lib/listings";
import { newslettersTag } from "@/lib/newsletters";
import { testimonialsTag } from "@/lib/testimonials";
import {
	didDeleteFromTrash,
	didRestoreFromTrash,
	listTrash,
	trashKinds,
} from "@/lib/trash";
import { revalidatePath, updateTag } from "next/cache";
import { z } from "zod";

/*
 * The admin-only trash (the secret "Trash" box): bring things back, or delete
 * them for good. Everyone else's deletes only move things here; they never
 * see this screen and can't call these actions.
 */

const idSchema = z.uuid();
const kindSchema = z.enum(trashKinds);
const missing = actionError("That item is no longer in the trash.");

/**
Lets the public pages show (or stop showing) what changed.
*/
function refreshPublic(kind: TrashKind) {
	switch (kind) {
		case "listing": {
			updateTag(listingsTag);
			revalidatePath("/opportunities", "layout");
			revalidatePath("/scholarships", "layout");
			revalidatePath("/sitemap.xml");
			break;
		}

		case "newsletter":
		case "preset": {
			updateTag(newslettersTag);
			revalidatePath("/newsletter");
			break;
		}

		case "gallery": {
			updateTag(galleryTag);
			revalidatePath("/gallery");
			break;
		}

		case "testimonial": {
			updateTag(testimonialsTag);
			revalidatePath("/");
			break;
		}

		case "crew": {
			updateTag(crewTag);
			revalidatePath("/flight-crew");
			break;
		}

		case "meeting": {
			updateTag(meetingsTag);
			revalidatePath("/meetings");
			revalidatePath("/");
			break;
		}
	}
}

export async function restoreTrashItemAction(
	kind: string,
	id: string
): Promise<ActionResult> {
	return guarded("trash", async ({ user, db }) => {
		const parsed = z
			.object({ kind: kindSchema, id: idSchema })
			.safeParse({ kind, id });
		if (!parsed.success) {
			return missing;
		}

		if (
			!(await didRestoreFromTrash(
				db,
				parsed.data.kind,
				parsed.data.id,
				user.email
			))
		) {
			return missing;
		}

		refreshPublic(parsed.data.kind);
		return { ok: true };
	});
}

export async function deleteTrashItemAction(
	kind: string,
	id: string
): Promise<ActionResult> {
	return guarded("trash", async ({ db }) => {
		const parsed = z
			.object({ kind: kindSchema, id: idSchema })
			.safeParse({ kind, id });
		if (!parsed.success) {
			return missing;
		}

		return (await didDeleteFromTrash(db, parsed.data.kind, parsed.data.id))
			? { ok: true }
			: missing;
	});
}

/**
Deletes everything in the trash for good.
*/
export async function emptyTrashAction(): Promise<
	ActionResult<{ removed: number }>
> {
	return guarded("trash", async ({ db }) => {
		const items = await listTrash(db);
		const results = await Promise.all(
			items.map(async (item) => didDeleteFromTrash(db, item.kind, item.id))
		);
		return { ok: true, removed: results.filter(Boolean).length };
	});
}
