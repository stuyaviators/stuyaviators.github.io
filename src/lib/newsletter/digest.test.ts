import type { Listing } from "@/lib/listings";
import { newsletterSchema } from "@/lib/newsletter/types";
import { describe, expect, it } from "vitest";
import { buildDeadlineDigest, inDigestWindow } from "./digest.ts";

// Noon in New York on Oct 11, 2026.
const now = new Date("2026-10-11T16:00:00Z");

function card(overrides: Partial<Listing> = {}): Listing {
	return {
		id: crypto.randomUUID(),
		kind: "scholarship",
		slug: "aviation-scholarship",
		title: "Aviation Scholarship",
		organization: "Peter Stuyvesant Foundation",
		summary: "Money for flight training.",
		description: null,
		url: "https://example.org/apply",
		imageUrl: null,
		deadline: "2026-10-28", // 17 days away
		amount: "$2,500",
		startDate: null,
		endDate: null,
		location: null,
		eligibility: null,
		tags: [],
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

describe("inDigestWindow", () => {
	it("includes deadlines 14 to 21 days away, and nothing else", () => {
		const isDue = (deadline: string) => inDigestWindow(card({ deadline }), now);
		expect(isDue("2026-10-24")).toBe(false); // 13
		expect(isDue("2026-10-25")).toBe(true); // 14
		expect(isDue("2026-11-01")).toBe(true); // 21
		expect(isDue("2026-11-02")).toBe(false); // 22
		expect(isDue("2026-10-01")).toBe(false); // past
	});

	it("skips drafts, deleted cards and cards without a deadline", () => {
		expect(inDigestWindow(card({ status: "draft" }), now)).toBe(false);
		expect(inDigestWindow(card({ deletedAt: now }), now)).toBe(false);
		expect(inDigestWindow(card({ deadline: null }), now)).toBe(false);
	});
});

describe("buildDeadlineDigest", () => {
	it("returns nothing when no card is due", () => {
		expect(buildDeadlineDigest([card({ deadline: "2026-12-01" })], now)).toBe(
			undefined
		);
	});

	it("groups scholarships before opportunities, soonest first, and passes the newsletter schema", () => {
		const data = buildDeadlineDigest(
			[
				card({ kind: "opportunity", title: "Camp", deadline: "2026-10-27" }),
				card({ title: "Later", deadline: "2026-10-30" }),
				card({ title: "Sooner", deadline: "2026-10-26" }),
				card({ title: "Out of range", deadline: "2027-01-01" }),
			],
			now
		);
		expect(newsletterSchema.safeParse(data).success).toBe(true);
		const titles = data?.blocks.map((block) =>
			"title" in block ? block.title : ""
		);
		expect(titles).toEqual([
			"Scholarships closing soon",
			"Sooner · Peter Stuyvesant Foundation",
			"Later · Peter Stuyvesant Foundation",
			"Opportunities closing soon",
			"Camp · Peter Stuyvesant Foundation",
		]);
	});

	it("writes the deadline, award and a button into each article", () => {
		const data = buildDeadlineDigest([card()], now);
		const article = data?.blocks.find((block) => block.type === "article");
		expect(article).toMatchObject({
			body: "Money for flight training.\n\n**Award:** $2,500\n\n**Deadline:** October 28, 2026",
			buttonText: "Apply",
			buttonUrl: "https://example.org/apply",
		});
	});
});
