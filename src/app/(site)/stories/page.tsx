import type { Metadata } from "next";
import SubmissionForm from "@/components/forms/SubmissionForm";
import { Md, Paragraphs } from "@/components/Md";
import { Stagger } from "@/components/TransitionProvider";
import { ButtonLink } from "@/components/ui/Button";
import { PageHero } from "@/components/ui/PageHero";
import { Section } from "@/components/ui/Section";
import { pageIntros } from "@/content/pages";
import { photos } from "@/content/photos";
import { storiesCopy } from "@/content/stories";
import Image from "next/image";

export const metadata: Metadata = {
	title: "Member Stories",
	description: pageIntros.stories.intro,
	alternates: { canonical: "/stories" },
};

const storyPhotos = [
	photos.storyYunusGubrud,
	photos.storyJerryQiu,
	photos.storyMatthewMonge,
];

export default function StoriesPage() {
	return (
		<>
			<PageHero
				eyebrow="Community · Member stories"
				title="Share Your Story"
				intro={pageIntros.stories.intro}
				image={photos.heroCessnaBackseat.src}
				imageAlt={photos.heroCessnaBackseat.alt}
			>
				<ButtonLink href="#stories" variant="accent">
					Read stories
				</ButtonLink>
				<ButtonLink href="#share" variant="secondary">
					Share yours
				</ButtonLink>
			</PageHero>
			<Section
				pin
				id="stories"
				label={storiesCopy.spotlightHeading}
				title={storiesCopy.sharedHeading}
				intro={storiesCopy.sharedIntro}
			>
				<p className="-mt-4 mb-10 max-w-3xl text-muted">
					{storiesCopy.spotlightIntro}
				</p>
				<div className="space-y-10">
					{storiesCopy.stories.map((story, index) => {
						const photo = storyPhotos[index];
						return (
							<Stagger key={story.name}>
								<article className="grid overflow-hidden rounded-3xl bg-surface md:grid-cols-[18rem_1fr]">
									<div className="relative aspect-[4/3] bg-surface-2 md:aspect-auto">
										<Image
											src={photo.src}
											alt={photo.alt}
											fill
											placeholder="blur"
											sizes="(min-width: 768px) 288px, 100vw"
											className="object-cover"
										/>
									</div>
									<div className="p-6 sm:p-8">
										<h3 className="text-2xl">{story.name}</h3>
										<p className="label mt-1 text-muted">{story.classOf}</p>
										<Paragraphs
											items={story.body}
											className="prose-club mt-4"
										/>
									</div>
								</article>
							</Stagger>
						);
					})}
				</div>
			</Section>
			<Section
				id="share"
				className="pb-24 sm:pb-32"
				label="Share"
				title={storiesCopy.shareHeading}
			>
				<div className="grid gap-10 lg:grid-cols-[1fr_1.2fr]">
					<p className="text-lg text-muted">
						<Md>{storiesCopy.shareBody}</Md> You can also tell us here.
					</p>
					<SubmissionForm
						type="story"
						submitLabel="Share my story"
						successMessage="Thanks for sharing! We’ll be in touch."
						fields={[
							{ name: "name", label: "Full name", autoComplete: "name" },
							{
								name: "email",
								label: "Email",
								type: "email",
								autoComplete: "email",
							},
							{
								name: "classOf",
								label: "Class of",
								optional: true,
								placeholder: "2028",
							},
							{
								name: "message",
								label: "Your story (or theirs)",
								type: "textarea",
								hint: "How did you get into aviation? What are you working toward?",
							},
						]}
					/>
				</div>
			</Section>
		</>
	);
}
