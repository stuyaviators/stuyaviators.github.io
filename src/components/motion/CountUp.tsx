"use client";

import { animate, useInView, useReducedMotion } from "motion/react";
import { useEffect, useRef, useState } from "react";

/**
Number that counts up when it scrolls into view.
*/
export default function CountUp({
	value,
	suffix = "",
	duration = 1.6,
	format = (n: number) => Math.round(n).toLocaleString("en-US"),
}: {
	readonly value: number;
	readonly suffix?: string;
	readonly duration?: number;
	readonly format?: (n: number) => string;
}) {
	const ref = useRef<HTMLSpanElement>(null);
	const isInView = useInView(ref, { once: true, margin: "0px 0px -10% 0px" });
	const isReducedMotion = useReducedMotion();
	const [display, setDisplay] = useState(0);

	useEffect(() => {
		if (!isInView) {
			return;
		}

		if (isReducedMotion) {
			setDisplay(value);
			return;
		}

		const controls = animate(0, value, {
			duration,
			ease: [0.16, 1, 0.3, 1],
			onUpdate: setDisplay,
		});
		return () => {
			controls.stop();
		};
	}, [isInView, isReducedMotion, value, duration]);

	return (
		<span ref={ref}>
			{format(display)}
			{suffix}
		</span>
	);
}
