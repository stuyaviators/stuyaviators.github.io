import type { Metadata } from "next";
import {
	listingMetadata,
	ListingPage,
} from "@/components/listings/listing-page";

export const revalidate = 3600;

export async function generateMetadata({
	params,
}: {
	readonly params: Promise<{ slug: string }>;
}): Promise<Metadata> {
	return listingMetadata("opportunity", params);
}

export default async function Page({
	params,
}: {
	readonly params: Promise<{ slug: string }>;
}) {
	return ListingPage({ kind: "opportunity", parameters: params });
}
