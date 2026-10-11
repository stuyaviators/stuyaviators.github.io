"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import {
	motion,
	useReducedMotion,
	useScroll,
	useTransform,
} from "motion/react";
import { useRef } from "react";

/**
Background parallax: children drift vertically (and slightly zoom) as the
section scrolls through the viewport. Fills its positioned parent.
*/
export default function Parallax({
	children,
	className,
	distance = 80,
}: {
	readonly children: ReactNode;
	readonly className?: string;
	readonly distance?: number;
}) {
	const ref = useRef<HTMLDivElement>(null);
	const isReducedMotion = useReducedMotion();
	const { scrollYProgress } = useScroll({
		target: ref,
		offset: ["start start", "end start"],
	});
	const y = useTransform(scrollYProgress, [0, 1], [0, distance]);
	const scale = useTransform(scrollYProgress, [0, 1], [1.08, 1.18]);
	return (
		<div
			ref={ref}
			className={cn("absolute inset-0 overflow-hidden", className)}
		>
			<motion.div
				className="absolute inset-0"
				style={isReducedMotion ? undefined : { y, scale }}
			>
				{children}
			</motion.div>
		</div>
	);
}
