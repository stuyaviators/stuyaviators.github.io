import type { OgPicture } from "@/lib/og";
import { fetchPicture } from "@/lib/autofill";
import { isBlobUrl } from "@/lib/blob-url";
import { processImage } from "@/lib/uploads";

/*
 * The picture on an Open Graph card for an opportunity or scholarship: the
 * card's own image. Ours (uploaded) is JPEG or PNG already; older cards may
 * point at another site's picture (often WebP, which next/og can't draw), so
 * that one goes through the same guarded download and converter as autofill:
 * public hosts only, size-capped, re-encoded.
 */

const maxPictureBytes = 4 * 1024 * 1024;

async function fetchOwnPicture(url: string): Promise<OgPicture | undefined> {
	const response = await fetch(url, { signal: AbortSignal.timeout(4000) });
	const type = response.headers.get("content-type")?.split(";", 1)[0]?.trim();
	if (!response.ok || (type !== "image/jpeg" && type !== "image/png")) {
		return undefined;
	}

	const bytes = new Uint8Array(await response.arrayBuffer());
	return bytes.length > 0 && bytes.length <= maxPictureBytes
		? { bytes, type }
		: undefined;
}

/**
The picture for a card's address, or undefined when there is none or it can't
be used (not an image, too big, gone, slow): the caller then uses the usual
club-photo card.
*/
export async function fetchOgPicture(
	url: string | undefined
): Promise<OgPicture | undefined> {
	if (!url) {
		return undefined;
	}

	try {
		if (isBlobUrl(url)) {
			return await fetchOwnPicture(url);
		}

		const processed = await processImage(await fetchPicture(url), "listing");
		return { bytes: processed.data, type: processed.contentType };
	} catch {
		return undefined;
	}
}
