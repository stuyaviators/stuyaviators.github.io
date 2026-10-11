import type { ListingKind } from "@/lib/listings";
import type { Metadata } from "next";
import { site } from "@/content/site";
import { listingPath } from "@/lib/listing-path";
import { getPublishedListing } from "@/lib/listings";
import { renderOg, renderPictureOg } from "@/lib/og";
import { fetchOgPicture } from "@/lib/og-picture";
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

	// A card with its own picture shares that picture; one without (or with a
	// picture we can't draw) gets the usual club-photo card.
	const picture = await fetchOgPicture(listing.imageUrl ?? undefined);
	if (picture) {
		return renderPictureOg({
			picture,
			label: `${noun} · ${listing.organization}`.slice(0, 48),
		});
	}

	let detail: string | undefined;
	if (kind === "opportunity") {
		const when = listing.startDate ?? listing.deadline;
		detail = when ? formatDate(when) : undefined;
	} else if (listing.deadline) {
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
