import { describe, expect, it } from "vitest";
import { listingSlug } from "./listing-slug.ts";

describe("listingSlug", () => {
	it("makes a lowercase hyphenated address", () => {
		expect(listingSlug("NASA Summer Camp!")).toBe("nasa-summer-camp");
		expect(listingSlug("  Café — Pilot's Guide  ")).toBe("cafe-pilot-s-guide");
	});

	it("never ends with a hyphen, even when cut short", () => {
		const slug = listingSlug(`${"word ".repeat(30)}end`);
		expect(slug.length).toBeLessThanOrEqual(80);
		expect(slug.endsWith("-")).toBe(false);
	});

	it("falls back when nothing is left", () => {
		expect(listingSlug("🛩️")).toBe("listing");
	});
});
