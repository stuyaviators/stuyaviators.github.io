import type { PassField } from "@/components/ui/BoardingPass";
import type { Listing } from "@/lib/listings";
import { Md } from "@/components/Md";
import { BoardingPass } from "@/components/ui/BoardingPass";
import { daysUntil, isClosingSoon } from "@/lib/listing-dates";
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

export function stubFields(listing: Listing): PassField[] {
	const isOpportunity = listing.kind === "opportunity";
	let dates: string | undefined;
	if (isOpportunity && listing.startDate) {
		dates = listing.endDate
			? `${formatDate(listing.startDate)} – ${formatDate(listing.endDate)}`
			: formatDate(listing.startDate);
	}

	const fields: Array<PassField | undefined> = [
		listing.deadline
			? { label: "Deadline", value: formatDate(listing.deadline) }
			: undefined,
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
	return present.length > 0
		? present
		: [{ label: "Deadline", value: "Rolling" }];
}

export default function ListingCard({
	listing,
	preview = false,
}: {
	readonly listing: Listing;
	readonly preview?: boolean;
}) {
	const path = listingPath(listing);
	const isClosing = isClosingSoon(listing);
	const days = listing.deadline ? daysUntil(listing.deadline) : undefined;
	return (
		<BoardingPass
			highlight={listing.featured}
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
				{isClosing ? (
					<span className="label inline-flex items-center gap-1 rounded-sm bg-danger px-2 py-0.5 text-bg">
						<Clock aria-hidden className="size-3" />
						Closing soon
						{days === 0
							? " · today"
							: days === 1
								? " · 1 day"
								: ` · ${days} days`}
					</span>
				) : null}
			</div>
			<h3 className="mt-2 text-xl">
				{path && !preview ? (
					<Link href={path} className="hover:underline">
						{listing.title}
					</Link>
				) : (
					listing.title
				)}
			</h3>
			<p className="label mt-1 text-muted">{listing.organization}</p>
			<p className="mt-3">
				<Md>{listing.summary}</Md>
			</p>
			{listing.description ? (
				<details className="group mt-3">
					<summary className="cursor-pointer text-sm font-semibold text-brand">
						More details
					</summary>
					<div
						className="prose-club mt-3 text-sm"
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
				className="mt-5 inline-flex items-center gap-1.5 font-semibold text-brand underline-offset-4 hover:underline"
			>
				Learn more and apply
				<ArrowUpRight aria-hidden className="btn-arrow size-4" />
				<span className="sr-only">
					(opens {listing.organization} in a new tab)
				</span>
			</a>
		</BoardingPass>
	);
}
