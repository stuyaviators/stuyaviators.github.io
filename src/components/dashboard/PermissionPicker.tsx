"use client";

/* eslint-disable no-bitwise -- the permission number is a bit mask by design: each box is a power of two. */
import { CheckboxField, SelectField } from "@/components/dashboard/fields";
import { TextField } from "@/components/forms/Field";
import {
	allPermissions,
	isWithin,
	permissionList,
	presets,
	roleFor,
	roleLabels,
	roles,
} from "@/lib/permissions";
import { useState } from "react";

/*
 * The permission calculator: tick the boxes someone should have and the
 * permission number updates (each box is worth a different power of two, so
 * every mix adds up to its own number). You can also pick a ready-made role to
 * tick a set of boxes, or type a number. Only boxes you're allowed to give are
 * enabled; the server checks again.
 */
export default function PermissionPicker({
	value,
	onChange,
	grantable,
	isDisabled = false,
}: {
	readonly value: number;
	readonly onChange: (value: number) => void;
	// The boxes the signed-in person may tick for others.
	readonly grantable: number;
	readonly isDisabled?: boolean;
}) {
	const [typed, setTyped] = useState<string>();
	const stored = roleFor(value);
	const ticked = permissionList.filter(
		(permission) => (value & permission.value) !== 0
	);
	const offered = roles.filter((role) => isWithin(presets[role], grantable));
	// Secret boxes are only shown to people who can give them.
	const boxes = permissionList.filter(
		(permission) =>
			permission.isSecret !== true || (grantable & permission.value) !== 0
	);

	function tick(amount: number, isOn: boolean) {
		setTyped(undefined);
		onChange(isOn ? value | amount : value & ~amount);
	}

	function type(text: string) {
		setTyped(text);
		const number = Number(text);
		const isUsable =
			text.trim() !== "" &&
			Number.isSafeInteger(number) &&
			number >= 0 &&
			number <= allPermissions &&
			isWithin(number, grantable);
		if (!isUsable) {
			return;
		}

		onChange(number);
	}

	return (
		<div className="space-y-4">
			<SelectField
				label="Start from a role"
				disabled={isDisabled}
				value={stored}
				hint="Ticks a ready-made set of boxes. Change any box afterwards and it becomes Custom."
				onChange={(event) => {
					const role = roles.find((name) => name === event.target.value);
					if (role === undefined) {
						return;
					}

					setTyped(undefined);
					onChange(presets[role]);
				}}
			>
				{stored === "custom" ? (
					<option value="custom">{roleLabels.custom}</option>
				) : null}
				{offered.map((role) => (
					<option key={role} value={role}>
						{roleLabels[role]}
					</option>
				))}
			</SelectField>

			<fieldset disabled={isDisabled} className="space-y-3">
				<legend className="text-sm font-semibold">Can do</legend>
				<div className="grid gap-3 sm:grid-cols-2">
					{boxes.map((permission) => (
						<CheckboxField
							key={permission.key}
							label={`${permission.label} (+${permission.value})`}
							hint={permission.hint}
							checked={(value & permission.value) !== 0}
							disabled={isDisabled || (grantable & permission.value) === 0}
							onChange={(event) => {
								tick(permission.value, event.target.checked);
							}}
						/>
					))}
				</div>
			</fieldset>

			<div className="grid gap-3 rounded-xl border border-hairline bg-surface-2/60 p-4 sm:grid-cols-[1fr_9rem] sm:items-end">
				<div>
					<p className="label text-muted">Permission number</p>
					<p className="mt-1 text-sm" aria-live="polite">
						{ticked.length === 0
							? "Nothing ticked yet."
							: `${ticked.map((permission) => permission.value).join(" + ")} = `}
						{ticked.length === 0 ? null : (
							<strong className="text-2xl">{value}</strong>
						)}
					</p>
				</div>
				<TextField
					label="Or type the number"
					inputMode="numeric"
					disabled={isDisabled}
					value={typed ?? String(value)}
					hint={`0 to ${allPermissions}`}
					onChange={(event) => {
						type(event.target.value);
					}}
				/>
			</div>
		</div>
	);
}

/* eslint-enable no-bitwise -- end of the bit-mask exemption. */
