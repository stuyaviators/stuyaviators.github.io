"use client";

import {
	addCrewMemberAction,
	deleteCrewMemberAction,
	importCrewAction,
	moveCrewMemberAction,
	updateCrewMemberAction,
} from "@/actions/crew";
import Confirm from "@/components/dashboard/Confirm";
import { ImageField, SelectField } from "@/components/dashboard/fields";
import { Spinner } from "@/components/dashboard/Spinner";
import { useToast } from "@/components/dashboard/Toast";
import { Card, Notice } from "@/components/dashboard/ui";
import { useAction } from "@/components/dashboard/use-action";
import {
	AddedBy,
	blockedDeleteHint,
	useViewer,
} from "@/components/dashboard/Viewer";
import { TextField } from "@/components/forms/Field";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/cn";
import { crewGroupOptions } from "@/lib/crew-groups";
import { ArrowDown, ArrowUp, Pencil, Plus, Trash2, Users } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

export type Person = {
	id: string;
	groupId: string;
	name: string;
	classOf: string;
	role: string;
	imageUrl: string;
	photoSrc: string | undefined;
	createdBy: string | undefined;
};

type Draft = Omit<Person, "id" | "photoSrc" | "createdBy">;

const blank: Draft = {
	groupId: "helpers",
	name: "",
	classOf: "",
	role: "",
	imageUrl: "",
};

export default function CrewManager({
	people,
}: {
	readonly people: readonly Person[];
}) {
	const { canDeleteItem } = useViewer();
	const router = useRouter();
	const { run, isPending, error, leavingId, markLeaving } = useAction();
	const [editingId, setEditingId] = useState<string>();
	const [removing, setRemoving] = useState<Person>();

	if (people.length === 0) {
		return (
			<Card>
				<h2 className="text-xl">Start from the current crew</h2>
				<p className="mt-2 max-w-xl text-muted">
					The Flight Crew page shows a built-in list today. Copy it here once,
					then add, edit, reorder or remove people from this screen. The page
					looks the same afterwards.
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
						run(
							async () => importCrewAction(),
							undefined,
							"Crew copied here. Edit them from this screen now."
						);
					}}
				>
					{isPending ? <Spinner /> : <Users aria-hidden className="size-4" />}{" "}
					Copy the current crew here
				</Button>
			</Card>
		);
	}

	return (
		<>
			<Card className="mb-8" aria-labelledby="add-person">
				<h2 id="add-person" className="text-xl">
					Add someone
				</h2>
				<div className="mt-4">
					<PersonForm
						initial={blank}
						submitLabel="Add"
						onSubmit={async (draft) => addCrewMemberAction(draft)}
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

			<div className="space-y-8">
				{crewGroupOptions.map((group) => {
					const members = people.filter(
						(person) => person.groupId === group.id
					);
					return (
						<section key={group.id} aria-labelledby={`group-${group.id}`}>
							<h2 id={`group-${group.id}`} className="label mb-3 text-muted">
								{group.title} · {members.length}
							</h2>
							{members.length === 0 ? (
								<p className="text-sm text-muted">Nobody yet.</p>
							) : (
								<ul className="dash-stagger space-y-3">
									{members.map((person, index) => (
										<li
											key={person.id}
											className={cn(
												"rounded-2xl border border-hairline bg-surface p-4",
												leavingId === person.id && "dash-leave"
											)}
										>
											{editingId === person.id ? (
												<PersonForm
													initial={person}
													submitLabel="Save"
													onSubmit={async (draft) =>
														updateCrewMemberAction(person.id, draft)
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
												<div className="flex flex-wrap items-center gap-3">
													<Avatar person={person} />
													<div className="min-w-0 flex-1 basis-40">
														<p className="truncate font-semibold">
															{person.name}
															{person.classOf ? (
																<span className="ml-2 font-normal text-muted">
																	{person.classOf}
																</span>
															) : null}
														</p>
														<p className="truncate text-sm text-muted">
															{person.role}
														</p>
														<p className="mt-1">
															<AddedBy email={person.createdBy} />
														</p>
													</div>
													<div className="ml-auto flex items-center">
														<Button
															variant="ghost"
															aria-label={`Move ${person.name} up`}
															disabled={isPending || index === 0}
															onClick={() => {
																run(
																	async () =>
																		moveCrewMemberAction(person.id, "up"),
																	undefined,
																	`Moved ${person.name} up`
																);
															}}
														>
															<ArrowUp aria-hidden className="size-4" />
														</Button>
														<Button
															variant="ghost"
															aria-label={`Move ${person.name} down`}
															disabled={
																isPending || index === members.length - 1
															}
															onClick={() => {
																run(
																	async () =>
																		moveCrewMemberAction(person.id, "down"),
																	undefined,
																	`Moved ${person.name} down`
																);
															}}
														>
															<ArrowDown aria-hidden className="size-4" />
														</Button>
														<Button
															variant="ghost"
															aria-label={`Edit ${person.name}`}
															disabled={isPending}
															onClick={() => {
																setEditingId(person.id);
															}}
														>
															<Pencil aria-hidden className="size-4" />
														</Button>
														<Button
															variant="ghost"
															aria-label={`Remove ${person.name}`}
															title={
																canDeleteItem(person.createdBy)
																	? undefined
																	: blockedDeleteHint
															}
															disabled={
																isPending || !canDeleteItem(person.createdBy)
															}
															onClick={() => {
																setRemoving(person);
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
						</section>
					);
				})}
			</div>

			<Confirm
				isOpen={removing !== undefined}
				title="Remove from the Flight Crew page?"
				description={`${removing?.name ?? ""} will no longer appear on the site. You can add them again later.`}
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
						async () => deleteCrewMemberAction(target.id),
						undefined,
						`Removed ${target.name}`
					);
				}}
			/>
		</>
	);
}

function Avatar({ person }: { readonly person: Person }) {
	return (
		<span className="relative inline-flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-full bg-surface-2 text-sm font-semibold text-muted">
			{person.photoSrc ? (
				<Image
					src={person.photoSrc}
					alt=""
					width={96}
					height={96}
					className="size-full object-cover"
				/>
			) : (
				person.name
					.split(/\s+/u)
					.slice(0, 2)
					.map((word) => word.at(0))
					.join("")
			)}
		</span>
	);
}

function PersonForm({
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
	const [draft, setDraft] = useState<Draft>({
		groupId: initial.groupId,
		name: initial.name,
		classOf: initial.classOf,
		role: initial.role,
		imageUrl: initial.imageUrl,
	});
	const [errors, setErrors] = useState<Record<string, string>>({});
	const [message, setMessage] = useState<string>();

	function change(patch: Partial<Draft>) {
		setDraft((current) => ({ ...current, ...patch }));
		setMessage(undefined);
	}

	function submit(event: React.SubmitEvent<HTMLFormElement>) {
		event.preventDefault();
		setErrors({});
		setMessage(undefined);
		startTransition(async () => {
			try {
				const result = await onSubmit(draft);
				if (result.ok) {
					toast(resetOnSuccess ? "Added to the list" : "Saved");
					if (resetOnSuccess) {
						setDraft({ ...blank, groupId: draft.groupId });
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
			<div className="grid gap-4 sm:grid-cols-2">
				<TextField
					label="Name"
					value={draft.name}
					maxLength={80}
					autoComplete="off"
					error={errors.name}
					onChange={(event) => {
						change({ name: event.target.value });
					}}
				/>
				<TextField
					label="Role"
					value={draft.role}
					maxLength={120}
					placeholder="Flight Attendant (Helper)"
					error={errors.role}
					onChange={(event) => {
						change({ role: event.target.value });
					}}
				/>
				<SelectField
					label="Group"
					value={draft.groupId}
					error={errors.groupId}
					onChange={(event) => {
						change({ groupId: event.target.value });
					}}
				>
					{crewGroupOptions.map((group) => (
						<option key={group.id} value={group.id}>
							{group.title}
						</option>
					))}
				</SelectField>
				<TextField
					label="Class of"
					optional
					value={draft.classOf}
					maxLength={10}
					placeholder="'27"
					error={errors.classOf}
					onChange={(event) => {
						change({ classOf: event.target.value });
					}}
				/>
			</div>
			<ImageField
				label="Photo"
				purpose="headshot"
				value={draft.imageUrl}
				error={errors.imageUrl}
				hint="Without a photo, their initials show instead."
				onChange={(url) => {
					change({ imageUrl: url });
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
