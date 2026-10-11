import { getDb } from "@/db";
import { listings } from "@/db/schema";
import { and, asc, eq, isNull } from "drizzle-orm";
import { unstable_cache } from "next/cache";

export type Listing = typeof listings.$inferSelect;
export type ListingKind = Listing["kind"];

export const listingsTag = "listings";
export {
	closingSoonDays,
	daysUntil,
	isClosingSoon,
	isExpired,
} from "./listing-dates.ts";

/**
Published, not deleted; ordered by sort order then deadline.
*/
export const getPublishedListings = unstable_cache(
	async (kind: ListingKind): Promise<Listing[]> => {
		const db = getDb();
		if (!db) {
			return [];
		}

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
