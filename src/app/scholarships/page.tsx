import type { Metadata } from "next";
import ListingsSection from "@/components/listings/ListingsPage";
import { ButtonLink, buttonClasses } from "@/components/ui/Button";
import { PageHero } from "@/components/ui/PageHero";
import { listingCopy } from "@/content/listings";
import { pageIntros } from "@/content/pages";
import { photos } from "@/content/photos";

export const revalidate = 3600;

export const metadata: Metadata = {
	title: "Scholarships",
	description: pageIntros.scholarships.intro,
	alternates: { canonical: "/scholarships" },
};

export default function ScholarshipsPage() {
	return (
		<>
			<PageHero
				eyebrow="Explore · Scholarships"
				title="Scholarships"
				intro={pageIntros.scholarships.intro}
				image={photos.heroCessnaSunset.src}
				imageAlt={photos.heroCessnaSunset.alt}
			>
				<ButtonLink href="#listings" variant="accent">
					Browse scholarships
				</ButtonLink>
				<a href="#mailing-list" className={buttonClasses("secondary")}>
					Get notified
				</a>
			</PageHero>
			<ListingsSection
				kind="scholarship"
				intro={listingCopy.scholarships.intro}
				emptyText={listingCopy.scholarships.empty}
			/>
		</>
	);
}
