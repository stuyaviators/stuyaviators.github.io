import { and, asc, eq, isNull } from "drizzle-orm";
import { unstable_cache } from "next/cache";
import { getDb } from "@/db";
import { listings } from "@/db/schema";

export type Listing = typeof listings.$inferSelect;
export type ListingKind = Listing["kind"];

export const listingsTag = "listings";
export const closingSoonDays = 14;

/** Days from today (America/New_York) until the deadline; negative = past. */
export function daysUntil(deadline: string, now = new Date()): number {
	const today = new Intl.DateTimeFormat("en-CA", {
		timeZone: "America/New_York",
	}).format(now);
	const ms = Date.parse(`${deadline}T00:00:00Z`) - Date.parse(`${today}T00:00:00Z`);
	return Math.round(ms / 86_400_000);
}

export function isExpired(listing: Pick<Listing, "deadline" | "endDate">, now = new Date()) {
	const last = listing.deadline ?? listing.endDate;
	return last ? daysUntil(last, now) < 0 : false;
}

export function isClosingSoon(listing: Pick<Listing, "deadline">, now = new Date()) {
	if (!listing.deadline) return false;
	const days = daysUntil(listing.deadline, now);
	return days >= 0 && days <= closingSoonDays;
}

/** Published, not deleted; ordered by sort order then deadline. */
export const getPublishedListings = unstable_cache(
	async (kind: ListingKind): Promise<Listing[]> => {
		const db = getDb();
		if (!db) return [];
		try {
			return await db
				.select()
				.from(listings)
				.where(
					and(
						eq(listings.kind, kind),
						eq(listings.status, "published"),
						isNull(listings.deletedAt)
					)
				)
				.orderBy(asc(listings.sortOrder), asc(listings.deadline));
		} catch (error) {
			console.error("Could not load listings", error);
			return [];
		}
	},
	["published-listings"],
	{ tags: [listingsTag], revalidate: 3600 }
);
