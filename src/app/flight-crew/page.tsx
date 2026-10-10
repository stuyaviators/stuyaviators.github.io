import type { CrewMember } from "@/content/crew";
import type { Metadata } from "next";
import { Stagger } from "@/components/TransitionProvider";
import { ButtonLink } from "@/components/ui/Button";
import { Initials } from "@/components/ui/Initials";
import { PageHero } from "@/components/ui/PageHero";
import { Section } from "@/components/ui/Section";
import { crewApplyUrl, crewGroups } from "@/content/crew";
import { pageIntros } from "@/content/pages";
import { photos } from "@/content/photos";
import { crewCopy, positions } from "@/content/positions";
import { ArrowUpRight } from "lucide-react";
import Image from "next/image";

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

function MemberCard({ member }: { readonly member: CrewMember }) {
	const name = member.classOf
		? `${member.name} (${member.classOf})`
		: member.name;
	return (
		<li className="overflow-hidden rounded-lg border border-hairline bg-surface">
			<div className="relative aspect-square bg-surface-2">
				{member.photo ? (
					<Image
						src={member.photo}
						alt={`Portrait of ${member.name}`}
						fill
						placeholder="blur"
						sizes="(min-width: 1024px) 22vw, (min-width: 640px) 33vw, 50vw"
						className="object-cover"
					/>
				) : (
					<Initials name={member.name} className="absolute inset-0" />
				)}
			</div>
			<div className="border-t border-dashed border-hairline p-4">
				<p className="font-semibold">{name}</p>
				<p className="label mt-1 text-muted">{member.role}</p>
			</div>
		</li>
	);
}

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
					Apply now <ArrowUpRight aria-hidden className="size-4" />
				</ButtonLink>
				<ButtonLink href="#positions" variant="secondary">
					See positions
				</ButtonLink>
			</PageHero>

			{crewGroups.map((group, index) => (
				<Section
					key={group.id}
					id={group.id}
					index={index + 1}
					label={group.title}
					title={group.title}
					intro={
						group.introKey ? crewCopy.groupIntros[group.introKey] : undefined
					}
					className={index > 0 ? "pt-0 sm:pt-0" : undefined}
				>
					<ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
						{group.members.map((member) => (
							<MemberCard key={member.name} member={member} />
						))}
					</ul>
				</Section>
			))}

			<Section
				id="positions"
				index={crewGroups.length + 1}
				label="Positions"
				title="Positions"
				intro={crewCopy.positionsIntro}
			>
				<div className="grid gap-4">
					{positions.map((position) => {
						const level = commitmentLevel[position.commitment] ?? 0;
						return (
							<Stagger key={position.title}>
								<details className="group rounded-lg border border-hairline bg-surface open:shadow-card">
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
									<div className="grid gap-6 border-t border-dashed border-hairline p-5 sm:grid-cols-2 sm:p-6">
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

			<section aria-labelledby="apply-heading" className="pb-20">
				<div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
					<div className="rounded-lg bg-navy px-6 py-10 text-[#eef4ff] sm:px-10">
						<h2 id="apply-heading" className="text-3xl">
							{crewCopy.joinHeading}
						</h2>
						<p className="mt-4 max-w-3xl text-[#a9bedd]">{crewCopy.joinBody}</p>
						<a
							href={crewApplyUrl}
							target="_blank"
							rel="noopener noreferrer"
							className="mt-6 inline-flex min-h-11 items-center gap-2 rounded-md bg-ice px-5 py-2.5 text-sm font-semibold text-navy"
						>
							Apply now <ArrowUpRight aria-hidden className="size-4" />
						</a>
						<p className="mt-3 text-sm text-[#a9bedd]">
							The application form asks you to sign in with your Stuy Google
							account.
						</p>
					</div>
				</div>
			</section>
		</>
	);
}
