"use client";

import type { User } from "@/lib/users";
import {
	addOfficer,
	changeOfficerPermissions,
	removeOfficer,
} from "@/actions/officers";
import Confirm from "@/components/dashboard/Confirm";
import PermissionMatrix from "@/components/dashboard/PermissionMatrix";
import PermissionPicker from "@/components/dashboard/PermissionPicker";
import { Spinner } from "@/components/dashboard/Spinner";
import { useToast } from "@/components/dashboard/Toast";
import { Badge, Card, formatWhen, Notice } from "@/components/dashboard/ui";
import { useAction } from "@/components/dashboard/use-action";
import { TextField } from "@/components/forms/Field";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/cn";
import {
	hasPermission,
	isWithin,
	presets,
	roleLabels,
} from "@/lib/permissions";
import { Pencil, Trash2, UserPlus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

export default function OfficersManager({
	users,
	currentId,
	grantable,
}: {
	readonly users: User[];
	readonly currentId: string;
	// The boxes the signed-in person may tick for others.
	readonly grantable: number;
}) {
	const router = useRouter();
	const { toast } = useToast();
	const { run, isPending, error, leavingId, markLeaving } = useAction();
	const [isAdding, startAdding] = useTransition();
	const [isSaving, startSaving] = useTransition();
	const [email, setEmail] = useState("");
	// Start new people on the narrowest ready-made role that fits.
	const [permissions, setPermissions] = useState(
		isWithin(presets.contributor, grantable) ? presets.contributor : 0
	);
	const [emailError, setEmailError] = useState<string>();
	const [removing, setRemoving] = useState<User>();
	const [added, setAdded] = useState<string>();
	const [editingId, setEditingId] = useState<string>();
	const [draft, setDraft] = useState(0);
	const [editError, setEditError] = useState<string>();

	function add(event: React.SubmitEvent<HTMLFormElement>) {
		event.preventDefault();
		setEmailError(undefined);
		setAdded(undefined);
		const value = email;
		startAdding(async () => {
			try {
				const result = await addOfficer(value, permissions);
				if (result.ok) {
					setEmail("");
					setAdded(value.trim().toLowerCase());
					toast(`Added ${value.trim().toLowerCase()}`);
					router.refresh();
				} else {
					setEmailError(result.fieldErrors?.email ?? result.error);
				}
			} catch {
				setEmailError("Couldn’t reach the server. Check your connection.");
			}
		});
	}

	function startEditing(user: User) {
		setEditingId(user.id);
		setDraft(user.permissions);
		setEditError(undefined);
	}

	function saveEdit(user: User) {
		setEditError(undefined);
		startSaving(async () => {
			try {
				const result = await changeOfficerPermissions(user.id, draft);
				if (result.ok) {
					toast(`Saved permissions for ${user.name ?? user.email}`);
					setEditingId(undefined);
					router.refresh();
				} else {
					setEditError(result.error);
				}
			} catch {
				setEditError("Couldn’t reach the server. Check your connection.");
			}
		});
	}

	return (
		<>
			<Card className="mb-6" aria-labelledby="add-heading">
				<h2 id="add-heading" className="text-xl">
					Add someone
				</h2>
				<p className="mt-1 text-sm text-muted">
					Use the Google account they’ll sign in with. A personal Gmail works if
					their school account blocks sign-in.
				</p>
				<form onSubmit={add} noValidate className="mt-4 space-y-5">
					<TextField
						label="Email"
						type="email"
						autoComplete="off"
						value={email}
						placeholder="pstuyvesant60@stuy.edu"
						error={emailError}
						onChange={(event) => {
							setEmail(event.target.value);
						}}
					/>
					<PermissionPicker
						value={permissions}
						onChange={setPermissions}
						grantable={grantable}
					/>
					<Button
						type="submit"
						disabled={
							isPending || isAdding || email.trim() === "" || permissions === 0
						}
					>
						{isAdding ? (
							<Spinner />
						) : (
							<UserPlus aria-hidden className="size-4" />
						)}{" "}
						Add
					</Button>
				</form>
				{added ? (
					<Notice tone="good" className="mt-3">
						{added} can now sign in.
					</Notice>
				) : null}
			</Card>

			{error ? (
				<Notice tone="bad" className="mb-4">
					{error}
				</Notice>
			) : null}

			<ul className="dash-stagger space-y-3">
				{users.map((user) => {
					const isYou = user.id === currentId;
					// People holding boxes you can't give are shown, but locked.
					const isLocked = isYou || !isWithin(user.permissions, grantable);
					const isEditing = editingId === user.id;
					return (
						<li
							key={user.id}
							className={cn(
								"rounded-2xl border border-hairline bg-surface p-4",
								leavingId === user.id && "dash-leave"
							)}
						>
							<div className="flex flex-wrap items-center justify-between gap-3">
								<div className="min-w-0 flex-1 basis-56">
									<p className="truncate font-semibold">
										{user.name ?? user.email}{" "}
										{isYou ? <Badge tone="brand">You</Badge> : null}
									</p>
									{user.name ? (
										<p className="truncate text-sm text-muted">{user.email}</p>
									) : null}
									<p className="mt-1 flex flex-wrap items-center gap-2 text-sm">
										<Badge>{roleLabels[user.role]}</Badge>
										<span className="text-muted">
											Permission number {user.permissions}
										</span>
									</p>
									<p className="text-sm text-muted">
										{user.lastSignInAt
											? `Last signed in ${formatWhen(user.lastSignInAt)}`
											: "Hasn’t signed in yet"}
										{user.addedBy ? ` · added by ${user.addedBy}` : ""}
									</p>
								</div>
								{isLocked ? null : (
									<div className="flex items-center gap-1">
										<Button
											variant="secondary"
											disabled={isPending || isSaving}
											aria-expanded={isEditing}
											onClick={() => {
												if (isEditing) {
													setEditingId(undefined);
												} else {
													startEditing(user);
												}
											}}
										>
											<Pencil aria-hidden className="size-4" />{" "}
											{isEditing ? "Close" : "Edit permissions"}
										</Button>
										<Button
											variant="ghost"
											aria-label={`Remove ${user.email}`}
											disabled={isPending}
											onClick={() => {
												setRemoving(user);
											}}
										>
											<Trash2 aria-hidden className="size-4" />
										</Button>
									</div>
								)}
							</div>
							{isEditing ? (
								<div className="mt-4 space-y-4 border-t border-hairline pt-4">
									<PermissionPicker
										value={draft}
										onChange={setDraft}
										grantable={grantable}
									/>
									{editError ? <Notice tone="bad">{editError}</Notice> : null}
									<div className="flex gap-2">
										<Button
											disabled={
												isSaving || draft === 0 || draft === user.permissions
											}
											onClick={() => {
												saveEdit(user);
											}}
										>
											{isSaving ? <Spinner /> : null} Save permissions
										</Button>
										<Button
											variant="ghost"
											onClick={() => {
												setEditingId(undefined);
											}}
										>
											Cancel
										</Button>
									</div>
								</div>
							) : null}
						</li>
					);
				})}
			</ul>

			<Card className="mt-8" aria-labelledby="roles-heading">
				<h2 id="roles-heading" className="text-xl">
					What each role can do
				</h2>
				<p className="mt-1 text-sm text-muted">
					A role is just a ready-made set of ticked boxes. The number at the
					bottom is the permission number it adds up to; any mix of boxes works
					too.
				</p>
				<div className="mt-4">
					<PermissionMatrix showSecret={hasPermission(grantable, "trash")} />
				</div>
				<p className="mt-4 text-sm text-muted">
					Without “Delete other people’s items”, someone can edit anything their
					boxes cover but can only delete what they added themselves, so one
					account can’t wipe out other people’s work.
				</p>
			</Card>

			<Confirm
				isOpen={removing !== undefined}
				title="Remove from the officer list?"
				description={`${removing?.email ?? ""} will no longer be able to sign in. They lose access on their next click.`}
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
						async () => removeOfficer(target.id),
						undefined,
						`Removed ${target.name ?? target.email}`
					);
				}}
			/>
		</>
	);
}
