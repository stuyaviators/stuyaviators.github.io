import { describe, expect, it } from "vitest";
import { paletteColor, parseFeed } from "./behold";

const size = (host = "behold.pictures") => ({
	width: 400,
	height: 400,
	mediaUrl: `https://${host}/a/b.webp`,
});
const post = (overrides: Record<string, unknown> = {}) => ({
	id: "1",
	permalink: "https://www.instagram.com/p/x/",
	timestamp: "2026-09-24T00:31:46+0000",
	mediaType: "IMAGE",
	prunedCaption: "Clubs & Pubs",
	mediaUrl: "https://scontent.cdninstagram.com/expiring.jpg",
	colorPalette: { dominant: "157,145,140" },
	sizes: { small: size(), medium: size(), large: size(), full: size() },
	somethingNew: true,
	...overrides,
});

describe("parseFeed", () => {
	it("keeps valid posts and ignores unknown fields", () => {
		const feed = parseFeed({
			username: "stuyaviators",
			posts: [post()],
			extra: 1,
		});
		expect(feed?.posts).toHaveLength(1);
		expect(feed?.posts[0]?.placeholder).toBe("rgb(157 145 140)");
		expect(JSON.stringify(feed)).not.toContain("cdninstagram");
	});

	it("drops posts whose sizes aren't on behold.pictures", () => {
		const bad = post({
			sizes: {
				small: size("evil.example"),
				medium: size(),
				large: size(),
				full: size(),
			},
		});
		expect(
			parseFeed({ username: "x", posts: [bad, post({ id: "2" })] })?.posts
		).toHaveLength(1);
	});

	it("returns undefined for malformed payloads", () => {
		expect(parseFeed({ nope: true })).toBeUndefined();
		expect(parseFeed(null)).toBeUndefined();
	});

	it("falls back to a token color for bad palettes", () => {
		expect(paletteColor("x,y")).toBe("var(--surface-2)");
		expect(paletteColor(undefined)).toBe("var(--surface-2)");
	});
});
