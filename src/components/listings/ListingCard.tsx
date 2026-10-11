import type { PassField } from "@/components/ui/BoardingPass";
import type { Listing } from "@/lib/listings";
import { Md } from "@/components/Md";
import { BoardingPass } from "@/components/ui/BoardingPass";
import { soonLabel } from "@/lib/listing-dates";
import { listingPath } from "@/lib/listing-path";
import { renderMarkdown } from "@/lib/markdown";
import { ArrowUpRight, Clock } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

const dateFormat = new Intl.DateTimeFormat("en-US", {
	month: "short",
	day: "numeric",
	year: "numeric",
	timeZone: "UTC",
});

export function formatDate(value: string) {
	return dateFormat.format(new Date(`${value}T00:00:00Z`));
}

/**
The link's words: opportunities just say "Learn more", or "Learn more and
RSVP" when they have an RSVP deadline; scholarships say "Learn more and apply".
*/
export function linkLabel(listing: Pick<Listing, "kind" | "deadline">) {
	if (listing.kind === "scholarship") {
		return "Learn more and apply";
	}

	return listing.deadline ? "Learn more and RSVP" : "Learn more";
}

export function stubFields(listing: Listing): PassField[] {
	const isOpportunity = listing.kind === "opportunity";
	let dates: string | undefined;
	if (isOpportunity && listing.startDate) {
		dates = listing.endDate
			? `${formatDate(listing.startDate)} – ${formatDate(listing.endDate)}`
			: formatDate(listing.startDate);
	}

	let deadlineField: PassField | undefined;
	if (listing.deadline) {
		let label = "Deadline";
		if (isOpportunity) {
			// An opportunity's deadline is the date to RSVP by; with no start date
			// it is the only date the card has.
			label = listing.startDate ? "RSVP by" : "Date";
		}

		deadlineField = { label, value: formatDate(listing.deadline) };
	}

	const fields: Array<PassField | undefined> = [
		deadlineField,
		listing.kind === "scholarship" && listing.amount
			? { label: "Amount", value: listing.amount }
			: undefined,
		dates ? { label: "Dates", value: dates } : undefined,
		isOpportunity && listing.location
			? { label: "Where", value: listing.location }
			: undefined,
		listing.eligibility
			? { label: "Eligibility", value: listing.eligibility }
			: undefined,
	];
	const present = fields.filter((field) => field !== undefined);
	if (present.length > 0) {
		return present;
	}

	return [
		isOpportunity
			? { label: "Date", value: "Ongoing" }
			: { label: "Deadline", value: "Rolling" },
	];
}

export default function ListingCard({
	listing,
	preview = false,
}: {
	readonly listing: Listing;
	readonly preview?: boolean;
}) {
	const path = listingPath(listing);
	const soon = soonLabel(listing);
	// The whole card opens its own page: the title's link is stretched over it
	// and the links inside the card sit above that.
	const isLinked = path !== undefined && !preview;
	return (
		<BoardingPass
			highlight={listing.featured}
			className={
				isLinked
					? "group transition-colors hover:border-brand focus-within:border-brand"
					: undefined
			}
			stub={stubFields(listing)}
			stubTitle={listing.kind === "scholarship" ? "Scholarship" : "Opportunity"}
			stubImage={
				listing.imageUrl ? (
					// Already resized by the upload route, so skip the optimizer.
					<Image
						src={listing.imageUrl}
						alt=""
						fill
						unoptimized
						sizes="(min-width: 1024px) 20rem, (min-width: 640px) 16rem, 100vw"
						className="object-cover"
					/>
				) : undefined
			}
		>
			<div className="flex flex-wrap items-center gap-2">
				{listing.featured ? (
					<span className="label rounded-sm bg-ice px-2 py-0.5 text-ink">
						Featured
					</span>
				) : null}
				{soon === undefined ? null : (
					<span className="label inline-flex items-center gap-1 rounded-sm bg-danger px-2 py-0.5 text-bg">
						<Clock aria-hidden className="size-3" />
						{soon}
					</span>
				)}
			</div>
			<h3 className="mt-2 text-xl">
				{isLinked ? (
					<Link
						href={path}
						className="group-hover:underline after:absolute after:inset-0"
					>
						{listing.title}
					</Link>
				) : (
					listing.title
				)}
			</h3>
			<p className="label mt-1 text-muted">{listing.organization}</p>
			<p className="mt-3 [&_a]:relative [&_a]:z-10">
				<Md>{listing.summary}</Md>
			</p>
			{listing.description ? (
				<details className="group mt-3">
					<summary className="relative z-10 cursor-pointer text-sm font-semibold text-brand">
						More details
					</summary>
					<div
						className="prose-club mt-3 text-sm [&_a]:relative [&_a]:z-10"
						dangerouslySetInnerHTML={{
							__html: renderMarkdown(listing.description),
						}}
					/>
				</details>
			) : null}
			{listing.tags.length > 0 ? (
				<ul className="mt-4 flex flex-wrap gap-1.5" aria-label="Tags">
					{listing.tags.map((tag) => (
						<li
							key={tag}
							className="label rounded-sm border border-hairline px-2 py-0.5 text-muted"
						>
							{tag}
						</li>
					))}
				</ul>
			) : null}
			<a
				href={listing.url}
				target="_blank"
				rel="noopener noreferrer"
				tabIndex={preview ? -1 : undefined}
				className="relative z-10 mt-5 inline-flex items-center gap-1.5 font-semibold text-brand underline-offset-4 hover:underline"
			>
				{linkLabel(listing)}
				<ArrowUpRight aria-hidden className="btn-arrow size-4" />
				<span className="sr-only">
					(opens {listing.organization} in a new tab)
				</span>
			</a>
		</BoardingPass>
	);
}
