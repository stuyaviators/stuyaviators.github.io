import type { Database } from "@/db";
import { home } from "@/content/home";
import { createTestDb } from "@/test/pglite";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/db", () => ({ getDb: () => undefined }));
vi.mock("next/cache", () => ({
	unstable_cache: <T>(function_: T) => function_,
}));

const {
	addTestimonial,
	deleteTestimonial,
	getPublicTestimonials,
	importStaticTestimonials,
	listTestimonials,
	moveTestimonial,
	testimonialSchema,
	updateTestimonial,
} = await import("./testimonials.ts");

let db: Database;
beforeEach(async () => {
	db = await createTestDb();
});

const quote = (text: string) => ({ quote: text, author: "Peter Stuyvesant" });
const texts = async () => (await listTestimonials(db)).map((row) => row.quote);

describe("testimonials", () => {
	it("imports the bundled quotes once", async () => {
		expect(await importStaticTestimonials(db)).toBe(home.testimonials.length);
		expect(await importStaticTestimonials(db)).toBe(0);
		expect(await texts()).toEqual(home.testimonials.map((item) => item.quote));
	});

	it("is the bundled set until the database has quotes", async () => {
		expect(await getPublicTestimonials()).toEqual(
			home.testimonials.map((item) => ({ ...item }))
		);
	});

	it("adds, edits, reorders and removes", async () => {
		await addTestimonial(db, quote("One"), "a");
		await addTestimonial(db, quote("Two"), "a");
		await addTestimonial(db, quote("Three"), "a");
		expect(await texts()).toEqual(["One", "Two", "Three"]);

		const three = (await listTestimonials(db)).at(2);
		await moveTestimonial(db, three?.id ?? "", "up");
		expect(await texts()).toEqual(["One", "Three", "Two"]);

		const edited = await updateTestimonial(
			db,
			three?.id ?? "",
			quote("Edited"),
			"a"
		);
		expect(edited?.quote).toBe("Edited");
		expect(await deleteTestimonial(db, three?.id ?? "")).toBe(1);
		expect(await deleteTestimonial(db, three?.id ?? "")).toBe(0);
		expect(await texts()).toEqual(["One", "Two"]);
		expect(
			await updateTestimonial(
				db,
				"00000000-0000-4000-8000-000000000000",
				quote("x"),
				"a"
			)
		).toBeUndefined();
		expect(
			await moveTestimonial(db, "00000000-0000-4000-8000-000000000000", "up")
		).toBeUndefined();
	});

	it("validates the text", () => {
		expect(testimonialSchema.safeParse(quote(" ")).success).toBe(false);
		expect(
			testimonialSchema.safeParse({ quote: "Fine", author: " " }).success
		).toBe(false);
		expect(testimonialSchema.safeParse(quote("x".repeat(701))).success).toBe(
			false
		);
		expect(testimonialSchema.parse(quote("  Hi  ")).quote).toBe("Hi");
	});
});
