"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import {
	AnimatePresence,
	motion,
	useMotionValueEvent,
	useReducedMotion,
} from "motion/react";
import { useState } from "react";
import PinnedScene, { useSceneProgress } from "./PinnedScene.tsx";

/*
 * Locks the section on screen and steps through items one at a time as you
 * scroll (like the homepage's member quotes): a rail lists every step and
 * highlights the current one, and the active step slides in while the last
 * slides out. Unpinned (reduced motion, short screens) it shows every step.
 */
export type Step = { key: string; label: string; content: ReactNode };

const ease = [0.16, 1, 0.3, 1] as const;

function Steps({
	header,
	steps,
}: {
	readonly header: ReactNode;
	readonly steps: Step[];
}) {
	const { progress, isPinned } = useSceneProgress();
	const isReducedMotion = useReducedMotion();
	const [active, setActive] = useState(0);
	const [direction, setDirection] = useState(1);

	useMotionValueEvent(progress, "change", (value) => {
		const next = Math.min(steps.length - 1, Math.floor(value * steps.length));
		if (next === active) {
			return;
		}

		setDirection(next > active ? 1 : -1);
		setActive(next);
	});

	if (!isPinned) {
		return (
			<>
				{header}
				<ol className="grid gap-5 md:grid-cols-2">
					{steps.map((step) => (
						<li key={step.key} className="rounded-3xl bg-surface p-6 sm:p-8">
							<p className="label text-accent-text">{step.label}</p>
							<div className="mt-3">{step.content}</div>
						</li>
					))}
				</ol>
			</>
		);
	}

	const step = steps[active];
	return (
		<>
			{header}
			<div className="grid gap-8 md:grid-cols-[14rem_1fr] md:gap-12">
				<ol className="flex gap-2 overflow-x-auto md:flex-col md:gap-1">
					{steps.map((item, index) => (
						<li
							key={item.key}
							aria-current={index === active ? "step" : undefined}
							className={cn(
								"relative shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-colors duration-300 md:rounded-2xl",
								index === active ? "text-brand-ink" : "text-muted"
							)}
						>
							{index === active ? (
								<motion.span
									layoutId="step-rail"
									className="absolute inset-0 -z-10 rounded-full bg-brand md:rounded-2xl"
									transition={{ type: "spring", stiffness: 380, damping: 34 }}
								/>
							) : null}
							{item.label}
						</li>
					))}
				</ol>
				<div className="relative min-h-[18rem]">
					<AnimatePresence mode="wait" custom={direction} initial={false}>
						<motion.div
							key={step.key}
							custom={direction}
							initial={
								isReducedMotion
									? false
									: { opacity: 0, y: direction * 48, scale: 0.96 }
							}
							animate={{ opacity: 1, y: 0, scale: 1 }}
							exit={{ opacity: 0, y: direction * -48, scale: 0.96 }}
							transition={{ duration: 0.5, ease }}
							className="rounded-3xl bg-surface p-6 shadow-card sm:p-10"
						>
							<p className="label text-accent-text">{step.label}</p>
							<div className="mt-3">{step.content}</div>
						</motion.div>
					</AnimatePresence>
					<div className="mt-6 h-1 overflow-hidden rounded-full bg-hairline">
						<motion.div
							className="h-full origin-left rounded-full bg-brand"
							style={{ scaleX: progress }}
						/>
					</div>
				</div>
			</div>
		</>
	);
}

export default function StepSequence({
	id,
	labelledBy,
	header,
	steps,
}: {
	readonly id?: string;
	readonly labelledBy?: string;
	readonly header: ReactNode;
	readonly steps: Step[];
}) {
	return (
		<PinnedScene
			id={id}
			labelledBy={labelledBy}
			length={steps.length * 0.6}
			isAlwaysPinned
		>
			<div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">
				<Steps header={header} steps={steps} />
			</div>
		</PinnedScene>
	);
}
