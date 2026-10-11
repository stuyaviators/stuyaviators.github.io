"use client";

import type { ReactNode } from "react";
import { useEffect, useRef, useState } from "react";

/**
Marks its wrapper data-inview="in" the first time it scrolls into view, so
CSS can hold an animation (like the departure board's split-flap) until the
visitor can actually see it. Without JS the attribute has no effect.
*/
export default function InView({
	children,
	className,
}: {
	readonly children: ReactNode;
	readonly className?: string;
}) {
	const ref = useRef<HTMLDivElement>(null);
	const [state, setState] = useState<"out" | "in">("out");

	useEffect(() => {
		const element = ref.current;
		if (!element) {
			return;
		}

		const observer = new IntersectionObserver(
			([entry]) => {
				if (!entry?.isIntersecting) {
					return;
				}

				setState("in");
				observer.disconnect();
			},
			{ rootMargin: "0px 0px -15% 0px" }
		);
		observer.observe(element);
		return () => {
			observer.disconnect();
		};
	}, []);

	return (
		<div ref={ref} className={className} data-inview={state}>
			{children}
		</div>
	);
}
