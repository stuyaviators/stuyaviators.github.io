import type { PassField } from "@/components/ui/BoardingPass";
import type { Listing } from "@/lib/listings";
import { Md } from "@/components/Md";
import { BoardingPass } from "@/components/ui/BoardingPass";
import { daysUntil, isClosingSoon } from "@/lib/listings";
import { renderMarkdown } from "@/lib/markdown";
import { ArrowUpRight, Clock } from "lucide-react";

const dateFormat = new Intl.DateTimeFormat("en-US", {
	month: "short",
	day: "numeric",
	year: "numeric",
	timeZone: "UTC",
});

export function formatDate(value: string) {
	return dateFormat.format(new Date(`${value}T00:00:00Z`));
}

function stubFields(listing: Listing): PassField[] {
	const fields: PassField[] = [];
	if (listing.deadline)
		fields.push({ label: "Deadline", value: formatDate(listing.deadline) });
	if (listing.kind === "scholarship" && listing.amount) {
		fields.push({ label: "Amount", value: listing.amount });
	}

	if (listing.kind === "opportunity") {
		if (listing.startDate) {
			fields.push({
				label: "Dates",
				value: listing.endDate
					? `${formatDate(listing.startDate)} – ${formatDate(listing.endDate)}`
					: formatDate(listing.startDate),
			});
		}

		if (listing.location)
			fields.push({ label: "Where", value: listing.location });
	}

	if (listing.eligibility)
		fields.push({ label: "Eligibility", value: listing.eligibility });
	if (fields.length === 0) fields.push({ label: "Deadline", value: "Rolling" });
	return fields;
}

export default function ListingCard({
	listing,
	preview = false,
}: {
	readonly listing: Listing;
	readonly preview?: boolean;
}) {
	const closing = isClosingSoon(listing);
	const days = listing.deadline ? daysUntil(listing.deadline) : undefined;
	return (
		<BoardingPass
			highlight={listing.featured}
			stub={stubFields(listing)}
			stubTitle={listing.kind === "scholarship" ? "Scholarship" : "Opportunity"}
		>
			<div className="flex flex-wrap items-center gap-2">
				{listing.featured ? (
					<span className="label rounded-sm bg-ice px-2 py-0.5 text-navy">
						Featured
					</span>
				) : null}
				{closing ? (
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
			<h3 className="mt-2 text-xl">{listing.title}</h3>
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
						// eslint-disable-next-line react/no-danger
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
				<ArrowUpRight aria-hidden className="size-4" />
				<span className="sr-only">
					(opens {listing.organization} in a new tab)
				</span>
			</a>
		</BoardingPass>
	);
}
