"use client";

import {
	addTestimonialAction,
	deleteTestimonialAction,
	importTestimonialsAction,
	moveTestimonialAction,
	updateTestimonialAction,
} from "@/actions/testimonials";
import Confirm from "@/components/dashboard/Confirm";
import { Spinner } from "@/components/dashboard/Spinner";
import { Card, Notice } from "@/components/dashboard/ui";
import { useAction } from "@/components/dashboard/use-action";
import { TextAreaField, TextField } from "@/components/forms/Field";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/cn";
import { ArrowDown, ArrowUp, Pencil, Plus, Quote, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

type Draft = { quote: string; author: string };
type Row = Draft & { id: string };

export default function TestimonialsManager({
	quotes,
	prefill,
}: {
	readonly quotes: readonly Row[];
	readonly prefill?: Draft;
}) {
	const router = useRouter();
	const { run, isPending, error, leavingId, markLeaving } = useAction();
	const [editingId, setEditingId] = useState<string>();
	const [removing, setRemoving] = useState<Row>();

	if (prefill === undefined && quotes.length === 0) {
		return (
			<Card>
				<h2 className="text-xl">Start from the current quotes</h2>
				<p className="mt-2 max-w-xl text-muted">
					The home page shows a built-in set of quotes today. Copy them here
					once, then add, edit, reorder or remove them from this screen.
				</p>
				{error ? (
					<Notice tone="bad" className="mt-3">
						{error}
					</Notice>
				) : null}
				<Button
					className="mt-4"
					disabled={isPending}
					onClick={() => {
						run(async () => importTestimonialsAction());
					}}
				>
					{isPending ? <Spinner /> : <Quote aria-hidden className="size-4" />}{" "}
					Copy the current quotes here
				</Button>
			</Card>
		);
	}

	return (
		<>
			<Card className="mb-8" aria-labelledby="add-quote">
				<h2 id="add-quote" className="text-xl">
					Add a quote
				</h2>
				{prefill ? (
					<Notice tone="warn" className="mt-3">
						Filled in from a story submission. Trim it to the part you want to
						feature, and check that they’re happy to be quoted.
					</Notice>
				) : null}
				<div className="mt-4">
					<QuoteForm
						initial={prefill ?? { quote: "", author: "" }}
						submitLabel="Add"
						onSubmit={async (draft) => addTestimonialAction(draft)}
						onDone={() => {
							router.replace("/dashboard/testimonials");
							router.refresh();
						}}
						resetOnSuccess
					/>
				</div>
			</Card>

			{error ? (
				<Notice tone="bad" className="mb-4">
					{error}
				</Notice>
			) : null}

			{quotes.length === 0 ? null : (
				<ul className="dash-stagger space-y-3">
					{quotes.map((item, index) => (
						<li
							key={item.id}
							className={cn(
								"rounded-2xl border border-hairline bg-surface p-4",
								leavingId === item.id && "dash-leave"
							)}
						>
							{editingId === item.id ? (
								<QuoteForm
									initial={item}
									submitLabel="Save"
									onSubmit={async (draft) =>
										updateTestimonialAction(item.id, draft)
									}
									onDone={() => {
										setEditingId(undefined);
										router.refresh();
									}}
									onCancel={() => {
										setEditingId(undefined);
									}}
								/>
							) : (
								<div className="flex flex-wrap items-start gap-3">
									<figure className="min-w-0 flex-1">
										<blockquote className="whitespace-pre-wrap">
											“{item.quote}”
										</blockquote>
										<figcaption className="label mt-2 text-muted">
											— {item.author}
										</figcaption>
									</figure>
									<div className="flex items-center">
										<Button
											variant="ghost"
											aria-label="Move up"
											disabled={isPending || index === 0}
											onClick={() => {
												run(async () => moveTestimonialAction(item.id, "up"));
											}}
										>
											<ArrowUp aria-hidden className="size-4" />
										</Button>
										<Button
											variant="ghost"
											aria-label="Move down"
											disabled={isPending || index === quotes.length - 1}
											onClick={() => {
												run(async () => moveTestimonialAction(item.id, "down"));
											}}
										>
											<ArrowDown aria-hidden className="size-4" />
										</Button>
										<Button
											variant="ghost"
											aria-label={`Edit the quote by ${item.author}`}
											disabled={isPending}
											onClick={() => {
												setEditingId(item.id);
											}}
										>
											<Pencil aria-hidden className="size-4" />
										</Button>
										<Button
											variant="ghost"
											aria-label={`Remove the quote by ${item.author}`}
											disabled={isPending}
											onClick={() => {
												setRemoving(item);
											}}
										>
											<Trash2 aria-hidden className="size-4" />
										</Button>
									</div>
								</div>
							)}
						</li>
					))}
				</ul>
			)}

			<Confirm
				isOpen={removing !== undefined}
				title="Remove this quote?"
				description={`The quote by ${removing?.author ?? ""} will no longer show on the home page. If you remove every quote, the built-in ones show again.`}
				confirmLabel="Remove"
				onCancel={() => {
					setRemoving(undefined);
				}}
				onConfirm={() => {
					const target = removing;
					setRemoving(undefined);
					if (!target) {
						return;
					}

					markLeaving(target.id);
					run(async () => deleteTestimonialAction(target.id));
				}}
			/>
		</>
	);
}

function QuoteForm({
	initial,
	submitLabel,
	onSubmit,
	onDone,
	onCancel,
	resetOnSuccess = false,
}: {
	readonly initial: Draft;
	readonly submitLabel: string;
	readonly onSubmit: (draft: Draft) => Promise<{
		ok: boolean;
		error?: string;
		fieldErrors?: Record<string, string>;
	}>;
	readonly onDone: () => void;
	readonly onCancel?: () => void;
	readonly resetOnSuccess?: boolean;
}) {
	const [isPending, startTransition] = useTransition();
	const [draft, setDraft] = useState<Draft>({
		quote: initial.quote,
		author: initial.author,
	});
	const [errors, setErrors] = useState<Record<string, string>>({});
	const [message, setMessage] = useState<string>();

	function submit(event: React.SubmitEvent<HTMLFormElement>) {
		event.preventDefault();
		setErrors({});
		setMessage(undefined);
		startTransition(async () => {
			try {
				const result = await onSubmit(draft);
				if (result.ok) {
					if (resetOnSuccess) {
						setDraft({ quote: "", author: "" });
					}

					onDone();
				} else {
					setErrors(result.fieldErrors ?? {});
					setMessage(result.error);
				}
			} catch {
				setMessage("Couldn’t reach the server. Check your connection.");
			}
		});
	}

	return (
		<form onSubmit={submit} noValidate className="grid gap-4">
			<TextAreaField
				label="Quote"
				rows={4}
				value={draft.quote}
				maxLength={700}
				error={errors.quote}
				onChange={(event) => {
					setDraft((current) => ({ ...current, quote: event.target.value }));
				}}
			/>
			<TextField
				label="Who said it"
				value={draft.author}
				maxLength={80}
				placeholder="Peter Stuyvesant ('60), or Anonymous"
				error={errors.author}
				onChange={(event) => {
					setDraft((current) => ({ ...current, author: event.target.value }));
				}}
			/>
			{message ? <Notice tone="bad">{message}</Notice> : null}
			<div className="flex flex-wrap gap-2">
				<Button type="submit" disabled={isPending}>
					{isPending ? <Spinner /> : <Plus aria-hidden className="size-4" />}{" "}
					{submitLabel}
				</Button>
				{onCancel ? (
					<Button variant="secondary" disabled={isPending} onClick={onCancel}>
						Cancel
					</Button>
				) : null}
			</div>
		</form>
	);
}
