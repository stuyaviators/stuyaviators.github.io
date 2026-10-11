import type { UploadPurpose } from "@/lib/uploads";

/*
 * Browser side of image uploads. Large phone photos are shrunk to at most
 * 2400px and re-encoded as JPEG first, so they fit under Vercel's 4.5 MB
 * request limit; the server then does the real resizing and checks.
 */

const maxSide = 2400;
const directLimit = 3.5 * 1024 * 1024;

async function shrink(file: File): Promise<Blob> {
	if (file.size <= directLimit || file.type === "image/gif") {
		return file;
	}

	const bitmap = await createImageBitmap(file);
	const scale = Math.min(1, maxSide / Math.max(bitmap.width, bitmap.height));
	const canvas = new OffscreenCanvas(
		Math.round(bitmap.width * scale),
		Math.round(bitmap.height * scale)
	);
	const context = canvas.getContext("2d");
	if (!context) {
		return file;
	}

	context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
	bitmap.close();
	return canvas.convertToBlob({ type: "image/jpeg", quality: 0.88 });
}

export type UploadedImage = { url: string; width: number; height: number };

export async function uploadImageSized(
	file: File,
	purpose: UploadPurpose
): Promise<UploadedImage> {
	if (!file.type.startsWith("image/") && file.type !== "") {
		throw new Error("Choose an image file.");
	}

	const body = new FormData();
	body.append("file", await shrink(file), file.name);
	body.append("purpose", purpose);
	const response = await fetch("/api/upload", { method: "POST", body });
	const data = (await response.json().catch(() => ({}))) as {
		url?: string;
		width?: number;
		height?: number;
		error?: string;
	};
	if (!response.ok || !data.url) {
		throw new Error(data.error ?? "Upload failed. Try again.");
	}

	return { url: data.url, width: data.width ?? 0, height: data.height ?? 0 };
}
