"use client";

import type { RoleName } from "@/lib/permissions";
import type { User } from "@/lib/users";
import {
	addOfficer,
	changeOfficerRole,
	removeOfficer,
} from "@/actions/officers";
import Confirm from "@/components/dashboard/Confirm";
import { SelectField } from "@/components/dashboard/fields";
import { Spinner } from "@/components/dashboard/Spinner";
import { useToast } from "@/components/dashboard/Toast";
import { Badge, Card, formatWhen, Notice } from "@/components/dashboard/ui";
import { useAction } from "@/components/dashboard/use-action";
import { TextField } from "@/components/forms/Field";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/cn";
import { roleDescriptions, roleLabels, roles } from "@/lib/permissions";
import { Trash2, UserPlus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

export default function OfficersManager({
	users,
	currentId,
	manageable,
}: {
	readonly users: User[];
	readonly currentId: string;
	// The roles this signed-in person may give out and take away.
	readonly manageable: RoleName[];
}) {
	const router = useRouter();
	const { toast } = useToast();
	const { run, isPending, error, leavingId, markLeaving } = useAction();
	const [isAdding, startAdding] = useTransition();
	const [email, setEmail] = useState("");
	const [role, setRole] = useState<string>(manageable.at(-1) ?? "officer");
	const [emailError, setEmailError] = useState<string>();
	const [removing, setRemoving] = useState<User>();
	const [added, setAdded] = useState<string>();

	function add(event: React.SubmitEvent<HTMLFormElement>) {
		event.preventDefault();
		setEmailError(undefined);
		setAdded(undefined);
		const value = email;
		startAdding(async () => {
			try {
				const result = await addOfficer(value, role);
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
				<form
					onSubmit={add}
					noValidate
					className="mt-4 grid gap-3 sm:grid-cols-[1fr_11rem_auto] sm:items-end"
				>
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
					<SelectField
						label="Role"
						value={role}
						onChange={(event) => {
							setRole(event.target.value);
						}}
					>
						{manageable.map((name) => (
							<option key={name} value={name}>
								{roleLabels[name]}
							</option>
						))}
					</SelectField>
					<Button
						type="submit"
						disabled={isPending || isAdding || email.trim() === ""}
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
					// Roles you can't manage are shown, but locked.
					const isLocked = isYou || !manageable.includes(user.role);
					return (
						<li
							key={user.id}
							className={cn(
								"flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-hairline bg-surface p-4",
								leavingId === user.id && "dash-leave"
							)}
						>
							<div className="min-w-0 flex-1 basis-56">
								<p className="truncate font-semibold">
									{user.name ?? user.email}{" "}
									{isYou ? <Badge tone="brand">You</Badge> : null}
								</p>
								{user.name ? (
									<p className="truncate text-sm text-muted">{user.email}</p>
								) : null}
								<p className="text-sm text-muted">
									{user.lastSignInAt
										? `Last signed in ${formatWhen(user.lastSignInAt)}`
										: "Hasn’t signed in yet"}
									{user.addedBy ? ` · added by ${user.addedBy}` : ""}
								</p>
							</div>
							<div className="flex items-center gap-2">
								<div className="w-36">
									<SelectField
										label="Role"
										value={user.role}
										disabled={isPending || isLocked}
										onChange={(event) => {
											run(
												async () =>
													changeOfficerRole(user.id, event.target.value),
												undefined,
												`${user.name ?? user.email} is now ${roleLabels[event.target.value as RoleName] ?? event.target.value}`
											);
										}}
									>
										{(isLocked ? roles : manageable).map((name) => (
											<option key={name} value={name}>
												{roleLabels[name]}
											</option>
										))}
									</SelectField>
								</div>
								{isLocked ? null : (
									<Button
										variant="ghost"
										aria-label={`Remove ${user.email}`}
										className="self-end"
										disabled={isPending}
										onClick={() => {
											setRemoving(user);
										}}
									>
										<Trash2 aria-hidden className="size-4" />
									</Button>
								)}
							</div>
						</li>
					);
				})}
			</ul>

			<Card className="mt-8" aria-labelledby="roles-heading">
				<h2 id="roles-heading" className="text-xl">
					What each role can do
				</h2>
				<dl className="mt-4 grid gap-4 sm:grid-cols-2">
					{roles.map((name) => (
						<div key={name}>
							<dt className="font-semibold">{roleLabels[name]}</dt>
							<dd className="text-sm text-muted">{roleDescriptions[name]}</dd>
						</div>
					))}
				</dl>
				<p className="mt-4 text-sm text-muted">
					Everyone can edit the things their role covers. “Deletes only what
					they added” means they can edit anything in their areas, but can only
					delete items with their own name on them, so one account can’t wipe
					out other people’s work. Settings are admin-only.
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
