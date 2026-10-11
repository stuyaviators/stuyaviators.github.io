import { blobToken } from "@/lib/blob-token";
import { AuthorizationError, requireUser } from "@/lib/session";
import {
	maxUploadBytes,
	processImage,
	UploadError,
	uploadPurpose,
} from "@/lib/uploads";
import { put } from "@vercel/blob";
import { NextResponse } from "next/server";

/*
 * Officer-only image upload to Vercel Blob. (Replaces recode's unauthenticated
 * catbox.moe proxy.) The session and allowlist are checked here, not just in
 * the proxy.
 */

function error(message: string, status: number) {
	return NextResponse.json({ error: message }, { status });
}

export async function POST(request: Request) {
	try {
		await requireUser("officer");
	} catch (error_) {
		if (error_ instanceof AuthorizationError) {
			return error(error_.message, 401);
		}

		throw error_;
	}

	// Same-origin requests only (the session cookie is SameSite=Lax too).
	const origin = request.headers.get("origin");
	if (origin && origin !== new URL(request.url).origin) {
		return error("Cross-site uploads aren’t allowed.", 403);
	}

	const token = blobToken();
	if (token === undefined) {
		return error(
			"Uploads aren’t set up yet. An admin needs to connect Vercel Blob (BLOB_READ_WRITE_TOKEN).",
			503
		);
	}

	const length = Number(request.headers.get("content-length") ?? 0);
	if (length > maxUploadBytes + 64 * 1024) {
		return error("Images must be under 4 MB.", 413);
	}

	let form: FormData;
	try {
		form = await request.formData();
	} catch {
		return error("Couldn’t read the upload.", 400);
	}

	const file = form.get("file");
	const purpose = uploadPurpose.safeParse(form.get("purpose"));
	if (!(file instanceof File) || !purpose.success) {
		return error("Choose an image to upload.", 400);
	}

	try {
		const image = await processImage(
			new Uint8Array(await file.arrayBuffer()),
			purpose.data
		);
		const blob = await put(
			`uploads/${purpose.data}/${crypto.randomUUID()}.${image.extension}`,
			Buffer.from(image.data),
			{
				access: "public",
				contentType: image.contentType,
				cacheControlMaxAge: 60 * 60 * 24 * 365,
				token,
			}
		);
		return NextResponse.json({
			url: blob.url,
			width: image.width,
			height: image.height,
		});
	} catch (error_) {
		if (error_ instanceof UploadError) {
			return error(error_.message, 400);
		}

		console.error("Upload failed", error_);
		return error("Upload failed. Try again.", 500);
	}
}
