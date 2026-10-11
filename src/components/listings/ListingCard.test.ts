import type { Listing } from "@/lib/listings";
import { describe, expect, it } from "vitest";
import { linkLabel, stubFields } from "./ListingCard.tsx";

const base: Listing = {
	id: "id",
	kind: "opportunity",
	slug: "a",
	title: "A",
	organization: "Org",
	summary: "Summary",
	description: null,
	url: "https://example.org",
	imageUrl: null,
	deadline: null,
	amount: null,
	startDate: null,
	endDate: null,
	location: null,
	eligibility: null,
	tags: [],
	featured: false,
	status: "published",
	sortOrder: 0,
	createdAt: new Date(0),
	updatedAt: new Date(0),
	createdBy: null,
	updatedBy: null,
	deletedAt: null,
	deletedBy: null,
};

describe("the link's words", () => {
	it("says just Learn more for an opportunity with no deadline", () => {
		expect(linkLabel(base)).toBe("Learn more");
	});

	it("says Learn more and RSVP once an opportunity has a deadline", () => {
		expect(linkLabel({ ...base, deadline: "2026-10-20" })).toBe(
			"Learn more and RSVP"
		);
	});

	it("keeps Learn more and apply for scholarships", () => {
		expect(linkLabel({ ...base, kind: "scholarship" })).toBe(
			"Learn more and apply"
		);
	});
});

describe("the ticket stub", () => {
	it("never says Deadline on an opportunity", () => {
		const labels = (listing: Listing) =>
			stubFields(listing).map((field) => field.label);
		expect(
			labels({ ...base, deadline: "2026-10-20", startDate: "2026-11-02" })
		).toEqual(["RSVP by", "Dates"]);
		expect(labels({ ...base, deadline: "2026-10-20" })).toEqual(["Date"]);
		expect(labels(base)).toEqual(["Date"]);
	});

	it("keeps Deadline on a scholarship", () => {
		expect(
			stubFields({ ...base, kind: "scholarship", deadline: "2026-10-20" })[0]
				?.label
		).toBe("Deadline");
		expect(stubFields({ ...base, kind: "scholarship" })).toEqual([
			{ label: "Deadline", value: "Rolling" },
		]);
	});
});
