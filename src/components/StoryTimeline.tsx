"use client";

import type { MotionValue } from "motion/react";
import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import { Plane } from "lucide-react";
import {
	motion,
	useReducedMotion,
	useScroll,
	useSpring,
	useTransform,
} from "motion/react";
import { useRef } from "react";

/*
 * Story timeline as a flight: a dotted flight path draws down the page as
 * you scroll with a plane riding its leading edge; each milestone swings in
 * from alternating sides (tilted, blurred, scaled down) and settles as it
 * reaches the middle of the screen, its waypoint lighting up as the plane
 * passes. A giant year strip drifts sideways in the background. Reduced
 * motion gets the same layout, static.
 */
export type TimelineItem = { key: string; label: string; content: ReactNode };

const years = "2022 · 2023 · 2024 · 2025 · 2026 · ";

function Milestone({
	item,
	index,
}: {
	readonly item: TimelineItem;
	readonly index: number;
}) {
	const ref = useRef<HTMLLIElement>(null);
	const isReducedMotion = useReducedMotion();
	const isLeft = index % 2 === 0;
	const { scrollYProgress } = useScroll({
		target: ref,
		offset: ["start end", "center center"],
	});
	const progress = useSpring(scrollYProgress, {
		stiffness: 140,
		damping: 26,
		mass: 0.4,
	});
	const x = useTransform(progress, [0, 1], [isLeft ? -140 : 140, 0]);
	const rotate = useTransform(progress, [0, 1], [isLeft ? -8 : 8, 0]);
	const scale = useTransform(progress, [0, 1], [0.82, 1]);
	const opacity = useTransform(progress, [0, 0.6], [0, 1]);
	const filter = useTransform(progress, [0, 0.8], ["blur(10px)", "blur(0px)"]);
	const dotScale = useTransform(progress, [0.75, 1], [0, 1]);
	const glow = useTransform(progress, [0.85, 1], [0, 1]);
	const labelY = useTransform(scrollYProgress, [0, 1], [60, 0]);

	return (
		<li
			ref={ref}
			className={cn(
				"relative grid pl-14 md:grid-cols-2 md:gap-24 md:pl-0",
				"min-h-[70svh] content-center py-10"
			)}
		>
			{/* Waypoint on the flight path. */}
			<motion.span
				aria-hidden
				className="absolute top-1/2 left-6 z-10 size-5 -translate-x-1/2 -translate-y-1/2 rotate-45 rounded-[4px] border-2 border-brand bg-bg md:left-1/2"
				style={isReducedMotion ? undefined : { scale: dotScale }}
			/>
			<motion.span
				aria-hidden
				className="absolute top-1/2 left-6 size-14 -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand/30 blur-md md:left-1/2"
				style={{ opacity: isReducedMotion ? 0 : glow }}
			/>
			<motion.div
				className={cn(
					"min-w-0",
					isLeft ? "md:col-start-1 md:text-right" : "md:col-start-2"
				)}
				style={
					isReducedMotion ? undefined : { x, rotate, scale, opacity, filter }
				}
			>
				<motion.p
					className="font-display text-sm font-semibold text-accent-text sm:text-base"
					style={isReducedMotion ? undefined : { y: labelY }}
				>
					{item.label}
				</motion.p>
				<div
					className={cn(
						"mt-4 rounded-3xl border border-hairline bg-surface p-6 text-left shadow-card sm:p-8",
						isLeft ? "md:ml-auto" : ""
					)}
				>
					{item.content}
				</div>
			</motion.div>
		</li>
	);
}

function FlightPath({ progress }: { readonly progress: MotionValue<number> }) {
	const isReducedMotion = useReducedMotion();
	const top = useTransform(progress, [0, 1], ["0%", "100%"]);
	const sway = useTransform(progress, (value) => Math.sin(value * 18) * 10);
	const bank = useTransform(progress, (value) => 135 + Math.cos(value * 18) * 14);
	return (
		<div
			aria-hidden
			className="pointer-events-none absolute inset-y-0 left-6 w-0 md:left-1/2"
		>
			{/* Faint full route, then the drawn (flown) part. */}
			<div className="absolute inset-y-0 -left-px w-0.5 bg-[repeating-linear-gradient(to_bottom,var(--hairline)_0_6px,transparent_6px_14px)]" />
			<motion.div
				className="absolute inset-x-0 top-0 -left-px w-0.5 origin-top bg-[repeating-linear-gradient(to_bottom,var(--brand)_0_6px,transparent_6px_14px)]"
				style={{ height: isReducedMotion ? "100%" : top }}
			/>
			{isReducedMotion ? null : (
				<motion.div
					className="absolute -left-5 -translate-y-1/2"
					style={{ top, x: sway }}
				>
					<span className="absolute inset-0 -z-10 rounded-full bg-brand/40 blur-lg" />
					<motion.span className="block" style={{ rotate: bank }}>
						<Plane className="size-10 fill-brand text-brand" strokeWidth={1.5} />
					</motion.span>
				</motion.div>
			)}
		</div>
	);
}

export default function StoryTimeline({
	items,
	backdrop = years,
}: {
	readonly items: TimelineItem[];
	/**
	Giant outlined text drifting behind the timeline.
	*/
	readonly backdrop?: string;
}) {
	const ref = useRef<HTMLDivElement>(null);
	const isReducedMotion = useReducedMotion();
	const { scrollYProgress } = useScroll({
		target: ref,
		offset: ["start 60%", "end 40%"],
	});
	const progress = useSpring(scrollYProgress, {
		stiffness: 120,
		damping: 24,
		mass: 0.3,
	});
	const { scrollYProgress: pass } = useScroll({
		target: ref,
		offset: ["start end", "end start"],
	});
	const marqueeX = useTransform(pass, [0, 1], ["5%", "-55%"]);

	return (
		<div ref={ref} className="relative">
			{/* Giant drifting years behind everything. */}
			<div
				aria-hidden
				className="pointer-events-none sticky top-[20svh] -z-10 h-0 overflow-visible"
			>
				<motion.p
					className="font-display text-[22vw] leading-none font-semibold whitespace-nowrap text-transparent opacity-60 [-webkit-text-stroke:1px_var(--hairline)]"
					style={isReducedMotion ? undefined : { x: marqueeX }}
				>
					{backdrop}
					{backdrop}
				</motion.p>
			</div>
			<FlightPath progress={progress} />
			<ol className="relative">
				{items.map((item, index) => (
					<Milestone key={item.key} item={item} index={index} />
				))}
			</ol>
		</div>
	);
}
