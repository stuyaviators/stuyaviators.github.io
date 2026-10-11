"use client";

import type { MotionValue } from "motion/react";
import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import { motion, useScroll, useTransform } from "motion/react";
import { createContext, useContext, useEffect, useRef, useState } from "react";

/*
 * Apple-style scroll lock: the scene sticks to the viewport for `length`
 * extra screen heights while you keep scrolling, and children can read the
 * scene's 0→1 progress (useSceneProgress) to animate in step with it. The
 * content eases in (scale/fade) as the scene arrives and recedes as it
 * leaves. Falls back to a normal section under reduced motion or when the
 * content is taller than the screen, so nothing is ever clipped.
 */
const SceneContext = createContext<
	{ progress: MotionValue<number>; isPinned: boolean } | undefined
>(undefined);

/**
Scene progress when inside a pinned <PinnedScene>, otherwise undefined.
*/
export function useOptionalScene() {
	const context = useContext(SceneContext);
	return context?.isPinned ? context : undefined;
}

export function useSceneProgress() {
	const context = useContext(SceneContext);
	if (!context) {
		throw new Error("useSceneProgress must be used inside <PinnedScene>");
	}

	return context;
}

export default function PinnedScene({
	children,
	length = 1,
	className,
	innerClassName,
	label,
	labelledBy,
	id,
	isEntranceAnimated = true,
	isAlwaysPinned = false,
}: {
	readonly children: ReactNode;
	/**
	Extra scroll distance while locked, in viewport heights.
	*/
	readonly length?: number;
	readonly className?: string;
	readonly innerClassName?: string;
	readonly label?: string;
	readonly labelledBy?: string;
	readonly id?: string;
	readonly isEntranceAnimated?: boolean;
	/**
	Skip the fits-on-screen check (content with a compact pinned layout).
	*/
	readonly isAlwaysPinned?: boolean;
}) {
	const sectionRef = useRef<HTMLElement>(null);
	const contentRef = useRef<HTMLDivElement>(null);
	const [isPinned, setIsPinned] = useState(false);

	useEffect(() => {
		const reduced = globalThis.matchMedia("(prefers-reduced-motion: reduce)");
		const measure = () => {
			const content = contentRef.current;
			const isFits =
				isAlwaysPinned ||
				!content ||
				content.scrollHeight <= window.innerHeight + 1;
			setIsPinned(!reduced.matches && isFits);
		};

		measure();
		const observer = new ResizeObserver(measure);
		observer.observe(document.documentElement);
		if (contentRef.current) {
			observer.observe(contentRef.current);
		}

		reduced.addEventListener("change", measure);
		return () => {
			observer.disconnect();
			reduced.removeEventListener("change", measure);
		};
	}, [isAlwaysPinned]);

	// Progress across the locked stretch only (0 when it pins, 1 on release).
	const { scrollYProgress } = useScroll({
		target: sectionRef,
		offset: ["start start", "end end"],
	});
	// Entrance/exit across the whole pass through the viewport.
	const { scrollYProgress: passProgress } = useScroll({
		target: sectionRef,
		offset: ["start end", "end start"],
	});
	const total = length + 2;
	const enterEnd = 1 / total;
	const exitStart = (length + 1) / total;
	const scale = useTransform(
		passProgress,
		[0, enterEnd, exitStart, 1],
		[0.92, 1, 1, 0.96]
	);
	const opacity = useTransform(
		passProgress,
		// Fade only at the far ends so text never looks greyed out mid-read.
		[0, enterEnd * 0.6, exitStart + (1 - exitStart) * 0.6, 1],
		[0.2, 1, 1, 0.3]
	);

	return (
		<SceneContext.Provider value={{ progress: scrollYProgress, isPinned }}>
			<section
				ref={sectionRef}
				id={id}
				aria-label={label}
				aria-labelledby={labelledBy}
				className={cn("relative", className)}
				style={isPinned ? { height: `${(1 + length) * 100}svh` } : undefined}
			>
				<div
					className={cn(
						isPinned && "sticky top-0 flex h-svh flex-col justify-center",
						isPinned ? "overflow-hidden" : "py-8 sm:py-10"
					)}
				>
					<motion.div
						ref={contentRef}
						className={cn("w-full", innerClassName)}
						style={
							isPinned && isEntranceAnimated ? { scale, opacity } : undefined
						}
					>
						{children}
					</motion.div>
				</div>
			</section>
		</SceneContext.Provider>
	);
}
