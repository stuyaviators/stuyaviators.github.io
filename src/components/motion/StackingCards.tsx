"use client";

import type { MotionValue } from "motion/react";
import type { ReactNode } from "react";
import {
	motion,
	useReducedMotion,
	useScroll,
	useTransform,
} from "motion/react";
import { Children, useRef } from "react";

/*
 * Cards that stack as you scroll: every card sticks at the same height, and
 * as later cards slide up over it, the ones underneath shrink slightly and
 * lift, so the stack grows upward instead of drifting down the screen.
 */
function StackCard({
	children,
	index,
	total,
	progress,
}: {
	readonly children: ReactNode;
	readonly index: number;
	readonly total: number;
	readonly progress: MotionValue<number>;
}) {
	const isReducedMotion = useReducedMotion();
	const below = total - 1 - index; // Cards that will land on top of this one
	const start = index / total;
	const scale = useTransform(progress, [start, 1], [1, 1 - below * 0.04]);
	const y = useTransform(progress, [start, 1], [0, -below * 14]);
	const filter = useTransform(
		progress,
		[start, 1],
		["brightness(1)", `brightness(${1 - below * 0.06})`]
	);
	return (
		// The gap below each card holds it in the middle of the screen for a
		// moment before the next one slides over it.
		<li className="sticky top-24 mb-[18svh] h-[calc(100svh-7rem)] max-h-[34rem] pt-4 last:mb-0">
			<motion.div
				className="h-full origin-top"
				style={isReducedMotion ? undefined : { scale, y, filter }}
			>
				{children}
			</motion.div>
		</li>
	);
}

export default function StackingCards({
	children,
}: {
	readonly children: ReactNode;
}) {
	const ref = useRef<HTMLOListElement>(null);
	const { scrollYProgress } = useScroll({
		target: ref,
		offset: ["start start", "end end"],
	});
	const items = Children.toArray(children);
	return (
		<ol ref={ref} className="relative">
			{items.map((child, index) => (
				<StackCard
					key={index}
					index={index}
					total={items.length}
					progress={scrollYProgress}
				>
					{child}
				</StackCard>
			))}
		</ol>
	);
}
