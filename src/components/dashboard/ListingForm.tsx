"use client";

import type { Listing, ListingKind } from "@/lib/listings";
import { saveListing } from "@/actions/listings";
import {
	CheckboxField,
	ImageField,
	SelectField,
} from "@/components/dashboard/fields";
import { Spinner } from "@/components/dashboard/Spinner";
import { Card, Notice } from "@/components/dashboard/ui";
import { TextAreaField, TextField } from "@/components/forms/Field";
import ListingCard from "@/components/listings/ListingCard";
import { Button, buttonClasses } from "@/components/ui/Button";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

type Values = {
	title: string;
	organization: string;
	summary: string;
	description: string;
	url: string;
	imageUrl: string;
	deadline: string;
	amount: string;
	startDate: string;
	endDate: string;
	location: string;
	eligibility: string;
	tags: string;
	featured: boolean;
	status: "draft" | "published";
};

function initialValues(listing?: Listing): Values {
	return {
		title: listing?.title ?? "",
		organization: listing?.organization ?? "",
		summary: listing?.summary ?? "",
		description: listing?.description ?? "",
		url: listing?.url ?? "",
		imageUrl: listing?.imageUrl ?? "",
		deadline: listing?.deadline ?? "",
		amount: listing?.amount ?? "",
		startDate: listing?.startDate ?? "",
		endDate: listing?.endDate ?? "",
		location: listing?.location ?? "",
		eligibility: listing?.eligibility ?? "",
		tags: listing?.tags.join(", ") ?? "",
		featured: listing?.featured ?? false,
		status: listing?.status ?? "draft",
	};
}

const isoDate = /^\d{4}-\d{2}-\d{2}$/u;
const dateOrUndefined = (value: string) => (isoDate.test(value) ? value : null);
const textOrNull = (value: string) => value.trim() || null;

/**
What the public card will look like for the values typed so far.
*/
function previewListing(kind: ListingKind, values: Values): Listing {
	const now = new Date();
	return {
		id: "preview",
		kind,
		slug: null,
		title: values.title.trim() || "Card title",
		organization: values.organization.trim() || "Organization",
		summary: values.summary.trim() || "A short description appears here.",
		description: textOrNull(values.description),
		url: values.url.trim() || "#",
		imageUrl: /^https?:\/\//iu.test(values.imageUrl.trim())
			? values.imageUrl.trim()
			: null,
		deadline: dateOrUndefined(values.deadline),
		amount: textOrNull(values.amount),
		startDate: dateOrUndefined(values.startDate),
		endDate: dateOrUndefined(values.endDate),
		location: textOrNull(values.location),
		eligibility: textOrNull(values.eligibility),
		tags: values.tags
			.split(",")
			.map((tag) => tag.trim())
			.filter(Boolean)
			.slice(0, 12),
		featured: values.featured,
		status: values.status,
		sortOrder: 0,
		createdAt: now,
		updatedAt: now,
		createdBy: null,
		updatedBy: null,
		deletedAt: null,
	};
}

export default function ListingForm({
	kind,
	slug,
	noun,
	listing,
}: {
	readonly kind: ListingKind;
	readonly slug: string;
	readonly noun: string;
	readonly listing?: Listing;
}) {
	const router = useRouter();
	const [isPending, startTransition] = useTransition();
	const [values, setValues] = useState(() => initialValues(listing));
	const [error, setError] = useState<string>();
	const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
	const isScholarship = kind === "scholarship";

	function set<K extends keyof Values>(key: K, value: Values[K]) {
		setValues((previous) => ({ ...previous, [key]: value }));
	}

	function submit(event: React.SubmitEvent<HTMLFormElement>) {
		event.preventDefault();
		setError(undefined);
		setFieldErrors({});
		startTransition(async () => {
			try {
				const result = await saveListing(listing?.id, { kind, ...values });
				if (!result.ok) {
					setError(result.error);
					setFieldErrors(result.fieldErrors ?? {});
					return;
				}

				router.push(`/dashboard/${slug}`);
				router.refresh();
			} catch {
				setError("Couldn’t reach the server. Check your connection.");
			}
		});
	}

	return (
		<form
			onSubmit={submit}
			noValidate
			className="grid gap-6 lg:grid-cols-[1fr_22rem] xl:grid-cols-[1fr_26rem]"
		>
			<div className="space-y-5">
				<Card className="space-y-5">
					<TextField
						label="Title"
						value={values.title}
						maxLength={160}
						required
						error={fieldErrors.title}
						onChange={(event) => {
							set("title", event.target.value);
						}}
					/>
					<TextField
						label={isScholarship ? "Provider" : "Organization"}
						value={values.organization}
						maxLength={120}
						required
						error={fieldErrors.organization}
						onChange={(event) => {
							set("organization", event.target.value);
						}}
					/>
					<TextAreaField
						label="Short description"
						rows={3}
						value={values.summary}
						maxLength={400}
						required
						hint={`${values.summary.length}/400. Shown on the card.`}
						error={fieldErrors.summary}
						onChange={(event) => {
							set("summary", event.target.value);
						}}
					/>
					<TextAreaField
						label="Long description"
						optional
						rows={6}
						value={values.description}
						maxLength={8000}
						hint="Markdown works: **bold**, *italic*, lists, [links](https://…). Shown under “More details”."
						error={fieldErrors.description}
						onChange={(event) => {
							set("description", event.target.value);
						}}
					/>
					<TextField
						label="Link"
						type="url"
						inputMode="url"
						value={values.url}
						required
						placeholder="https://…"
						hint="Where “Learn more and apply” goes. Must start with https:// or http://."
						error={fieldErrors.url}
						onChange={(event) => {
							set("url", event.target.value);
						}}
					/>
					<ImageField
						purpose="listing"
						value={values.imageUrl}
						error={fieldErrors.imageUrl}
						onChange={(url) => {
							set("imageUrl", url);
						}}
					/>
				</Card>

				<Card className="space-y-5">
					<div className="grid gap-5 sm:grid-cols-2">
						<TextField
							label="Deadline"
							type="date"
							optional
							value={values.deadline}
							error={fieldErrors.deadline}
							hint="Shows “Closing soon” in the last 14 days, then moves to Past."
							onChange={(event) => {
								set("deadline", event.target.value);
							}}
						/>
						{isScholarship ? (
							<TextField
								label="Amount"
								optional
								value={values.amount}
								maxLength={60}
								placeholder="$1,000"
								error={fieldErrors.amount}
								onChange={(event) => {
									set("amount", event.target.value);
								}}
							/>
						) : (
							<TextField
								label="Where"
								optional
								value={values.location}
								maxLength={120}
								placeholder="Online, or a city"
								error={fieldErrors.location}
								onChange={(event) => {
									set("location", event.target.value);
								}}
							/>
						)}
						{isScholarship ? null : (
							<>
								<TextField
									label="Starts"
									type="date"
									optional
									value={values.startDate}
									error={fieldErrors.startDate}
									onChange={(event) => {
										set("startDate", event.target.value);
									}}
								/>
								<TextField
									label="Ends"
									type="date"
									optional
									value={values.endDate}
									error={fieldErrors.endDate}
									onChange={(event) => {
										set("endDate", event.target.value);
									}}
								/>
							</>
						)}
					</div>
					<TextField
						label="Eligibility"
						optional
						value={values.eligibility}
						maxLength={160}
						placeholder="Grades 9–12"
						error={fieldErrors.eligibility}
						onChange={(event) => {
							set("eligibility", event.target.value);
						}}
					/>
					<TextField
						label="Tags"
						optional
						value={values.tags}
						maxLength={400}
						hint="Separate with commas. Visitors can filter by tag."
						error={fieldErrors.tags}
						onChange={(event) => {
							set("tags", event.target.value);
						}}
					/>
				</Card>

				<Card className="space-y-5">
					<SelectField
						label="Status"
						value={values.status}
						hint="Drafts are only visible here."
						onChange={(event) => {
							set(
								"status",
								event.target.value === "published" ? "published" : "draft"
							);
						}}
					>
						<option value="draft">Draft</option>
						<option value="published">Published</option>
					</SelectField>
					<CheckboxField
						label="Featured"
						hint="Highlights the card on the public page."
						checked={values.featured}
						onChange={(event) => {
							set("featured", event.target.checked);
						}}
					/>
				</Card>

				{error ? <Notice tone="bad">{error}</Notice> : null}
				<div className="flex flex-wrap gap-3">
					<Button type="submit" disabled={isPending}>
						{isPending ? (
							<>
								<Spinner /> Saving…
							</>
						) : (
							`Save ${noun}`
						)}
					</Button>
					<Link
						href={`/dashboard/${slug}`}
						className={buttonClasses("secondary")}
					>
						Cancel
					</Link>
				</div>
			</div>

			<aside
				aria-label="Live preview"
				className="lg:sticky lg:top-6 lg:self-start"
			>
				<p className="label mb-2 text-muted">Live preview</p>
				<ListingCard listing={previewListing(kind, values)} preview />
				<p className="mt-2 text-sm text-muted">
					This is how the card looks on the public page.
				</p>
			</aside>
		</form>
	);
}
