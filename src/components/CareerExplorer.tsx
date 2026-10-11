"use client";

import type { Career, CareerFamily } from "@/content/careers";
import { cn } from "@/lib/cn";
import {
	ArrowUpRight,
	ChevronDown,
	GraduationCap,
	Search,
	X,
} from "lucide-react";
import {
	AnimatePresence,
	LayoutGroup,
	motion,
	useReducedMotion,
} from "motion/react";
import { useDeferredValue, useEffect, useId, useMemo, useState } from "react";

/*
 * Searchable career explorer: type to search every role (name, duties,
 * path, credentials, fields of study), filter by family with chips, and
 * tap a card to expand its details. The quiz above can pre-select a family
 * by dispatching `filterCareersEvent`.
 */
export const filterCareersEvent = "careers:filter";

type Entry = { career: Career; family: CareerFamily };

const ease = [0.16, 1, 0.3, 1] as const;

function normalize(text: string) {
	return text
		.normalize("NFD")
		.replaceAll(/\p{Mark}/gu, "")
		.toLowerCase();
}

function searchText({ career, family }: Entry) {
	return normalize(
		[
			career.name,
			career.what,
			career.path,
			career.credential ?? "",
			...career.study,
			family.name,
		].join(" ")
	);
}

function CareerCard({
	entry,
	isOpen,
	onToggle,
	showFamily,
}: {
	readonly entry: Entry;
	readonly isOpen: boolean;
	readonly onToggle: () => void;
	readonly showFamily: boolean;
}) {
	const { career, family } = entry;
	const detailsId = useId();
	const isReducedMotion = useReducedMotion();
	const source = family.sources.at(0);
	return (
		<motion.li
			layout={isReducedMotion ? false : "position"}
			initial={{ opacity: 0, scale: 0.96 }}
			animate={{ opacity: 1, scale: 1 }}
			exit={{ opacity: 0, scale: 0.96 }}
			transition={{ duration: 0.35, ease }}
			className={cn(
				"rounded-3xl border bg-surface transition-[border-color,box-shadow] duration-300",
				isOpen
					? "border-brand shadow-card sm:col-span-2"
					: "border-transparent hover:border-hairline"
			)}
		>
			<button
				type="button"
				aria-expanded={isOpen}
				aria-controls={detailsId}
				className="flex w-full items-start justify-between gap-4 p-5 text-left sm:p-6"
				onClick={onToggle}
			>
				<span className="min-w-0">
					{showFamily ? (
						<span className="label block text-accent-text">{family.name}</span>
					) : null}
					<span className="mt-1 block font-display text-xl font-semibold">
						{career.name}
					</span>
					<span
						className={cn(
							"mt-2 block text-muted",
							isOpen ? "" : "line-clamp-2"
						)}
					>
						{career.what}
					</span>
				</span>
				<span
					aria-hidden
					className={cn(
						"mt-1 inline-flex size-8 shrink-0 items-center justify-center rounded-full bg-bg transition-transform duration-300 motion-reduce:transition-none",
						isOpen && "rotate-180"
					)}
				>
					<ChevronDown className="size-4" />
				</span>
			</button>
			<AnimatePresence initial={false}>
				{isOpen ? (
					<motion.div
						id={detailsId}
						initial={{ height: 0, opacity: 0 }}
						animate={{ height: "auto", opacity: 1 }}
						exit={{ height: 0, opacity: 0 }}
						transition={{ duration: isReducedMotion ? 0 : 0.4, ease }}
						className="overflow-hidden"
					>
						<div className="grid gap-6 border-t border-hairline p-5 sm:grid-cols-[1.4fr_1fr] sm:p-6">
							<div className="space-y-4">
								<div>
									<p className="label text-muted">How to get there</p>
									<p className="mt-1">{career.path}</p>
								</div>
								{career.credential ? (
									<div>
										<p className="label text-muted">Credential</p>
										<p className="mt-1">{career.credential}</p>
									</div>
								) : null}
							</div>
							<div>
								<p className="label flex items-center gap-1.5 text-muted">
									<GraduationCap aria-hidden className="size-4" /> Fields of
									study
								</p>
								<ul className="mt-2 flex flex-wrap gap-2">
									{career.study.map((study) => (
										<li
											key={study}
											className="rounded-full bg-bg px-3 py-1 text-sm"
										>
											{study}
										</li>
									))}
								</ul>
								{source ? (
									<a
										href={source.url}
										target="_blank"
										rel="noopener noreferrer"
										className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-brand underline-offset-4 hover:underline"
									>
										{source.label}
										<ArrowUpRight aria-hidden className="size-3.5" />
									</a>
								) : null}
							</div>
						</div>
					</motion.div>
				) : null}
			</AnimatePresence>
		</motion.li>
	);
}

export default function CareerExplorer({
	families,
}: {
	readonly families: CareerFamily[];
}) {
	const [query, setQuery] = useState("");
	const [familyId, setFamilyId] = useState<string | undefined>(undefined);
	const [openKey, setOpenKey] = useState<string | undefined>(undefined);
	const deferredQuery = useDeferredValue(query);

	const entries = useMemo(
		() =>
			families.flatMap((family) =>
				family.careers.map((career) => {
					const entry = { career, family };
					return { entry, haystack: searchText(entry) };
				})
			),
		[families]
	);

	const terms = normalize(deferredQuery).split(/\s+/u).filter(Boolean);
	const visible = entries.filter(
		({ entry, haystack }) =>
			(!familyId || entry.family.id === familyId) &&
			terms.every((term) => haystack.includes(term))
	);
	const selectedFamily = families.find((family) => family.id === familyId);

	// The quiz's "See … careers" links pre-select a family.
	useEffect(() => {
		const onFilter = (event: Event) => {
			const id = (event as CustomEvent<string>).detail;
			setFamilyId(id);
			setQuery("");
			setOpenKey(undefined);
		};

		globalThis.addEventListener(filterCareersEvent, onFilter);
		return () => {
			globalThis.removeEventListener(filterCareersEvent, onFilter);
		};
	}, []);

	const chip = (id: string | undefined, label: string, count: number) => {
		const isActive = familyId === id;
		return (
			<li key={id ?? "all"}>
				<button
					type="button"
					aria-pressed={isActive}
					className={cn(
						"relative inline-flex min-h-10 items-center gap-1.5 rounded-full px-4 text-sm font-medium whitespace-nowrap transition-colors",
						isActive ? "text-brand-ink" : "text-text hover:bg-surface-2"
					)}
					onClick={() => {
						setFamilyId(id);
						setOpenKey(undefined);
					}}
				>
					{isActive ? (
						<motion.span
							layoutId="career-chip"
							className="absolute inset-0 -z-10 rounded-full bg-brand"
							transition={{ type: "spring", stiffness: 420, damping: 36 }}
						/>
					) : null}
					{label}
					<span className={isActive ? "opacity-80" : "text-muted"}>
						{count}
					</span>
				</button>
			</li>
		);
	};

	return (
		<div>
			<div className="below-header sticky z-20 -mx-4 bg-bg/85 px-4 py-3 backdrop-blur-xl backdrop-saturate-150 sm:-mx-3 sm:rounded-3xl sm:px-3">
				<label className="relative block">
					<span className="sr-only">Search careers</span>
					<Search
						aria-hidden
						className="pointer-events-none absolute top-1/2 left-4 size-5 -translate-y-1/2 text-muted"
					/>
					<input
						type="search"
						value={query}
						placeholder="Search careers, skills or degrees (e.g. “engineering”, “FAA”, “drones”)"
						className="min-h-13 w-full rounded-full border border-hairline bg-surface py-3 pr-12 pl-12 text-base placeholder:text-muted focus:border-brand focus:outline-none"
						onChange={(event) => {
							setQuery(event.target.value);
							setOpenKey(undefined);
						}}
					/>
					{query ? (
						<button
							type="button"
							aria-label="Clear search"
							className="absolute top-1/2 right-3 inline-flex size-8 -translate-y-1/2 items-center justify-center rounded-full text-muted hover:bg-surface-2"
							onClick={() => {
								setQuery("");
							}}
						>
							<X aria-hidden className="size-4" />
						</button>
					) : null}
				</label>
				<LayoutGroup>
					<ul
						aria-label="Career families"
						className="isolate -mx-1 mt-3 flex gap-1 overflow-x-auto px-1 pb-1 [scrollbar-width:none]"
					>
						{chip(undefined, "All", entries.length)}
						{families.map((family) =>
							chip(family.id, family.name, family.careers.length)
						)}
					</ul>
				</LayoutGroup>
			</div>

			<AnimatePresence mode="wait" initial={false}>
				{selectedFamily ? (
					<motion.div
						key={selectedFamily.id}
						initial={{ opacity: 0, y: 12 }}
						animate={{ opacity: 1, y: 0 }}
						exit={{ opacity: 0, y: -8 }}
						transition={{ duration: 0.35, ease }}
						className="mt-6 grid gap-6 rounded-3xl bg-surface p-6 sm:p-8 lg:grid-cols-[1.5fr_1fr]"
					>
						<div>
							<h3 className="text-3xl">{selectedFamily.name}</h3>
							<p className="mt-3 text-lg text-muted">
								{selectedFamily.summary}
							</p>
							{selectedFamily.tryIt ? (
								<p className="mt-4">
									<span className="label mr-2 text-accent-text">
										Try it here
									</span>
									{selectedFamily.tryIt}
								</p>
							) : null}
						</div>
						<div>
							<p className="label text-muted">Helpful fields of study</p>
							<ul className="mt-2 flex flex-wrap gap-2">
								{selectedFamily.studies.map((study) => (
									<li
										key={study}
										className="rounded-full bg-bg px-3 py-1 text-sm"
									>
										{study}
									</li>
								))}
							</ul>
							<ul className="mt-4 space-y-1 text-sm">
								{selectedFamily.sources.map((source) => (
									<li key={source.url}>
										<a
											href={source.url}
											target="_blank"
											rel="noopener noreferrer"
											className="inline-flex items-center gap-1 text-brand underline-offset-4 hover:underline"
										>
											{source.label}
											<ArrowUpRight aria-hidden className="size-3" />
										</a>
									</li>
								))}
							</ul>
						</div>
					</motion.div>
				) : null}
			</AnimatePresence>

			<p className="mt-6 text-sm text-muted" aria-live="polite">
				{visible.length === entries.length
					? `All ${entries.length} careers`
					: `${visible.length} of ${entries.length} careers`}
			</p>

			{visible.length > 0 ? (
				<ul className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
					<AnimatePresence initial={false} mode="popLayout">
						{visible.map(({ entry }) => {
							const key = `${entry.family.id}:${entry.career.name}`;
							return (
								<CareerCard
									key={key}
									entry={entry}
									isOpen={openKey === key}
									showFamily={!familyId}
									onToggle={() => {
										setOpenKey((current) => (current === key ? undefined : key));
									}}
								/>
							);
						})}
					</AnimatePresence>
				</ul>
			) : (
				<div className="mt-4 rounded-3xl bg-surface p-10 text-center">
					<p className="text-lg font-semibold">No careers match “{query}”.</p>
					<button
						type="button"
						className="mt-3 text-brand underline-offset-4 hover:underline"
						onClick={() => {
							setQuery("");
							setFamilyId(undefined);
						}}
					>
						Clear filters
					</button>
				</div>
			)}
		</div>
	);
}
