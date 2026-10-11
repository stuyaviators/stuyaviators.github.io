import type { Listing } from "@/lib/listings";

/**
Where a card's own page lives, or undefined for a card without an address.
*/
export function listingPath(listing: Pick<Listing, "kind" | "slug">) {
	const section =
		listing.kind === "scholarship" ? "scholarships" : "opportunities";
	return listing.slug ? `/${section}/${listing.slug}` : undefined;
}
