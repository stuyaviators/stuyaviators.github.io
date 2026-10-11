import type { LightboxImage } from "@/components/Lightbox";
import type { Database } from "@/db";
import { photoSpecs } from "@/content/photo-specs";
import { galleryPhotos, photos, spotlightPhotos } from "@/content/photos";
import { getDb } from "@/db";
import { galleryPhotos as galleryTable } from "@/db/schema";
import { optionalBlobUrl } from "@/lib/blob-url";
import { moveId } from "@/lib/reorder";
import { asc, eq, sql } from "drizzle-orm";
import { unstable_cache } from "next/cache";
import { z } from "zod";

/*
 * The gallery page. Until the bundled photos are imported (or a photo is
 * added) the page keeps showing the ones in src/content/photos.ts.
 */

export const galleryTag = "gallery";

export type GalleryRow = typeof galleryTable.$inferSelect;

export const altSchema = z
	.string()
	.trim()
	.min(1, "Describe the photo for people who can't see it")
	.max(300);

export const newPhotoSchema = z.object({
	alt: altSchema,
	imageUrl: optionalBlobUrl.refine((value) => value !== "", {
		message: "Upload a photo",
	}),
	width: z.int().min(1).max(10_000),
	height: z.int().min(1).max(10_000),
});

export type NewPhotoInput = z.infer<typeof newPhotoSchema>;

export async function listGalleryRows(db: Database): Promise<GalleryRow[]> {
	return db
		.select()
		.from(galleryTable)
		.orderBy(asc(galleryTable.sortOrder), asc(galleryTable.createdAt));
}

/**
New photos go first: the newest is the one people want to see.
*/
export async function addGalleryPhoto(
	db: Database,
	input: NewPhotoInput,
	by: string
) {
	const lowest = await db
		.select({
			first: sql<number>`coalesce(min(${galleryTable.sortOrder}) - 1, 0)::int`,
		})
		.from(galleryTable);
	await db.insert(galleryTable).values({
		alt: input.alt,
		imageUrl: input.imageUrl,
		width: input.width,
		height: input.height,
		sortOrder: lowest.at(0)?.first ?? 0,
		updatedBy: by,
	});
}

export async function updateGalleryAlt(
	db: Database,
	id: string,
	alt: string,
	by: string
): Promise<GalleryRow | undefined> {
	const rows = await db
		.update(galleryTable)
		.set({ alt, updatedAt: new Date(), updatedBy: by })
		.where(eq(galleryTable.id, id))
		.returning();
	return rows.at(0);
}

export async function deleteGalleryPhoto(db: Database, id: string) {
	const rows = await db
		.delete(galleryTable)
		.where(eq(galleryTable.id, id))
		.returning({ id: galleryTable.id });
	return rows.length;
}

export async function moveGalleryPhoto(
	db: Database,
	id: string,
	direction: "up" | "down"
): Promise<string[] | undefined> {
	const rows = await listGalleryRows(db);
	const order = moveId(
		rows.map((row) => row.id),
		id,
		direction
	);
	if (order) {
		await Promise.all(
			order.map(async (rowId, sortOrder) =>
				db
					.update(galleryTable)
					.set({ sortOrder })
					.where(eq(galleryTable.id, rowId))
			)
		);
	}

	return order;
}

/**
Copies the bundled photos, in page order. Only when the table is empty.
*/
export async function importStaticGallery(db: Database): Promise<number> {
	const existing = await db
		.select({ id: galleryTable.id })
		.from(galleryTable)
		.limit(1);
	if (existing.length > 0) {
		return 0;
	}

	const rows = [...galleryPhotos, ...spotlightPhotos].map(
		(photoKey, sortOrder) => ({
			alt: photos[photoKey].alt,
			photoKey,
			sortOrder,
			updatedBy: "import",
		})
	);
	await db.insert(galleryTable).values(rows);
	return rows.length;
}

export function isPhotoKey(
	key: string | undefined
): key is keyof typeof photos {
	return key !== undefined && Object.hasOwn(photos, key);
}

export function toLightboxImage(row: GalleryRow): LightboxImage | undefined {
	if (row.imageUrl !== null && row.width !== null && row.height !== null) {
		return {
			src: { src: row.imageUrl, width: row.width, height: row.height },
			alt: row.alt,
		};
	}

	const key = row.photoKey ?? undefined;
	return isPhotoKey(key)
		? { src: photos[key].src, alt: row.alt, spec: photoSpecs[key] }
		: undefined;
}

function bundledImages(): LightboxImage[] {
	return [...galleryPhotos, ...spotlightPhotos].map((key) => ({
		...photos[key],
		spec: photoSpecs[key],
	}));
}

export const getPublicGallery = unstable_cache(
	async (): Promise<LightboxImage[]> => {
		const db = getDb();
		if (db) {
			try {
				const rows = await listGalleryRows(db);
				if (rows.length > 0) {
					return rows.flatMap((row) => toLightboxImage(row) ?? []);
				}
			} catch (error) {
				console.error("Could not load the gallery", error);
			}
		}

		return bundledImages();
	},
	["gallery"],
	{ tags: [galleryTag], revalidate: 3600 }
);
