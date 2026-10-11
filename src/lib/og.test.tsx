import sharp from "sharp";
import { afterEach, describe, expect, it, vi } from "vitest";
import { fetchOgPicture } from "./og-picture.ts";
import { renderPictureOg } from "./og.tsx";

const blobUrl = "https://abc.public.blob.vercel-storage.com/uploads/a.png";

async function png() {
	return sharp({
		create: {
			width: 300,
			height: 300,
			channels: 3,
			background: { r: 200, g: 30, b: 30 },
		},
	})
		.png()
		.toBuffer();
}

function respond(body: Uint8Array | string, type: string, status = 200) {
	vi.stubGlobal(
		"fetch",
		vi.fn(
			async () =>
				new Response(body as BodyInit, {
					status,
					headers: { "content-type": type },
				})
		)
	);
}

afterEach(() => {
	vi.unstubAllGlobals();
});

describe("the picture for an Open Graph card", () => {
	it("downloads PNG and JPEG pictures from our own store", async () => {
		respond(await png(), "image/png");
		const picture = await fetchOgPicture(blobUrl);
		expect(picture?.type).toBe("image/png");
		expect(picture?.bytes.length).toBeGreaterThan(0);
	});

	it("won't fetch a private address or something that isn't a link", async () => {
		respond(await png(), "image/png");
		expect(
			await fetchOgPicture("http://169.254.169.254/latest/meta-data")
		).toBeUndefined();
		expect(await fetchOgPicture("http://localhost:3000/a.png")).toBeUndefined();
		expect(await fetchOgPicture("javascript:alert(1)")).toBeUndefined();
		expect(await fetchOgPicture(undefined)).toBeUndefined();
	});

	it("turns another site's WebP into a PNG or JPEG it can draw", async () => {
		const webp = await sharp({
			create: {
				width: 400,
				height: 300,
				channels: 3,
				background: { r: 10, g: 90, b: 200 },
			},
		})
			.webp()
			.toBuffer();
		respond(webp, "image/webp");
		const picture = await fetchOgPicture("http://93.184.216.34/photo.webp");
		expect(picture?.type).toMatch(/^image\/(?:jpeg|png)$/u);
		expect((await sharp(picture?.bytes).metadata()).format).toMatch(
			/^(?:jpeg|png)$/u
		);
	});

	it("gives up on types it can't draw, failures and oversized files", async () => {
		respond(await png(), "image/webp");
		expect(await fetchOgPicture(blobUrl)).toBeUndefined();
		respond("nope", "text/html", 404);
		expect(await fetchOgPicture(blobUrl)).toBeUndefined();
		respond(new Uint8Array(5 * 1024 * 1024), "image/png");
		expect(await fetchOgPicture(blobUrl)).toBeUndefined();
		vi.stubGlobal(
			"fetch",
			vi.fn(async () => {
				throw new Error("offline");
			})
		);
		expect(await fetchOgPicture(blobUrl)).toBeUndefined();
	});

	it("draws a 1200 by 630 card around the picture", async () => {
		const bytes = new Uint8Array(await png());
		const response = await renderPictureOg({
			picture: { bytes, type: "image/png" },
			label: "Scholarship · Peter Foundation",
		});
		expect(response.status).toBe(200);
		expect(response.headers.get("content-type")).toBe("image/png");
		const image = Buffer.from(await response.arrayBuffer());
		const meta = await sharp(image).metadata();
		expect([meta.width, meta.height]).toEqual([1200, 630]);
	});
});
