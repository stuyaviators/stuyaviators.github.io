"use client";

import type { Announcement } from "@/lib/announcement";
import { saveAnnouncementAction } from "@/actions/announcement";
import AnnouncementBanner from "@/components/AnnouncementBanner";
import { CheckboxField } from "@/components/dashboard/fields";
import { Spinner } from "@/components/dashboard/Spinner";
import { Card, Notice } from "@/components/dashboard/ui";
import { TextField } from "@/components/forms/Field";
import { Button } from "@/components/ui/Button";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

export default function AnnouncementForm({
	initial,
}: {
	readonly initial: Announcement;
}) {
	const router = useRouter();
	const [isPending, startTransition] = useTransition();
	const [value, setValue] = useState({
		...initial,
		endsOn: initial.endsOn ?? "",
	});
	const [errors, setErrors] = useState<Record<string, string>>({});
	const [note, setNote] = useState<{ tone: "good" | "bad"; text: string }>();

	function change(patch: Partial<typeof value>) {
		setValue((current) => ({ ...current, ...patch }));
		setNote(undefined);
	}

	function save(event: React.SubmitEvent<HTMLFormElement>) {
		event.preventDefault();
		setErrors({});
		setNote(undefined);
		startTransition(async () => {
			try {
				const result = await saveAnnouncementAction(value);
				if (result.ok) {
					setNote({
						tone: "good",
						text: value.isOn
							? "Saved. The banner is live within a minute or so."
							: "Saved. The banner is off.",
					});
					router.refresh();
				} else {
					setErrors(result.fieldErrors ?? {});
					setNote({ tone: "bad", text: result.error });
				}
			} catch {
				setNote({
					tone: "bad",
					text: "Couldn’t reach the server. Check your connection.",
				});
			}
		});
	}

	return (
		<Card>
			<form onSubmit={save} noValidate className="grid max-w-xl gap-4">
				<TextField
					label="Message"
					value={value.text}
					maxLength={200}
					error={errors.text}
					hint="Keep it to one line."
					onChange={(event) => {
						change({ text: event.target.value });
					}}
				/>
				<div className="grid gap-4 sm:grid-cols-2">
					<TextField
						label="Link"
						optional
						value={value.linkUrl}
						placeholder="/meetings"
						error={errors.linkUrl}
						onChange={(event) => {
							change({ linkUrl: event.target.value });
						}}
					/>
					<TextField
						label="Link text"
						optional
						value={value.linkLabel}
						maxLength={40}
						placeholder="See the schedule"
						error={errors.linkLabel}
						onChange={(event) => {
							change({ linkLabel: event.target.value });
						}}
					/>
				</div>
				<TextField
					label="Last day to show"
					type="date"
					optional
					value={value.endsOn}
					error={errors.endsOn}
					hint="It hides itself after this day (New York time). Leave empty to keep it up until you switch it off."
					onChange={(event) => {
						change({ endsOn: event.target.value });
					}}
				/>
				<CheckboxField
					label="Show the banner"
					checked={value.isOn}
					onChange={(event) => {
						change({ isOn: event.target.checked });
					}}
				/>
				{value.text.trim() === "" ? null : (
					<div>
						<p className="label mb-1.5 text-muted">Preview</p>
						<div className="overflow-hidden rounded-xl">
							<AnnouncementBanner
								announcement={{
									...value,
									text: value.text.trim(),
									endsOn: undefined,
								}}
							/>
						</div>
					</div>
				)}
				{note ? <Notice tone={note.tone}>{note.text}</Notice> : null}
				<div>
					<Button type="submit" disabled={isPending}>
						{isPending ? <Spinner /> : null} Save
					</Button>
				</div>
			</form>
		</Card>
	);
}
