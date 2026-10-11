import type { ListingKind } from "@/lib/listings";
import type { Metadata } from "next";
import { site } from "@/content/site";
import { listingPath } from "@/lib/listing-path";
import { getPublishedListing } from "@/lib/listings";
import { renderOg } from "@/lib/og";
import { notFound } from "next/navigation";
import { formatDate } from "./ListingCard.tsx";
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

	let detail: string | undefined;
	if (listing.deadline) {
		detail = `Deadline ${formatDate(listing.deadline)}`;
	} else if (listing.amount) {
		detail = listing.amount;
	}

	return renderOg({
		title: listing.title.slice(0, 90),
		eyebrow: `${noun} · ${listing.organization}`.slice(0, 60),
		photo,
		detail,
	});
}
