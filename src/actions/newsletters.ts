"use server";

import type { ActionResult } from "@/lib/action-guard";
import { actionError, guarded, invalid } from "@/lib/action-guard";
import { listWithDeadlines } from "@/lib/listings-admin";
import { defaultNewsletter } from "@/lib/newsletter/defaults";
import { buildDeadlineDigest, digestWindow } from "@/lib/newsletter/digest";
import { newsletterSchema } from "@/lib/newsletter/types";
import {
	availableSlug,
	createNewsletter,
	createPreset,
	getNewsletter,
	getPreset,
	newslettersTag,
	publishNewsletter,
	saveNewsletter,
	slugSchema,
	titleSchema,
	unpublishNewsletter,
} from "@/lib/newsletters";
import { canDeleteRow, notYours } from "@/lib/ownership";
import { didMoveToTrash } from "@/lib/trash";
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
	revalidatePath("/newsletter");
	if (slug) {
		revalidatePath(`/newsletter/${slug}`);
	}
}

const draftSchema = z.object({ title: titleSchema, data: newsletterSchema });

export async function createNewsletterAction(
	presetId?: string
): Promise<ActionResult<{ id: string }>> {
	return guarded("newsletters", async ({ user, db }) => {
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

/**
Creates a draft listing the cards whose deadline is 14-21 days away.
*/
export async function createDeadlineDigestAction(): Promise<
	ActionResult<{ id: string }>
> {
	return guarded("newsletters", async ({ user, db }) => {
		const now = new Date();
		const data = buildDeadlineDigest(await listWithDeadlines(db), now);
		if (!data) {
			return actionError(
				`No published card has a deadline ${digestWindow.fromDays}-${digestWindow.toDays} days from now.`
			);
		}

		const day = new Intl.DateTimeFormat("en-US", {
			month: "long",
			day: "numeric",
			timeZone: "America/New_York",
		}).format(now);
		const created = await createNewsletter(
			db,
			{ title: `Deadline digest · ${day}`, data },
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
	return guarded("newsletters", async ({ user, db }) => {
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
	return guarded("newsletters", async ({ db }) => {
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
	return guarded("newsletters", async ({ db }) =>
		idSchema.safeParse(id).success
			? { ok: true, slug: await availableSlug(db, wanted.slice(0, 120), id) }
			: notFound
	);
}

export async function unpublishNewsletterAction(
	id: string
): Promise<ActionResult> {
	return guarded("newsletters", async ({ db }) => {
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
Deleting a newsletter hides it and takes its web version down; it waits in the
admin-only trash.
*/
export async function trashNewsletter(id: string): Promise<ActionResult> {
	return guarded("newsletters", async ({ user, db }) => {
		if (!idSchema.safeParse(id).success) {
			return notFound;
		}

		if (!(await canDeleteRow(db, user, "newsletter", id))) {
			return notYours;
		}

		const newsletter = await getNewsletter(db, id);
		if (!(await didMoveToTrash(db, "newsletter", id, user.email))) {
			return notFound;
		}

		refreshWebVersion(newsletter?.slug ?? undefined);
		return { ok: true };
	});
}

export async function savePresetAction(
	name: string,
	data: unknown
): Promise<ActionResult> {
	return guarded("newsletters", async ({ user, db }) => {
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
	return guarded("newsletters", async ({ user, db }) => {
		if (!idSchema.safeParse(id).success) {
			return actionError("That preset no longer exists.");
		}

		if (!(await canDeleteRow(db, user, "preset", id))) {
			return notYours;
		}

		return (await didMoveToTrash(db, "preset", id, user.email))
			? { ok: true }
			: actionError("That preset no longer exists.");
	});
}
