"use client";

import type { CareerFamily } from "@/content/careers";
import CountUp from "@/components/motion/CountUp";
import { Button } from "@/components/ui/Button";
import { quizAnswers, quizQuestions } from "@/content/career-quiz";
import { cn } from "@/lib/cn";
import { ArrowLeft, ArrowRight, RotateCcw } from "lucide-react";
import {
	AnimatePresence,
	motion,
	useInView,
	useReducedMotion,
} from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { filterCareersEvent } from "./CareerExplorer.tsx";

/*
 * Career finder, one question at a time: pick an answer (click, or press
 * 1–3) and it slides to the next; ← or Back revisits. The end screen counts
 * up a match score for the top three career families and links each one
 * into the explorer below, pre-filtered.
 */
type Family = Pick<CareerFamily, "id" | "name" | "summary">;
type Result = { family: Family; percent: number };

const ease = [0.16, 1, 0.3, 1] as const;

function rank(families: Family[], answers: Record<string, number>): Result[] {
	const totals = new Map<string, number>();
	const max = new Map<string, number>();
	for (const question of quizQuestions) {
		for (const [family, weight] of Object.entries(question.weights)) {
			totals.set(
				family,
				(totals.get(family) ?? 0) + weight * (answers[question.id] ?? 0)
			);
			max.set(family, (max.get(family) ?? 0) + weight * 2);
		}
	}

	return families
		.map((family) => ({
			family,
			score: totals.get(family.id) ?? 0,
			percent: Math.round(
				((totals.get(family.id) ?? 0) / (max.get(family.id) ?? 1)) * 100
			),
		}))
		.toSorted((a, b) =>
			b.percent === a.percent ? b.score - a.score : b.percent - a.percent
		)
		.slice(0, 3);
}

function MatchBar({
	percent,
	delay,
}: {
	readonly percent: number;
	readonly delay: number;
}) {
	return (
		<div className="mt-3 h-2 overflow-hidden rounded-full bg-hairline">
			<motion.div
				className="h-full rounded-full bg-brand"
				initial={{ width: "0%" }}
				animate={{ width: `${Math.max(percent, 3)}%` }}
				transition={{ duration: 1.4, delay, ease }}
			/>
		</div>
	);
}

export default function CareerQuiz({
	families,
}: {
	readonly families: Family[];
}) {
	const [step, setStep] = useState(0);
	const [direction, setDirection] = useState(1);
	const [answers, setAnswers] = useState<Record<string, number>>({});
	const isReducedMotion = useReducedMotion();
	const panelRef = useRef<HTMLDivElement>(null);
	const isInView = useInView(panelRef, { amount: 0.5 });
	const advanceTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
	const total = quizQuestions.length;
	const isDone = step >= total;
	const question = quizQuestions[Math.min(step, total - 1)];
	const results = isDone ? rank(families, answers) : [];

	const goTo = useCallback(
		(next: number) => {
			clearTimeout(advanceTimer.current);
			setDirection(next > step ? 1 : -1);
			setStep(next);
		},
		[step]
	);

	const choose = useCallback(
		(value: number) => {
			setAnswers((current) => ({ ...current, [question.id]: value }));
			clearTimeout(advanceTimer.current);
			// Brief pause so the selection registers before sliding on.
			advanceTimer.current = setTimeout(
				() => {
					goTo(step + 1);
				},
				isReducedMotion ? 0 : 280
			);
		},
		[goTo, isReducedMotion, question.id, step]
	);

	const restart = () => {
		setAnswers({});
		goTo(0);
	};

	// Keyboard while the quiz is on screen: 1–3 answer, ← back, → forward.
	useEffect(() => {
		if (!isInView) {
			return;
		}

		const onKey = (event: KeyboardEvent) => {
			const target = event.target as HTMLElement | undefined;
			if (
				event.metaKey ||
				event.ctrlKey ||
				event.altKey ||
				target?.closest("input, textarea, select, [contenteditable]")
			) {
				return;
			}

			const index = Number(event.key) - 1;
			if (!isDone && index >= 0 && index < quizAnswers.length) {
				event.preventDefault();
				choose(quizAnswers[index].value);
			} else if (event.key === "ArrowLeft" && step > 0) {
				event.preventDefault();
				goTo(step - 1);
			} else if (
				!isDone &&
				event.key === "ArrowRight" &&
				answers[question.id] !== undefined
			) {
				event.preventDefault();
				goTo(step + 1);
			}
		};

		document.addEventListener("keydown", onKey);
		return () => {
			document.removeEventListener("keydown", onKey);
		};
	}, [answers, choose, goTo, isDone, isInView, question.id, step]);

	useEffect(
		() => () => {
			clearTimeout(advanceTimer.current);
		},
		[]
	);

	const slide = {
		enter: (dir: number) => ({ opacity: 0, x: isReducedMotion ? 0 : dir * 60 }),
		center: { opacity: 1, x: 0 },
		exit: (dir: number) => ({ opacity: 0, x: isReducedMotion ? 0 : dir * -60 }),
	};

	return (
		<div
			ref={panelRef}
			className="overflow-hidden rounded-3xl border border-hairline bg-surface"
		>
			{/* Progress */}
			<div className="flex items-center gap-4 px-5 pt-5 sm:px-8 sm:pt-8">
				<div
					role="progressbar"
					aria-label="Career finder progress"
					aria-valuemin={0}
					aria-valuemax={total}
					aria-valuenow={Math.min(step, total)}
					className="h-1.5 flex-1 overflow-hidden rounded-full bg-hairline"
				>
					<motion.div
						className="h-full rounded-full bg-brand"
						animate={{ width: `${(Math.min(step, total) / total) * 100}%` }}
						transition={{ duration: 0.5, ease }}
					/>
				</div>
				<p className="font-mono text-sm text-muted" aria-live="polite">
					{isDone ? "Done" : `${step + 1} / ${total}`}
				</p>
			</div>

			<div className="relative min-h-[22rem] px-5 py-8 sm:min-h-[20rem] sm:px-8 sm:py-10">
				<AnimatePresence mode="wait" custom={direction} initial={false}>
					{isDone ? (
						<motion.div
							key="results"
							custom={direction}
							variants={slide}
							initial="enter"
							animate="center"
							exit="exit"
							transition={{ duration: 0.45, ease }}
						>
							<p className="label text-accent-text">Your top matches</p>
							<h3 className="mt-2 text-3xl sm:text-4xl">
								{results[0]?.family.name ?? "Explore everything"}
							</h3>
							<ol className="mt-8 grid gap-4 md:grid-cols-3">
								{results.map((result, index) => (
									<motion.li
										key={result.family.id}
										initial={{ opacity: 0, y: 24 }}
										animate={{ opacity: 1, y: 0 }}
										transition={{ duration: 0.6, delay: 0.15 * index, ease }}
										className={cn(
											"flex flex-col rounded-2xl bg-bg p-5",
											index === 0 && "ring-2 ring-brand"
										)}
									>
										<p className="flex items-baseline justify-between gap-2">
											<span className="label text-muted">#{index + 1}</span>
											<span className="font-display text-4xl font-semibold text-brand">
												<CountUp
													value={result.percent}
													suffix="%"
													duration={1.4}
												/>
											</span>
										</p>
										<MatchBar percent={result.percent} delay={0.15 * index} />
										<p className="mt-4 text-lg font-semibold">
											{result.family.name}
										</p>
										<p className="mt-1 flex-1 text-sm text-muted">
											{result.family.summary}
										</p>
										<a
											href="#explore"
											className="group mt-4 inline-flex items-center gap-1 text-sm font-semibold text-brand"
											onClick={() => {
												globalThis.dispatchEvent(
													new CustomEvent(filterCareersEvent, {
														detail: result.family.id,
													})
												);
											}}
										>
											See {result.family.name.toLowerCase()} careers
											<ArrowRight aria-hidden className="btn-arrow size-4" />
										</a>
									</motion.li>
								))}
							</ol>
							<div className="mt-8 flex flex-wrap items-center gap-4">
								<Button variant="secondary" onClick={restart}>
									<RotateCcw aria-hidden className="size-4" /> Retake
								</Button>
								<p className="text-sm text-muted">
									Just a starting point. Many careers mix several families.
								</p>
							</div>
						</motion.div>
					) : (
						<motion.fieldset
							key={question.id}
							custom={direction}
							variants={slide}
							initial="enter"
							animate="center"
							exit="exit"
							transition={{ duration: 0.4, ease }}
						>
							<legend className="text-2xl font-semibold text-balance sm:text-4xl font-display">
								{question.text}
							</legend>
							<div className="mt-8 grid gap-3 sm:grid-cols-3">
								{quizAnswers.map((answer, index) => {
									const isChosen = answers[question.id] === answer.value;
									return (
										<button
											key={answer.label}
											type="button"
											aria-pressed={isChosen}
											className={cn(
												"group flex min-h-16 items-center justify-between gap-3 rounded-2xl border px-5 text-left text-lg font-medium transition-[background-color,border-color,color,transform] duration-200 active:scale-[0.98] motion-reduce:transition-none",
												isChosen
													? "border-brand bg-brand text-brand-ink"
													: "border-hairline bg-bg hover:border-brand"
											)}
											onClick={() => {
												choose(answer.value);
											}}
										>
											{answer.label}
											<kbd
												aria-hidden
												className={cn(
													"hidden size-7 items-center justify-center rounded-md border font-sans text-xs sm:inline-flex",
													isChosen
														? "border-brand-ink/40"
														: "border-hairline text-muted"
												)}
											>
												{index + 1}
											</kbd>
										</button>
									);
								})}
							</div>
						</motion.fieldset>
					)}
				</AnimatePresence>
			</div>

			{isDone ? null : (
				<div className="flex items-center justify-between border-t border-hairline px-5 py-4 sm:px-8">
					<button
						type="button"
						disabled={step === 0}
						className="inline-flex min-h-10 items-center gap-1.5 rounded-full px-3 text-sm font-medium text-muted transition-colors hover:text-text disabled:opacity-40"
						onClick={() => {
							goTo(step - 1);
						}}
					>
						<ArrowLeft aria-hidden className="size-4" /> Back
					</button>
					<p className="hidden text-sm text-muted sm:block">
						Press 1, 2 or 3 to answer
					</p>
					<button
						type="button"
						disabled={answers[question.id] === undefined}
						className="inline-flex min-h-10 items-center gap-1.5 rounded-full px-3 text-sm font-medium text-muted transition-colors hover:text-text disabled:opacity-40"
						onClick={() => {
							goTo(step + 1);
						}}
					>
						Next <ArrowRight aria-hidden className="size-4" />
					</button>
				</div>
			)}
		</div>
	);
}
