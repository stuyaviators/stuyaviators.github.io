"use client";

import type { ReactNode } from "react";
import { motion, useScroll, useTransform } from "motion/react";
import { useEffect, useRef, useState } from "react";

/**
How far the track must slide for the last card to sit in the middle of the
screen (not jammed against the right edge).
*/
function slideDistance(track: HTMLElement): number {
	const last = track.lastElementChild;
	if (!(last instanceof HTMLElement)) {
		return 0;
	}

	const trackBox = track.getBoundingClientRect();
	const lastBox = last.getBoundingClientRect();
	const center = lastBox.left - trackBox.left + lastBox.width / 2;
	return Math.max(0, center - window.innerWidth / 2);
}

/**
Pinned horizontal carousel: the section locks while vertical scrolling
slides the cards sideways, on every screen size, and the last card ends
centered. Reduced-motion visitors and very short screens get a native
swipeable row with scroll-snap.
*/
export default function HorizontalShowcase({
	header,
	children,
}: {
	readonly header: ReactNode;
	readonly children: ReactNode;
}) {
	const sectionRef = useRef<HTMLElement>(null);
	const trackRef = useRef<HTMLDivElement>(null);
	const [distance, setDistance] = useState(0);
	const [isPinned, setIsPinned] = useState(false);

	useEffect(() => {
		const tall = globalThis.matchMedia("(min-height: 560px)");
		const reduced = globalThis.matchMedia("(prefers-reduced-motion: reduce)");
		const measure = () => {
			setIsPinned(tall.matches && !reduced.matches);
			const track = trackRef.current;
			if (track) {
				setDistance(slideDistance(track));
			}
		};

		measure();
		const observer = new ResizeObserver(measure);
		observer.observe(document.documentElement);
		tall.addEventListener("change", measure);
		reduced.addEventListener("change", measure);
		return () => {
			observer.disconnect();
			tall.removeEventListener("change", measure);
			reduced.removeEventListener("change", measure);
		};
	}, []);

	// Re-measure once the pinned track (with its padding) is rendered.
	useEffect(() => {
		const track = trackRef.current;
		if (track) {
			setDistance(slideDistance(track));
		}
	}, [isPinned]);

	const { scrollYProgress } = useScroll({
		target: sectionRef,
		offset: ["start start", "end end"],
	});
	const x = useTransform(scrollYProgress, [0.05, 0.95], [0, -distance]);
	const progressWidth = useTransform(
		scrollYProgress,
		[0.05, 0.95],
		["0%", "100%"]
	);

	// Both layouts attach sectionRef to the same <section>: useScroll binds to
	// it once on mount and throws (stopping every scroll animation queued
	// alongside it) if the ref is still empty.
	if (!isPinned) {
		return (
			<section ref={sectionRef} className="py-14 sm:py-20">
				<div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">{header}</div>
				<div
					ref={trackRef}
					className="mt-8 flex snap-x snap-mandatory gap-4 overflow-x-auto px-[max(1rem,calc(50vw-min(37vw,12rem)))] pb-4 sm:px-[max(1.5rem,calc(50vw-11rem))]"
				>
					{children}
				</div>
			</section>
		);
	}

	return (
		<section
			ref={sectionRef}
			className="relative"
			style={{ height: `calc(100svh + ${distance}px)` }}
		>
			<div className="sticky top-0 flex h-svh flex-col justify-center overflow-hidden">
				<div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">
					{header}
				</div>
				<motion.div
					ref={trackRef}
					style={{ x }}
					className="mt-8 flex gap-4 pr-4 pl-4 sm:mt-10 sm:gap-6 sm:pr-16 sm:pl-[max(1.5rem,calc((100vw-72rem)/2+2rem))]"
				>
					{children}
				</motion.div>
				<div className="mx-auto mt-8 h-0.5 w-[calc(100%-2rem)] max-w-[calc(72rem-4rem)] overflow-hidden rounded-full bg-hairline sm:mt-10 sm:w-[calc(100%-3rem)]">
					<motion.div
						className="h-full bg-brand"
						style={{ width: progressWidth }}
					/>
				</div>
			</div>
		</section>
	);
}
