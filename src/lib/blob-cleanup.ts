import type { Database } from "@/db";
import {
	crewMembers,
	galleryPhotos,
	listings,
	newsletterPresets,
	newsletters,
} from "@/db/schema";
import { blobToken } from "@/lib/blob-token";
import { isBlobUrl } from "@/lib/blob-url";
import { del, list } from "@vercel/blob";
import { isNotNull, sql } from "drizzle-orm";

/*
 * Keeping the image store tidy. An upload goes to Blob first and is only
 * linked to a card, photo or person when that is saved, so a failed save (or
 * a failed AI caption) would leave the file behind. Three layers stop that:
 * the screen deletes the file at once when adding fails, the form deletes an
 * upload that is replaced or removed, and a daily sweep deletes any upload
 * that nothing uses after a day (which also clears the files of items purged
 * from the trash). Nothing is ever deleted while something still uses it.
 */

const uploadPrefix = "uploads/";
export const orphanGraceMs = 24 * 60 * 60 * 1000;
const sweepEveryMs = 24 * 60 * 60 * 1000;
const maxSweepFiles = 2000;

const blobUrlPattern =
	/https:\/\/[\d\-a-z]+\.public\.blob\.vercel-storage\.com\/[^\s"')<>\\]+/giu;

function isOurUpload(url: string): boolean {
	return isBlobUrl(url) && new URL(url).pathname.startsWith(`/${uploadPrefix}`);
}

function normalize(url: string): string {
	try {
		const parsed = new URL(url);
		return `${parsed.origin}${decodeURI(parsed.pathname)}`;
	} catch {
		return url;
	}
}

/**
Every upload that something still points at, trashed items included (they come
back if restored). Newsletters keep their images inside their content.
*/
export async function referencedImageUrls(db: Database): Promise<Set<string>> {
	const [listingRows, photoRows, crewRows, letterRows, presetRows] =
		await Promise.all([
			db
				.select({ url: listings.imageUrl })
				.from(listings)
				.where(isNotNull(listings.imageUrl)),
			db
				.select({ url: galleryPhotos.imageUrl })
				.from(galleryPhotos)
				.where(isNotNull(galleryPhotos.imageUrl)),
			db
				.select({ url: crewMembers.imageUrl })
				.from(crewMembers)
				.where(isNotNull(crewMembers.imageUrl)),
			db
				.select({
					text: sql<string>`concat(${newsletters.data}::text, ' ', coalesce(${newsletters.published}::text, ''))`,
				})
				.from(newsletters),
			db
				.select({ text: sql<string>`${newsletterPresets.data}::text` })
				.from(newsletterPresets),
		]);

	const used = new Set<string>();
	for (const row of [...listingRows, ...photoRows, ...crewRows]) {
		if (row.url) {
			used.add(normalize(row.url));
		}
	}

	for (const row of [...letterRows, ...presetRows]) {
		for (const match of row.text.matchAll(blobUrlPattern)) {
			used.add(normalize(match[0]));
		}
	}

	return used;
}

export type DiscardResult = "deleted" | "in-use" | "skipped";

/**
Deletes one upload that nothing uses (the officer backed out, or saving
failed). Refuses anything still in use, and anything that isn't one of our
uploads.
*/
export async function discardUnusedImage(
	db: Database,
	url: string
): Promise<DiscardResult> {
	const token = blobToken();
	if (token === undefined || !isOurUpload(url)) {
		return "skipped";
	}

	const used = await referencedImageUrls(db);
	if (used.has(normalize(url))) {
		return "in-use";
	}

	await del(url, { token });
	return "deleted";
}

/**
Deletes uploads older than a day that nothing uses. Returns how many went.
*/
export async function sweepOrphanImages(
	db: Database,
	now = new Date()
): Promise<number> {
	const token = blobToken();
	if (token === undefined) {
		return 0;
	}

	const used = await referencedImageUrls(db);
	const cutoff = now.getTime() - orphanGraceMs;
	const orphans: string[] = [];
	let cursor: string | undefined;
	let seen = 0;
	do {
		// eslint-disable-next-line no-await-in-loop -- pages come one after another.
		const page = await list({
			token,
			prefix: uploadPrefix,
			limit: 1000,
			cursor,
		});
		for (const blob of page.blobs) {
			seen++;
			if (
				blob.uploadedAt.getTime() < cutoff &&
				!used.has(normalize(blob.url))
			) {
				orphans.push(blob.url);
			}
		}

		cursor = page.hasMore ? page.cursor : undefined;
	} while (cursor !== undefined && seen < maxSweepFiles);

	if (orphans.length > 0) {
		await del(orphans, { token });
	}

	return orphans.length;
}

let lastSweep = 0;

/**
The daily sweep, at most once a day per server instance.
*/
export async function sweepOrphansIfDue(
	db: Database,
	now = new Date()
): Promise<void> {
	if (now.getTime() - lastSweep < sweepEveryMs) {
		return;
	}

	lastSweep = now.getTime();
	try {
		await sweepOrphanImages(db, now);
	} catch (error) {
		console.error("Could not sweep unused images", error);
	}
}
