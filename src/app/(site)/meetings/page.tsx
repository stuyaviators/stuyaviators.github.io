import type { Metadata } from "next";
import DepartureBoard from "@/components/DepartureBoard";
import SubmissionForm from "@/components/forms/SubmissionForm";
import { Paragraphs } from "@/components/Md";
import { Stagger } from "@/components/TransitionProvider";
import { ButtonLink } from "@/components/ui/Button";
import { PageHero } from "@/components/ui/PageHero";
import StackingCards from "@/components/motion/StackingCards";
import { Section } from "@/components/ui/Section";
import { charter } from "@/content/charter";
import { meetingImages } from "@/content/meeting-images";
import { meetings } from "@/content/meetings";
import { pageIntros } from "@/content/pages";
import { photos } from "@/content/photos";
import { getUpcomingMeetings } from "@/lib/meetings";
import Image from "next/image";

export const revalidate = 3600;

export const metadata: Metadata = {
	title: "Meetings",
	description: pageIntros.meetings.intro,
	alternates: { canonical: "/meetings" },
};

export default async function MeetingsPage() {
	const upcoming = await getUpcomingMeetings(new Date(), 10);
	const schedule = charter.sections.filter((section) =>
		["when-we-meet", "schedule", "meeting-structure"].includes(section.id)
	);

	return (
		<>
			<PageHero
				eyebrow="Explore · Meetings"
				title="Meetings"
				intro={pageIntros.meetings.intro}
				image={photos.heroSimSetup.src}
				imageAlt={photos.heroSimSetup.alt}
			>
				<ButtonLink href="#upcoming" variant="accent">
					Upcoming meetings
				</ButtonLink>
				<ButtonLink href="#types" variant="secondary">
					Meeting types
				</ButtonLink>
			</PageHero>

			<Section
				pin
				id="upcoming"
				label="Departures"
				title="Upcoming meetings"
			>
				<Stagger>
					<DepartureBoard meetings={upcoming} showAllLink={false} />
				</Stagger>
			</Section>

			<Section
				id="types"
				label="Types of meetings"
				title="What happens at a meeting"
				intro={meetings.typesIntro}
			>
				<StackingCards>
					{meetings.types.map((type, index) => {
						const photo = meetingImages[index];
						return (
							<article
								key={type.name}
								id={type.code?.toLowerCase() ?? `type-${index + 1}`}
								className="grid h-full scroll-mt-28 grid-rows-[11rem_1fr] overflow-hidden rounded-3xl border border-hairline bg-surface shadow-card sm:grid-rows-[14rem_1fr] md:grid-cols-[1fr_1.1fr] md:grid-rows-1"
							>
								<div className="relative bg-surface-2">
									<Image
										src={photo.src}
										alt={photo.alt}
										fill
										placeholder="blur"
										sizes="(min-width: 768px) 50vw, 100vw"
										className="object-cover"
									/>
								</div>
								<div className="min-h-0 overflow-hidden p-6 sm:p-10">
									<p className="label text-accent-text">
										{type.code ?? `Type ${String(index + 1).padStart(2, "0")}`}
										{type.isNew ? " · New" : ""}
									</p>
									<h3 className="mt-2 text-2xl sm:text-3xl">{type.name}</h3>
									<p className="mt-2 font-medium text-muted">{type.tagline}</p>
									<p className="mt-4 line-clamp-5 sm:line-clamp-6 md:line-clamp-none">
										{type.description}
									</p>
								</div>
							</article>
						);
					})}
				</StackingCards>
			</Section>

			<Section pin id="schedule" label="Schedule" title="When we meet">
				<div className="grid gap-8 lg:grid-cols-3">
					{schedule.map((section) => (
						<Stagger key={section.id}>
							<h3 className="label text-accent-text">{section.title}</h3>
							<Paragraphs
								items={section.paragraphs}
								className="prose-club mt-3"
							/>
						</Stagger>
					))}
				</div>
			</Section>

			<Section
				pin
				id="ideas"
				label="Suggestions"
				title={meetings.ideaHeading}
				intro={meetings.ideaIntro}
			>
				<div className="max-w-2xl">
					<SubmissionForm
						type="meeting_idea"
						submitLabel="Let us know!"
						successMessage="Thanks for your input!"
						fields={[
							{
								name: "name",
								label: "Full name",
								optional: true,
								autoComplete: "name",
							},
							{
								name: "email",
								label: "Email",
								type: "email",
								optional: true,
								autoComplete: "email",
							},
							{ name: "message", label: "Suggestion", type: "textarea" },
						]}
					/>
				</div>
			</Section>
		</>
	);
}
