import type { Metadata } from "next";
import { Paragraphs } from "@/components/Md";
import { Stagger } from "@/components/TransitionProvider";
import { ButtonLink } from "@/components/ui/Button";
import { PageHero } from "@/components/ui/PageHero";
import Parallax from "@/components/motion/Parallax";
import TiltCard from "@/components/motion/TiltCard";
import { Section } from "@/components/ui/Section";
import { about } from "@/content/about";
import { pageIntros } from "@/content/pages";
import { photos } from "@/content/photos";
import { Accessibility, GraduationCap, Plane, Sparkles, Wrench } from "lucide-react";
import Image from "next/image";

export const metadata: Metadata = {
	title: "Our Mission & Project Skylab",
	description: pageIntros.about.intro,
	alternates: { canonical: "/about" },
};

const impactIcons = [GraduationCap, Wrench, Accessibility, Plane];

const stageLabels = [
	"Stage 01 · Community",
	"Stage 02 · Growth",
	"Stage 03 · The Skylab",
];

export default function AboutPage() {
	const [intro, ...stageDetails] = about.objectives.paragraphs;
	return (
		<>
			<PageHero
				eyebrow="About · Our mission"
				title="Our Mission"
				intro={pageIntros.about.intro}
				image={photos.heroSimDisplay.src}
				imageAlt={photos.heroSimDisplay.alt}
			>
				<ButtonLink href="#skylab" variant="accent">
					Project Skylab
				</ButtonLink>
				<ButtonLink href="#objectives" variant="secondary">
					The three stages
				</ButtonLink>
			</PageHero>

			<Section
				pin
				id="skylab"
				label="Project Skylab"
				title={about.skylab.heading}
			>
				<div className="grid gap-10 lg:grid-cols-[1.3fr_1fr]">
					<Stagger>
						<Paragraphs
							items={about.skylab.paragraphs}
							className="prose-club text-lg"
						/>
					</Stagger>
					<div className="clip-reveal relative aspect-[3/4] overflow-hidden rounded-3xl bg-surface-2">
						<Parallax distance={50}>
							<Image
								src={photos.heroWorksheets.src}
								alt={photos.heroWorksheets.alt}
								fill
								placeholder="blur"
								sizes="(min-width: 1024px) 35vw, 100vw"
								className="object-cover"
							/>
						</Parallax>
					</div>
				</div>
			</Section>

			<Section
				id="impact"
				label="Impact & benefits"
				title={about.impact.heading}
			>
				<ul className="grid gap-6 sm:grid-cols-2">
					{about.impact.items.map((item, index) => {
						const Icon = impactIcons[index] ?? Sparkles;
						return (
							<Stagger as="li" key={item.title} className="h-full">
								<TiltCard className="h-full rounded-3xl">
									<article className="flex h-full flex-col rounded-3xl border border-hairline bg-surface p-6 sm:p-8">
										<span className="inline-flex size-12 items-center justify-center rounded-2xl bg-brand/10 text-brand">
											<Icon aria-hidden className="size-6" />
										</span>
										<h3 className="mt-6 text-2xl">{item.title}</h3>
										<p className="mt-3 text-muted">{item.body}</p>
									</article>
								</TiltCard>
							</Stagger>
						);
					})}
				</ul>
			</Section>

			<Section
				id="objectives"
				label="Flight plan"
				title={about.objectives.heading}
				intro={intro}
			>
				{/* Three stages side by side, joined by a route line that draws in. */}
				<div className="relative">
					<div
						aria-hidden
						className="draw-line absolute top-6 right-[16%] left-[16%] hidden h-px bg-brand/40 lg:block"
					/>
					<ol className="grid gap-6 lg:grid-cols-3">
						{about.objectives.stages.map((summary, index) => (
							<Stagger as="li" key={summary} className="h-full">
								<article className="flex h-full flex-col">
									<span
										aria-hidden
										className="relative z-10 mx-auto hidden size-12 items-center justify-center rounded-full border-2 border-brand bg-bg font-display text-lg font-semibold text-brand lg:inline-flex"
									>
										{index + 1}
									</span>
									<div className="flex flex-1 flex-col rounded-3xl border border-hairline bg-surface p-6 sm:p-8 lg:mt-6">
										<p className="label text-accent-text">
											{stageLabels[index] ?? `Stage ${index + 1}`}
										</p>
										<h3 className="mt-3 text-2xl">{summary}</h3>
										{stageDetails.at(index) === undefined ? null : (
											<p className="mt-4 text-muted">{stageDetails.at(index)}</p>
										)}
									</div>
								</article>
							</Stagger>
						))}
					</ol>
				</div>
			</Section>

			<Section className="min-h-0 sm:py-16">
				<div className="flex flex-wrap justify-center gap-3">
					<ButtonLink href="/story" variant="secondary">
						Read our story
					</ButtonLink>
					<ButtonLink href="/charter" variant="ghost">
						Club charter
					</ButtonLink>
				</div>
			</Section>
		</>
	);
}
