"use client";

import { CheckCircle2 } from "lucide-react";
import { useActionState, useState } from "react";
import { unsubscribe } from "@/actions/forms";
import { Button } from "@/components/ui/Button";
import { initialFormState } from "@/lib/form-state";
import { validateStuyEmail } from "@/lib/mailing-list";
import { Honeypot, TextField } from "./Field";

export default function UnsubscribeForm() {
	const [state, action, pending] = useActionState(unsubscribe, initialFormState);
	const [email, setEmail] = useState("");
	const [touched, setTouched] = useState(false);
	const error = validateStuyEmail(email);

	if (state.status === "success") {
		return (
			<p role="status" className="flex gap-3 rounded-lg border border-hairline bg-surface p-5">
				<CheckCircle2 aria-hidden className="size-5 shrink-0 text-success" />
				You’ve been unsubscribed. It may take a few days for emails to stop.
			</p>
		);
	}

	return (
		<form
			noValidate
			action={action}
			className="relative grid max-w-md gap-4"
			onSubmit={(event) => {
				setTouched(true);
				if (error) event.preventDefault();
			}}
		>
			<Honeypot />
			<TextField
				label="Stuy email"
				name="email"
				type="email"
				autoComplete="email"
				placeholder="pstuyvesant60@stuy.edu"
				value={email}
				error={touched ? error : state.fieldErrors?.email}
				onChange={(event) => {
					setEmail(event.target.value);
				}}
				onBlur={() => {
					setTouched(true);
				}}
			/>
			<div className="flex flex-wrap items-center gap-4">
				<Button type="submit" disabled={Boolean(error) || pending}>
					{pending ? "Unsubscribing…" : "Unsubscribe"}
				</Button>
				<p aria-live="polite" className="text-sm text-danger">
					{state.status === "error" && state.message ? (
						<>
							{state.message}{" "}
							{state.fallbackUrl ? (
								<a href={state.fallbackUrl} className="underline">Email us instead</a>
							) : null}
						</>
					) : null}
				</p>
			</div>
		</form>
	);
}
