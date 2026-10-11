import sharp from "sharp";
import { describe, expect, it } from "vitest";
import { maxUploadBytes, processImage, UploadError } from "./uploads.ts";

async function jpeg(width: number, height: number) {
	return new Uint8Array(
		await sharp({
			create: { width, height, channels: 3, background: "#0b64a9" },
		})
			.jpeg()
			.toBuffer()
	);
}

describe("processImage", () => {
	it("resizes large photos to the purpose's width", async () => {
		const result = await processImage(await jpeg(3000, 2000), "listing");
		expect(result).toMatchObject({
			contentType: "image/jpeg",
			extension: "jpg",
			width: 1200,
		});
		expect(result.height).toBe(800);
		const meta = await sharp(result.data).metadata();
		expect(meta.format).toBe("jpeg");
		expect(meta.width).toBe(1200);
	});

	it("doesn't enlarge small images, and uses smaller sizes for headshots", async () => {
		expect((await processImage(await jpeg(300, 200), "listing")).width).toBe(
			300
		);
		expect((await processImage(await jpeg(2000, 2000), "headshot")).width).toBe(
			640
		);
	});

	it("strips metadata, including GPS", async () => {
		const withExif = new Uint8Array(
			await sharp({
				create: { width: 100, height: 100, channels: 3, background: "#fff" },
			})
				.withExif({
					IFD0: { Copyright: "Someone" },
					IFD3: { GPSLatitudeRef: "N" },
				})
				.jpeg()
				.toBuffer()
		);
		expect((await sharp(withExif).metadata()).exif).toBeDefined();
		const result = await processImage(withExif, "highlight");
		expect((await sharp(result.data).metadata()).exif).toBeUndefined();
	});

	it("keeps transparency as PNG", async () => {
		const logo = new Uint8Array(
			await sharp({
				create: {
					width: 64,
					height: 64,
					channels: 4,
					background: { r: 0, g: 0, b: 0, alpha: 0 },
				},
			})
				.png()
				.toBuffer()
		);
		expect(await processImage(logo, "newsletter")).toMatchObject({
			contentType: "image/png",
			extension: "png",
		});
	});

	it("rejects things that aren't images, whatever they claim to be", async () => {
		const text = new TextEncoder().encode(
			"<html><script>alert(1)</script></html>"
		);
		await expect(processImage(text, "listing")).rejects.toThrow(UploadError);
		await expect(processImage(new Uint8Array(), "listing")).rejects.toThrow(
			"empty"
		);
	});

	it("rejects SVG (can carry scripts)", async () => {
		const svg = new TextEncoder().encode(
			'<svg xmlns="http://www.w3.org/2000/svg" width="10" height="10"><script>alert(1)</script></svg>'
		);
		await expect(processImage(svg, "listing")).rejects.toThrow(UploadError);
	});

	it("rejects files over the size cap before decoding", async () => {
		await expect(
			processImage(new Uint8Array(maxUploadBytes + 1), "listing")
		).rejects.toThrow("4 MB");
	});
});
