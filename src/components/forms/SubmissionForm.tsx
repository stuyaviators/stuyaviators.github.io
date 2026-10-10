"use client";

import { CheckCircle2 } from "lucide-react";
import { useActionState } from "react";
import { submitForm } from "@/actions/forms";
import { Button } from "@/components/ui/Button";
import { initialFormState } from "@/lib/form-state";
import type { SubmissionType } from "@/lib/submission-schemas";
import { Honeypot, TextAreaField, TextField } from "./Field";

export type FieldSpec = {
	name: string;
	label: string;
	type?: "text" | "email" | "url" | "textarea";
	optional?: boolean;
	placeholder?: string;
	hint?: string;
	autoComplete?: string;
};

/**
 * Generic inbox form (contact, story, photo, meeting idea). Server Action does
 * the real validation; native `required`/`type` give instant feedback.
 */
export default function SubmissionForm({
	type,
	fields,
	submitLabel,
	successMessage,
}: {
	readonly type: SubmissionType;
	readonly fields: FieldSpec[];
	readonly submitLabel: string;
	readonly successMessage: string;
}) {
	const [state, action, pending] = useActionState(
		submitForm.bind(null, type),
		initialFormState
	);

	if (state.status === "success") {
		return (
			<div role="status" className="flex items-start gap-3 rounded-lg border border-hairline bg-surface p-5">
				<CheckCircle2 aria-hidden className="mt-0.5 size-5 shrink-0 text-success" />
				<div>
					<p className="font-semibold">{successMessage}</p>
					{state.joinedMailingList ? (
						<p className="mt-1 text-sm text-muted">
							We’ve also added you to the StuyAviators mailing list.
						</p>
					) : null}
				</div>
			</div>
		);
	}

	return (
		<form action={action} className="relative grid gap-5">
			<Honeypot />
			{fields.map((field) =>
				field.type === "textarea" ? (
					<TextAreaField
						key={field.name}
						name={field.name}
						label={field.label}
						optional={field.optional}
						required={!field.optional}
						placeholder={field.placeholder}
						hint={field.hint}
						maxLength={6000}
						error={state.fieldErrors?.[field.name]}
					/>
				) : (
					<TextField
						key={field.name}
						name={field.name}
						type={field.type ?? "text"}
						label={field.label}
						optional={field.optional}
						required={!field.optional}
						placeholder={field.placeholder}
						hint={field.hint}
						autoComplete={field.autoComplete}
						error={state.fieldErrors?.[field.name]}
					/>
				)
			)}
			<div className="flex flex-wrap items-center gap-4">
				<Button type="submit" variant="accent" disabled={pending}>
					{pending ? "Sending…" : submitLabel}
				</Button>
				<p aria-live="polite" className="text-sm text-danger">
					{state.status === "error" ? state.message : null}
				</p>
			</div>
			<p className="text-sm text-muted">
				If you use your Stuy email, we’ll also add you to our mailing list.
				Unsubscribe any time.
			</p>
		</form>
	);
}
