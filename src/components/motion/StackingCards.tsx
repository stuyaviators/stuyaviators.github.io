"use client";

import type { MotionValue } from "motion/react";
import type { ReactNode, RefCallback } from "react";
import {
	motion,
	motionValue,
	useMotionValueEvent,
	useReducedMotion,
	useScroll,
	useTransform,
} from "motion/react";
import { Children, useEffect, useMemo, useRef } from "react";

/*
 * Cards that stack as you scroll: every card sticks at the same height, and
 * as later cards slide up over it, the ones underneath shrink slightly and
 * lift, so the stack grows upward instead of drifting down the screen.
 *
 * How far a card is buried is measured from where the cards above it really
 * are on screen (not from the scroll progress of the whole list), so each
 * card arrives at exactly the same height, the last one included, however
 * much space there is between cards.
 */
// Matches the top-24 class on each card, in pixels.
const stickyTop = 96;

function StackCard({
	children,
	cover,
	cardRef,
}: {
	readonly children: ReactNode;
	// How many cards have landed on this one (0 → untouched).
	readonly cover: MotionValue<number>;
	readonly cardRef: RefCallback<HTMLLIElement>;
}) {
	const isReducedMotion = useReducedMotion();
	const scale = useTransform(cover, (value) => 1 - value * 0.04);
	const y = useTransform(cover, (value) => -value * 14);
	const filter = useTransform(
		cover,
		(value) => `brightness(${1 - value * 0.06})`
	);
	return (
		// The gap below each card holds it in the middle of the screen for a
		// moment before the next one slides over it.
		<li
			ref={cardRef}
			className="sticky top-24 mb-[18svh] h-[calc(100svh-7rem)] max-h-[34rem] pt-4 last:mb-0"
		>
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
	const items = Children.toArray(children);
	const cards = useRef<Array<HTMLLIElement | undefined>>([]);
	const covers = useMemo(
		() => items.map(() => motionValue(0)),
		// One value per card.
		[items.length]
	);
	const { scrollY } = useScroll();

	const update = () => {
		const height = window.innerHeight;
		// Zero when a card's top is at the bottom of the screen, 1 once it has
		// landed in the stack.
		const landed = cards.current.map((card) => {
			if (!card) {
				return 0;
			}

			const { top } = card.getBoundingClientRect();
			return Math.min(1, Math.max(0, (height - top) / (height - stickyTop)));
		});
		for (const [index, cover] of covers.entries()) {
			let total = 0;
			for (let later = index + 1; later < landed.length; later++) {
				total += landed[later] ?? 0;
			}

			cover.set(total);
		}
	};

	useMotionValueEvent(scrollY, "change", update);
	useEffect(() => {
		update();
		globalThis.addEventListener("resize", update);
		return () => {
			globalThis.removeEventListener("resize", update);
		};
	}, [covers]);

	return (
		<ol className="relative">
			{items.map((child, index) => (
				<StackCard
					key={index}
					cover={covers[index] ?? motionValue(0)}
					cardRef={(element) => {
						cards.current[index] = element ?? undefined;
					}}
				>
					{child}
				</StackCard>
			))}
			{/* Room after the last card: the cards stay stacked on screen for a
			    moment before the whole stack scrolls away. Padding wouldn't do:
			    sticky cards only stay put inside the list's content. */}
			<li aria-hidden className="h-[18svh]" />
		</ol>
	);
}
