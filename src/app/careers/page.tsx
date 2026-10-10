import type { Metadata } from "next";
import CareerQuiz from "@/components/CareerQuiz";
import { Stagger } from "@/components/TransitionProvider";
import { BoardingPass } from "@/components/ui/BoardingPass";
import { FlightStrip } from "@/components/ui/FlightStrip";
import { PageHero } from "@/components/ui/PageHero";
import { Container, Section } from "@/components/ui/Section";
import { careerFamilies, startNow } from "@/content/careers";
import { pageIntros } from "@/content/pages";
import { photos } from "@/content/photos";
import { ArrowUpRight, GraduationCap } from "lucide-react";

export const metadata: Metadata = {
	title: "Future Careers",
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
				<a
					href="#quiz"
					className="inline-flex min-h-11 items-center rounded-md bg-accent px-5 py-2.5 text-sm font-semibold text-accent-ink"
				>
					Take the career finder
				</a>
				<a
					href="#families"
					className="inline-flex min-h-11 items-center rounded-md border border-field px-5 py-2.5 text-sm font-semibold"
				>
					Browse {total} careers
				</a>
			</PageHero>

			<Section
				id="quiz"
				index={1}
				label="Career finder"
				title="Which path fits you?"
				intro="Answer a few quick questions and we’ll suggest the career families to explore first."
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
				id="families"
				index={2}
				label="Career pathways"
				title="Explore career pathways"
				intro="Discover the many possibilities in aviation, aerospace, and STEM fields."
			>
				<nav aria-label="Career families">
					<ul className="flex flex-wrap gap-2">
						{careerFamilies.map((family) => (
							<li key={family.id}>
								<a
									href={`#${family.id}`}
									className="label inline-flex min-h-9 items-center rounded-sm border border-hairline bg-surface px-3 text-muted hover:border-brand hover:text-text"
								>
									{family.name} · {family.careers.length}
								</a>
							</li>
						))}
					</ul>
				</nav>
			</Section>

			<Container className="space-y-20 pb-20">
				{careerFamilies.map((family, index) => (
					<section
						key={family.id}
						id={family.id}
						aria-labelledby={`${family.id}-h`}
						className="scroll-mt-28"
					>
						<FlightStrip
							index={index + 1}
							label="Career family"
							code={`${family.careers.length} careers`}
						/>
						<div className="mt-5 grid gap-6 lg:grid-cols-[1fr_20rem]">
							<div>
								<h2 id={`${family.id}-h`} className="text-3xl">
									{family.name}
								</h2>
								<p className="mt-3 max-w-3xl text-lg text-muted">
									{family.summary}
								</p>
							</div>
							<aside className="rounded-lg border border-hairline bg-surface-2 p-5 text-sm">
								<p className="label flex items-center gap-1.5 text-accent-text">
									<GraduationCap aria-hidden className="size-4" /> Helpful
									fields of study
								</p>
								<ul className="mt-2 space-y-1">
									{family.studies.map((study) => (
										<li key={study}>{study}</li>
									))}
								</ul>
								{family.tryIt ? (
									<>
										<p className="label mt-4 text-accent-text">
											Try it at StuyAviators
										</p>
										<p className="mt-1">{family.tryIt}</p>
									</>
								) : null}
							</aside>
						</div>
						<ul className="mt-8 grid gap-4 lg:grid-cols-2">
							{family.careers.map((career) => (
								<Stagger as="li" key={career.name}>
									<BoardingPass
										as="div"
										className="h-full"
										stubTitle="Study"
										stub={career.study
											.slice(0, 3)
											.map((study, i) => ({
												label: i === 0 ? "Helpful" : "Also",
												value: study,
											}))}
									>
										<h3 className="text-lg">{career.name}</h3>
										<p className="mt-2">{career.what}</p>
										<p className="mt-3 text-sm">
											<span className="label mr-1 text-muted">Path</span>
											{career.path}
										</p>
										{career.credential ? (
											<p className="mt-2 text-sm">
												<span className="label mr-1 text-muted">
													Credential
												</span>
												{career.credential}
											</p>
										) : null}
									</BoardingPass>
								</Stagger>
							))}
						</ul>
						{family.sources.length > 0 ? (
							<p className="mt-5 flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted">
								<span>Official sources:</span>
								{family.sources.map((source) => (
									<a
										key={source.url}
										href={source.url}
										target="_blank"
										rel="noopener noreferrer"
										className="inline-flex items-center gap-1 text-brand underline-offset-4 hover:underline"
									>
										{source.label}{" "}
										<ArrowUpRight aria-hidden className="size-3" />
									</a>
								))}
							</p>
						) : null}
					</section>
				))}

				<section
					aria-labelledby="start-h"
					className="rounded-lg bg-navy p-6 text-[#eef4ff] sm:p-10"
				>
					<p className="label text-[#a9bedd]">Start now</p>
					<h2 id="start-h" className="mt-2 text-3xl">
						First steps you can take in high school
					</h2>
					<ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
						{startNow.map((step) => (
							<li
								key={step.title}
								className="rounded-md border border-[#243b63] p-4"
							>
								<p className="font-semibold">{step.title}</p>
								<p className="mt-1 text-sm text-[#a9bedd]">{step.body}</p>
							</li>
						))}
					</ul>
					<p className="mt-6 text-sm text-[#a9bedd]">
						Requirements change. Always check the official sources linked above
						before you apply.
					</p>
				</section>
			</Container>
		</>
	);
}
