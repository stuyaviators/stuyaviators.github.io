import type { Metadata } from "next";
import { Paragraphs } from "@/components/Md";
import { PageHero } from "@/components/ui/PageHero";
import { Section } from "@/components/ui/Section";
import Waypoints from "@/components/Waypoints";
import { pageIntros } from "@/content/pages";
import { photos } from "@/content/photos";
import { story } from "@/content/story";
import Image from "next/image";

export const metadata: Metadata = {
	title: "Our Story",
	description: pageIntros.story.intro,
	alternates: { canonical: "/story" },
};

export default function StoryPage() {
	const speaker = photos.storyFirstGuestSpeaker;
	return (
		<>
			<PageHero
				eyebrow="About · Our story"
				title="Our Story"
				intro={pageIntros.story.intro}
				image={photos.heroLandingChallenge.src}
				imageAlt={photos.heroLandingChallenge.alt}
			/>
			<Section
				id="timeline"
				index={1}
				label="Flight log"
				title="From hobby to initiative"
			>
				<Waypoints
					items={[
						{
							key: "founded",
							label: "Nov 19, 2022 · Departure",
							content: (
								<>
									<h3 className="text-2xl">{story.founded}</h3>
									<Paragraphs
										items={story.origin}
										className="prose-club mt-4"
									/>
								</>
							),
						},
						{
							key: "hobby",
							label: "Early days · Climb",
							content: (
								<>
									<h3 className="text-2xl">{story.hobbyHeading}</h3>
									<Paragraphs items={story.hobby} className="prose-club mt-4" />
								</>
							),
						},
						{
							key: "skylab",
							label: "2024–25 · Project Skylab",
							content: (
								<>
									<h3 className="text-2xl">{story.skylabHeading}</h3>
									<Paragraphs
										items={story.skylab}
										className="prose-club mt-4"
									/>
								</>
							),
						},
						{
							key: "speaker",
							label: "Jan 8, 2025 · First guest speaker",
							content: (
								<figure className="max-w-2xl">
									<div className="relative aspect-[4/3] overflow-hidden rounded-lg border border-hairline bg-surface-2">
										<Image
											src={speaker.src}
											alt={speaker.alt}
											fill
											placeholder="blur"
											sizes="(min-width: 768px) 672px, 100vw"
											className="object-cover"
										/>
									</div>
									<figcaption className="mt-3 text-muted">
										{story.firstSpeakerCaption}
									</figcaption>
								</figure>
							),
						},
					]}
				/>
			</Section>
		</>
	);
}
