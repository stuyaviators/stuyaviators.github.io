import type { Database } from "@/db";
import type { NewsletterData } from "@/lib/newsletter/types";
import { newsletterPresets, newsletters } from "@/db/schema";
import { slugify } from "@/lib/newsletter/defaults";
import { and, asc, desc, eq, isNotNull, isNull, ne } from "drizzle-orm";
import { z } from "zod";

/*
 * Newsletter drafts and presets, stored in Postgres so every officer sees the
 * same ones (recode kept them in each browser's localStorage).
 */

export type Newsletter = typeof newsletters.$inferSelect;
export type NewsletterPreset = typeof newsletterPresets.$inferSelect;

export const newslettersTag = "newsletters";

export const titleSchema = z
	.string()
	.trim()
	.min(1, "Give it a name")
	.max(120);

export const slugSchema = z
	.string()
	.trim()
	.toLowerCase()
	.regex(/^[a-z\d]+(?:-[a-z\d]+)*$/u, {
		message: "Use lowercase letters, numbers and dashes",
	})
	.max(80);

export async function listNewsletters(
	db: Database,
	view: "active" | "trash" = "active"
): Promise<Newsletter[]> {
	return db
		.select()
		.from(newsletters)
		.where(
			view === "trash"
				? isNotNull(newsletters.deletedAt)
				: isNull(newsletters.deletedAt)
		)
		.orderBy(desc(newsletters.updatedAt));
}

export async function getNewsletter(
	db: Database,
	id: string
): Promise<Newsletter | undefined> {
	const [newsletter] = await db
		.select()
		.from(newsletters)
		.where(eq(newsletters.id, id))
		.limit(1);
	return newsletter;
}

export async function createNewsletter(
	db: Database,
	input: { title: string; data: NewsletterData },
	by: string
): Promise<Newsletter> {
	const [created] = await db
		.insert(newsletters)
		.values({
			...input,
			createdBy: by,
			updatedBy: by,
			// Millisecond precision, so saveNewsletter's timestamp check matches.
			createdAt: new Date(),
			updatedAt: new Date(),
		})
		.returning();
	return created!;
}

export type SaveResult =
	| { ok: true; updatedAt: string }
	| { ok: false; conflict: true; updatedBy?: string }
	| { ok: false; conflict: false; error: string };

/**
Saves a draft only if nobody else saved since `expectedUpdatedAt`, so two
officers editing at once don't silently overwrite each other.
*/
export async function saveNewsletter(
	db: Database,
	id: string,
	input: { title: string; data: NewsletterData },
	expectedUpdatedAt: string,
	by: string
): Promise<SaveResult> {
	const [saved] = await db
		.update(newsletters)
		.set({ ...input, updatedBy: by, updatedAt: new Date() })
		.where(
			and(
				eq(newsletters.id, id),
				eq(newsletters.updatedAt, new Date(expectedUpdatedAt))
			)
		)
		.returning({ updatedAt: newsletters.updatedAt });
	if (saved) {
		return { ok: true, updatedAt: saved.updatedAt.toISOString() };
	}

	const current = await getNewsletter(db, id);
	return current
		? { ok: false, conflict: true, updatedBy: current.updatedBy ?? undefined }
		: { ok: false, conflict: false, error: "This newsletter was deleted." };
}

/**
A slug not used by another newsletter: "october", then "october-2", …
*/
export async function availableSlug(
	db: Database,
	wanted: string,
	id: string
): Promise<string> {
	const base = slugify(wanted);
	for (let attempt = 1; attempt < 50; attempt++) {
		const slug = attempt === 1 ? base : `${base}-${attempt}`;
		// eslint-disable-next-line no-await-in-loop -- usually one query.
		const [taken] = await db
			.select({ id: newsletters.id })
			.from(newsletters)
			.where(and(eq(newsletters.slug, slug), ne(newsletters.id, id)))
			.limit(1);
		if (!taken) {
			return slug;
		}
	}

	return `${base}-${id.slice(0, 8)}`;
}

/**
Copies the current draft to the public web version at /newsletter/[slug].
*/
export async function publishNewsletter(
	db: Database,
	id: string,
	slug: string
): Promise<{ ok: true; slug: string } | { ok: false; error: string }> {
	const newsletter = await getNewsletter(db, id);
	if (!newsletter || newsletter.deletedAt) {
		return { ok: false, error: "This newsletter was deleted." };
	}

	const [taken] = await db
		.select({ id: newsletters.id })
		.from(newsletters)
		.where(and(eq(newsletters.slug, slug), ne(newsletters.id, id)))
		.limit(1);
	if (taken) {
		return { ok: false, error: `/newsletter/${slug} is already used.` };
	}

	await db
		.update(newsletters)
		.set({
			slug,
			status: "published",
			published: newsletter.data,
			// Keeps updatedAt (the draft's edit time) so open editors stay in sync.
			publishedAt: newsletter.publishedAt ?? new Date(),
		})
		.where(eq(newsletters.id, id));
	return { ok: true, slug };
}

/**
Takes the web version down; the slug stays reserved for republishing.
*/
export async function unpublishNewsletter(db: Database, id: string) {
	await db
		.update(newsletters)
		.set({ status: "draft" })
		.where(eq(newsletters.id, id));
}

export async function setNewsletterDeleted(
	db: Database,
	id: string,
	isDeleted: boolean,
	by: string
) {
	await db
		.update(newsletters)
		.set({
			deletedAt: isDeleted ? new Date() : null,
			// Deleting also takes the web version down.
			...(isDeleted ? { status: "draft" as const } : {}),
			updatedBy: by,
			updatedAt: new Date(),
		})
		.where(eq(newsletters.id, id));
}

export async function getPublishedNewsletter(
	db: Database,
	slug: string
): Promise<Newsletter | undefined> {
	const [newsletter] = await db
		.select()
		.from(newsletters)
		.where(
			and(
				eq(newsletters.slug, slug),
				eq(newsletters.status, "published"),
				isNull(newsletters.deletedAt)
			)
		)
		.limit(1);
	return newsletter?.published ? newsletter : undefined;
}

export async function listPresets(db: Database): Promise<NewsletterPreset[]> {
	return db
		.select()
		.from(newsletterPresets)
		.orderBy(asc(newsletterPresets.name));
}

export async function getPreset(
	db: Database,
	id: string
): Promise<NewsletterPreset | undefined> {
	const [preset] = await db
		.select()
		.from(newsletterPresets)
		.where(eq(newsletterPresets.id, id))
		.limit(1);
	return preset;
}

export async function createPreset(
	db: Database,
	input: { name: string; data: NewsletterData },
	by: string
) {
	await db.insert(newsletterPresets).values({ ...input, createdBy: by });
}

export async function deletePreset(db: Database, id: string) {
	await db.delete(newsletterPresets).where(eq(newsletterPresets.id, id));
}
