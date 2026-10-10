"use client";

import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/cn";
import { honeypotField } from "@/lib/form-state";
import { useId } from "react";

/*
 * Form field adapted from recode's FormField (webcubed): the label is now tied
 * to the input, and hints/errors are linked with aria-describedby.
 */
type BaseProps = {
	readonly label: string;
	readonly error?: string;
	readonly hint?: ReactNode;
	readonly extra?: ReactNode;
	readonly optional?: boolean;
};

const inputClass =
	"mt-1.5 block w-full rounded-md border border-field bg-surface px-3 py-2.5 text-base text-text placeholder:text-muted/70 focus-visible:border-brand focus-visible:outline-2 focus-visible:outline-offset-0 aria-[invalid=true]:border-danger";

function Wrapper({
	id,
	label,
	error,
	hint,
	extra,
	optional,
	children,
}: BaseProps & { readonly id: string; readonly children: ReactNode }) {
	return (
		<div>
			<label htmlFor={id} className="text-sm font-semibold">
				{label}
				{optional ? (
					<span className="ml-1.5 font-normal text-muted">(optional)</span>
				) : null}
			</label>
			{children}
			{hint ? (
				<p id={`${id}-hint`} className="mt-1.5 text-sm text-muted">
					{hint}
				</p>
			) : null}
			<div id={`${id}-error`} aria-live="polite">
				{error ? (
					<p className="mt-1.5 text-sm font-medium text-danger">{error}</p>
				) : null}
				{error ? extra : null}
			</div>
		</div>
	);
}

function describedBy(id: string, hint: unknown, error: unknown) {
	return (
		[hint ? `${id}-hint` : "", error ? `${id}-error` : ""]
			.filter(Boolean)
			.join(" ") || undefined
	);
}

export function TextField({
	label,
	error,
	hint,
	extra,
	optional,
	className,
	...props
}: BaseProps & ComponentProps<"input">) {
	const id = useId();
	return (
		<Wrapper {...{ id, label, error, hint, extra, optional }}>
			<input
				id={id}
				aria-invalid={error ? true : undefined}
				aria-describedby={describedBy(id, hint, error)}
				className={cn(inputClass, className)}
				{...props}
			/>
		</Wrapper>
	);
}

export function TextAreaField({
	label,
	error,
	hint,
	extra,
	optional,
	className,
	...props
}: BaseProps & ComponentProps<"textarea">) {
	const id = useId();
	return (
		<Wrapper {...{ id, label, error, hint, extra, optional }}>
			<textarea
				id={id}
				rows={5}
				aria-invalid={error ? true : undefined}
				aria-describedby={describedBy(id, hint, error)}
				className={cn(inputClass, "resize-y", className)}
				{...props}
			/>
		</Wrapper>
	);
}

/** Visually hidden trap field; humans never see or fill it. */
export function Honeypot() {
	return (
		<div
			aria-hidden
			className="absolute -left-[9999px] h-px w-px overflow-hidden"
		>
			<label>
				Leave this empty
				<input
					type="text"
					name={honeypotField}
					tabIndex={-1}
					autoComplete="off"
				/>
			</label>
		</div>
	);
}
