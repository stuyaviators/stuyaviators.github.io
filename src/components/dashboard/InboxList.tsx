"use client";

import type { Submission } from "@/lib/inbox";
import { markSubmission } from "@/actions/inbox";
import { Badge, Card, formatWhen, Notice } from "@/components/dashboard/ui";
import { useAction } from "@/components/dashboard/use-action";
import { Button, buttonClasses } from "@/components/ui/Button";
import { cn } from "@/lib/cn";
import { typeLabels } from "@/lib/inbox";
import {
	Archive,
	ArchiveRestore,
	ChevronDown,
	Images,
	Mail,
	Quote,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";

const mailingListLabels: Record<string, string> = {
	submitted: "Added to the mailing list",
	skipped: "Not added (not a Stuy email)",
	failed: "Mailing-list sign-up failed",
};

export default function InboxList({
	items,
}: {
	readonly items: readonly Submission[];
}) {
	const { run, isPending, error, leavingId, markLeaving } = useAction();
	const [openId, setOpenId] = useState<string>();

	if (items.length === 0) {
		return (
			<Card>
				<p className="text-muted">Nothing here.</p>
			</Card>
		);
	}

	function toggle(item: Submission) {
		const isOpening = openId !== item.id;
		setOpenId(isOpening ? item.id : undefined);
		// Reading it counts as reading it.
		if (isOpening && item.status === "new") {
			run(async () => markSubmission(item.id, "read"));
		}
	}

	return (
		<>
			{error ? (
				<Notice tone="bad" className="mb-4">
					{error}
				</Notice>
			) : null}
			<ul className="dash-stagger space-y-3">
				{items.map((item) => {
					const isOpen = openId === item.id;
					const panelId = `submission-${item.id}`;
					const isArchived = item.status === "archived";
					return (
						<li
							key={item.id}
							className={cn(
								"rounded-2xl border border-hairline bg-surface",
								item.status === "new" && "border-brand/60",
								leavingId === item.id && "dash-leave"
							)}
						>
							<button
								type="button"
								aria-expanded={isOpen}
								aria-controls={panelId}
								onClick={() => {
									toggle(item);
								}}
								className="flex w-full min-w-0 items-center gap-3 rounded-2xl p-4 text-left"
							>
								<span className="min-w-0 flex-1">
									<span className="flex flex-wrap items-center gap-2">
										<Badge tone={item.status === "new" ? "brand" : "neutral"}>
											{typeLabels[item.type]}
										</Badge>
										<span
											className={cn(
												"truncate",
												item.status === "new" ? "font-semibold" : "font-medium"
											)}
										>
											{item.name ?? item.email ?? "Anonymous"}
										</span>
									</span>
									{item.message ? (
										<span className="mt-1 block truncate text-sm text-muted">
											{item.message}
										</span>
									) : null}
								</span>
								<span className="label shrink-0 text-muted">
									{formatWhen(item.createdAt)}
								</span>
								<ChevronDown
									aria-hidden
									className={cn(
										"size-4 shrink-0 text-muted transition-transform motion-reduce:transition-none",
										isOpen && "rotate-180"
									)}
								/>
							</button>
							{isOpen ? (
								<div id={panelId} className="border-t border-hairline p-4">
									<Details item={item} />
									<div className="mt-4 flex flex-wrap gap-2">
										{item.email ? (
											<a
												href={`mailto:${item.email}`}
												className={buttonClasses("secondary")}
											>
												<Mail aria-hidden className="size-4" /> Reply
											</a>
										) : null}
										{item.type === "story" ? (
											<Link
												href={`/dashboard/testimonials?from=${item.id}`}
												className={buttonClasses("secondary")}
											>
												<Quote aria-hidden className="size-4" /> Make a
												testimonial
											</Link>
										) : null}
										{item.type === "photo" ? (
											<Link
												href={`/dashboard/gallery?from=${item.id}`}
												className={buttonClasses("secondary")}
											>
												<Images aria-hidden className="size-4" /> Add to the
												gallery
											</Link>
										) : null}
										<Button
											variant="secondary"
											disabled={isPending}
											onClick={() => {
												if (!isArchived) {
													markLeaving(item.id);
												}

												run(async () =>
													markSubmission(
														item.id,
														isArchived ? "read" : "archived"
													)
												);
											}}
										>
											{isArchived ? (
												<ArchiveRestore aria-hidden className="size-4" />
											) : (
												<Archive aria-hidden className="size-4" />
											)}{" "}
											{isArchived ? "Restore" : "Archive"}
										</Button>
										{item.status === "read" ? (
											<Button
												variant="ghost"
												disabled={isPending}
												onClick={() => {
													run(async () => markSubmission(item.id, "new"));
												}}
											>
												Mark unread
											</Button>
										) : null}
									</div>
								</div>
							) : null}
						</li>
					);
				})}
			</ul>
		</>
	);
}

function Details({ item }: { readonly item: Submission }) {
	const extra = Object.entries(item.data).filter(([, value]) => value !== "");
	return (
		<div className="space-y-3 text-sm">
			{item.message ? (
				<p className="max-w-prose whitespace-pre-wrap">{item.message}</p>
			) : null}
			<dl className="grid gap-x-4 gap-y-1 sm:grid-cols-[10rem_1fr]">
				{item.email ? <Row label="Email" value={item.email} /> : null}
				{extra.map(([key, value]) => (
					<Row key={key} label={key} value={value} />
				))}
				{item.mailingList ? (
					<Row
						label="Mailing list"
						value={mailingListLabels[item.mailingList] ?? item.mailingList}
					/>
				) : null}
			</dl>
		</div>
	);
}

function Row({
	label,
	value,
}: {
	readonly label: string;
	readonly value: string;
}) {
	return (
		<>
			<dt className="text-muted">{label}</dt>
			<dd className="min-w-0 break-words whitespace-pre-wrap">{value}</dd>
		</>
	);
}
