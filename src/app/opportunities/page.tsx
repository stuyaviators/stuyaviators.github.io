import type { Metadata } from "next";
import ListingsSection from "@/components/listings/ListingsPage";
import { PageHero } from "@/components/ui/PageHero";
import { listingCopy } from "@/content/listings";
import { pageIntros } from "@/content/pages";
import { photos } from "@/content/photos";

export const revalidate = 3600;

export const metadata: Metadata = {
	title: "Opportunities",
	description: pageIntros.opportunities.intro,
	alternates: { canonical: "/opportunities" },
};

export default function OpportunitiesPage() {
	return (
		<>
			<PageHero
				eyebrow="Explore · Opportunities"
				title="Opportunities"
				intro={pageIntros.opportunities.intro}
				image={photos.eventAviationHsPanel.src}
				imageAlt={photos.eventAviationHsPanel.alt}
			/>
			<ListingsSection
				kind="opportunity"
				intro={listingCopy.opportunities.intro}
				emptyText={listingCopy.opportunities.empty}
			/>
		</>
	);
}
