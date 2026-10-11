"use client";

import { takeoffFlag } from "@/lib/takeoff";
import { usePathname } from "next/navigation";
import { useEffect } from "react";

/**
The other half of the "taking off" exit: once the next page is on screen, the
veil fades away, and on the dashboard the sidebar and content fly in.
*/
export default function TakeoffArrival() {
	const pathname = usePathname();

	useEffect(() => {
		let isFlagged = false;
		try {
			isFlagged = sessionStorage.getItem(takeoffFlag) === "1";
			sessionStorage.removeItem(takeoffFlag);
		} catch {
			// Storage can be blocked; the veil clears itself either way.
		}

		const root = document.documentElement;
		// A finished sign-out fade must never hide the next page.
		root.classList.remove("dash-leaving");
		if (isFlagged && pathname.startsWith("/dashboard")) {
			root.classList.add("dash-arriving");
		}

		for (const veil of document.querySelectorAll<HTMLElement>(
			".takeoff-veil"
		)) {
			const fade = veil.animate([{ opacity: 1 }, { opacity: 0 }], {
				duration: 700,
				delay: 150,
				easing: "ease-out",
				fill: "forwards",
			});
			void fade.finished.then(() => {
				veil.remove();
			});
		}

		const timer = setTimeout(() => {
			root.classList.remove("dash-arriving");
		}, 1800);
		return () => {
			clearTimeout(timer);
		};
	}, [pathname]);

	return null;
}
