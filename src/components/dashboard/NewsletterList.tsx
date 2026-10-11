"use client";

import type { Newsletter, NewsletterPreset } from "@/lib/newsletters";
import {
	createDeadlineDigestAction,
	createNewsletterAction,
	deletePresetAction,
	trashNewsletter,
} from "@/actions/newsletters";
import Confirm from "@/components/dashboard/Confirm";
import { SelectField } from "@/components/dashboard/fields";
import { Spinner } from "@/components/dashboard/Spinner";
import { Badge, Card, formatWhen, Notice } from "@/components/dashboard/ui";
import { useAction } from "@/components/dashboard/use-action";
import {
	AddedBy,
	blockedDeleteHint,
	useViewer,
} from "@/components/dashboard/Viewer";
import { Button, buttonClasses } from "@/components/ui/Button";
import { cn } from "@/lib/cn";
import {
	CalendarClock,
	ExternalLink,
	Pencil,
	Plus,
	Trash2,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

type Pending = { kind: "newsletter" | "preset"; id: string; title: string };

export default function NewsletterList({
	newsletters,
	presets,
}: {
	readonly newsletters: Newsletter[];
	readonly presets: NewsletterPreset[];
}) {
	const router = useRouter();
	const { run, isPending, error, leavingId, markLeaving } = useAction();
	const [presetId, setPresetId] = useState("");
	const [pending, setPending] = useState<Pending>();
	const { canDeleteItem } = useViewer();

	function create(fromPreset?: string) {
		run(
			async () => createNewsletterAction(fromPreset),
			(result) => {
				router.push(`/dashboard/newsletter/${result.id}`);
			},
			"New newsletter started"
		);
	}

	function createDigest() {
		run(
			async () => createDeadlineDigestAction(),
			(result) => {
				router.push(`/dashboard/newsletter/${result.id}`);
			},
			"Deadline digest drafted"
		);
	}

	const confirmText = {
		newsletter: "It disappears, and its web version goes offline.",
		preset:
			"The preset will be deleted. Newsletters made from it aren’t affected.",
	} as const;

	return (
		<>
			{error ? (
				<Notice tone="bad" className="mb-4">
					{error}
				</Notice>
			) : null}

			<Card
				className="mb-6 flex flex-wrap items-end gap-3"
				aria-labelledby="new-heading"
			>
				<h2 id="new-heading" className="sr-only">
					Start a newsletter
				</h2>
				<Button
					disabled={isPending}
					onClick={() => {
						create();
					}}
				>
					{isPending ? <Spinner /> : <Plus aria-hidden className="size-4" />}{" "}
					New newsletter
				</Button>
				<Button variant="secondary" disabled={isPending} onClick={createDigest}>
					<CalendarClock aria-hidden className="size-4" /> Deadline digest
				</Button>
				{presets.length > 0 ? (
					<div className="flex flex-1 flex-wrap items-end gap-2">
						<div className="min-w-48 flex-1">
							<SelectField
								label="Or start from a preset"
								value={presetId}
								onChange={(event) => {
									setPresetId(event.target.value);
								}}
							>
								<option value="">Choose a preset…</option>
								{presets.map((preset) => (
									<option key={preset.id} value={preset.id}>
										{preset.name}
									</option>
								))}
							</SelectField>
						</div>
						<Button
							variant="secondary"
							disabled={isPending || presetId === ""}
							onClick={() => {
								create(presetId);
							}}
						>
							Use preset
						</Button>
					</div>
				) : null}
				<p className="basis-full text-sm text-muted">
					Deadline digest starts a draft with the published scholarships and
					opportunities whose deadline is 14-21 days away.
				</p>
			</Card>

			{newsletters.length === 0 ? (
				<Card>
					<p className="font-semibold">No newsletters yet.</p>
				</Card>
			) : (
				<ul className="dash-stagger space-y-3">
					{newsletters.map((newsletter) => (
						<li
							key={newsletter.id}
							className={cn(
								"flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-hairline bg-surface p-4 sm:p-5",
								leavingId === newsletter.id && "dash-leave"
							)}
						>
							<div className="min-w-0 flex-1 basis-56">
								<div className="flex flex-wrap items-center gap-2">
									<Badge
										tone={
											newsletter.status === "published" ? "good" : "neutral"
										}
									>
										{newsletter.status === "published"
											? "Web version live"
											: "Draft"}
									</Badge>
									<AddedBy email={newsletter.createdBy ?? undefined} />
								</div>
								<h2 className="mt-2 text-lg font-semibold leading-snug">
									{newsletter.title}
								</h2>
								<p className="text-sm text-muted">
									Edited {formatWhen(newsletter.updatedAt)}
									{newsletter.updatedBy ? ` by ${newsletter.updatedBy}` : ""}
								</p>
							</div>
							<div className="flex flex-wrap items-center gap-1.5">
								<>
									{newsletter.status === "published" && newsletter.slug ? (
										<Link
											href={`/newsletter/${newsletter.slug}`}
											target="_blank"
											className={buttonClasses("ghost")}
										>
											<ExternalLink aria-hidden className="size-4" /> View
										</Link>
									) : null}
									<Link
										href={`/dashboard/newsletter/${newsletter.id}`}
										className={buttonClasses("secondary")}
									>
										<Pencil aria-hidden className="size-4" /> Edit
									</Link>
									<Button
										variant="ghost"
										aria-label={`Delete ${newsletter.title}`}
										title={
											canDeleteItem(newsletter.createdBy ?? undefined)
												? undefined
												: blockedDeleteHint
										}
										disabled={
											isPending ||
											!canDeleteItem(newsletter.createdBy ?? undefined)
										}
										onClick={() => {
											setPending({
												kind: "newsletter",
												id: newsletter.id,
												title: newsletter.title,
											});
										}}
									>
										<Trash2 aria-hidden className="size-4" />
									</Button>
								</>
							</div>
						</li>
					))}
				</ul>
			)}

			<section className="mt-10" aria-labelledby="presets-heading">
				<h2 id="presets-heading" className="text-xl">
					Presets
				</h2>
				<p className="mt-1 text-sm text-muted">
					Reusable starting points. Save one from inside a newsletter.
				</p>
				{presets.length === 0 ? (
					<p className="mt-3 text-sm text-muted">No presets yet.</p>
				) : (
					<ul className="mt-3 flex flex-wrap gap-2">
						{presets.map((preset) => (
							<li
								key={preset.id}
								className={cn(
									"flex items-center gap-1 rounded-full border border-hairline bg-surface py-1 pr-1 pl-4 text-sm",
									leavingId === preset.id && "dash-leave"
								)}
							>
								{preset.name}
								<Button
									variant="ghost"
									aria-label={`Delete preset ${preset.name}`}
									className="min-h-9 px-2.5 py-1.5"
									title={
										canDeleteItem(preset.createdBy ?? undefined)
											? undefined
											: blockedDeleteHint
									}
									disabled={
										isPending || !canDeleteItem(preset.createdBy ?? undefined)
									}
									onClick={() => {
										setPending({
											kind: "preset",
											id: preset.id,
											title: preset.name,
										});
									}}
								>
									<Trash2 aria-hidden className="size-4" />
								</Button>
							</li>
						))}
					</ul>
				)}
			</section>

			<Confirm
				isOpen={pending !== undefined}
				title={
					pending?.kind === "preset" ? "Delete preset?" : "Delete newsletter?"
				}
				description={
					pending
						? `“${pending.title}”. ${confirmText[pending.kind]}`
						: undefined
				}
				confirmLabel="Delete"
				onCancel={() => {
					setPending(undefined);
				}}
				onConfirm={() => {
					if (!pending) {
						return;
					}

					const current = pending;
					setPending(undefined);
					markLeaving(current.id);
					run(
						async () =>
							current.kind === "preset"
								? deletePresetAction(current.id)
								: trashNewsletter(current.id),
						undefined,
						`Deleted “${current.title}”`
					);
				}}
			/>
		</>
	);
}
