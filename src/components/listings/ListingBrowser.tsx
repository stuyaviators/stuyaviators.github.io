"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import { Search } from "lucide-react";
import { useId, useMemo, useState } from "react";

export type BrowserItem = {
	id: string;
	tags: string[];
	searchText: string;
	node: ReactNode;
};

/**
Text search + tag filter over server-rendered listing cards.
*/
export default function ListingBrowser({
	items,
	past,
	noun,
}: {
	readonly items: BrowserItem[];
	readonly past: BrowserItem[];
	readonly noun: string;
}) {
	const searchId = useId();
	const [query, setQuery] = useState("");
	const [tag, setTag] = useState<string | undefined>(undefined);
	const tags = useMemo(
		() =>
			[...new Set(items.flatMap((item) => item.tags))].toSorted((a, b) =>
				a.localeCompare(b)
			),
		[items]
	);
	const q = query.trim().toLowerCase();
	const visible = items.filter(
		(item) =>
			(!tag || item.tags.includes(tag)) && (!q || item.searchText.includes(q))
	);

	return (
		<div>
			<div className="mb-6 flex flex-col gap-4 rounded-3xl bg-surface p-4 sm:flex-row sm:items-center">
				<label htmlFor={searchId} className="sr-only">
					Search {noun}
				</label>
				<div className="relative flex-1">
					<Search
						aria-hidden
						className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted"
					/>
					<input
						id={searchId}
						type="search"
						value={query}
						placeholder={`Search ${noun}`}
						onChange={(event) => {
							setQuery(event.target.value);
						}}
						className="w-full rounded-md border border-field bg-bg py-2.5 pr-3 pl-9"
					/>
				</div>
				{tags.length > 0 ? (
					<div
						role="group"
						aria-label="Filter by tag"
						className="flex flex-wrap gap-2"
					>
						{[undefined, ...tags].map((value) => (
							<button
								key={value ?? "all"}
								type="button"
								aria-pressed={tag === value}
								onClick={() => {
									setTag(value);
								}}
								className={cn(
									"label min-h-9 rounded-sm border px-3",
									tag === value
										? "border-brand bg-brand text-brand-ink"
										: "border-hairline text-muted hover:text-text"
								)}
							>
								{value ?? "All"}
							</button>
						))}
					</div>
				) : null}
			</div>
			<p aria-live="polite" className="sr-only">
				{visible.length} {noun} shown
			</p>
			{visible.length > 0 ? (
				<ul className="grid gap-6">
					{visible.map((item) => (
						<li key={item.id}>{item.node}</li>
					))}
				</ul>
			) : (
				<p className="rounded-2xl border border-field p-8 text-center text-muted">
					No {noun} match your search.
				</p>
			)}
			{past.length > 0 ? (
				<details className="mt-10 rounded-2xl border border-hairline">
					<summary className="cursor-pointer p-4 font-semibold">
						Past {noun} ({past.length})
					</summary>
					<ul className="grid gap-6 p-4 pt-0 opacity-80">
						{past.map((item) => (
							<li key={item.id}>{item.node}</li>
						))}
					</ul>
				</details>
			) : null}
		</div>
	);
}
