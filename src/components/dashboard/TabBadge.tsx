"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

/*
 * Shows unread inbox messages on the browser tab: "(3) " before the page
 * title and a red dot on the tab icon. The count is checked again every
 * minute, and the page data is refreshed when it changes.
 */
const pollMs = 60_000;
const countPrefix = /^\(\d+\)\s/u;

function withPrefix(title: string, count: number) {
	const bare = title.replace(countPrefix, "");
	return count > 0 ? `(${count > 99 ? "99+" : count}) ${bare}` : bare;
}

async function drawDot(source: string): Promise<string | undefined> {
	return new Promise((resolve) => {
		const image = new Image();
		image.addEventListener("load", () => {
			const size = 64;
			const canvas = document.createElement("canvas");
			canvas.width = size;
			canvas.height = size;
			const context = canvas.getContext("2d");
			if (!context) {
				resolve(undefined);
				return;
			}

			context.drawImage(image, 0, 0, size, size);
			context.beginPath();
			context.arc(48, 16, 15, 0, Math.PI * 2);
			context.fillStyle = "#e5251b";
			context.fill();
			context.lineWidth = 4;
			context.strokeStyle = "#ffffff";
			context.stroke();
			resolve(canvas.toDataURL("image/png"));
		});
		image.addEventListener("error", () => {
			resolve(undefined);
		});
		image.src = source;
	});
}

export default function TabBadge({ initial }: { readonly initial: number }) {
	const router = useRouter();
	const [count, setCount] = useState(initial);
	const originals = useRef(new Map<HTMLLinkElement, string>());

	// A fresh count from the server (after a refresh) wins.
	useEffect(() => {
		setCount(initial);
	}, [initial]);

	useEffect(() => {
		let isStopped = false;
		const check = async () => {
			if (document.visibilityState !== "visible") {
				return;
			}

			try {
				const response = await fetch("/api/dashboard/unread", {
					cache: "no-store",
				});
				const data = (await response.json()) as { count?: number };
				if (!isStopped && typeof data.count === "number") {
					setCount((current) => {
						if (current !== data.count) {
							router.refresh();
						}

						return data.count ?? current;
					});
				}
			} catch {
				// Offline or signed out: try again next time.
			}
		};

		const poll = () => {
			void check();
		};

		const timer = setInterval(poll, pollMs);
		document.addEventListener("visibilitychange", poll);
		return () => {
			isStopped = true;
			clearInterval(timer);
			document.removeEventListener("visibilitychange", poll);
		};
	}, [router]);

	// The count in the title survives page changes, which reset the title.
	useEffect(() => {
		const apply = () => {
			const next = withPrefix(document.title, count);
			if (next !== document.title) {
				document.title = next;
			}
		};

		apply();
		const observer = new MutationObserver(apply);
		const title = document.querySelector("title");
		if (title) {
			observer.observe(title, {
				childList: true,
				characterData: true,
				subtree: true,
			});
		}

		return () => {
			observer.disconnect();
			document.title = withPrefix(document.title, 0);
		};
	}, [count]);

	// The red dot on the tab icon.
	useEffect(() => {
		if (count === 0) {
			for (const [link, href] of originals.current) {
				link.href = href;
			}

			return;
		}

		const state = { isCurrent: true };
		const links =
			document.querySelectorAll<HTMLLinkElement>('link[rel~="icon"]');
		for (const link of links) {
			if (!originals.current.has(link)) {
				originals.current.set(link, link.href);
			}

			const original = originals.current.get(link) ?? link.href;
			void drawDot(original).then((dotted) => {
				if (dotted === undefined || !state.isCurrent) {
					return;
				}

				link.type = "image/png";
				link.href = dotted;
			});
		}

		return () => {
			state.isCurrent = false;
		};
	}, [count]);

	return null;
}
