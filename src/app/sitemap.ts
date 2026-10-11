import type { MetadataRoute } from "next";
import { site } from "@/content/site";
import { listingPath } from "@/lib/listing-path";
import { getPublishedListings } from "@/lib/listings";
import { getNewsletterArchive } from "@/lib/newsletters-public";

const routes = [
	"",
	"/about",
	"/story",
	"/charter",
	"/meetings",
	"/opportunities",
	"/scholarships",
	"/careers",
	"/flight-crew",
	"/gallery",
	"/stories",
	"/newsletter",
	"/connect",
	"/join",
	"/brand",
	"/privacy",
	"/terms",
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
	const [opportunities, scholarships, issues] = await Promise.all([
		getPublishedListings("opportunity"),
		getPublishedListings("scholarship"),
		getNewsletterArchive(),
	]);
	const pages = [
		...routes,
		...[...opportunities, ...scholarships].flatMap(
			(listing) => listingPath(listing) ?? []
		),
		...issues.map((issue) => `/newsletter/${issue.slug}`),
	];
	return pages.map((route) => ({
		url: `${site.url}${route}`,
		changeFrequency:
			route === "" || route === "/meetings" ? "weekly" : "monthly",
		priority: route === "" ? 1 : 0.7,
	}));
}
