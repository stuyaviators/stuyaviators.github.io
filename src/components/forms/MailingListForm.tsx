"use client";

import { signUpForMailingList } from "@/actions/forms";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/cn";
import { initialFormState } from "@/lib/form-state";
import {
	isLastNameMatch,
	messages,
	validateFullName,
	validateStuyEmail,
} from "@/lib/mailing-list";
import { CheckCircle2 } from "lucide-react";
import { useActionState, useState } from "react";
import LinkifyEmails from "../LinkifyEmails.tsx";
import { Honeypot, TextField } from "./Field.tsx";

/*
 * Native, on-brand sign-up that submits through a Server Action to the club's
 * Google Form. Validates on blur and on submit with the same rules as the
 * server (src/lib/mailing-list.ts).
 */
export default function MailingListForm({
	fallbackUrl,
	compact = false,
	className,
}: {
	readonly fallbackUrl: string;
	readonly compact?: boolean;
	readonly className?: string;
}) {
	const [state, action, pending] = useActionState(
		signUpForMailingList,
		initialFormState
	);
	const [values, setValues] = useState({ fullName: "", email: "" });
	const [touched, setTouched] = useState({ fullName: false, email: false });

	if (state.status === "success") {
		return (
			<div
				role="status"
				className={cn(
					"flex items-start gap-3 rounded-3xl bg-surface p-4",
					className
				)}
			>
				<CheckCircle2
					aria-hidden
					className="mt-0.5 size-5 shrink-0 text-success"
				/>
				<p>
					<span className="font-semibold">You’re on the list.</span> Thanks for
					signing up for the StuyAviators mailing list!
				</p>
			</div>
		);
	}

	const nameError = validateFullName(values.fullName);
	const formatError = validateStuyEmail(values.email);
	const isMismatch =
		!nameError &&
		!formatError &&
		!isLastNameMatch(values.fullName, values.email);
	const emailError =
		formatError ?? (isMismatch ? messages.emailLastName : undefined);
	const isValid = !nameError && !emailError;

	const shownNameError = touched.fullName
		? nameError
		: state.fieldErrors?.fullName;
	const shownEmailError = touched.email ? emailError : state.fieldErrors?.email;
	const showEscapeHatch =
		shownEmailError === messages.emailLastName || state.lastNameMismatch;

	return (
		<form
			noValidate
			action={action}
			className={cn("relative", className)}
			onSubmit={(event) => {
				setTouched({ fullName: true, email: true });
				if (!isValid) {
					event.preventDefault();
				}
			}}
		>
			<Honeypot />
			<div className={cn("grid gap-4", compact ? "" : "sm:grid-cols-2")}>
				<TextField
					label="Full name"
					name="fullName"
					autoComplete="name"
					placeholder="Peter Stuyvesant"
					value={values.fullName}
					error={shownNameError}
					onChange={(event) => {
						setValues((v) => ({ ...v, fullName: event.target.value }));
					}}
					onBlur={() => {
						setTouched((t) => ({ ...t, fullName: true }));
					}}
				/>
				<TextField
					label="Stuy email"
					name="email"
					type="email"
					inputMode="email"
					autoComplete="email"
					placeholder="pstuyvesant60@stuy.edu"
					value={values.email}
					error={shownEmailError}
					extra={
						showEscapeHatch ? (
							<p className="mt-1 text-sm text-muted">
								Email doesn’t follow this pattern?{" "}
								<a
									href={fallbackUrl}
									target="_blank"
									rel="noopener noreferrer"
									className="text-link"
								>
									Sign up here
								</a>
							</p>
						) : null
					}
					onChange={(event) => {
						setValues((v) => ({ ...v, email: event.target.value }));
					}}
					onBlur={() => {
						setTouched((t) => ({ ...t, email: true }));
					}}
				/>
			</div>
			<div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2">
				<Button type="submit" variant="accent" disabled={!isValid || pending}>
					{pending ? "Signing up…" : "Sign up"}
				</Button>
				<div aria-live="polite" className="text-sm">
					{state.status === "error" && state.message ? (
						<p className="text-danger">
							<LinkifyEmails text={state.message} />{" "}
							{state.fallbackUrl ? (
								<a
									href={state.fallbackUrl}
									target="_blank"
									rel="noopener noreferrer"
									className="text-link"
								>
									Use the sign-up form instead
								</a>
							) : null}
						</p>
					) : null}
				</div>
			</div>
			<p className="mt-3 text-sm text-muted">
				We only use your email for StuyAviators news and events. To unsubscribe,
				use the link at the bottom of any newsletter.
			</p>
		</form>
	);
}
