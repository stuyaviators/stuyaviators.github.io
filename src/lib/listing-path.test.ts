import { describe, expect, it } from "vitest";
import { listingPath } from "./listing-path.ts";

describe("listingPath", () => {
	it("points into the right section", () => {
		expect(listingPath({ kind: "opportunity", slug: "camp" })).toBe(
			"/opportunities/camp"
		);
		expect(listingPath({ kind: "scholarship", slug: "grant" })).toBe(
			"/scholarships/grant"
		);
	});

	it("has no page for a card without a slug", () => {
		expect(listingPath({ kind: "opportunity", slug: null })).toBeUndefined();
	});
});
