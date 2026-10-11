import type { ProcessedImage, UploadPurpose } from "@/lib/uploads";
import { blobToken } from "@/lib/blob-token";
import { put } from "@vercel/blob";

/**
Stores a processed image in Vercel Blob (public, cached for a year) and
returns its address. Throws when the Blob store isn't connected.
*/
export async function storeImage(
	image: ProcessedImage,
	purpose: UploadPurpose
): Promise<string> {
	const token = blobToken();
	if (token === undefined) {
		throw new Error("Vercel Blob isn’t connected (BLOB_READ_WRITE_TOKEN).");
	}

	const blob = await put(
		`uploads/${purpose}/${crypto.randomUUID()}.${image.extension}`,
		Buffer.from(image.data),
		{
			access: "public",
			contentType: image.contentType,
			cacheControlMaxAge: 60 * 60 * 24 * 365,
			token,
		}
	);
	return blob.url;
}
