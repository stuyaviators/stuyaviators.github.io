import { z } from "zod";

/*
 * Photos shown on the site come from Vercel Blob uploads only: next/image
 * refuses other hosts, and a stray address would break the whole page.
 */

const blobHost = ".public.blob.vercel-storage.com";

export function isBlobUrl(value: string) {
	try {
		const url = new URL(value);
		return url.protocol === "https:" && url.hostname.endsWith(blobHost);
	} catch {
		return false;
	}
}

/**
A Blob address, or empty.
*/
export const optionalBlobUrl = z
	.string()
	.trim()
	.max(2000)
	.refine((value) => value === "" || isBlobUrl(value), {
		message: "Use the Upload button for photos",
	});
