import type { ListingKind } from "@/lib/listings";
import type { BrowserItem } from "./ListingBrowser.tsx";
import { Stagger } from "@/components/TransitionProvider";
import { buttonClasses } from "@/components/ui/Button";
import { Section } from "@/components/ui/Section";
import { getPublishedListings, isExpired } from "@/lib/listings";
import { Bell, Compass } from "lucide-react";
import Link from "next/link";
import ListingBrowser from "./ListingBrowser.tsx";
import ListingCard from "./ListingCard.tsx";

/**
Shared body for /opportunities and /scholarships.
*/
export default async function ListingsSection({
	kind,
	intro,
	emptyText,
}: {
	readonly kind: ListingKind;
	readonly intro: string;
	readonly emptyText: string;
}) {
	const listings = await getPublishedListings(kind);
	const noun = kind === "scholarship" ? "scholarships" : "opportunities";
	const toItem = (listing: (typeof listings)[number]): BrowserItem => ({
		id: listing.id,
		tags: listing.tags,
		searchText: [
			listing.title,
			listing.organization,
			listing.summary,
			listing.description,
			listing.eligibility,
			listing.location,
			...listing.tags,
		]
			.filter(Boolean)
			.join(" ")
			.toLowerCase(),
		node: <ListingCard listing={listing} />,
	});
	const current = listings
		.filter((listing) => !isExpired(listing))
		.map((listing) => toItem(listing));
	const past = listings
		.filter((listing) => isExpired(listing))
		.map((listing) => toItem(listing));

	return (
		<Section
			id="listings"
			label={`Explore ${noun}`}
			title={`Current ${noun}`}
			intro={intro}
		>
			{current.length > 0 || past.length > 0 ? (
				<ListingBrowser items={current} past={past} noun={noun} />
			) : (
				<Stagger>
					<div className="grid overflow-hidden rounded-2xl border border-field bg-surface sm:grid-cols-[1fr_auto]">
						<div className="p-8 sm:p-10">
							<Compass aria-hidden className="size-8 text-brand" />
							<p className="label mt-4 text-accent-text">Holding pattern</p>
							<h3 className="mt-2 text-2xl">No {noun} listed right now</h3>
							<p className="mt-3 max-w-xl text-muted">{emptyText}</p>
							<div className="mt-6 flex flex-wrap gap-3">
								<a href="#mailing-list" className={buttonClasses("accent")}>
									<Bell aria-hidden className="size-4" /> Get notified on the
									mailing list
								</a>
								<Link href="/careers" className={buttonClasses("secondary")}>
									Explore careers
								</Link>
							</div>
						</div>
						<div
							aria-hidden
							className="hidden w-40 border-l border-field bg-surface-2 p-5 font-mono text-sm text-muted sm:block"
						>
							<p className="label">Status</p>
							<p className="mt-1">STANDBY</p>
							<p className="label mt-4">Gate</p>
							<p className="mt-1">TBA</p>
						</div>
					</div>
				</Stagger>
			)}
		</Section>
	);
}
