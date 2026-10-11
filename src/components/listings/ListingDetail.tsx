import type { Listing } from "@/lib/listings";
import { Md } from "@/components/Md";
import { buttonClasses } from "@/components/ui/Button";
import { Container } from "@/components/ui/Section";
import { daysUntil, isClosingSoon, isExpired } from "@/lib/listing-dates";
import { renderMarkdown } from "@/lib/markdown";
import { ArrowLeft, ArrowUpRight, Clock } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { stubFields } from "./ListingCard.tsx";

/**
One card on its own page: opportunities and scholarships share it.
*/
export default function ListingDetail({
	listing,
}: {
	readonly listing: Listing;
}) {
	const isScholarship = listing.kind === "scholarship";
	const backHref = isScholarship ? "/scholarships" : "/opportunities";
	const days = listing.deadline ? daysUntil(listing.deadline) : undefined;
	return (
		<Container className="pt-8 pb-16 sm:pb-24">
			<Link
				href={backHref}
				className="inline-flex min-h-11 items-center gap-1.5 text-sm font-semibold text-brand"
			>
				<ArrowLeft aria-hidden className="size-4" />
				All {isScholarship ? "scholarships" : "opportunities"}
			</Link>
			<article className="mt-4 max-w-3xl">
				<p className="label text-accent-text">
					{isScholarship ? "Scholarship" : "Opportunity"}
				</p>
				<div className="mt-2 flex items-start justify-between gap-4">
					<div className="min-w-0 flex-1">
						<h1 className="text-3xl sm:text-5xl">{listing.title}</h1>
						<p className="label mt-3 text-muted">{listing.organization}</p>
					</div>
					{listing.imageUrl ? (
						<div className="relative size-16 shrink-0 overflow-hidden rounded-xl bg-surface-2 sm:size-20">
							<Image
								src={listing.imageUrl}
								alt=""
								fill
								unoptimized
								priority
								sizes="80px"
								className="object-cover"
							/>
						</div>
					) : null}
				</div>
				{isExpired(listing) ? (
					<p className="mt-4 rounded-xl border border-hairline bg-surface-2 px-4 py-3 text-sm">
						This one has closed. Browse the current{" "}
						{isScholarship ? "scholarships" : "opportunities"} for what’s open
						now.
					</p>
				) : null}
				{isClosingSoon(listing) ? (
					<p className="label mt-4 inline-flex items-center gap-1 rounded-sm bg-danger px-2 py-0.5 text-bg">
						<Clock aria-hidden className="size-3" />
						Closing soon
						{days === 0 ? " · today" : ` · ${days} day${days === 1 ? "" : "s"}`}
					</p>
				) : null}
				<p className="mt-6 text-lg">
					<Md>{listing.summary}</Md>
				</p>
				<dl className="mt-6 grid gap-x-6 gap-y-4 rounded-2xl border border-hairline bg-surface p-5 sm:grid-cols-2">
					{stubFields(listing).map((field) => (
						<div key={field.label}>
							<dt className="label text-muted">{field.label}</dt>
							<dd className="mt-1 font-semibold">{field.value}</dd>
						</div>
					))}
				</dl>
				{listing.description ? (
					<div
						className="prose-club mt-8"
						dangerouslySetInnerHTML={{
							__html: renderMarkdown(listing.description),
						}}
					/>
				) : null}
				{listing.tags.length > 0 ? (
					<ul className="mt-6 flex flex-wrap gap-1.5" aria-label="Tags">
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
					className={buttonClasses("accent", "mt-8")}
				>
					Learn more and apply
					<ArrowUpRight aria-hidden className="btn-arrow size-4" />
					<span className="sr-only">
						(opens {listing.organization} in a new tab)
					</span>
				</a>
			</article>
		</Container>
	);
}
