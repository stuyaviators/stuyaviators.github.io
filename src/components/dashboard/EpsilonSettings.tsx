"use client";

import type { EpsilonStatus } from "@/lib/epsilon-token";
import {
	removeEpsilonTokenAction,
	saveEpsilonTokenAction,
	testEpsilonAction,
} from "@/actions/settings";
import Confirm from "@/components/dashboard/Confirm";
import { Spinner } from "@/components/dashboard/Spinner";
import { Badge, Card, formatWhen, Notice } from "@/components/dashboard/ui";
import { TextAreaField } from "@/components/forms/Field";
import { Button } from "@/components/ui/Button";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

type Note = { tone: "good" | "bad"; text: string };

export default function EpsilonSettings({
	status,
}: {
	readonly status: EpsilonStatus;
}) {
	const router = useRouter();
	const [isPending, startTransition] = useTransition();
	const [token, setToken] = useState("");
	const [tokenError, setTokenError] = useState<string>();
	const [note, setNote] = useState<Note>();
	const [isRemoving, setIsRemoving] = useState(false);
	const hasToken = ["connected", "error", "unreadable"].includes(status.state);

	function guard(task: () => Promise<void>) {
		setNote(undefined);
		setTokenError(undefined);
		startTransition(async () => {
			try {
				await task();
			} catch {
				setNote({
					tone: "bad",
					text: "Couldn’t reach the server. Check your connection.",
				});
			}
		});
	}

	function save(event: React.SubmitEvent<HTMLFormElement>) {
		event.preventDefault();
		const value = token;
		guard(async () => {
			const result = await saveEpsilonTokenAction(value);
			if (result.ok) {
				// Don't keep the secret in the page.
				setToken("");
				setNote({ tone: "good", text: "Saved. Epsilon accepted the token." });
				router.refresh();
			} else {
				setTokenError(result.fieldErrors?.token ?? result.error);
			}
		});
	}

	function test() {
		guard(async () => {
			const result = await testEpsilonAction();
			setNote(
				result.ok
					? {
							tone: "good",
							text: `Epsilon returned ${result.count} meeting${result.count === 1 ? "" : "s"}${result.next ? `. Next: ${result.next}.` : "."}`,
						}
					: { tone: "bad", text: result.error }
			);
		});
	}

	return (
		<>
			<Card className="mb-6" aria-labelledby="status-heading">
				<h2 id="status-heading" className="text-xl">
					Epsilon connection
				</h2>
				<p className="mt-1 text-sm text-muted">
					The departure board reads upcoming meetings from Epsilon using an
					officer’s login. Epsilon logins expire hourly, so the site keeps a
					long-lived refresh token (stored encrypted) and renews it
					automatically.
				</p>
				<dl className="mt-4 grid gap-x-6 gap-y-2 text-sm sm:grid-cols-2">
					<div>
						<dt className="label text-muted">Status</dt>
						<dd className="mt-1">
							{status.state === "connected" ? (
								<Badge tone="good">Connected</Badge>
							) : status.state === "error" ? (
								<Badge tone="bad">Needs a new token</Badge>
							) : status.state === "unreadable" ? (
								<Badge tone="bad">Unreadable</Badge>
							) : status.envFallback ? (
								<Badge tone="warn">Using EPSILON_ACCESS_TOKEN</Badge>
							) : (
								<Badge>Not connected</Badge>
							)}
						</dd>
					</div>
					{status.state === "connected" || status.state === "error" ? (
						<>
							<div>
								<dt className="label text-muted">Account</dt>
								<dd className="mt-1">{status.email ?? "—"}</dd>
							</div>
							<div>
								<dt className="label text-muted">Access token expires</dt>
								<dd className="mt-1">
									{status.expiresAt === undefined
										? "—"
										: formatWhen(status.expiresAt * 1000)}
								</dd>
							</div>
							<div>
								<dt className="label text-muted">Last refreshed</dt>
								<dd className="mt-1">{formatWhen(status.refreshedAt)}</dd>
							</div>
							<div>
								<dt className="label text-muted">Saved</dt>
								<dd className="mt-1">
									{formatWhen(status.updatedAt)}
									{status.updatedBy ? ` by ${status.updatedBy}` : ""}
								</dd>
							</div>
						</>
					) : null}
				</dl>
				{status.state === "error" ? (
					<Notice tone="bad" className="mt-4">
						{status.error}
					</Notice>
				) : null}
				{status.state === "unreadable" ? (
					<Notice tone="bad" className="mt-4">
						The stored token can’t be read (AUTH_SECRET changed?). Paste a new
						one.
					</Notice>
				) : null}
				<div className="mt-4 flex flex-wrap gap-2">
					<Button
						variant="secondary"
						disabled={isPending || !hasToken}
						onClick={test}
					>
						Test connection
					</Button>
					{hasToken ? (
						<Button
							variant="ghost"
							className="text-danger"
							disabled={isPending}
							onClick={() => {
								setIsRemoving(true);
							}}
						>
							Remove token
						</Button>
					) : null}
				</div>
				{note ? (
					<Notice tone={note.tone} className="mt-4">
						{note.text}
					</Notice>
				) : null}
			</Card>

			<Card aria-labelledby="paste-heading">
				<h2 id="paste-heading" className="text-xl">
					{hasToken ? "Replace the token" : "Add a token"}
				</h2>
				<ol className="mt-3 list-decimal space-y-1.5 pl-5 text-sm text-muted">
					<li>
						Open a <strong>private/incognito window</strong> and sign in at
						epsilon.stuysu.org with an officer account that can see
						StuyAviators’ meetings.
					</li>
					<li>
						Open the browser’s developer tools → <strong>Application</strong>{" "}
						(Chrome) or <strong>Storage</strong> (Firefox) →{" "}
						<strong>Local Storage</strong> → epsilon.stuysu.org.
					</li>
					<li>
						Find the key that starts with <code>sb-</code> and ends with{" "}
						<code>-auth-token</code>. Copy its whole value (or just the{" "}
						<code>refresh_token</code> inside it) and paste it below.
					</li>
					<li>
						<strong>Close the private window without signing out.</strong>{" "}
						Signing out revokes the token.
					</li>
				</ol>
				<Notice tone="warn" className="mt-4">
					This token gives long-lived access to that person’s Epsilon account.
					Use an account you trust with it, only paste it here, and remove it
					here when that officer leaves.
				</Notice>
				<form onSubmit={save} noValidate className="mt-4 space-y-3">
					<TextAreaField
						label="Refresh token"
						rows={4}
						autoComplete="off"
						spellCheck={false}
						value={token}
						error={tokenError}
						onChange={(event) => {
							setToken(event.target.value);
						}}
					/>
					<Button type="submit" disabled={isPending || token.trim() === ""}>
						{isPending ? (
							<>
								<Spinner /> Checking…
							</>
						) : (
							"Check and save"
						)}
					</Button>
				</form>
			</Card>

			<Confirm
				isOpen={isRemoving}
				title="Remove the Epsilon token?"
				description="The departure board will show the manual meeting list until a new token is added."
				confirmLabel="Remove"
				onCancel={() => {
					setIsRemoving(false);
				}}
				onConfirm={() => {
					setIsRemoving(false);
					guard(async () => {
						const result = await removeEpsilonTokenAction();
						if (result.ok) {
							setNote({ tone: "good", text: "Token removed." });
							router.refresh();
						} else {
							setNote({ tone: "bad", text: result.error });
						}
					});
				}}
			/>
		</>
	);
}
