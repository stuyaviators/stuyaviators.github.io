import type { Metadata } from "next";
import CareerExplorer from "@/components/CareerExplorer";
import CareerQuiz from "@/components/CareerQuiz";
import { Stagger } from "@/components/TransitionProvider";
import { ButtonLink } from "@/components/ui/Button";
import { PageHero } from "@/components/ui/PageHero";
import { Container, Section } from "@/components/ui/Section";
import { careerFamilies, startNow } from "@/content/careers";
import { pageIntros } from "@/content/pages";
import { photos } from "@/content/photos";

export const metadata: Metadata = {
	title: "Careers",
	description: pageIntros.careers.intro,
	alternates: { canonical: "/careers" },
};

const total = careerFamilies.reduce(
	(sum, family) => sum + family.careers.length,
	0
);

export default function CareersPage() {
	return (
		<>
			<PageHero
				eyebrow="Explore · Future careers"
				title="Future Careers"
				intro={pageIntros.careers.intro}
				image={photos.eventAirlineBooth.src}
				imageAlt={photos.eventAirlineBooth.alt}
			>
				<ButtonLink href="#quiz" variant="accent">
					Take the career finder
				</ButtonLink>
				<ButtonLink href="#explore" variant="secondary">
					Browse {total} careers
				</ButtonLink>
				<ButtonLink href="#start" variant="ghost">
					High school first steps
				</ButtonLink>
			</PageHero>

			<Section
				id="quiz"
				label="Career finder"
				title="Which path fits you?"
				intro="Thirteen quick questions, one at a time. We’ll score how well each career family matches you."
			>
				<CareerQuiz
					families={careerFamilies.map(({ id, name, summary }) => ({
						id,
						name,
						summary,
					}))}
				/>
			</Section>

			<Section
				id="explore"
				label="Career pathways"
				title="Explore every path"
				intro="Search all the roles in aviation, aerospace and STEM, or filter by family. Tap a career for how to get there."
				className="scroll-mt-20"
			>
				<p className="-mt-2 mb-6">
					<a href="#start" className="text-link text-sm">
						Skip to first steps you can take in high school ↓
					</a>
				</p>
				<CareerExplorer families={careerFamilies} />
				<p className="mt-8">
					<a href="#start" className="text-link">
						Done browsing? Jump to first steps in high school ↓
					</a>
				</p>
			</Section>

			<Container className="scene-section">
				<section
					id="start"
					aria-labelledby="start-h"
					className="scene on-dark scroll-mt-24 rounded-3xl bg-ink p-6 sm:p-12"
				>
					<p className="label text-accent-text">Start now</p>
					<h2 id="start-h" className="mt-2 text-3xl sm:text-4xl">
						First steps you can take in high school
					</h2>
					<ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
						{startNow.map((step) => (
							<Stagger as="li" key={step.title}>
								<div className="h-full rounded-2xl bg-white/5 p-5">
									<p className="font-semibold">{step.title}</p>
									<p className="mt-1 text-sm text-muted">{step.body}</p>
								</div>
							</Stagger>
						))}
					</ul>
					<p className="mt-6 text-sm text-muted">
						Requirements change. Always check with the program or employer before you
						apply.
					</p>
				</section>
			</Container>
		</>
	);
}
