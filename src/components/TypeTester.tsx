"use client";

import type { Typeface } from "@/content/brand";
import { cn } from "@/lib/cn";
import { useState } from "react";

/**
Live type tester for the brand page: type your own text and compare it in
each brand typeface at any size and weight.
*/
export default function TypeTester({
	typefaces,
}: {
	readonly typefaces: Typeface[];
}) {
	const [text, setText] = useState("Cleared for takeoff");
	const [size, setSize] = useState(56);
	const [weight, setWeight] = useState(600);

	return (
		<div className="rounded-3xl border border-hairline bg-surface p-5 sm:p-8">
			<div className="grid gap-4 sm:grid-cols-[1fr_12rem_auto] sm:items-end">
				<label className="block">
					<span className="label text-muted">Your text</span>
					<input
						type="text"
						value={text}
						maxLength={80}
						className="mt-2 min-h-11 w-full rounded-xl border border-hairline bg-bg px-4 focus:border-brand focus:outline-none"
						onChange={(event) => {
							setText(event.target.value);
						}}
					/>
				</label>
				<label className="block">
					<span className="label flex justify-between text-muted">
						Size <span className="font-mono">{size}px</span>
					</span>
					<input
						type="range"
						min={16}
						max={120}
						value={size}
						className="mt-4 w-full accent-[var(--brand)]"
						onChange={(event) => {
							setSize(Number(event.target.value));
						}}
					/>
				</label>
				<fieldset>
					<legend className="label text-muted">Weight</legend>
					<div className="mt-2 flex gap-1 rounded-full bg-bg p-1">
						{[400, 500, 600, 700].map((value) => (
							<button
								key={value}
								type="button"
								aria-pressed={weight === value}
								className={cn(
									"min-h-9 rounded-full px-3 text-sm font-mono transition-colors",
									weight === value
										? "bg-brand text-brand-ink"
										: "text-muted hover:text-text"
								)}
								onClick={() => {
									setWeight(value);
								}}
							>
								{value}
							</button>
						))}
					</div>
				</fieldset>
			</div>
			<ul className="mt-8 divide-y divide-hairline">
				{typefaces.map((face) => (
					<li key={face.id} className="py-6 first:pt-0 last:pb-0">
						<p className="label text-muted">
							{face.name} · {face.role}
						</p>
						<p
							className="mt-2 break-words"
							style={{
								fontFamily: face.variable,
								fontSize: `${size}px`,
								fontWeight: face.weights.some((w) => w.value === weight)
									? weight
									: 400,
								lineHeight: 1.1,
								letterSpacing: face.id === "inter-tight" ? "-0.01em" : undefined,
								textTransform: face.id === "goudy" ? "uppercase" : undefined,
							}}
						>
							{text || "Cleared for takeoff"}
						</p>
					</li>
				))}
			</ul>
		</div>
	);
}
