import { Bell, Compass } from "lucide-react";
import Link from "next/link";
import { Stagger } from "@/components/TransitionProvider";
import { buttonClasses } from "@/components/ui/Button";
import { Section } from "@/components/ui/Section";
import { getPublishedListings, isExpired, type ListingKind } from "@/lib/listings";
import ListingBrowser, { type BrowserItem } from "./ListingBrowser";
import ListingCard from "./ListingCard";

/** Shared body for /opportunities and /scholarships. */
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
		searchText: [listing.title, listing.organization, listing.summary, listing.description, listing.eligibility, listing.location, ...listing.tags]
			.filter(Boolean)
			.join(" ")
			.toLowerCase(),
		node: <ListingCard listing={listing} />,
	});
	const current = listings.filter((listing) => !isExpired(listing)).map(toItem);
	const past = listings.filter((listing) => isExpired(listing)).map(toItem);

	return (
		<Section id="listings" index={1} label={`Explore ${noun}`} title={`Current ${noun}`} intro={intro}>
			{current.length > 0 || past.length > 0 ? (
				<ListingBrowser items={current} past={past} noun={noun} />
			) : (
				<Stagger>
					<div className="grid overflow-hidden rounded-lg border border-dashed border-field bg-surface sm:grid-cols-[1fr_auto]">
						<div className="p-8 sm:p-10">
							<Compass aria-hidden className="size-8 text-brand" />
							<p className="label mt-4 text-accent-text">Holding pattern</p>
							<h3 className="mt-2 text-2xl">No {noun} listed right now</h3>
							<p className="mt-3 max-w-xl text-muted">{emptyText}</p>
							<div className="mt-6 flex flex-wrap gap-3">
								<Link href="/connect#mailing-list" className={buttonClasses("accent")}>
									<Bell aria-hidden className="size-4" /> Get notified on the mailing list
								</Link>
								<Link href="/careers" className={buttonClasses("secondary")}>Explore careers</Link>
							</div>
						</div>
						<div aria-hidden className="hidden w-40 border-l border-dashed border-field bg-surface-2 p-5 font-mono text-sm text-muted sm:block">
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
