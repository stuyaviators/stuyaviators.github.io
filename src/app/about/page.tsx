import type { Metadata } from "next";
import { Paragraphs } from "@/components/Md";
import { Stagger } from "@/components/TransitionProvider";
import { ButtonLink } from "@/components/ui/Button";
import { PageHero } from "@/components/ui/PageHero";
import { RunwayDivider, Section } from "@/components/ui/Section";
import Waypoints from "@/components/Waypoints";
import { about } from "@/content/about";
import { pageIntros } from "@/content/pages";
import { photos } from "@/content/photos";
import Image from "next/image";

export const metadata: Metadata = {
	title: "Our Mission & Project Skylab",
	description: pageIntros.about.intro,
	alternates: { canonical: "/about" },
};

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
			/>

			<Section
				id="skylab"
				index={1}
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
					<Stagger className="relative aspect-[3/4] overflow-hidden rounded-lg border border-hairline bg-surface-2">
						<Image
							src={photos.heroWorksheets.src}
							alt={photos.heroWorksheets.alt}
							fill
							placeholder="blur"
							sizes="(min-width: 1024px) 35vw, 100vw"
							className="object-cover"
						/>
					</Stagger>
				</div>
			</Section>

			<RunwayDivider />

			<Section
				id="impact"
				index={2}
				label="Impact & benefits"
				title={about.impact.heading}
			>
				<div className="grid gap-6 sm:grid-cols-2">
					{about.impact.items.map((item, index) => (
						<Stagger key={item.title}>
							<article className="h-full rounded-lg border border-hairline bg-surface p-6">
								<p className="font-mono text-sm text-accent-text">
									{String(index + 1).padStart(2, "0")}
								</p>
								<h3 className="mt-1 text-xl">{item.title}</h3>
								<p className="mt-3 text-muted">{item.body}</p>
							</article>
						</Stagger>
					))}
				</div>
			</Section>

			<Section
				id="objectives"
				index={3}
				label="Flight plan"
				title={about.objectives.heading}
			>
				<Stagger>
					<p className="mb-10 max-w-3xl text-lg text-muted">{intro}</p>
				</Stagger>
				<Waypoints
					items={about.objectives.stages.map((summary, index) => ({
						key: summary,
						label: stageLabels[index],
						content: (
							<>
								<p className="text-xl font-semibold">{summary}</p>
								{stageDetails.at(index) === undefined ? null : (
									<p className="mt-3 max-w-3xl text-muted">
										{stageDetails.at(index)}
									</p>
								)}
							</>
						),
					}))}
				/>
				<div className="mt-12 flex flex-wrap gap-3">
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
