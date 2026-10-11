import type { Metadata } from "sharp";
import sharp from "sharp";
import { z } from "zod";

/*
 * Image uploads (listing cards, newsletters, headshots, highlights). Every file
 * is decoded with sharp, so only real images get through whatever their name
 * or MIME type claims; then it's rotated upright, stripped of metadata
 * (including GPS), resized and recompressed to keep Vercel Blob within the
 * free tier.
 */

export const uploadPurposes = [
	"listing",
	"newsletter",
	"headshot",
	"highlight",
] as const;
export const uploadPurpose = z.enum(uploadPurposes);
export type UploadPurpose = z.infer<typeof uploadPurpose>;

/**
Vercel rejects request bodies over 4.5 MB; the browser shrinks bigger photos
before uploading (src/lib/client-upload.ts).
*/
export const maxUploadBytes = 4 * 1024 * 1024;

const maxWidth: Record<UploadPurpose, number> = {
	listing: 1200,
	newsletter: 1200, // 600px email column at 2×
	headshot: 640,
	highlight: 1920,
};

const allowedFormats = new Set(["jpeg", "png", "webp", "gif", "avif", "heif", "tiff"]);

export class UploadError extends Error {
	constructor(message: string) {
		super(message);
		this.name = "UploadError";
	}
}

export type ProcessedImage = {
	data: Uint8Array;
	contentType: "image/jpeg" | "image/png";
	extension: "jpg" | "png";
	width: number;
	height: number;
};

export async function processImage(
	input: Uint8Array,
	purpose: UploadPurpose
): Promise<ProcessedImage> {
	if (input.byteLength === 0) {
		throw new UploadError("That file is empty.");
	}

	if (input.byteLength > maxUploadBytes) {
		throw new UploadError("Images must be under 4 MB.");
	}

	let metadata: Metadata;
	try {
		metadata = await sharp(input, { limitInputPixels: 60_000_000 }).metadata();
	} catch {
		throw new UploadError("That file isn’t an image we can read.");
	}

	if (!metadata.format || !allowedFormats.has(metadata.format)) {
		throw new UploadError("Use a JPEG, PNG, WebP, GIF, AVIF or HEIC image.");
	}

	// Email clients don't all support WebP/AVIF, so output JPEG, or PNG when the
	// image has transparency (logos).
	const isPng = metadata.hasAlpha === true;
	const pipeline = sharp(input, { limitInputPixels: 60_000_000, pages: 1 })
		.rotate()
		.resize({
			width: maxWidth[purpose],
			height: maxWidth[purpose] * 2,
			fit: "inside",
			withoutEnlargement: true,
		});
	const { data, info } = await (isPng
		? pipeline.png({ compressionLevel: 9, palette: true, quality: 90 })
		: pipeline.flatten({ background: "#ffffff" }).jpeg({ quality: 80, mozjpeg: true })
	).toBuffer({ resolveWithObject: true });

	return {
		data: new Uint8Array(data),
		contentType: isPng ? "image/png" : "image/jpeg",
		extension: isPng ? "png" : "jpg",
		width: info.width,
		height: info.height,
	};
}
