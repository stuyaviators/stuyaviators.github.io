import type { Metadata } from "next";
import CrewChart from "@/components/CrewChart";
import { Stagger } from "@/components/TransitionProvider";
import { ButtonLink, buttonClasses } from "@/components/ui/Button";
import { PageHero } from "@/components/ui/PageHero";
import { Section } from "@/components/ui/Section";
import {
	crewApplyUrl,
	crewGroups,
	partnerClubs,
	pastAllianceMembers,
} from "@/content/crew";
import { pageIntros } from "@/content/pages";
import { photos } from "@/content/photos";
import { crewCopy, positions } from "@/content/positions";
import { ArrowUpRight } from "lucide-react";

export const metadata: Metadata = {
	title: "The Flight Crew",
	description: pageIntros.flightCrew.intro,
	alternates: { canonical: "/flight-crew" },
};

const commitmentLevel: Record<string, number> = {
	"Very High": 5,
	High: 4,
	Medium: 3,
	Low: 2,
	"Very Low": 1,
};

export default function FlightCrewPage() {
	return (
		<>
			<PageHero
				eyebrow="Community · Flight crew"
				title="The Flight Crew"
				intro={pageIntros.flightCrew.intro}
				image={photos.heroClassroomMeeting.src}
				imageAlt={photos.heroClassroomMeeting.alt}
			>
				<ButtonLink href={crewApplyUrl} variant="accent">
					Apply now <ArrowUpRight aria-hidden className="btn-arrow size-4" />
				</ButtonLink>
				<ButtonLink href="#crew" variant="secondary">
					Meet the crew
				</ButtonLink>
			</PageHero>

			<Section
				id="crew"
				label="2026–27"
				title="Meet the crew"
				intro={crewCopy.groupIntros.current}
			>
				<CrewChart
					groups={crewGroups}
					partners={partnerClubs}
					allianceIntro={crewCopy.groupIntros.alliance}
					pastExtra={pastAllianceMembers}
				/>
			</Section>

			<Section
				id="positions"
				label="Positions"
				title="Positions"
				intro={crewCopy.positionsIntro}
			>
				<div className="grid gap-4">
					{positions.map((position) => {
						const level = commitmentLevel[position.commitment] ?? 0;
						return (
							<Stagger key={position.title}>
								<details className="group rounded-3xl bg-surface open:shadow-card">
									<summary className="flex cursor-pointer list-none flex-wrap items-center justify-between gap-3 p-5 sm:p-6 [&::-webkit-details-marker]:hidden">
										<h3 className="text-lg">{position.title}</h3>
										<span className="flex items-center gap-3">
											<span className="label text-muted">
												{position.commitment} commitment
											</span>
											<span aria-hidden className="flex gap-0.5">
												{[1, 2, 3, 4, 5].map((n) => (
													<span
														key={n}
														className={`h-3 w-1.5 rounded-sm ${n <= level ? "bg-brand" : "bg-hairline"}`}
													/>
												))}
											</span>
										</span>
									</summary>
									<div className="grid gap-6 border-t border-hairline p-5 sm:grid-cols-2 sm:p-6">
										<div>
											<h4 className="label text-accent-text">
												Responsibilities
											</h4>
											<ul className="prose-club mt-2 text-sm">
												{position.responsibilities.map((item) => (
													<li key={item}>{item}</li>
												))}
											</ul>
										</div>
										<div>
											<h4 className="label text-accent-text">
												{position.requirementsLabel}
											</h4>
											<ul className="prose-club mt-2 text-sm">
												{position.requirements.map((item) => (
													<li key={item}>{item}</li>
												))}
											</ul>
										</div>
									</div>
								</details>
							</Stagger>
						);
					})}
				</div>
			</Section>

			<section aria-labelledby="apply-heading" className="scene-section pb-20">
				<div className="scene mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">
					<div className="on-dark rounded-3xl bg-ink px-6 py-12 sm:px-12 sm:py-16">
						<h2 id="apply-heading" className="text-3xl">
							{crewCopy.joinHeading}
						</h2>
						<p className="mt-4 max-w-3xl text-muted">{crewCopy.joinBody}</p>
						<a
							href={crewApplyUrl}
							target="_blank"
							rel="noopener noreferrer"
							className={buttonClasses("accent", "mt-6")}
						>
							Apply now{" "}
							<ArrowUpRight aria-hidden className="btn-arrow size-4" />
						</a>
						<p className="mt-3 text-sm text-muted">
							The application form asks you to sign in with your Stuy Google
							account.
						</p>
					</div>
				</div>
			</section>
		</>
	);
}
