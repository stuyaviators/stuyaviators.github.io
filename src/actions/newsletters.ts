"use server";

import type { ActionResult } from "@/lib/action-guard";
import { actionError, guarded, invalid } from "@/lib/action-guard";
import { defaultNewsletter } from "@/lib/newsletter/defaults";
import { newsletterSchema } from "@/lib/newsletter/types";
import {
	availableSlug,
	createNewsletter,
	createPreset,
	deleteNewsletterForever,
	deletePreset,
	getNewsletter,
	getPreset,
	newslettersTag,
	publishNewsletter,
	saveNewsletter,
	setNewsletterDeleted,
	slugSchema,
	titleSchema,
	unpublishNewsletter,
} from "@/lib/newsletters";
import { revalidatePath, updateTag } from "next/cache";
import { z } from "zod";

/*
 * Newsletter drafts, presets and web versions. Sending happens by hand from
 * the club Gmail (docs/sending-newsletters.md); nothing here emails anyone.
 */

const idSchema = z.uuid();
const notFound = actionError("That newsletter no longer exists.");

function refreshWebVersion(slug: string | undefined) {
	updateTag(newslettersTag);
	if (slug) {
		revalidatePath(`/newsletter/${slug}`);
	}
}

const draftSchema = z.object({ title: titleSchema, data: newsletterSchema });

export async function createNewsletterAction(
	presetId?: string
): Promise<ActionResult<{ id: string }>> {
	return guarded("officer", async ({ user, db }) => {
		let data = defaultNewsletter();
		let title = new Intl.DateTimeFormat("en-US", {
			month: "long",
			year: "numeric",
			timeZone: "America/New_York",
		}).format(new Date());
		if (presetId !== undefined) {
			const preset = idSchema.safeParse(presetId).success
				? await getPreset(db, presetId)
				: undefined;
			const parsed = newsletterSchema.safeParse(preset?.data);
			if (!preset || !parsed.success) {
				return actionError("That preset no longer exists.");
			}

			data = parsed.data;
			title = `${preset.name} · ${title}`;
		}

		const created = await createNewsletter(
			db,
			{ title: `${title} newsletter`.slice(0, 120), data },
			user.email
		);
		return { ok: true, id: created.id };
	});
}

export type SaveDraftResult =
	| ActionResult<{ updatedAt: string }>
	| { ok: false; conflict: true; error: string; updatedBy?: string };

/**
Saves a draft unless someone else saved since `expectedUpdatedAt`. Pass
undefined to overwrite their version.
*/
export async function saveNewsletterAction(
	id: string,
	input: unknown,
	expectedUpdatedAt: string | undefined
): Promise<SaveDraftResult> {
	return guarded("officer", async ({ user, db }) => {
		if (!idSchema.safeParse(id).success) {
			return notFound;
		}

		const parsed = draftSchema.safeParse(input);
		if (!parsed.success) {
			// Autosave runs while typing, so say what's wrong (for example a
			// half-typed link) instead of a generic message.
			return actionError(
				parsed.error.issues[0]?.message ?? "This newsletter can’t be saved yet."
			);
		}

		if (
			expectedUpdatedAt !== undefined &&
			Number.isNaN(Date.parse(expectedUpdatedAt))
		) {
			return actionError("Reload the page and try again.");
		}

		const result = await saveNewsletter(
			db,
			id,
			parsed.data,
			expectedUpdatedAt,
			user.email
		);
		if (result.ok) {
			return { ok: true, updatedAt: result.updatedAt };
		}

		if (result.conflict) {
			return {
				ok: false,
				conflict: true,
				error: `${result.updatedBy ?? "Another officer"} saved a newer version.`,
				updatedBy: result.updatedBy,
			};
		}

		return actionError(result.error);
	});
}

/**
Copies the saved draft to /newsletter/[slug] (the email's "View in browser").
*/
export async function publishNewsletterAction(
	id: string,
	slug: string
): Promise<ActionResult<{ slug: string }>> {
	return guarded("officer", async ({ db }) => {
		const parsedSlug = slugSchema.safeParse(slug);
		if (!parsedSlug.success) {
			const message =
				parsedSlug.error.issues[0]?.message ??
				"Use lowercase letters, numbers and dashes";
			return actionError(message, { slug: message });
		}

		if (!idSchema.safeParse(id).success) {
			return notFound;
		}

		const before = await getNewsletter(db, id);
		const result = await publishNewsletter(db, id, parsedSlug.data);
		if (!result.ok) {
			return actionError(result.error, { slug: result.error });
		}

		if (before?.slug && before.slug !== result.slug) {
			refreshWebVersion(before.slug);
		}

		refreshWebVersion(result.slug);
		return { ok: true, slug: result.slug };
	});
}

/**
A free slug based on `wanted` ("october", then "october-2", …).
*/
export async function suggestSlug(
	id: string,
	wanted: string
): Promise<ActionResult<{ slug: string }>> {
	return guarded("officer", async ({ db }) =>
		idSchema.safeParse(id).success
			? { ok: true, slug: await availableSlug(db, wanted.slice(0, 120), id) }
			: notFound
	);
}

export async function unpublishNewsletterAction(
	id: string
): Promise<ActionResult> {
	return guarded("officer", async ({ db }) => {
		if (!idSchema.safeParse(id).success) {
			return notFound;
		}

		const newsletter = await getNewsletter(db, id);
		await unpublishNewsletter(db, id);
		refreshWebVersion(newsletter?.slug ?? undefined);
		return { ok: true };
	});
}

/**
Soft delete (also takes the web version down); restorable from the trash.
*/
export async function trashNewsletter(id: string): Promise<ActionResult> {
	return guarded("officer", async ({ user, db }) => {
		if (!idSchema.safeParse(id).success) {
			return notFound;
		}

		const newsletter = await getNewsletter(db, id);
		await setNewsletterDeleted(db, id, true, user.email);
		refreshWebVersion(newsletter?.slug ?? undefined);
		return { ok: true };
	});
}

export async function restoreNewsletter(id: string): Promise<ActionResult> {
	return guarded("officer", async ({ user, db }) => {
		if (!idSchema.safeParse(id).success) {
			return notFound;
		}

		await setNewsletterDeleted(db, id, false, user.email);
		return { ok: true };
	});
}

export async function deleteNewsletterForeverAction(
	id: string
): Promise<ActionResult> {
	return guarded("officer", async ({ db }) => {
		if (!idSchema.safeParse(id).success) {
			return notFound;
		}

		await deleteNewsletterForever(db, id);
		return { ok: true };
	});
}

export async function savePresetAction(
	name: string,
	data: unknown
): Promise<ActionResult> {
	return guarded("officer", async ({ user, db }) => {
		const parsed = z
			.object({
				name: z.string().trim().min(1, "Name the preset").max(60),
				data: newsletterSchema,
			})
			.safeParse({ name, data });
		if (!parsed.success) {
			return invalid(parsed.error);
		}

		await createPreset(db, parsed.data, user.email);
		return { ok: true };
	});
}

export async function deletePresetAction(id: string): Promise<ActionResult> {
	return guarded("officer", async ({ db }) => {
		if (!idSchema.safeParse(id).success) {
			return actionError("That preset no longer exists.");
		}

		await deletePreset(db, id);
		return { ok: true };
	});
}
