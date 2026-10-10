import type { NextConfig } from "next";

// Old Mobirise URLs (GitHub Pages served both /page and /page.html) and recode
// routes → new locations. Kept in sync with the gh-pages redirect branch.
const legacyRedirects: Array<[string, string]> = [
	["/index", "/"],
	["/index.html", "/"],
	["/mission", "/about"],
	["/mission.html", "/about"],
	["/story.html", "/story"],
	["/charter.html", "/charter"],
	["/expectations", "/charter#code-of-conduct"],
	["/expectations.html", "/charter#code-of-conduct"],
	["/meetings.html", "/meetings"],
	["/opportunities.html", "/opportunities"],
	["/scholarships.html", "/scholarships"],
	["/careers.html", "/careers"],
	["/flight-crew.html", "/flight-crew"],
	["/leadership", "/flight-crew"],
	["/share-story", "/stories"],
	["/share-story.html", "/stories"],
	["/highlights", "/gallery"],
	["/highlights.html", "/gallery"],
	["/socials", "/connect"],
	["/socials.html", "/connect"],
	["/contact-us", "/connect"],
	["/contact-us.html", "/connect"],
	["/email-builder", "/dashboard/newsletter"],
];

const nextConfig: NextConfig = {
	images: {
		// Fewer breakpoints → fewer transformations on the Hobby plan.
		deviceSizes: [640, 828, 1200, 1920],
		imageSizes: [96, 256, 384],
		formats: ["image/webp"],
		minimumCacheTTL: 2_678_400, // 31 days
		remotePatterns: [
			{ protocol: "https", hostname: "behold.pictures" },
			{ protocol: "https", hostname: "cdn2.behold.pictures" },
		],
	},
	async redirects() {
		return legacyRedirects.map(([source, destination]) => ({
			source,
			destination,
			permanent: true,
		}));
	},
};

export default nextConfig;
