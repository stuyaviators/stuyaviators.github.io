/**
 Writes the static redirect pages for the `gh-pages` branch: one file per old
 Mobirise page, so old Google results and shared links on
 stuyaviators.github.io land on the matching page of the new site.
 Keep the table in sync with `legacyRedirects` in next.config.ts.
 Usage: node scripts/gh-pages-redirects.ts <out-dir> [site-url]
 The site URL defaults to NEXT_PUBLIC_SITE_URL, then the Vercel address.
 */

import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

// Old file (GitHub Pages also served it without ".html") → new path.
export const pages: Array<[file: string, target: string]> = [
	["index.html", "/"],
	["mission.html", "/about"],
	["story.html", "/story"],
	["charter.html", "/charter"],
	["expectations.html", "/charter#code-of-conduct"],
	["meetings.html", "/meetings"],
	["opportunities.html", "/opportunities"],
	["scholarships.html", "/scholarships"],
	["careers.html", "/careers"],
	["flight-crew.html", "/flight-crew"],
	["share-story.html", "/stories"],
	["highlights.html", "/gallery"],
	["socials.html", "/connect"],
	["contact-us.html", "/connect"],
];

const escapeHtml = (value: string) =>
	value
		.replaceAll("&", "&amp;")
		.replaceAll('"', "&quot;")
		.replaceAll("<", "&lt;")
		.replaceAll(">", "&gt;");

export function redirectPage(destination: string): string {
	const href = escapeHtml(destination);
	const script = JSON.stringify(destination).replaceAll(
		"<",
		String.raw`\u003c`
	);
	return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex">
<title>StuyAviators has moved</title>
<link rel="canonical" href="${href}">
<meta http-equiv="refresh" content="0; url=${href}">
<script>location.replace(${script});</script>
</head>
<body>
<p>StuyAviators has a new home: <a href="${href}">${href}</a></p>
</body>
</html>
`;
}

export async function writeRedirects(out: string, site: string) {
	const base = site.endsWith("/") ? site.slice(0, -1) : site;
	await mkdir(out, { recursive: true });
	const files: Array<[string, string]> = [
		...pages,
		// Anything else that used to exist goes to the home page.
		["404.html", "/"],
	];
	await Promise.all(
		files.map(async ([file, target]) =>
			writeFile(path.join(out, file), redirectPage(base + target))
		)
	);
	// No Jekyll build: serve the files exactly as they are.
	await writeFile(path.join(out, ".nojekyll"), "");
	return files.map(([file]) => file);
}

if (import.meta.main) {
	const [out, site] = process.argv.slice(2);
	if (!out) {
		throw new Error(
			"Usage: node scripts/gh-pages-redirects.ts <out-dir> [site-url]"
		);
	}

	const written = await writeRedirects(
		path.resolve(out),
		site ??
			process.env.NEXT_PUBLIC_SITE_URL ??
			"https://stuyaviators.vercel.app"
	);
	console.log(`Wrote ${written.length} pages and .nojekyll to ${out}`);
}
