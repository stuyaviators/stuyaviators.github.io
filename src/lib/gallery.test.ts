import type { Database } from "@/db";
import { galleryPhotos, photos, spotlightPhotos } from "@/content/photos";
import { didMoveToTrash } from "@/lib/trash";
import { createTestDb } from "@/test/pglite";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/db", () => ({ getDb: () => undefined }));
vi.mock("next/cache", () => ({
	unstable_cache: <T>(function_: T) => function_,
}));

const {
	addGalleryPhoto,
	getPublicGallery,
	importStaticGallery,
	listGalleryRows,
	moveGalleryPhoto,
	newPhotoSchema,
	shuffleGalleryPhotos,
	toLightboxImage,
	updateGalleryAlt,
} = await import("./gallery.ts");

let db: Database;
beforeEach(async () => {
	db = await createTestDb();
});

const url =
	"https://abc.public.blob.vercel-storage.com/uploads/highlight/a.jpg";
const photo = (alt: string) => ({
	alt,
	imageUrl: url,
	width: 1600,
	height: 900,
});
const alts = async () => (await listGalleryRows(db)).map((row) => row.alt);

describe("gallery", () => {
	const bundled = [...galleryPhotos, ...spotlightPhotos];

	it("imports the bundled photos once, in page order", async () => {
		expect(await importStaticGallery(db)).toBe(bundled.length);
		expect(await importStaticGallery(db)).toBe(0);
		expect((await listGalleryRows(db)).map((row) => row.photoKey)).toEqual(
			bundled
		);
	});

	it("shows imported photos exactly like the bundled page, with camera details", async () => {
		await importStaticGallery(db);
		const images = (await listGalleryRows(db)).map((row) =>
			toLightboxImage(row)
		);
		expect(images.map((image) => image?.src)).toEqual(
			bundled.map((key) => photos[key].src)
		);
		expect(images.map((image) => image?.alt)).toEqual(
			bundled.map((key) => photos[key].alt)
		);
		expect(images.some((image) => image?.spec !== undefined)).toBe(true);
	});

	it("is the bundled set until the database has photos", async () => {
		const images = await getPublicGallery();
		expect(images).toHaveLength(bundled.length);
	});

	it("puts new photos first, and uploaded ones carry their size", async () => {
		await addGalleryPhoto(db, photo("Older"), "a");
		await addGalleryPhoto(db, photo("Newer"), "a");
		expect(await alts()).toEqual(["Newer", "Older"]);
		const [first] = await listGalleryRows(db);
		expect(first === undefined ? undefined : toLightboxImage(first)).toEqual({
			src: { src: url, width: 1600, height: 900 },
			alt: "Newer",
			isAiCaption: false,
		});
	});

	it("edits the description, reorders and removes", async () => {
		await addGalleryPhoto(db, photo("A"), "a");
		await addGalleryPhoto(db, photo("B"), "a");
		const rows = await listGalleryRows(db);
		const a = rows.find((row) => row.alt === "A");
		await moveGalleryPhoto(db, a?.id ?? "", "up");
		expect(await alts()).toEqual(["A", "B"]);
		expect((await updateGalleryAlt(db, a?.id ?? "", "Renamed", "x"))?.alt).toBe(
			"Renamed"
		);
		expect(await didMoveToTrash(db, "gallery", a?.id ?? "", "x")).toBe(true);
		expect(await didMoveToTrash(db, "gallery", a?.id ?? "", "x")).toBe(false);
		expect(await alts()).toEqual(["B"]);
	});

	it("shuffles the photos into a new order, leaving none out", async () => {
		for (const name of ["A", "B", "C", "D"]) {
			// eslint-disable-next-line no-await-in-loop -- keeps the order of adding.
			await addGalleryPhoto(db, photo(name), "x");
		}

		const before = await alts();
		const order = await shuffleGalleryPhotos(db, () => 0);
		expect(order).toHaveLength(4);
		const after = await alts();
		expect(after.toSorted()).toEqual(before.toSorted());
		expect(after).not.toEqual(before);
	});

	it("labels AI descriptions, and an edit takes the label off", async () => {
		await addGalleryPhoto(db, photo("Written by AI"), "a", true);
		const [row] = await listGalleryRows(db);
		expect(row?.isAiCaption).toBe(true);
		expect(
			row === undefined ? undefined : toLightboxImage(row)?.isAiCaption
		).toBe(true);
		// Saving the same text keeps the label; changing it removes it.
		const same = await updateGalleryAlt(
			db,
			row?.id ?? "",
			"Written by AI",
			"x"
		);
		expect(same?.isAiCaption).toBe(true);
		const edited = await updateGalleryAlt(db, row?.id ?? "", "My words", "x");
		expect(edited?.isAiCaption).toBe(false);
		// A fresh AI description puts it back.
		const again = await updateGalleryAlt(
			db,
			row?.id ?? "",
			"New AI text",
			"x",
			true
		);
		expect(again?.isAiCaption).toBe(true);
	});

	it("labels the imported bundled photos as AI descriptions", async () => {
		await importStaticGallery(db);
		const rows = await listGalleryRows(db);
		expect(rows.every((item) => item.isAiCaption)).toBe(true);
		expect((await getPublicGallery()).every((image) => image.isAiCaption)).toBe(
			true
		);
	});

	it("only accepts uploaded photos with a size, and a description is optional", () => {
		expect(newPhotoSchema.safeParse(photo("Ok")).success).toBe(true);
		for (const bad of [
			{ ...photo("Ok"), imageUrl: "" },
			{ ...photo("Ok"), imageUrl: "https://example.org/a.jpg" },
			{ ...photo("Ok"), width: 0 },
			{ ...photo("Ok"), height: 1.5 },
			{ ...photo("x".repeat(301)) },
		]) {
			expect(newPhotoSchema.safeParse(bad).success).toBe(false);
		}

		expect(newPhotoSchema.safeParse(photo("  ")).data?.alt).toBe("");
	});
});
