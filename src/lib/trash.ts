import type { Database } from "@/db";
import {
	crewMembers,
	galleryPhotos,
	listings,
	newsletterPresets,
	newsletters,
	testimonials,
} from "@/db/schema";
import { and, eq, isNotNull, isNull, lt } from "drizzle-orm";

/*
 * The trash. Whatever anyone deletes (a card, a newsletter, a photo, a quote,
 * a Flight Crew entry, a preset) is only hidden: it waits here for 30 days and
 * is then removed for good. Only people with the secret Trash box can see this,
 * restore from it or delete from it for good; everyone else just sees things
 * disappear and never learns there is a trash.
 */

export const trashDays = 30;
const dayMs = 24 * 60 * 60 * 1000;

export const trashKinds = [
	"listing",
	"newsletter",
	"preset",
	"gallery",
	"testimonial",
	"crew",
] as const;
export type TrashKind = (typeof trashKinds)[number];

export const trashKindLabels: Record<TrashKind, string> = {
	listing: "Card",
	newsletter: "Newsletter",
	preset: "Newsletter preset",
	gallery: "Gallery photo",
	testimonial: "Testimonial",
	crew: "Flight Crew",
};

export type TrashItem = {
	kind: TrashKind;
	id: string;
	title: string;
	detail: string;
	imageUrl: string | undefined;
	deletedAt: Date;
	deletedBy: string | undefined;
	addedBy: string | undefined;
	daysLeft: number;
};

const clip = (text: string, length: number) =>
	text.length > length ? `${text.slice(0, length - 1)}…` : text;

/**
Whole days left before an item is removed for good (never below zero).
*/
export function daysLeftInTrash(deletedAt: Date, now = new Date()): number {
	const used = (now.getTime() - deletedAt.getTime()) / dayMs;
	return Math.max(0, Math.ceil(trashDays - used));
}

/**
Hides an item (it goes to the trash). False when it is gone or already there.
*/
export async function didMoveToTrash(
	db: Database,
	kind: TrashKind,
	id: string,
	by: string
): Promise<boolean> {
	const gone = { deletedAt: new Date(), deletedBy: by };
	switch (kind) {
		case "listing": {
			const rows = await db
				.update(listings)
				.set({ ...gone, updatedBy: by, updatedAt: new Date() })
				.where(and(eq(listings.id, id), isNull(listings.deletedAt)))
				.returning({ id: listings.id });
			return rows.length > 0;
		}

		case "newsletter": {
			const rows = await db
				.update(newsletters)
				.set({
					...gone,
					// Deleting also takes the web version down.
					status: "draft",
					updatedBy: by,
					updatedAt: new Date(),
				})
				.where(and(eq(newsletters.id, id), isNull(newsletters.deletedAt)))
				.returning({ id: newsletters.id });
			return rows.length > 0;
		}

		case "preset": {
			const rows = await db
				.update(newsletterPresets)
				.set(gone)
				.where(
					and(eq(newsletterPresets.id, id), isNull(newsletterPresets.deletedAt))
				)
				.returning({ id: newsletterPresets.id });
			return rows.length > 0;
		}

		case "gallery": {
			const rows = await db
				.update(galleryPhotos)
				.set(gone)
				.where(and(eq(galleryPhotos.id, id), isNull(galleryPhotos.deletedAt)))
				.returning({ id: galleryPhotos.id });
			return rows.length > 0;
		}

		case "testimonial": {
			const rows = await db
				.update(testimonials)
				.set(gone)
				.where(and(eq(testimonials.id, id), isNull(testimonials.deletedAt)))
				.returning({ id: testimonials.id });
			return rows.length > 0;
		}

		case "crew": {
			const rows = await db
				.update(crewMembers)
				.set(gone)
				.where(and(eq(crewMembers.id, id), isNull(crewMembers.deletedAt)))
				.returning({ id: crewMembers.id });
			return rows.length > 0;
		}
	}
}

/**
Brings an item back. Cards come back as drafts so nothing reappears by
surprise. False when it isn't in the trash.
*/
export async function didRestoreFromTrash(
	db: Database,
	kind: TrashKind,
	id: string,
	by: string
): Promise<boolean> {
	const back = { deletedAt: null, deletedBy: null };
	switch (kind) {
		case "listing": {
			const rows = await db
				.update(listings)
				.set({
					...back,
					status: "draft",
					updatedBy: by,
					updatedAt: new Date(),
				})
				.where(and(eq(listings.id, id), isNotNull(listings.deletedAt)))
				.returning({ id: listings.id });
			return rows.length > 0;
		}

		case "newsletter": {
			const rows = await db
				.update(newsletters)
				.set({ ...back, updatedBy: by, updatedAt: new Date() })
				.where(and(eq(newsletters.id, id), isNotNull(newsletters.deletedAt)))
				.returning({ id: newsletters.id });
			return rows.length > 0;
		}

		case "preset": {
			const rows = await db
				.update(newsletterPresets)
				.set(back)
				.where(
					and(
						eq(newsletterPresets.id, id),
						isNotNull(newsletterPresets.deletedAt)
					)
				)
				.returning({ id: newsletterPresets.id });
			return rows.length > 0;
		}

		case "gallery": {
			const rows = await db
				.update(galleryPhotos)
				.set(back)
				.where(
					and(eq(galleryPhotos.id, id), isNotNull(galleryPhotos.deletedAt))
				)
				.returning({ id: galleryPhotos.id });
			return rows.length > 0;
		}

		case "testimonial": {
			const rows = await db
				.update(testimonials)
				.set(back)
				.where(and(eq(testimonials.id, id), isNotNull(testimonials.deletedAt)))
				.returning({ id: testimonials.id });
			return rows.length > 0;
		}

		case "crew": {
			const rows = await db
				.update(crewMembers)
				.set(back)
				.where(and(eq(crewMembers.id, id), isNotNull(crewMembers.deletedAt)))
				.returning({ id: crewMembers.id });
			return rows.length > 0;
		}
	}
}

/**
Removes an item for good; only items already in the trash.
*/
export async function didDeleteFromTrash(
	db: Database,
	kind: TrashKind,
	id: string
): Promise<boolean> {
	switch (kind) {
		case "listing": {
			const rows = await db
				.delete(listings)
				.where(and(eq(listings.id, id), isNotNull(listings.deletedAt)))
				.returning({ id: listings.id });
			return rows.length > 0;
		}

		case "newsletter": {
			const rows = await db
				.delete(newsletters)
				.where(and(eq(newsletters.id, id), isNotNull(newsletters.deletedAt)))
				.returning({ id: newsletters.id });
			return rows.length > 0;
		}

		case "preset": {
			const rows = await db
				.delete(newsletterPresets)
				.where(
					and(
						eq(newsletterPresets.id, id),
						isNotNull(newsletterPresets.deletedAt)
					)
				)
				.returning({ id: newsletterPresets.id });
			return rows.length > 0;
		}

		case "gallery": {
			const rows = await db
				.delete(galleryPhotos)
				.where(
					and(eq(galleryPhotos.id, id), isNotNull(galleryPhotos.deletedAt))
				)
				.returning({ id: galleryPhotos.id });
			return rows.length > 0;
		}

		case "testimonial": {
			const rows = await db
				.delete(testimonials)
				.where(and(eq(testimonials.id, id), isNotNull(testimonials.deletedAt)))
				.returning({ id: testimonials.id });
			return rows.length > 0;
		}

		case "crew": {
			const rows = await db
				.delete(crewMembers)
				.where(and(eq(crewMembers.id, id), isNotNull(crewMembers.deletedAt)))
				.returning({ id: crewMembers.id });
			return rows.length > 0;
		}
	}
}

/**
Removes everything that has been in the trash longer than 30 days. Returns how
many items went.
*/
export async function purgeExpiredTrash(
	db: Database,
	now = new Date()
): Promise<number> {
	const cutoff = new Date(now.getTime() - trashDays * dayMs);
	const removed = await Promise.all([
		db
			.delete(listings)
			.where(lt(listings.deletedAt, cutoff))
			.returning({ id: listings.id }),
		db
			.delete(newsletters)
			.where(lt(newsletters.deletedAt, cutoff))
			.returning({ id: newsletters.id }),
		db
			.delete(newsletterPresets)
			.where(lt(newsletterPresets.deletedAt, cutoff))
			.returning({ id: newsletterPresets.id }),
		db
			.delete(galleryPhotos)
			.where(lt(galleryPhotos.deletedAt, cutoff))
			.returning({ id: galleryPhotos.id }),
		db
			.delete(testimonials)
			.where(lt(testimonials.deletedAt, cutoff))
			.returning({ id: testimonials.id }),
		db
			.delete(crewMembers)
			.where(lt(crewMembers.deletedAt, cutoff))
			.returning({ id: crewMembers.id }),
	]);
	return removed.reduce((sum, rows) => sum + rows.length, 0);
}

/**
Everything in the trash, newest first.
*/
export async function listTrash(
	db: Database,
	now = new Date()
): Promise<TrashItem[]> {
	const [
		listingRows,
		newsletterRows,
		presetRows,
		galleryRows,
		testimonialRows,
		crewRows,
	] = await Promise.all([
		db.select().from(listings).where(isNotNull(listings.deletedAt)),
		db.select().from(newsletters).where(isNotNull(newsletters.deletedAt)),
		db
			.select()
			.from(newsletterPresets)
			.where(isNotNull(newsletterPresets.deletedAt)),
		db.select().from(galleryPhotos).where(isNotNull(galleryPhotos.deletedAt)),
		db.select().from(testimonials).where(isNotNull(testimonials.deletedAt)),
		db.select().from(crewMembers).where(isNotNull(crewMembers.deletedAt)),
	]);

	const item = (
		kind: TrashKind,
		row: Pick<
			typeof listings.$inferSelect,
			"id" | "deletedAt" | "deletedBy" | "createdBy"
		>,
		title: string,
		detail: string,
		imageUrl?: typeof galleryPhotos.$inferSelect.imageUrl
	): TrashItem => {
		const deletedAt = row.deletedAt ?? now;
		return {
			kind,
			id: row.id,
			title: clip(title, 120),
			detail,
			imageUrl: imageUrl ?? undefined,
			deletedAt,
			deletedBy: row.deletedBy ?? undefined,
			addedBy: row.createdBy ?? undefined,
			daysLeft: daysLeftInTrash(deletedAt, now),
		};
	};

	return [
		...listingRows.map((row) =>
			item(
				"listing",
				row,
				row.title,
				`${row.kind === "scholarship" ? "Scholarship" : "Opportunity"} · ${row.organization}`,
				row.imageUrl
			)
		),
		...newsletterRows.map((row) =>
			item("newsletter", row, row.title, "Newsletter")
		),
		...presetRows.map((row) =>
			item("preset", row, row.name, "Newsletter preset")
		),
		...galleryRows.map((row) =>
			item("gallery", row, row.alt, "Gallery photo", row.imageUrl)
		),
		...testimonialRows.map((row) =>
			item("testimonial", row, `“${row.quote}”`, `Testimonial · ${row.author}`)
		),
		...crewRows.map((row) =>
			item("crew", row, row.name, `Flight Crew · ${row.role}`, row.imageUrl)
		),
	].toSorted((a, b) => b.deletedAt.getTime() - a.deletedAt.getTime());
}

let lastPurge = 0;
const purgeEveryMs = 60 * 60 * 1000;

/**
Runs the 30-day clean-up at most once an hour per server instance, so any
dashboard visit keeps the trash tidy without a scheduled job.
*/
export async function purgeTrashIfDue(
	db: Database,
	now = new Date()
): Promise<void> {
	if (now.getTime() - lastPurge < purgeEveryMs) {
		return;
	}

	lastPurge = now.getTime();
	try {
		await purgeExpiredTrash(db, now);
	} catch (error) {
		console.error("Could not purge the trash", error);
	}
}
