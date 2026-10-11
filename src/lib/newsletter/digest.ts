import type { Listing } from "@/lib/listings";
import type { Block, NewsletterData } from "./types.ts";
import { daysUntil } from "@/lib/listing-dates";
import { defaultNewsletter, newBlock } from "./defaults.ts";

/*
 * The "deadline digest": a ready-made newsletter draft listing the cards
 * whose deadline is a couple of weeks away. Officers edit it like any other
 * draft before publishing.
 */

export const digestWindow = { fromDays: 14, toDays: 21 } as const;

const dateFormat = new Intl.DateTimeFormat("en-US", {
	month: "long",
	day: "numeric",
	year: "numeric",
	timeZone: "UTC",
});

export function inDigestWindow(
	listing: Pick<Listing, "deadline" | "status" | "deletedAt">,
	now = new Date()
) {
	if (
		listing.status !== "published" ||
		listing.deletedAt !== null ||
		listing.deadline === null
	) {
		return false;
	}

	const days = daysUntil(listing.deadline, now);
	return days >= digestWindow.fromDays && days <= digestWindow.toDays;
}

function articleFor(listing: Listing): Block {
	const deadline = listing.deadline
		? dateFormat.format(new Date(`${listing.deadline}T00:00:00Z`))
		: "";
	const lines = [
		listing.summary,
		listing.amount ? `**Award:** ${listing.amount}` : "",
		deadline ? `**Deadline:** ${deadline}` : "",
	].filter(Boolean);
	const block = newBlock("article", `digest-${listing.id}`, {
		title: `${listing.title} · ${listing.organization}`.slice(0, 200),
	});
	return block.type === "article"
		? {
				...block,
				body: lines.join("\n\n").slice(0, 5000),
				imageUrl: listing.imageUrl ?? "",
				buttonText: listing.kind === "scholarship" ? "Apply" : "Learn more",
				buttonUrl: listing.url,
			}
		: block;
}

/**
Builds the draft, soonest deadline first within scholarships, then
opportunities. Returns undefined when nothing falls in the window.
*/
export function buildDeadlineDigest(
	candidates: readonly Listing[],
	now = new Date()
): NewsletterData | undefined {
	const due = candidates
		.filter((listing) => inDigestWindow(listing, now))
		.toSorted((a, b) => (a.deadline ?? "").localeCompare(b.deadline ?? ""));
	if (due.length === 0) {
		return undefined;
	}

	const base = defaultNewsletter(now);
	const blocks: Block[] = [];
	for (const [kind, heading] of [
		["scholarship", "Scholarships closing soon"],
		["opportunity", "Opportunities closing soon"],
	] as const) {
		const group = due.filter((listing) => listing.kind === kind);
		if (group.length > 0) {
			blocks.push(
				newBlock("separator", `digest-${kind}`, { title: heading }),
				...group.map((listing) => articleFor(listing))
			);
		}
	}

	return {
		...base,
		previewText: "Deadlines coming up in the next few weeks",
		introHeading: "Deadlines coming up",
		introText:
			"These scholarships and opportunities close in the next few weeks. Don’t miss them!",
		blocks: blocks.slice(0, 60),
	};
}
