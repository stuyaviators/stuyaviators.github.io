import { describe, expect, it } from "vitest";
import { isPrivateAddress, parseDate, parsePage } from "./autofill.ts";

const url = new URL("https://www.example.edu/programs/summer");

describe("parseDate", () => {
	it("reads the common ways of writing a date", () => {
		expect(parseDate("2026-03-01")).toBe("2026-03-01");
		expect(parseDate("March 1, 2026")).toBe("2026-03-01");
		expect(parseDate("Mar. 1st 2026")).toBe("2026-03-01");
		expect(parseDate("1 March 2026")).toBe("2026-03-01");
		expect(parseDate("3/1/2026")).toBe("2026-03-01");
	});

	it("rejects dates that don't exist", () => {
		expect(parseDate("February 31, 2026")).toBeUndefined();
		expect(parseDate("soon")).toBeUndefined();
	});
});

describe("parsePage", () => {
	it("fills a scholarship from social tags and page text", () => {
		const html = `<html><head>
			<title>Aviation Scholarship | Example Foundation</title>
			<meta property="og:title" content="Aviation Scholarship | Example Foundation">
			<meta property="og:site_name" content="Example Foundation">
			<meta property="og:description" content="Helps students pay for flight training &amp; ground school.">
			<script>var deadline = "ignore me";</script>
			</head><body>
			<p>The Aviation Scholarship awards up to $5,000 to students who want to learn to fly.</p>
			<p>Open to high school juniors and seniors. Application deadline: April 15, 2026.</p>
			</body></html>`;
		expect(parsePage(html, url, "scholarship")).toMatchObject({
			title: "Aviation Scholarship",
			organization: "Example Foundation",
			summary: "Helps students pay for flight training & ground school.",
			deadline: "2026-04-15",
			amount: "$5,000",
			eligibility: "High school juniors and seniors",
		});
	});

	it("uses structured event data for an opportunity", () => {
		const html = `<html><head><title>x</title>
			<script type="application/ld+json">${JSON.stringify({
				"@context": "https://schema.org",
				"@type": "Event",
				name: "Summer Flight Camp",
				description: "A week of flying.",
				startDate: "2026-07-06T09:00",
				endDate: "2026-07-10",
				organizer: { "@type": "Organization", name: "Hudson Aero Club" },
				location: {
					"@type": "Place",
					name: "Teterboro Airport",
					address: { addressLocality: "Teterboro", addressRegion: "NJ" },
				},
			})}</script></head><body></body></html>`;
		expect(parsePage(html, url, "opportunity")).toMatchObject({
			title: "Summer Flight Camp",
			organization: "Hudson Aero Club",
			summary: "A week of flying.",
			startDate: "2026-07-06",
			endDate: "2026-07-10",
			location: "Teterboro Airport, Teterboro, NJ",
		});
	});

	it("falls back to the site name and skips what it can't find", () => {
		const result = parsePage(
			"<html><body>Nothing here</body></html>",
			url,
			"opportunity"
		);
		expect(result).toEqual({ organization: "example.edu" });
	});

	it("finds the page's picture and resolves a relative address", () => {
		const html = `<meta property="og:image" content="/img/card.jpg">`;
		expect(parsePage(html, url, "scholarship").imageUrl).toBe(
			"https://www.example.edu/img/card.jpg"
		);
		const twitter = `<meta name="twitter:image" content="javascript:alert(1)">`;
		expect(parsePage(twitter, url, "scholarship").imageUrl).toBeUndefined();
	});

	it("keeps the short description within the form's limit", () => {
		const long = "word ".repeat(300);
		const html = `<meta name="description" content="${long}">`;
		expect(
			parsePage(html, url, "opportunity").summary?.length
		).toBeLessThanOrEqual(400);
	});
});

describe("parsePage on hostile pages", () => {
	it("stays fast on a megabyte of unclosed tags", () => {
		const started = performance.now();
		for (const piece of ["<p ", "<script ", "<!-- ", "<meta ", "<<<<"]) {
			parsePage(piece.repeat(250_000), url, "scholarship");
		}

		expect(performance.now() - started).toBeLessThan(3000);
	});
});

describe("isPrivateAddress", () => {
	it("blocks internal and local addresses", () => {
		for (const address of [
			"127.0.0.1",
			"10.1.2.3",
			"172.16.0.1",
			"192.168.1.1",
			"169.254.169.254",
			"100.64.0.1",
			"0.0.0.0",
			"::1",
			"fd00::1",
			"fe80::1",
			"::ffff:127.0.0.1",
			"not-an-ip",
		]) {
			expect(isPrivateAddress(address), address).toBe(true);
		}
	});

	it("allows public addresses", () => {
		expect(isPrivateAddress("93.184.216.34")).toBe(false);
		expect(isPrivateAddress("2606:2800:220:1:248:1893:25c8:1946")).toBe(false);
	});
});
