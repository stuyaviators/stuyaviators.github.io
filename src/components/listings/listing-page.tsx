import type { ListingKind } from "@/lib/listings";
import type { OgFact } from "@/lib/og";
import type { Metadata } from "next";
import { site } from "@/content/site";
import { listingPath } from "@/lib/listing-path";
import { getPublishedListing } from "@/lib/listings";
import { renderOg, renderPictureOg } from "@/lib/og";
import { fetchOgPicture } from "@/lib/og-picture";
import { notFound } from "next/navigation";
import { stubFields } from "./ListingCard.tsx";
import ListingDetail from "./ListingDetail.tsx";

/*
 * Shared by /opportunities/[slug] and /scholarships/[slug]: the page, its
 * metadata and its Open Graph image all come from the card.
 */

async function slugOf(parameters: Promise<{ slug: string }>) {
	const { slug } = await parameters;
	return slug;
}

async function load(kind: ListingKind, slug: string) {
	return getPublishedListing(kind, slug);
}

export async function listingMetadata(
	kind: ListingKind,
	parameters: Promise<{ slug: string }>
): Promise<Metadata> {
	const listing = await load(kind, await slugOf(parameters));
	if (!listing) {
		return { title: "Not found", robots: { index: false } };
	}

	return {
		title: listing.title,
		description: listing.summary.slice(0, 200),
		alternates: { canonical: `${site.url}${listingPath(listing)}` },
	};
}

export async function ListingPage({
	kind,
	parameters,
}: {
	readonly kind: ListingKind;
	readonly parameters: Promise<{ slug: string }>;
}) {
	const listing = await load(kind, await slugOf(parameters));
	if (!listing) {
		notFound();
	}

	return <ListingDetail listing={listing} />;
}

export async function renderListingOg({
	kind,
	parameters,
	photo,
}: {
	readonly kind: ListingKind;
	readonly parameters: Promise<{ slug: string }>;
	readonly photo: Uint8Array;
}) {
	const listing = await load(kind, await slugOf(parameters));
	const noun = kind === "scholarship" ? "Scholarship" : "Opportunity";
	if (!listing) {
		return renderOg({ title: noun, eyebrow: "StuyAviators", photo });
	}

	// The same facts the card shows (an opportunity says "RSVP by" or "Date",
	// never "Deadline"), trimmed to fit.
	const facts: OgFact[] = [];
	for (const { label, value } of stubFields(listing).slice(0, 4)) {
		if (typeof value === "string") {
			facts.push({
				label,
				value: value.length > 60 ? `${value.slice(0, 59).trimEnd()}…` : value,
			});
		}
	}

	const title = listing.title.slice(0, 90);
	const eyebrow = `${noun} · ${listing.organization}`.slice(0, 60);

	// A card with its own picture shares that picture, filling the card; one
	// without (or with a picture we can't draw) gets the usual club-photo card.
	const picture = await fetchOgPicture(listing.imageUrl ?? undefined);
	return picture
		? renderPictureOg({ picture, title, eyebrow, facts })
		: renderOg({ title, eyebrow, photo, facts });
}
