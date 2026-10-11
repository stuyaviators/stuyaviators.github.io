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

type Dated = Pick<Listing, "kind" | "deadline" | "startDate" | "endDate">;

/**
When a card is "on": a scholarship's deadline, or an opportunity's own date
(its start date, or its deadline for ones that only have that).
*/
export function eventDate(listing: Dated): string | undefined {
	return listing.kind === "opportunity"
		? (listing.startDate ?? listing.deadline ?? undefined)
		: (listing.deadline ?? undefined);
}

/**
The last day a card is still relevant. For an opportunity the deadline is just
the RSVP date, so the event's own dates decide when it moves to Past.
*/
function lastDay(listing: Dated): string | undefined {
	return listing.kind === "opportunity"
		? (listing.endDate ?? listing.startDate ?? listing.deadline ?? undefined)
		: (listing.deadline ?? listing.endDate ?? undefined);
}

export function isExpired(listing: Dated, now = new Date()) {
	const last = lastDay(listing);
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

function inDays(days: number) {
	if (days === 0) {
		return "today";
	}

	return days === 1 ? "in 1 day" : `in ${days} days`;
}

/**
The tag on a card that is coming up soon: "Closing soon · 3 days" for a
scholarship, "Happening in 3 days" for an opportunity. Nothing when it is far
off, already over, or has no date.
*/
export function soonLabel(
	listing: Dated,
	now = new Date()
): string | undefined {
	if (listing.kind === "scholarship") {
		if (!isClosingSoon(listing, now) || !listing.deadline) {
			return undefined;
		}

		const days = daysUntil(listing.deadline, now);
		return `Closing soon · ${days === 0 ? "today" : days === 1 ? "1 day" : `${days} days`}`;
	}

	const start = eventDate(listing);
	if (!start) {
		return undefined;
	}

	const days = daysUntil(start, now);
	if (days < 0) {
		// Started already: still happening until its last day.
		const last = lastDay(listing);
		return last !== undefined && last !== start && daysUntil(last, now) >= 0
			? "Happening now"
			: undefined;
	}

	return days <= closingSoonDays ? `Happening ${inDays(days)}` : undefined;
}
