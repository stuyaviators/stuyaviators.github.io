/* eslint-disable regexp/prefer-named-capture-group, regexp/sort-character-class-elements, unicorn/prefer-string-raw -- many small one-off patterns: named groups and raw strings would only make them harder to read. */

import { lookup } from "node:dns/promises";
import { isIP } from "node:net";

/*
 * "Autofill from link" for opportunities and scholarships. It reads the page
 * the officer pasted (title, social-card tags, structured data, readable
 * text) and guesses the form fields. No AI and no outside service: these are
 * only guesses, so the dashboard asks the officer to check them.
 */

export type Suggestion = Partial<{
	title: string;
	organization: string;
	summary: string;
	description: string;
	deadline: string;
	amount: string;
	startDate: string;
	endDate: string;
	location: string;
	eligibility: string;
	// Where the page's picture lives. The action re-hosts it in our own storage.
	imageUrl: string;
}>;

const entities: Record<string, string> = {
	amp: "&",
	lt: "<",
	gt: ">",
	quot: '"',
	apos: "'",
	nbsp: " ",
	ndash: "–",
	mdash: "—",
	rsquo: "’",
	lsquo: "‘",
	rdquo: "”",
	ldquo: "“",
	hellip: "…",
};

function decode(text: string): string {
	return text.replaceAll(
		/&(#x[\da-f]+|#\d+|[a-z]+);/giu,
		(whole, code: string) => {
			if (code.startsWith("#")) {
				const point = Number(
					code[1] === "x" || code[1] === "X"
						? `0x${code.slice(2)}`
						: code.slice(1)
				);
				return Number.isSafeInteger(point) && point > 0 && point < 0x11_00_00
					? String.fromCodePoint(point)
					: whole;
			}

			return entities[code.toLowerCase()] ?? whole;
		}
	);
}

const squash = (text: string) => decode(text).replaceAll(/\s+/gu, " ").trim();

function cut(text: string, max: number): string {
	if (text.length <= max) {
		return text;
	}

	const clipped = text.slice(0, max - 1);
	const space = clipped.lastIndexOf(" ");
	return `${(space > max * 0.6 ? clipped.slice(0, space) : clipped).trimEnd()}…`;
}

/*
 * Pages are untrusted and can be huge, so tags are found with indexOf (always
 * linear) rather than patterns that can backtrack badly.
 */

type Element = { attrs: string; inner: string };

function elements(html: string, name: string, limit = 200): Element[] {
	const lower = html.toLowerCase();
	const found: Element[] = [];
	let position = 0;
	while (found.length < limit) {
		const start = lower.indexOf(`<${name}`, position);
		if (start === -1) {
			break;
		}

		const open = lower.indexOf(">", start);
		if (open === -1) {
			break;
		}

		position = open + 1;
		const after = lower.charAt(start + name.length + 1);
		// "<p" must not match "<pre" or "<path".
		if (after !== ">" && after !== "/" && !/\s/u.test(after)) {
			continue;
		}

		const close = lower.indexOf(`</${name}`, position);
		found.push({
			attrs: html.slice(start + name.length + 1, open),
			inner: close === -1 ? "" : html.slice(position, close),
		});
		if (close !== -1) {
			position = close;
		}
	}

	return found;
}

/**
The page without the tags whose contents are never readable text.
*/
function withoutBlock(html: string, lower: string, name: string): string {
	let output = "";
	let position = 0;
	for (;;) {
		const start = lower.indexOf(`<${name}`, position);
		if (start === -1) {
			return output + html.slice(position);
		}

		output += `${html.slice(position, start)} `;
		const end = lower.indexOf(`</${name}`, start);
		const close = end === -1 ? -1 : lower.indexOf(">", end);
		if (close === -1) {
			return output;
		}

		position = close + 1;
	}
}

function withoutBlocks(html: string, names: string[]): string {
	let result = html;
	for (const name of names) {
		result = withoutBlock(result, result.toLowerCase(), name);
	}

	return result;
}

function withoutComments(html: string): string {
	let output = "";
	let position = 0;
	for (;;) {
		const start = html.indexOf("<!--", position);
		if (start === -1) {
			return output + html.slice(position);
		}

		output += `${html.slice(position, start)} `;
		const end = html.indexOf("-->", start + 4);
		if (end === -1) {
			return output;
		}

		position = end + 3;
	}
}

const stripTags = (html: string) => html.replaceAll(/<[^<>]*>/gu, " ");

function attributes(tag: string): Map<string, string> {
	const result = new Map<string, string>();
	/* eslint-disable regexp/no-super-linear-move -- the tag is cut to 4000 characters, so backtracking stays small. */
	for (const match of tag
		.slice(0, 4000)
		.matchAll(/([\w:-]+)\s?=\s?(?:"([^"]*)"|'([^']*)'|([^\s"'>]+))/gu)) {
		result.set(match[1].toLowerCase(), match[2] ?? match[3] ?? match[4] ?? "");
	}

	/* eslint-enable regexp/no-super-linear-move -- end of the exemption above. */
	return result;
}

function metaTags(html: string): Map<string, string> {
	const result = new Map<string, string>();
	for (const { attrs: tag } of elements(html, "meta", 400)) {
		const attrs = attributes(tag);
		const key = (attrs.get("property") ?? attrs.get("name"))?.toLowerCase();
		const content = attrs.get("content");
		if (key !== undefined && content && !result.has(key)) {
			result.set(key, squash(content));
		}
	}

	return result;
}

type Json = Record<string, unknown>;

const isJson = (value: unknown): value is Json =>
	typeof value === "object" && value !== null && !Array.isArray(value);

function flatten(value: unknown, into: Json[] = []): Json[] {
	if (Array.isArray(value)) {
		for (const item of value) {
			flatten(item, into);
		}
	} else if (isJson(value)) {
		into.push(value);
		flatten(value["@graph"], into);
	}

	return into;
}

function structuredData(html: string): Json[] {
	const nodes: Json[] = [];
	for (const script of elements(html, "script", 50)) {
		if (!script.attrs.toLowerCase().includes("ld+json")) {
			continue;
		}

		try {
			flatten(JSON.parse(script.inner), nodes);
		} catch {
			// Ignore data we can't read.
		}
	}

	return nodes;
}

const text = (value: unknown): string | undefined =>
	typeof value === "string" && value.trim() ? squash(value) : undefined;

function nameOf(value: unknown): string | undefined {
	const first: unknown = Array.isArray(value) ? value[0] : value;
	return text(isJson(first) ? first.name : first);
}

const months = [
	"jan",
	"feb",
	"mar",
	"apr",
	"may",
	"jun",
	"jul",
	"aug",
	"sep",
	"oct",
	"nov",
	"dec",
];

function isoDay(year: number, month: number, day: number): string | undefined {
	const date = new Date(Date.UTC(year, month - 1, day));
	return date.getUTCFullYear() === year &&
		date.getUTCMonth() === month - 1 &&
		date.getUTCDate() === day &&
		year >= 2000 &&
		year <= 2100
		? date.toISOString().slice(0, 10)
		: undefined;
}

/**
Reads a date written as 2026-03-01, March 1, 2026, 1 March 2026 or 3/1/2026.
*/
export function parseDate(value: string): string | undefined {
	const iso = /(\d{4})-(\d{2})-(\d{2})/u.exec(value);
	if (iso) {
		return isoDay(Number(iso[1]), Number(iso[2]), Number(iso[3]));
	}

	const named =
		/\b(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\.? (\d{1,2})(?:st|nd|rd|th)?,? (\d{4})\b/iu.exec(
			value
		);
	if (named) {
		return isoDay(
			Number(named[3]),
			months.indexOf(named[1].toLowerCase()) + 1,
			Number(named[2])
		);
	}

	const dayFirst =
		/\b(\d{1,2})(?:st|nd|rd|th)? (jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\.?,? (\d{4})\b/iu.exec(
			value
		);
	if (dayFirst) {
		return isoDay(
			Number(dayFirst[3]),
			months.indexOf(dayFirst[2].toLowerCase()) + 1,
			Number(dayFirst[1])
		);
	}

	const slash = /\b(\d{1,2})\/(\d{1,2})\/(\d{4})\b/u.exec(value);
	return slash
		? isoDay(Number(slash[3]), Number(slash[1]), Number(slash[2]))
		: undefined;
}

// The readable text has single spaces only, so patterns can use a plain " ".
const dateWords =
	"\\d{4}-\\d{2}-\\d{2}|\\d{1,2}/\\d{1,2}/\\d{4}|[a-z]{3,9}\\.? \\d{1,2}(?:st|nd|rd|th)?,? \\d{4}|\\d{1,2}(?:st|nd|rd|th)? [a-z]{3,9}\\.?,? \\d{4}";
const deadlinePattern = new RegExp(
	`(?:deadline|due|apply by|applications? (?:close|closes|are due)|closes?|closing|submit(?:ted)? by|received by)[^.\\n]{0,40}?(${dateWords})`,
	"iu"
);

function findDeadline(body: string): string | undefined {
	const match = deadlinePattern.exec(body);
	return match ? parseDate(match[1]) : undefined;
}

function findAmount(body: string): string | undefined {
	const money = String.raw`\$ ?\d[\d,]*(?:\.\d{2})?(?: ?(?:k|million|thousand))?`;
	const near = new RegExp(
		`(?:scholarship|award|grant|worth|value|up to|prize|receive)[^.\\n$]{0,50}(${money})`,
		"iu"
	).exec(body);
	const found = near?.[1] ?? new RegExp(money, "iu").exec(body)?.[0];
	return found === undefined ? undefined : cut(found.replaceAll(" ", ""), 60);
}

const studentYears = "freshmen|sophomores|juniors|seniors";

function findEligibility(body: string): string | undefined {
	const grades = new RegExp(
		`\\b(?:grades? \\d{1,2}(?: ?(?:-|–|to|and|through) ?\\d{1,2})?|(?:high school )?(?:${studentYears})(?:(?:,| and|,? &) (?:${studentYears}))*)`,
		"iu"
	).exec(body);
	if (grades) {
		return cut(
			`${grades[0].charAt(0).toUpperCase()}${grades[0].slice(1)}`,
			160
		);
	}

	const open = /\b(?:open to|eligible:?|available to) ([^.\n]{8,140})/iu.exec(
		body
	);
	return open ? cut(squash(open[1]), 160) : undefined;
}

function readableText(html: string): string {
	const stripped = withoutBlocks(html, [
		"script",
		"style",
		"noscript",
		"svg",
		"template",
		"head",
	]);
	return withoutComments(stripped)
		.replaceAll(/<\/(?:p|div|li|h\d|tr)>|<br\s?\/?>/giu, "\n")
		.replaceAll(/<[^<>]*>/gu, " ")
		.split("\n")
		.map((line) => squash(line))
		.filter(Boolean)
		.join("\n");
}

function paragraphs(html: string): string[] {
	const cleaned = withoutBlocks(html, [
		"script",
		"style",
		"noscript",
		"svg",
		"template",
		"nav",
		"header",
		"footer",
		"head",
	]);
	return elements(cleaned, "p", 60)
		.map((paragraph) => squash(stripTags(paragraph.inner)))
		.filter((paragraph) => paragraph.length >= 50);
}

const eventTypes = new Set([
	"event",
	"educationevent",
	"course",
	"courseinstance",
	"scholarship",
	"fundingscheme",
]);

function typeOf(node: Json): string[] {
	const type = node["@type"];
	return (Array.isArray(type) ? type : [type])
		.filter((item): item is string => typeof item === "string")
		.map((item) => item.toLowerCase());
}

function placeOf(location: unknown): string | undefined {
	const first: unknown = Array.isArray(location) ? location[0] : location;
	if (!isJson(first)) {
		return text(first);
	}

	if (typeOf(first).includes("virtuallocation")) {
		return "Online";
	}

	const { address } = first;
	const city = isJson(address)
		? [text(address.addressLocality), text(address.addressRegion)]
				.filter(Boolean)
				.join(", ")
		: text(address);
	return [text(first.name), city].filter(Boolean).join(", ") || undefined;
}

function findImage(
	meta: Map<string, string>,
	item: Json | undefined,
	pageUrl: URL
): string | undefined {
	const fromData: unknown = Array.isArray(item?.image)
		? item.image[0]
		: item?.image;
	const candidate =
		meta.get("og:image") ??
		meta.get("og:image:url") ??
		meta.get("twitter:image") ??
		text(isJson(fromData) ? fromData.url : fromData);
	if (candidate === undefined) {
		return undefined;
	}

	try {
		const url = new URL(candidate, pageUrl);
		return url.protocol === "https:" || url.protocol === "http:"
			? url.href
			: undefined;
	} catch {
		return undefined;
	}
}

function hostLabel(url: URL): string {
	return url.hostname.replace(/^www\./u, "");
}

function stripSiteName(title: string): string {
	// "Summer Program | Some University" → "Summer Program"
	const [first = title, ...rest] = title.split(/ [|·•–—-] /u);
	return rest.length > 0 && first.length >= 8 ? first : title;
}

/**
Guesses the form fields from a page's HTML. Only fields it found are set.
*/
export function parsePage(
	html: string,
	pageUrl: URL,
	kind: "opportunity" | "scholarship"
): Suggestion {
	const meta = metaTags(html);
	const data = structuredData(html);
	const item = data.find((node) =>
		typeOf(node).some((type) => eventTypes.has(type))
	);
	const body = readableText(html);
	const result: Suggestion = {};

	const heading = elements(html, "h1", 1)[0];
	const rawTitle =
		text(item?.name) ??
		meta.get("og:title") ??
		meta.get("twitter:title") ??
		text(elements(html, "title", 1)[0]?.inner) ??
		(heading === undefined ? undefined : text(stripTags(heading.inner)));
	if (rawTitle !== undefined) {
		result.title = cut(stripSiteName(rawTitle), 160);
	}

	const organization =
		nameOf(item?.organizer) ??
		nameOf(item?.provider) ??
		nameOf(item?.funder) ??
		meta.get("og:site_name") ??
		nameOf(data.find((node) => typeOf(node).includes("organization"))) ??
		hostLabel(pageUrl);
	result.organization = cut(organization, 120);

	const paras = paragraphs(html);
	const summary =
		text(item?.description) ??
		meta.get("og:description") ??
		meta.get("description") ??
		meta.get("twitter:description") ??
		paras[0];
	if (summary !== undefined) {
		result.summary = cut(summary, 400);
	}

	const long = paras.slice(0, 5).join("\n\n");
	if (long && long !== result.summary) {
		result.description = cut(long, 3000);
	}

	const image = findImage(meta, item, pageUrl);
	if (image !== undefined) {
		result.imageUrl = image;
	}

	const deadline = findDeadline(body);
	if (deadline !== undefined) {
		result.deadline = deadline;
	}

	if (kind === "scholarship") {
		const amount = findAmount(body);
		if (amount !== undefined) {
			result.amount = amount;
		}
	} else {
		const start = parseDate(text(item?.startDate) ?? "");
		const end = parseDate(text(item?.endDate) ?? "");
		const place = placeOf(item?.location);
		if (start !== undefined) {
			result.startDate = start;
		}

		if (end !== undefined) {
			result.endDate = end;
		}

		if (place !== undefined) {
			result.location = cut(place, 120);
		}
	}

	const eligibility = findEligibility(body);
	if (eligibility !== undefined) {
		result.eligibility = eligibility;
	}

	return result;
}

/* ----- Fetching safely -----
 * The officer types the address, so the server must not be tricked into
 * reading the Vercel network or internal services (SSRF): only public web
 * addresses, every redirect checked again, short timeout, capped size.
 */

function isPrivateV4(parts: number[]): boolean {
	const [a = 0, b = 0] = parts;
	return (
		a === 0 ||
		a === 10 ||
		a === 127 ||
		(a === 100 && b >= 64 && b <= 127) ||
		(a === 169 && b === 254) ||
		(a === 172 && b >= 16 && b <= 31) ||
		(a === 192 && b === 168) ||
		(a === 192 && b === 0) ||
		(a === 198 && (b === 18 || b === 19)) ||
		a >= 224
	);
}

export function isPrivateAddress(address: string): boolean {
	const family = isIP(address);
	if (family === 4) {
		return isPrivateV4(address.split(".").map(Number));
	}

	if (family === 6) {
		const lower = address.toLowerCase();
		const mapped = /^::ffff:(\d+\.\d+\.\d+\.\d+)$/u.exec(lower);
		if (mapped) {
			return isPrivateV4(mapped[1].split(".").map(Number));
		}

		return (
			lower === "::" ||
			lower === "::1" ||
			/^fe[89ab]/u.test(lower) ||
			/^f[cdf]/u.test(lower) ||
			lower.startsWith("::ffff:")
		);
	}

	return true;
}

export class AutofillError extends Error {}

async function assertPublic(url: URL) {
	if (url.protocol !== "https:" && url.protocol !== "http:") {
		throw new AutofillError("Use a link that starts with https:// or http://.");
	}

	if (url.username !== "" || url.password !== "") {
		throw new AutofillError(
			"Links with a username or password aren’t supported."
		);
	}

	if (url.port !== "" && url.port !== "80" && url.port !== "443") {
		throw new AutofillError(
			"That link uses an unusual port, so it was skipped."
		);
	}

	const host = url.hostname.replaceAll(/^\[|\]$/gu, "");
	const addresses =
		isIP(host) === 0
			? await lookup(host, { all: true }).catch(() => {
					throw new AutofillError("Couldn’t find that website.");
				})
			: [{ address: host }];
	if (
		addresses.length === 0 ||
		addresses.some((entry) => isPrivateAddress(entry.address))
	) {
		throw new AutofillError("That link doesn’t point to a public website.");
	}
}

const maxRedirects = 4;

async function readCapped(
	response: Response,
	maxBytes: number
): Promise<Uint8Array> {
	const reader = response.body?.getReader();
	if (!reader) {
		return new Uint8Array();
	}

	const chunks: Uint8Array[] = [];
	let size = 0;
	while (size < maxBytes) {
		// eslint-disable-next-line no-await-in-loop -- reading a stream in order.
		const { done, value } = await reader.read();
		if (done) {
			break;
		}

		chunks.push(value);
		size += value.byteLength;
	}

	await reader.cancel().catch(() => undefined);
	return new Uint8Array(Buffer.concat(chunks).subarray(0, maxBytes));
}

type Download = { bytes: Uint8Array; url: URL; contentType: string };

/**
Downloads a public web address: only public hosts (checked again at every
redirect), a short timeout, and at most `maxBytes` of the body.
*/
export async function fetchPublic(
	input: string,
	options: { accept: string; kind: RegExp; kindError: string; maxBytes: number }
): Promise<Download> {
	let url: URL;
	try {
		url = new URL(input);
	} catch {
		throw new AutofillError("That doesn’t look like a web address.");
	}

	for (let hop = 0; hop <= maxRedirects; hop++) {
		// eslint-disable-next-line no-await-in-loop -- each hop depends on the last.
		await assertPublic(url);
		// eslint-disable-next-line no-await-in-loop -- each hop depends on the last.
		const response = await fetch(url, {
			redirect: "manual",
			signal: AbortSignal.timeout(8000),
			headers: {
				accept: options.accept,
				"user-agent":
					"StuyAviatorsLinkReader/1.0 (+https://stuyaviators.vercel.app)",
			},
		}).catch(() => {
			throw new AutofillError(
				"Couldn’t open that page (it may be slow or block automated visits)."
			);
		});

		if (response.status >= 300 && response.status < 400) {
			const location = response.headers.get("location");
			if (location === null) {
				break;
			}

			url = new URL(location, url);
			continue;
		}

		if (!response.ok) {
			throw new AutofillError(
				`That page answered with an error (${response.status}). Fill the form by hand.`
			);
		}

		const contentType = response.headers.get("content-type") ?? "";
		if (!options.kind.test(contentType)) {
			throw new AutofillError(options.kindError);
		}

		// eslint-disable-next-line no-await-in-loop -- last step of the loop.
		const bytes = await readCapped(response, options.maxBytes);
		return { bytes, url, contentType };
	}

	throw new AutofillError("That link redirects too many times.");
}

export async function fetchPage(
	input: string
): Promise<{ html: string; url: URL }> {
	const page = await fetchPublic(input, {
		accept: "text/html,application/xhtml+xml",
		kind: /html|xml/iu,
		kindError: "That link isn’t a web page (maybe a PDF or file).",
		maxBytes: 1_500_000,
	});
	return { html: new TextDecoder().decode(page.bytes), url: page.url };
}

/**
A picture from a page, ready for the image processor (it checks the format).
*/
export async function fetchPicture(input: string): Promise<Uint8Array> {
	const picture = await fetchPublic(input, {
		accept: "image/*",
		kind: /^image\//iu,
		kindError: "That isn’t a picture.",
		maxBytes: 4 * 1024 * 1024,
	});
	return picture.bytes;
}
