import type { Metadata } from "next";
import SubmissionForm from "@/components/forms/SubmissionForm";
import Lightbox from "@/components/Lightbox";
import { Md } from "@/components/Md";
import { ButtonLink } from "@/components/ui/Button";
import { PageHero } from "@/components/ui/PageHero";
import { Section } from "@/components/ui/Section";
import { galleryCopy } from "@/content/gallery";
import { pageIntros } from "@/content/pages";
import { photoSpecs } from "@/content/photo-specs";
import { galleryPhotos, photos, spotlightPhotos } from "@/content/photos";

export const metadata: Metadata = {
	title: "Gallery",
	description: pageIntros.gallery.intro,
	alternates: { canonical: "/gallery" },
};

export default function GalleryPage() {
	const images = [...galleryPhotos, ...spotlightPhotos].map((key) => ({
		...photos[key],
		spec: photoSpecs[key],
	}));
	return (
		<>
			<PageHero
				eyebrow="Community · Gallery"
				title="Community Highlights"
				intro={pageIntros.gallery.intro}
				image={photos.galleryStrutCoastline.src}
				imageAlt={photos.galleryStrutCoastline.alt}
			>
				<ButtonLink href="#features" variant="accent">
					Browse photos
				</ButtonLink>
				<ButtonLink href="#submit" variant="secondary">
					Share your photos
				</ButtonLink>
			</PageHero>
			<Section
				id="features"
				label={galleryCopy.featuresHeading}
				title={galleryCopy.momentsHeading}
				intro={galleryCopy.momentsIntro}
			>
				<p className="-mt-4 mb-10 max-w-3xl text-muted">
					{galleryCopy.featuresIntro}
				</p>
				<Lightbox images={images} />
			</Section>
			<Section
				pin
				id="submit"
				label="Submit"
				title={galleryCopy.submitHeading}
			>
				<div className="grid gap-10 lg:grid-cols-[1fr_1.2fr]">
					<p className="text-lg text-muted">
						<Md>{galleryCopy.submitBody}</Md> Or use the form to send us a link
						to your photos or videos.
					</p>
					<SubmissionForm
						type="photo"
						submitLabel="Submit photos"
						successMessage="Thanks! Our media team will take a look."
						fields={[
							{ name: "name", label: "Full name", autoComplete: "name" },
							{
								name: "email",
								label: "Email",
								type: "email",
								autoComplete: "email",
							},
							{
								name: "link",
								label: "Link to your photos or videos",
								type: "url",
								placeholder: "https://drive.google.com/…",
								hint: "Google Drive, Google Photos, YouTube or Instagram link. Make sure it’s shared publicly.",
							},
							{
								name: "message",
								label: "What are the photos or videos about?",
								type: "textarea",
							},
						]}
					/>
				</div>
			</Section>
		</>
	);
}
