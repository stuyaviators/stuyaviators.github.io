"use client";

import { runTakeoff } from "@/lib/takeoff";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

/**
Any click on a link to the dashboard from the public site first plays the
"taking off" exit, then goes there. Modified clicks and new-tab links behave
normally.
*/
export default function TakeoffLauncher() {
	const router = useRouter();

	useEffect(() => {
		let isFlying = false;
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
				(link.target !== "" && link.target !== "_self")
			) {
				return;
			}

			const url = new URL(link.href);
			if (
				url.origin !== globalThis.location.origin ||
				!url.pathname.startsWith("/dashboard")
			) {
				return;
			}

			// Ours from here on: nothing else should handle this click.
			event.preventDefault();
			event.stopPropagation();
			if (isFlying) {
				return;
			}

			isFlying = true;
			const destination = url.pathname + url.search + url.hash;
			void runTakeoff().then(() => {
				router.push(destination);
			});
		};

		document.addEventListener("click", onClick, { capture: true });
		return () => {
			document.removeEventListener("click", onClick, { capture: true });
		};
	}, [router]);

	return null;
}
