import type { MetadataRoute } from "next";
import { site } from "@/content/site";

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
	"/connect",
	"/join",
	"/brand",
];

export default function sitemap(): MetadataRoute.Sitemap {
	return routes.map((route) => ({
		url: `${site.url}${route}`,
		changeFrequency:
			route === "" || route === "/meetings" ? "weekly" : "monthly",
		priority: route === "" ? 1 : 0.7,
	}));
}
