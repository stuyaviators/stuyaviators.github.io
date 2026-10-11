"use client";

import { useEffect, useRef } from "react";

/**
Drop inside a full-bleed photo header: while the header bar sits over the
photo, it turns transparent with white text (see `data-header` in
globals.css) instead of a light frosted bar.
*/
export default function HeaderOverlay() {
	const ref = useRef<HTMLSpanElement>(null);

	useEffect(() => {
		const hero = ref.current?.parentElement;
		if (!hero) {
			return;
		}

		const root = document.documentElement;
		// The root is the top 10% of the viewport, where the header bar sits.
		const observer = new IntersectionObserver(
			([entry]) => {
				if (entry?.isIntersecting) {
					root.dataset.header = "overlay";
				} else {
					delete root.dataset.header;
				}
			},
			{ rootMargin: "0px 0px -90% 0px" }
		);
		observer.observe(hero);
		return () => {
			observer.disconnect();
			delete root.dataset.header;
		};
	}, []);

	return <span ref={ref} hidden />;
}
