import type { Listing } from "@/lib/listings";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import ListingDetail from "./ListingDetail.tsx";

const now = new Date("2026-10-11T12:00:00Z");

function card(overrides: Partial<Listing> = {}): Listing {
	return {
		id: "1",
		kind: "scholarship",
		slug: "aviation-scholarship",
		title: "Aviation Scholarship",
		organization: "Peter Stuyvesant Foundation",
		summary: "Money for flight training.",
		description: "## Who can apply\n\nAny student. <script>alert(1)</script>",
		url: "https://example.org/apply",
		imageUrl: null,
		deadline: "2099-12-01",
		amount: "$2,500",
		startDate: null,
		endDate: null,
		location: null,
		eligibility: "Grades 9–12",
		tags: ["flight"],
		featured: false,
		status: "published",
		sortOrder: 0,
		createdAt: now,
		updatedAt: now,
		createdBy: null,
		updatedBy: null,
		deletedAt: null,
		...overrides,
	};
}

describe("ListingDetail", () => {
	it("shows the card's details and a way back and out", () => {
		const html = renderToStaticMarkup(<ListingDetail listing={card()} />);
		expect(html).toContain("<h1");
		expect(html).toContain("Aviation Scholarship");
		expect(html).toContain("Peter Stuyvesant Foundation");
		expect(html).toContain("$2,500");
		expect(html).toContain("Who can apply");
		expect(html).toContain('href="/scholarships"');
		expect(html).toContain('href="https://example.org/apply"');
		expect(html).not.toContain("<script>");
	});

	it("says so when the card has closed", () => {
		const html = renderToStaticMarkup(
			<ListingDetail listing={card({ deadline: "2020-01-01" })} />
		);
		expect(html).toContain("has closed");
	});

	it("links opportunities back to their own list", () => {
		const html = renderToStaticMarkup(
			<ListingDetail listing={card({ kind: "opportunity" })} />
		);
		expect(html).toContain('href="/opportunities"');
	});
});
