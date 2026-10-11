import type { Listing } from "@/lib/listings";

/*
 * Pure date helpers for listings. Kept apart from src/lib/listings.ts (which
 * talks to the database) so client components, like the dashboard's live
 * preview, can use them.
 */

export const closingSoonDays = 14;

/**
Days from today (America/New_York) until the deadline; negative = past.
*/
export function daysUntil(deadline: string, now = new Date()): number {
	const today = new Intl.DateTimeFormat("en-CA", {
		timeZone: "America/New_York",
	}).format(now);
	const ms =
		Date.parse(`${deadline}T00:00:00Z`) - Date.parse(`${today}T00:00:00Z`);
	return Math.round(ms / 86_400_000);
}

export function isExpired(
	listing: Pick<Listing, "deadline" | "endDate">,
	now = new Date()
) {
	const last = listing.deadline ?? listing.endDate;
	return last ? daysUntil(last, now) < 0 : false;
}

export function isClosingSoon(
	listing: Pick<Listing, "deadline">,
	now = new Date()
) {
	if (!listing.deadline) {
		return false;
	}

	const days = daysUntil(listing.deadline, now);
	return days >= 0 && days <= closingSoonDays;
}
