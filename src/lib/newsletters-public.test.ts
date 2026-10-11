import { defaultNewsletter } from "@/lib/newsletter/defaults";
import { describe, expect, it, vi } from "vitest";

vi.mock("@/db", () => ({ getDb: () => undefined }));
vi.mock("next/cache", () => ({
	unstable_cache: <T>(function_: T) => function_,
}));

const { excerptOf, getNewsletterArchive } =
	await import("./newsletters-public.ts");

const base = defaultNewsletter();

describe("excerptOf", () => {
	it("prefers the preview text", () => {
		expect(
			excerptOf({ ...base, previewText: "Deadlines this week", introText: "x" })
		).toBe("Deadlines this week");
	});

	it("falls back to the introduction without Markdown marks", () => {
		expect(
			excerptOf({
				...base,
				previewText: " ",
				introText:
					"Hi **pilots**, see [the list](https://example.org/x).\n\nBye",
			})
		).toBe("Hi pilots, see the list. Bye");
	});

	it("shortens long text", () => {
		const text = excerptOf({
			...base,
			previewText: "word ".repeat(100),
		});
		expect(text.length).toBeLessThanOrEqual(160);
		expect(text.endsWith("…")).toBe(true);
	});
});

describe("getNewsletterArchive", () => {
	it("is empty without a database", async () => {
		expect(await getNewsletterArchive()).toEqual([]);
	});
});
