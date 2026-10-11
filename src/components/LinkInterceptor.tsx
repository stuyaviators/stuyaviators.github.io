"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

/**
Plain <a> links to other pages on this site (for example, links inside
markdown copy, which can't use next/link) navigate client-side instead of
reloading the whole page. Same-page "#section" links are left to the browser
so they scroll smoothly. Links next/link already handled, new-tab and
modified clicks, and downloads are untouched.
*/
export default function LinkInterceptor() {
	const router = useRouter();

	useEffect(() => {
		const onClick = (event: MouseEvent) => {
			if (
				event.defaultPrevented ||
				event.button !== 0 ||
				event.metaKey ||
				event.ctrlKey ||
				event.shiftKey ||
				event.altKey
			) {
				return;
			}

			const link = (event.target as Element | undefined)?.closest?.("a[href]");
			if (
				!(link instanceof HTMLAnchorElement) ||
				(link.target !== "" && link.target !== "_self") ||
				link.hasAttribute("download")
			) {
				return;
			}

			const url = new URL(link.href);
			if (url.origin !== globalThis.location.origin) {
				return;
			}

			const isSamePage =
				url.pathname === globalThis.location.pathname &&
				url.search === globalThis.location.search;
			if (isSamePage && url.hash !== "") {
				return; // Native smooth scroll to the section.
			}

			event.preventDefault();
			router.push(url.pathname + url.search + url.hash);
		};

		document.addEventListener("click", onClick);
		return () => {
			document.removeEventListener("click", onClick);
		};
	}, [router]);

	return null;
}
