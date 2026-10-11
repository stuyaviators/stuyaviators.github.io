import { getDb } from "@/db";
import { listings } from "@/db/schema";
import { deadlineOrder } from "@/lib/listing-order";
import { and, eq, isNull } from "drizzle-orm";
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
Published, not deleted; soonest deadline first (see listing-order.ts).
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
				.orderBy(...deadlineOrder);
		} catch (error) {
			console.error("Could not load listings", error);
			return [];
		}
	},
	["published-listings"],
	{ tags: [listingsTag], revalidate: 3600 }
);

/**
One published card by its address, for the card's own page. Cards past their
deadline are still shown (marked closed), since people keep old links.
*/
export const getPublishedListing = unstable_cache(
	async (kind: ListingKind, slug: string): Promise<Listing | undefined> => {
		const db = getDb();
		if (!db) {
			return undefined;
		}

		try {
			const rows = await db
				.select()
				.from(listings)
				.where(
					and(
						eq(listings.kind, kind),
						eq(listings.slug, slug),
						eq(listings.status, "published"),
						isNull(listings.deletedAt)
					)
				)
				.limit(1);
			return rows.at(0);
		} catch (error) {
			console.error("Could not load the listing", error);
			return undefined;
		}
	},
	["published-listing"],
	{ tags: [listingsTag], revalidate: 3600 }
);
