import type { ListingKind } from "@/lib/listings";

/*
 * /dashboard/opportunities and /dashboard/scholarships share one set of
 * screens; the URL segment picks the kind.
 */

export const kindConfig = {
	opportunities: {
		kind: "opportunity",
		plural: "Opportunities",
		singular: "opportunity",
		article: "an",
	},
	scholarships: {
		kind: "scholarship",
		plural: "Scholarships",
		singular: "scholarship",
		article: "a",
	},
} as const satisfies Record<
	string,
	{ kind: ListingKind; plural: string; singular: string; article: string }
>;

export type KindSlug = keyof typeof kindConfig;

export function kindFromSlug(slug: string) {
	return slug === "opportunities" || slug === "scholarships"
		? { slug, ...kindConfig[slug] }
		: undefined;
}
