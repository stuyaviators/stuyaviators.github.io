import { afterEach, describe, expect, it, vi } from "vitest";
import { captionPhoto, cleanCaption, readCaption } from "./ai-caption.ts";

describe("cleanCaption", () => {
	it("makes one line without surrounding quotes", () => {
		expect(cleanCaption('  "A Cessna 172\non final approach."\n')).toBe(
			"A Cessna 172 on final approach."
		);
	});

	it("keeps the caption within the 300 character limit", () => {
		expect(cleanCaption("word ".repeat(200)).length).toBeLessThanOrEqual(300);
	});
});

describe("readCaption", () => {
	it("reads the first candidate's text", () => {
		expect(
			readCaption({
				candidates: [{ content: { parts: [{ text: "A plane at sunset." }] } }],
			})
		).toBe("A plane at sunset.");
	});

	it("returns nothing for blocked, empty or odd replies", () => {
		expect(readCaption({})).toBeUndefined();
		expect(readCaption({ candidates: [{}] })).toBeUndefined();
		expect(
			readCaption({ candidates: [{ content: { parts: [{ text: "  " }] } }] })
		).toBeUndefined();
		expect(readCaption("nope")).toBeUndefined();
	});
});

describe("captionPhoto", () => {
	afterEach(() => {
		vi.unstubAllEnvs();
		vi.unstubAllGlobals();
	});

	it("explains when no key is set", async () => {
		vi.stubEnv("GEMINI_API_KEY", "");
		await expect(
			captionPhoto("https://abc.public.blob.vercel-storage.com/a.jpg")
		).rejects.toThrow(/GEMINI_API_KEY/u);
	});

	it("only sends photos from our own storage", async () => {
		vi.stubEnv("GEMINI_API_KEY", "test-key");
		const fetchMock = vi.fn();
		vi.stubGlobal("fetch", fetchMock);
		await expect(captionPhoto("https://evil.example/a.jpg")).rejects.toThrow(
			/Upload the photo first/u
		);
		expect(fetchMock).not.toHaveBeenCalled();
	});

	it("sends the photo and key to Gemini and returns the caption", async () => {
		vi.stubEnv("GEMINI_API_KEY", "test-key");
		const fetchMock = vi
			.fn()
			.mockResolvedValueOnce(
				new Response(new Uint8Array([1, 2, 3]), {
					headers: { "content-type": "image/jpeg" },
				})
			)
			.mockResolvedValueOnce(
				Response.json({
					candidates: [
						{ content: { parts: [{ text: "A Cessna on a ramp." }] } },
					],
				})
			);
		vi.stubGlobal("fetch", fetchMock);
		await expect(
			captionPhoto("https://abc.public.blob.vercel-storage.com/a.jpg")
		).resolves.toBe("A Cessna on a ramp.");
		const [url, init] = fetchMock.mock.calls[1] as [string, RequestInit];
		expect(url).toContain("generativelanguage.googleapis.com");
		expect(url).not.toContain("test-key");
		expect((init.headers as Record<string, string>)["x-goog-api-key"]).toBe(
			"test-key"
		);
	});

	it("reports the free limit being reached", async () => {
		vi.stubEnv("GEMINI_API_KEY", "test-key");
		vi.stubGlobal(
			"fetch",
			vi
				.fn()
				.mockResolvedValueOnce(
					new Response(new Uint8Array([1]), {
						headers: { "content-type": "image/png" },
					})
				)
				.mockResolvedValueOnce(new Response("{}", { status: 429 }))
		);
		await expect(
			captionPhoto("https://abc.public.blob.vercel-storage.com/a.png")
		).rejects.toThrow(/limit/u);
	});
});
