/* eslint-disable no-await-in-loop -- these tests run their steps one after another, on purpose. */

import type { Database } from "@/db";
import {
	crewMembers,
	galleryPhotos,
	listings,
	newsletterPresets,
	newsletters,
	testimonials,
} from "@/db/schema";
import { defaultNewsletter } from "@/lib/newsletter/defaults";
import { createTestDb } from "@/test/pglite";
import { eq } from "drizzle-orm";
import { beforeEach, describe, expect, it } from "vitest";
import {
	daysLeftInTrash,
	didDeleteFromTrash,
	didMoveToTrash,
	didRestoreFromTrash,
	listTrash,
	purgeExpiredTrash,
	trashDays,
} from "./trash.ts";

let db: Database;
beforeEach(async () => {
	db = await createTestDb();
});

async function oneOfEach() {
	const [listing] = await db
		.insert(listings)
		.values({
			kind: "scholarship",
			slug: "a",
			title: "A scholarship",
			organization: "Peter Foundation",
			summary: "Money",
			url: "https://example.org",
			createdBy: "a@stuy.edu",
		})
		.returning();
	const [newsletter] = await db
		.insert(newsletters)
		.values({ title: "October", data: defaultNewsletter() })
		.returning();
	const [preset] = await db
		.insert(newsletterPresets)
		.values({ name: "Monthly", data: defaultNewsletter() })
		.returning();
	const [photo] = await db
		.insert(galleryPhotos)
		.values({
			alt: "A Cessna",
			imageUrl: "https://x.public.blob.vercel-storage.com/a.jpg",
		})
		.returning();
	const [quote] = await db
		.insert(testimonials)
		.values({ quote: "Great club", author: "A member" })
		.returning();
	const [person] = await db
		.insert(crewMembers)
		.values({ groupId: "helpers", name: "Peter", role: "Helper" })
		.returning();
	return [
		["listing", listing!.id],
		["newsletter", newsletter!.id],
		["preset", preset!.id],
		["gallery", photo!.id],
		["testimonial", quote!.id],
		["crew", person!.id],
	] as const;
}

describe("the trash", () => {
	it("hides every kind of item, lists them, and restores them", async () => {
		const items = await oneOfEach();
		for (const [kind, id] of items) {
			expect(await didMoveToTrash(db, kind, id, "b@stuy.edu")).toBe(true);
			// Already there: nothing to do.
			expect(await didMoveToTrash(db, kind, id, "b@stuy.edu")).toBe(false);
		}

		const trash = await listTrash(db);
		expect(trash.map((item) => item.kind).toSorted()).toEqual(
			items.map(([kind]) => kind).toSorted()
		);
		expect(trash.every((item) => item.deletedBy === "b@stuy.edu")).toBe(true);
		expect(trash.every((item) => item.daysLeft === trashDays)).toBe(true);
		expect(trash.find((item) => item.kind === "listing")?.addedBy).toBe(
			"a@stuy.edu"
		);

		for (const [kind, id] of items) {
			expect(await didRestoreFromTrash(db, kind, id, "b@stuy.edu")).toBe(true);
			expect(await didRestoreFromTrash(db, kind, id, "b@stuy.edu")).toBe(false);
		}

		expect(await listTrash(db)).toHaveLength(0);
	});

	it("only deletes for good what is already in the trash", async () => {
		const [photo] = await db
			.insert(galleryPhotos)
			.values({ alt: "A Cessna" })
			.returning();
		expect(await didDeleteFromTrash(db, "gallery", photo!.id)).toBe(false);
		expect(await db.select().from(galleryPhotos)).toHaveLength(1);
		await didMoveToTrash(db, "gallery", photo!.id, "x");
		expect(await didDeleteFromTrash(db, "gallery", photo!.id)).toBe(true);
		expect(await db.select().from(galleryPhotos)).toHaveLength(0);
	});

	it("takes a newsletter's web version down when it is deleted", async () => {
		const [letter] = await db
			.insert(newsletters)
			.values({
				title: "Live",
				data: defaultNewsletter(),
				status: "published",
				slug: "live",
			})
			.returning();
		await didMoveToTrash(db, "newsletter", letter!.id, "x");
		const [after] = await db
			.select()
			.from(newsletters)
			.where(eq(newsletters.id, letter!.id));
		expect(after?.status).toBe("draft");
	});

	it("removes things after 30 days, and only those", async () => {
		const items = await oneOfEach();
		for (const [kind, id] of items) {
			await didMoveToTrash(db, kind, id, "x");
		}

		const now = new Date();
		expect(await purgeExpiredTrash(db, now)).toBe(0);
		const later = new Date(
			now.getTime() + (trashDays + 1) * 24 * 60 * 60 * 1000
		);
		expect(await purgeExpiredTrash(db, later)).toBe(items.length);
		expect(await listTrash(db)).toHaveLength(0);
		expect(await db.select().from(listings)).toHaveLength(0);
	});

	it("counts the days left", () => {
		const start = new Date("2026-10-01T12:00:00Z");
		expect(daysLeftInTrash(start, start)).toBe(30);
		expect(daysLeftInTrash(start, new Date("2026-10-11T12:00:00Z"))).toBe(20);
		expect(daysLeftInTrash(start, new Date("2026-10-31T11:00:00Z"))).toBe(1);
		expect(daysLeftInTrash(start, new Date("2026-12-01T00:00:00Z"))).toBe(0);
	});
});
