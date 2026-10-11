import type { Database } from "@/db";
import { didDeleteFromTrash, didMoveToTrash, didRestoreFromTrash } from "@/lib/trash";
import { createTestDb } from "@/test/pglite";
import { beforeEach, describe, expect, it } from "vitest";
import {
	createListing,
	getListing,
	listForDashboard,
	listingInput,
	moveListing,
	setListingStatus,
	updateListing,
} from "./listings-admin.ts";

let db: Database;
beforeEach(async () => {
	db = await createTestDb();
});

const valid = {
	kind: "scholarship" as const,
	title: "Aviation Scholarship",
	organization: "Peter Stuyvesant Foundation",
	summary: "Help paying for flight training.",
	description: "",
	url: "https://example.org/apply",
	imageUrl: "",
	deadline: "2026-12-01",
	amount: "$1,000",
	startDate: "",
	endDate: "",
	location: "",
	eligibility: "Grades 9–12",
	tags: "flight, STEM, flight",
	featured: false,
	status: "draft" as const,
};

function parse(overrides: Record<string, unknown> = {}) {
	return listingInput.safeParse({ ...valid, ...overrides });
}

function parsed(overrides: Record<string, unknown> = {}) {
	return listingInput.parse({ ...valid, ...overrides });
}

function failure(overrides: Record<string, unknown>) {
	const result = parse(overrides);
	expect(result.success).toBe(false);
	return result.success
		? {}
		: Object.fromEntries(
				result.error.issues.map((issue) => [
					String(issue.path[0]),
					issue.message,
				])
			);
}

describe("listingInput", () => {
	it("accepts a complete card and tidies it", () => {
		const result = parse();
		expect(result.success).toBe(true);
		expect(result.data).toMatchObject({
			tags: ["flight", "STEM"], // trimmed, de-duplicated
			description: undefined,
			imageUrl: undefined,
			startDate: undefined,
		});
	});

	it("requires a title, organization, summary and link", () => {
		expect(failure({ title: "  " })).toHaveProperty("title");
		expect(failure({ organization: "" })).toHaveProperty("organization");
		expect(failure({ summary: "" })).toHaveProperty("summary");
		expect(failure({ url: "" })).toHaveProperty("url");
	});

	it("only allows http(s) links, so javascript: and data: can't get in", () => {
		for (const url of [
			"javascript:alert(1)",
			"data:text/html,<script>",
			"ftp://x.org",
			"//evil.com",
			"mailto:a@b.c",
		]) {
			expect(failure({ url })).toHaveProperty("url");
		}

		expect(failure({ imageUrl: "javascript:alert(1)" })).toHaveProperty(
			"imageUrl"
		);
		expect(parse({ url: "http://example.org" }).success).toBe(true);
	});

	it("checks dates and their order", () => {
		expect(failure({ deadline: "12/01/2026" })).toHaveProperty("deadline");
		expect(
			failure({
				kind: "opportunity",
				startDate: "2026-11-05",
				endDate: "2026-11-01",
			})
		).toHaveProperty("endDate");
	});

	it("caps lengths and the number of tags", () => {
		expect(failure({ summary: "x".repeat(401) })).toHaveProperty("summary");
		expect(failure({ title: "x".repeat(161) })).toHaveProperty("title");
		const many = Array.from({ length: 20 }, (_, index) => `tag${index}`).join(
			","
		);
		expect(parse({ tags: many }).data?.tags).toHaveLength(12);
	});

	it("rejects an unknown kind or status", () => {
		expect(failure({ kind: "job" })).toHaveProperty("kind");
		expect(failure({ status: "archived" })).toHaveProperty("status");
	});
});

describe("saving cards", () => {
	async function make(
		title: string,
		kind: "opportunity" | "scholarship" = "scholarship"
	) {
		const values = listingInput.parse({ ...valid, kind, title });
		return createListing(db, values, "officer@gmail.com");
	}

	it("keeps only the fields that apply to the kind", async () => {
		const card = await createListing(
			db,
			listingInput.parse({
				...valid,
				kind: "scholarship",
				location: "Online",
				startDate: "2026-11-01",
			}),
			"officer@gmail.com"
		);
		expect(card).toMatchObject({
			amount: "$1,000",
			location: null,
			startDate: null,
			createdBy: "officer@gmail.com",
		});

		const trip = await createListing(
			db,
			listingInput.parse({
				...valid,
				kind: "opportunity",
				location: "Online",
				amount: "$5",
			}),
			"officer@gmail.com"
		);
		expect(trip).toMatchObject({ amount: null, location: "Online" });
	});

	it("numbers cards in order, separately for each kind", async () => {
		const a = await make("A");
		const b = await make("B");
		const o = await make("O", "opportunity");
		expect([a.sortOrder, b.sortOrder, o.sortOrder]).toEqual([0, 1, 0]);
	});

	it("updates a card and records who", async () => {
		const card = await make("Old title");
		const updated = await updateListing(
			db,
			card.id,
			listingInput.parse({ ...valid, title: "New title", status: "published" }),
			"other@gmail.com"
		);
		expect(updated).toMatchObject({
			title: "New title",
			status: "published",
			updatedBy: "other@gmail.com",
		});
		expect(
			await updateListing(
				db,
				crypto.randomUUID(),
				listingInput.parse(valid),
				"x"
			)
		).toBeUndefined();
	});

	it("publishes and unpublishes", async () => {
		const card = await make("A");
		expect(
			(await setListingStatus(db, card.id, "published", "x"))?.status
		).toBe("published");
		expect((await setListingStatus(db, card.id, "draft", "x"))?.status).toBe(
			"draft"
		);
	});
});

describe("ordering", () => {
	async function titles() {
		return (await listForDashboard(db, "scholarship")).map(
			(card) => card.title
		);
	}

	async function seed() {
		const ids: string[] = [];
		for (const title of ["A", "B", "C"]) {
			// eslint-disable-next-line no-await-in-loop
			const card = await createListing(
				db,
				listingInput.parse({ ...valid, title }),
				"x"
			);
			ids.push(card.id);
		}

		return ids as [string, string, string];
	}

	it("moves cards up and down", async () => {
		const [a, , c] = await seed();
		await moveListing(db, c, "up");
		expect(await titles()).toEqual(["A", "C", "B"]);
		await moveListing(db, a, "down");
		expect(await titles()).toEqual(["C", "A", "B"]);
	});

	it("does nothing at the ends", async () => {
		const [a, , c] = await seed();
		await moveListing(db, a, "up");
		await moveListing(db, c, "down");
		expect(await titles()).toEqual(["A", "B", "C"]);
	});

	it("doesn't disturb the other kind", async () => {
		const [a] = await seed();
		const other = await createListing(
			db,
			listingInput.parse({ ...valid, kind: "opportunity", title: "O" }),
			"x"
		);
		await moveListing(db, a, "down");
		expect((await getListing(db, other.id))?.sortOrder).toBe(0);
	});

	it("returns undefined for a card that doesn't exist", async () => {
		expect(await moveListing(db, crypto.randomUUID(), "up")).toBeUndefined();
	});
});

describe("trash", () => {
	it("hides trashed cards, restores them as drafts, and deletes for good only from the trash", async () => {
		const card = await createListing(
			db,
			listingInput.parse({ ...valid, status: "published" }),
			"x"
		);

		// Not in the trash: deleting for good must leave it alone.
		expect(await didDeleteFromTrash(db, "listing", card.id)).toBe(false);
		expect(await getListing(db, card.id)).toBeDefined();

		expect(await didMoveToTrash(db, "listing", card.id, "y")).toBe(true);
		expect(await listForDashboard(db, "scholarship")).toHaveLength(0);
		expect(await getListing(db, card.id)).toMatchObject({ deletedBy: "y" });

		expect(await didRestoreFromTrash(db, "listing", card.id, "x")).toBe(true);
		const restored = await getListing(db, card.id);
		expect(restored).toMatchObject({
			deletedAt: null,
			deletedBy: null,
			status: "draft",
		});

		await didMoveToTrash(db, "listing", card.id, "x");
		expect(await didDeleteFromTrash(db, "listing", card.id)).toBe(true);
		expect(await getListing(db, card.id)).toBeUndefined();
	});

	it("won't publish a trashed card", async () => {
		const card = await createListing(db, listingInput.parse(valid), "x");
		await didMoveToTrash(db, "listing", card.id, "x");
		expect(
			await setListingStatus(db, card.id, "published", "x")
		).toBeUndefined();
	});
});

describe("card addresses", () => {
	it("gives each new card a slug from its title, and keeps it when the title changes", async () => {
		const created = await createListing(db, parsed(), "a");
		expect(created.slug).toBe("aviation-scholarship");

		const renamed = await updateListing(
			db,
			created.id,
			parsed({ title: "A brand new name" }),
			"a"
		);
		expect(renamed?.slug).toBe("aviation-scholarship");
	});

	it("adds a number when a title is already used, per kind", async () => {
		const first = await createListing(db, parsed(), "a");
		const second = await createListing(db, parsed(), "a");
		const third = await createListing(db, parsed(), "a");
		const opportunity = await createListing(
			db,
			parsed({ kind: "opportunity" }),
			"a"
		);
		expect([first.slug, second.slug, third.slug]).toEqual([
			"aviation-scholarship",
			"aviation-scholarship-2",
			"aviation-scholarship-3",
		]);
		expect(opportunity.slug).toBe("aviation-scholarship");
	});

	it("falls back for titles with no letters or digits", async () => {
		const created = await createListing(db, parsed({ title: "★★★" }), "a");
		expect(created.slug).toBe("listing");
	});
});
