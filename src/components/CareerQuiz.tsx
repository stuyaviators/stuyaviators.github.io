"use client";

import type { CareerFamily } from "@/content/careers";
import { Button } from "@/components/ui/Button";
import { quizAnswers, quizQuestions } from "@/content/career-quiz";
import { cn } from "@/lib/cn";
import { RotateCcw } from "lucide-react";
import { useRef, useState } from "react";

type Result = {
	family: Pick<CareerFamily, "id" | "name" | "summary">;
	score: number;
	percent: number;
};

export default function CareerQuiz({
	families,
}: {
	readonly families: Array<Pick<CareerFamily, "id" | "name" | "summary">>;
}) {
	const [answers, setAnswers] = useState<Record<string, number>>({});
	const [results, setResults] = useState<Result[] | undefined>(undefined);
	const resultsRef = useRef<HTMLDivElement>(null);
	const answered = Object.keys(answers).length;

	const score = () => {
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

		const ranked = families
			.map((family) => {
				const total = totals.get(family.id) ?? 0;
				return {
					family,
					score: total,
					percent: Math.round((total / (max.get(family.id) ?? 1)) * 100),
				};
			})
			.toSorted((a, b) =>
				b.percent === a.percent ? b.score - a.score : b.percent - a.percent
			)
			.slice(0, 3);
		setResults(ranked);
		requestAnimationFrame(() => {
			resultsRef.current?.focus();
		});
	};

	return (
		<div className="rounded-lg border border-hairline bg-surface p-5 sm:p-8">
			<form
				onSubmit={(event) => {
					event.preventDefault();
					score();
				}}
			>
				<ol className="grid gap-6 md:grid-cols-2">
					{quizQuestions.map((question, index) => (
						<li key={question.id}>
							<fieldset>
								<legend className="font-medium">
									<span className="mr-2 font-mono text-sm text-accent-text">
										{String(index + 1).padStart(2, "0")}
									</span>
									{question.text}
								</legend>
								<div className="mt-3 flex flex-wrap gap-2">
									{quizAnswers.map((answer) => {
										const isChecked = answers[question.id] === answer.value;
										return (
											<label
												key={answer.label}
												className={cn(
													"flex min-h-10 cursor-pointer items-center rounded-md border px-3 text-sm has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-brand",
													isChecked
														? "border-brand bg-brand text-brand-ink"
														: "border-field hover:border-brand"
												)}
											>
												<input
													type="radio"
													name={question.id}
													value={answer.value}
													checked={isChecked}
													className="sr-only"
													onChange={() => {
														setAnswers((current) => ({
															...current,
															[question.id]: answer.value,
														}));
													}}
												/>
												{answer.label}
											</label>
										);
									})}
								</div>
							</fieldset>
						</li>
					))}
				</ol>
				<div className="mt-8 flex flex-wrap items-center gap-4">
					<Button type="submit" variant="accent" disabled={answered < 4}>
						See my matches
					</Button>
					<p className="text-sm text-muted">
						{answered < 4
							? `Answer at least 4 questions (${answered}/${quizQuestions.length}).`
							: `${answered} of ${quizQuestions.length} answered.`}
					</p>
					{answered > 0 ? (
						<button
							type="button"
							className="inline-flex items-center gap-1.5 text-sm text-muted underline-offset-4 hover:underline"
							onClick={() => {
								setAnswers({});
								setResults(undefined);
							}}
						>
							<RotateCcw aria-hidden className="size-3.5" /> Start over
						</button>
					) : null}
				</div>
			</form>

			{results ? (
				<div
					ref={resultsRef}
					tabIndex={-1}
					aria-live="polite"
					className="mt-8 border-t border-dashed border-hairline pt-8 outline-none"
				>
					<h3 className="label text-accent-text">Your top matches</h3>
					<ol className="mt-4 grid gap-4 md:grid-cols-3">
						{results.map((result, index) => (
							<li
								key={result.family.id}
								className="rounded-lg border border-hairline bg-bg p-5"
							>
								<p className="font-mono text-sm text-muted">
									#{index + 1} · {result.percent}% match
								</p>
								<div className="mt-2 h-1.5 overflow-hidden rounded-full bg-hairline">
									<div
										className="h-full bg-brand"
										style={{ width: `${Math.max(result.percent, 4)}%` }}
									/>
								</div>
								<p className="mt-3 text-lg font-semibold">
									{result.family.name}
								</p>
								<p className="mt-1 text-sm text-muted">
									{result.family.summary}
								</p>
								<a
									href={`#${result.family.id}`}
									className="mt-3 inline-block text-sm font-semibold text-brand underline-offset-4 hover:underline"
								>
									Explore {result.family.name.toLowerCase()} careers ↓
								</a>
							</li>
						))}
					</ol>
					<p className="mt-4 text-sm text-muted">
						This is just a starting point. Plenty of aviators switch paths, and
						many careers mix several families.
					</p>
				</div>
			) : null}
		</div>
	);
}
