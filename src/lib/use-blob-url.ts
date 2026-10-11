"use client";

import { useEffect, useState } from "react";

/*
 * Loads a file into memory and returns a blob: URL for it, so the media's
 * real address doesn't appear in the page (a deterrent against copying, not
 * a lock: the file still crosses the network). Each URL is fetched once per
 * visit and shared. If the fetch fails, falls back to the original URL.
 */
const cache = new Map<string, Promise<string>>();

async function load(url: string) {
	let pending = cache.get(url);
	if (!pending) {
		pending = fetch(url)
			.then(async (response) => {
				if (!response.ok) {
					throw new Error(`Failed to load ${url}`);
				}

				return URL.createObjectURL(await response.blob());
			})
			.catch((error: unknown) => {
				cache.delete(url);
				throw error;
			});
		cache.set(url, pending);
	}

	return pending;
}

export function useBlobUrl(url: string | undefined, isEnabled = true) {
	const [blobUrl, setBlobUrl] = useState<string | undefined>(undefined);

	useEffect(() => {
		if (url === undefined || !isEnabled) {
			return;
		}

		let isActive = true;
		load(url)
			.then((result) => {
				if (isActive) {
					setBlobUrl(result);
				}
			})
			.catch(() => {
				if (isActive) {
					setBlobUrl(url);
				}
			});
		return () => {
			isActive = false;
		};
	}, [url, isEnabled]);

	return blobUrl;
}
