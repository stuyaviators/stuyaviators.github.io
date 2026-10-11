"use client";

import type { meetingStatuses } from "@/lib/meeting-options";
import {
	addMeetingAction,
	deleteMeetingAction,
	updateMeetingAction,
} from "@/actions/meetings";
import Confirm from "@/components/dashboard/Confirm";
import { SelectField } from "@/components/dashboard/fields";
import { Spinner } from "@/components/dashboard/Spinner";
import { useToast } from "@/components/dashboard/Toast";
import { Badge, Card, Notice } from "@/components/dashboard/ui";
import { useAction } from "@/components/dashboard/use-action";
import {
	AddedBy,
	blockedDeleteHint,
	useViewer,
} from "@/components/dashboard/Viewer";
import { TextAreaField, TextField } from "@/components/forms/Field";
import { Button, buttonClasses } from "@/components/ui/Button";
import { cn } from "@/lib/cn";
import {
	defaultEndTime,
	defaultStartTime,
	meetingStatusLabels,
	meetingTypes,
} from "@/lib/meeting-options";
import { ExternalLink, Pencil, Plus, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

type Draft = {
	title: string;
	code: string;
	start: string;
	end: string;
	room: string;
	status: (typeof meetingStatuses)[number];
	description: string;
	linkUrl: string;
	linkLabel: string;
};
type Row = {
	id: string;
	draft: Draft;
	// "Oct 12, 2026, 3:30 PM – 5:00 PM", already in New York time.
	when: string;
	createdBy: string | undefined;
};

/*
 * The form shows a date and two times instead of two date-and-time boxes, so
 * a new meeting can start with the usual 3:35 PM to 5:00 PM already filled in.
 * `endDate` only differs from `date` for the rare meeting that runs past
 * midnight, and is kept as it was saved.
 */
type FormState = Omit<Draft, "start" | "end"> & {
	date: string;
	startTime: string;
	endTime: string;
	endDate: string;
};

function toFormState(draft: Draft): FormState {
	const { start, end, ...rest } = draft;
	const [date = "", startTime = ""] = start.split("T", 2);
	const [endDate = "", endTime = ""] = end.split("T", 2);
	const isNew = start === "";
	return {
		...rest,
		date,
		startTime: isNew ? defaultStartTime : startTime,
		endTime: isNew ? defaultEndTime : endTime,
		endDate: endDate || date,
	};
}

function toDraft(state: FormState): Draft {
	const { date, startTime, endTime, endDate, ...rest } = state;
	return {
		...rest,
		start: date === "" || startTime === "" ? "" : `${date}T${startTime}`,
		end: endTime === "" ? "" : `${endDate || date}T${endTime}`,
	};
}

const emptyDraft: Draft = {
	title: "",
	code: "",
	start: "",
	end: "",
	room: "",
	status: "scheduled",
	description: "",
	linkUrl: "",
	linkLabel: "",
};

export default function MeetingsManager({
	upcoming,
	past,
}: {
	readonly upcoming: readonly Row[];
	readonly past: readonly Row[];
}) {
	const { canDeleteItem } = useViewer();
	const router = useRouter();
	const { run, isPending, error, leavingId, markLeaving } = useAction();
	const [editingId, setEditingId] = useState<string>();
	const [removing, setRemoving] = useState<Row>();

	function renderRow(item: Row) {
		const { draft } = item;
		return (
			<li
				key={item.id}
				className={cn(
					"rounded-2xl border border-hairline bg-surface p-4",
					leavingId === item.id && "dash-leave"
				)}
			>
				{editingId === item.id ? (
					<MeetingForm
						initial={draft}
						submitLabel="Save"
						onSubmit={async (next) => updateMeetingAction(item.id, next)}
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
						<div className="min-w-0 flex-1 basis-56">
							<div className="flex flex-wrap items-center gap-2">
								<h3 className="text-lg">{draft.title}</h3>
								{draft.code ? <Badge tone="brand">{draft.code}</Badge> : null}
								{draft.status === "scheduled" ? null : (
									<Badge tone="bad">{meetingStatusLabels[draft.status]}</Badge>
								)}
							</div>
							<p className="mt-1 text-muted">
								{item.when}
								{draft.room ? ` · Room ${draft.room}` : ""}
							</p>
							<p className="mt-2">
								<AddedBy email={item.createdBy} />
							</p>
						</div>
						<div className="ml-auto flex items-center">
							<a
								href={`/meetings/${item.id}`}
								target="_blank"
								rel="noopener noreferrer"
								aria-label={`Open the page for ${draft.title} (opens in a new tab)`}
								className={buttonClasses("ghost")}
							>
								<ExternalLink aria-hidden className="size-4" />
							</a>
							<Button
								variant="ghost"
								aria-label={`Edit ${draft.title}`}
								disabled={isPending}
								onClick={() => {
									setEditingId(item.id);
								}}
							>
								<Pencil aria-hidden className="size-4" />
							</Button>
							<Button
								variant="ghost"
								aria-label={`Remove ${draft.title}`}
								title={
									canDeleteItem(item.createdBy) ? undefined : blockedDeleteHint
								}
								disabled={isPending || !canDeleteItem(item.createdBy)}
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
		);
	}

	return (
		<>
			<Notice className="mb-6">
				Meetings from Epsilon show on the board by themselves. Add one here for
				anything Epsilon doesn’t have, or to keep the board going if Epsilon
				can’t be read. Times are New York time.
			</Notice>

			<Card className="mb-8" aria-labelledby="add-meeting">
				<h2 id="add-meeting" className="text-xl">
					Add a meeting
				</h2>
				<div className="mt-4">
					<MeetingForm
						initial={emptyDraft}
						submitLabel="Add"
						onSubmit={async (draft) => addMeetingAction(draft)}
						onDone={() => {
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

			<h2 className="mb-3 text-xl">Upcoming</h2>
			{upcoming.length === 0 ? (
				<p className="text-muted">Nothing added by hand is coming up.</p>
			) : (
				<ul className="dash-stagger space-y-3">
					{upcoming.map((item) => renderRow(item))}
				</ul>
			)}

			{past.length === 0 ? null : (
				<details className="mt-8">
					<summary className="cursor-pointer text-lg font-semibold">
						Past ({past.length})
					</summary>
					<ul className="mt-3 space-y-3">
						{past.map((item) => renderRow(item))}
					</ul>
				</details>
			)}

			<Confirm
				isOpen={removing !== undefined}
				title="Remove this meeting?"
				description={`“${removing?.draft.title ?? ""}” will come off the board and its page will stop working.`}
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
					run(
						async () => deleteMeetingAction(target.id),
						undefined,
						"Meeting removed"
					);
				}}
			/>
		</>
	);
}

function MeetingForm({
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
	const { toast } = useToast();
	const [draft, setDraft] = useState<FormState>(toFormState(initial));
	const [errors, setErrors] = useState<Record<string, string>>({});
	const [message, setMessage] = useState<string>();

	function change<K extends keyof FormState>(key: K, value: FormState[K]) {
		setDraft((current) => ({ ...current, [key]: value }));
	}

	function submit(event: React.SubmitEvent<HTMLFormElement>) {
		event.preventDefault();
		setErrors({});
		setMessage(undefined);
		startTransition(async () => {
			try {
				const result = await onSubmit(toDraft(draft));
				if (result.ok) {
					toast(resetOnSuccess ? "Added to the board" : "Saved");
					if (resetOnSuccess) {
						setDraft(toFormState(emptyDraft));
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
			<TextField
				label="Title"
				value={draft.title}
				maxLength={120}
				placeholder="Flight Simulator Demonstration"
				error={errors.title}
				onChange={(event) => {
					change("title", event.target.value);
				}}
			/>
			<div className="grid gap-4 sm:grid-cols-3">
				<TextField
					label="Date"
					type="date"
					value={draft.date}
					error={errors.start}
					onChange={(event) => {
						const { value } = event.target;
						setDraft((current) => ({
							...current,
							date: value,
							// An end on the same day keeps following the date.
							endDate:
								current.endDate === current.date || current.endDate === ""
									? value
									: current.endDate,
						}));
					}}
				/>
				<TextField
					label="Starts"
					type="time"
					value={draft.startTime}
					onChange={(event) => {
						change("startTime", event.target.value);
					}}
				/>
				<TextField
					label="Ends"
					type="time"
					optional
					value={draft.endTime}
					error={errors.end}
					onChange={(event) => {
						change("endTime", event.target.value);
					}}
				/>
			</div>
			<p className="-mt-2 text-sm text-muted">
				Times are New York time and start at 3:35 PM – 5:00 PM, the usual
				meeting time.
			</p>
			<div className="grid gap-4 sm:grid-cols-3">
				<TextField
					label="Room"
					optional
					value={draft.room}
					maxLength={60}
					placeholder="313"
					error={errors.room}
					onChange={(event) => {
						change("room", event.target.value);
					}}
				/>
				<SelectField
					label="Meeting type"
					value={draft.code}
					error={errors.code}
					onChange={(event) => {
						change("code", event.target.value);
					}}
				>
					<option value="">Not one of these</option>
					{meetingTypes.map((type) => (
						<option key={type.code} value={type.code}>
							{type.code} · {type.name}
						</option>
					))}
				</SelectField>
				<SelectField
					label="Status"
					value={draft.status}
					error={errors.status}
					onChange={(event) => {
						change("status", event.target.value as Draft["status"]);
					}}
				>
					{Object.entries(meetingStatusLabels).map(([value, label]) => (
						<option key={value} value={value}>
							{label}
						</option>
					))}
				</SelectField>
			</div>
			<TextAreaField
				label="Description"
				optional
				rows={4}
				value={draft.description}
				maxLength={4000}
				hint="Shown on the meeting’s own page. Bold, links and lists work."
				error={errors.description}
				onChange={(event) => {
					change("description", event.target.value);
				}}
			/>
			<div className="grid gap-4 sm:grid-cols-[2fr_1fr]">
				<TextField
					label="Link"
					optional
					type="url"
					value={draft.linkUrl}
					maxLength={500}
					placeholder="https://"
					hint="A sign-up, a call, a form: a button on the meeting’s page."
					error={errors.linkUrl}
					onChange={(event) => {
						change("linkUrl", event.target.value);
					}}
				/>
				<TextField
					label="Button text"
					optional
					value={draft.linkLabel}
					maxLength={40}
					placeholder="More info"
					error={errors.linkLabel}
					onChange={(event) => {
						change("linkLabel", event.target.value);
					}}
				/>
			</div>
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
