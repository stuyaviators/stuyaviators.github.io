import type { Database } from "@/db";
import {
	crewMembers,
	galleryPhotos,
	listings,
	newsletterPresets,
	newsletters,
} from "@/db/schema";
import { defaultNewsletter } from "@/lib/newsletter/defaults";
import { createTestDb } from "@/test/pglite";
import { beforeEach, describe, expect, it, vi } from "vitest";

const store = vi.hoisted(() => ({
	files: [] as Array<{ url: string; uploadedAt: Date }>,
	deleted: [] as string[],
}));

vi.mock("@vercel/blob", () => ({
	list: vi.fn(async () => ({
		blobs: store.files.map((file) => ({ ...file, pathname: file.url })),
		hasMore: false,
		cursor: undefined,
	})),
	del: vi.fn(async (target: string | string[]) => {
		store.deleted.push(...(Array.isArray(target) ? target : [target]));
	}),
}));

const {
	discardUnusedImage,
	orphanGraceMs,
	referencedImageUrls,
	sweepOrphanImages,
} = await import("./blob-cleanup.ts");

const host = "https://abc.public.blob.vercel-storage.com";
const image = (name: string) => `${host}/uploads/highlight/${name}.jpg`;

let db: Database;
beforeEach(async () => {
	db = await createTestDb();
	store.files = [];
	store.deleted = [];
	process.env.BLOB_READ_WRITE_TOKEN = "token";
});

async function useEverywhere() {
	await db.insert(galleryPhotos).values({ alt: "A", imageUrl: image("photo") });
	await db.insert(crewMembers).values({
		groupId: "helpers",
		name: "Peter",
		role: "Helper",
		imageUrl: image("crew"),
	});
	await db.insert(listings).values({
		kind: "scholarship",
		slug: "s",
		title: "S",
		organization: "O",
		summary: "x",
		url: "https://example.org",
		imageUrl: image("card"),
	});
	const draft = defaultNewsletter();
	await db.insert(newsletters).values({
		title: "N",
		data: { ...draft, headerTitle: `see ${image("letter")}` },
	});
	await db.insert(newsletterPresets).values({
		name: "P",
		data: { ...draft, headerTitle: image("preset") },
	});
}

describe("which uploads are in use", () => {
	it("finds uploads used by cards, photos, people, newsletters and presets", async () => {
		await useEverywhere();
		const used = await referencedImageUrls(db);
		for (const name of ["photo", "crew", "card", "letter", "preset"]) {
			expect(used.has(image(name))).toBe(true);
		}

		expect(used.has(image("loose"))).toBe(false);
	});
});

describe("discarding an upload", () => {
	it("deletes one that nothing uses", async () => {
		expect(await discardUnusedImage(db, image("loose"))).toBe("deleted");
		expect(store.deleted).toEqual([image("loose")]);
	});

	it("never deletes one that is still in use", async () => {
		await useEverywhere();
		for (const name of ["photo", "crew", "card", "letter", "preset"]) {
			// eslint-disable-next-line no-await-in-loop -- one at a time.
			expect(await discardUnusedImage(db, image(name))).toBe("in-use");
		}

		expect(store.deleted).toEqual([]);
	});

	it("ignores anything that isn't one of our uploads", async () => {
		expect(await discardUnusedImage(db, "https://evil.example/a.jpg")).toBe(
			"skipped"
		);
		expect(await discardUnusedImage(db, `${host}/other/a.jpg`)).toBe("skipped");
		expect(store.deleted).toEqual([]);
	});

	it("does nothing when the store isn't connected", async () => {
		delete process.env.BLOB_READ_WRITE_TOKEN;
		delete process.env.aviatorsblob_READ_WRITE_TOKEN;
		expect(await discardUnusedImage(db, image("loose"))).toBe("skipped");
	});
});

describe("the daily sweep", () => {
	it("deletes old unused uploads, and keeps used and recent ones", async () => {
		await useEverywhere();
		const now = new Date();
		const old = new Date(now.getTime() - orphanGraceMs - 60_000);
		const fresh = new Date(now.getTime() - 60_000);
		store.files = [
			{ url: image("photo"), uploadedAt: old },
			{ url: image("old-orphan"), uploadedAt: old },
			{ url: image("fresh-orphan"), uploadedAt: fresh },
		];
		expect(await sweepOrphanImages(db, now)).toBe(1);
		expect(store.deleted).toEqual([image("old-orphan")]);
	});

	it("also clears files of items purged from the trash", async () => {
		const [photo] = await db
			.insert(galleryPhotos)
			.values({ alt: "A", imageUrl: image("gone") })
			.returning();
		const now = new Date();
		const old = new Date(now.getTime() - orphanGraceMs - 60_000);
		store.files = [{ url: image("gone"), uploadedAt: old }];
		// Still in the database (even if trashed): kept.
		expect(await sweepOrphanImages(db, now)).toBe(0);
		await db.delete(galleryPhotos);
		expect(photo).toBeDefined();
		expect(await sweepOrphanImages(db, now)).toBe(1);
	});
});
