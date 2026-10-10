import type { Metadata } from "next";
import Image from "next/image";
import DepartureBoard from "@/components/DepartureBoard";
import SubmissionForm from "@/components/forms/SubmissionForm";
import { Paragraphs } from "@/components/Md";
import { Stagger } from "@/components/TransitionProvider";
import { PageHero } from "@/components/ui/PageHero";
import { Section } from "@/components/ui/Section";
import { charter } from "@/content/charter";
import { meetingImages } from "@/content/meeting-images";
import { meetings } from "@/content/meetings";
import { pageIntros } from "@/content/pages";
import { photos } from "@/content/photos";
import { getUpcomingMeetings } from "@/lib/meetings";

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
			/>

			<Section id="upcoming" index={1} label="Departures" title="Upcoming meetings">
				<Stagger>
					<DepartureBoard meetings={upcoming} showAllLink={false} />
				</Stagger>
			</Section>

			<Section
				id="types"
				index={2}
				label="Types of meetings"
				title="What happens at a meeting"
				intro={meetings.typesIntro}
			>
				<ul className="grid gap-6 md:grid-cols-2">
					{meetings.types.map((type, index) => {
						const photo = meetingImages[index]!;
						return (
							<Stagger as="li" key={type.name}>
								<article
									id={type.code?.toLowerCase() ?? `type-${index + 1}`}
									className="h-full scroll-mt-28 overflow-hidden rounded-lg border border-hairline bg-surface"
								>
									<div className="relative aspect-[16/9] bg-surface-2">
										<Image
											src={photo.src}
											alt={photo.alt}
											fill
											placeholder="blur"
											sizes="(min-width: 768px) 50vw, 100vw"
											className="object-cover"
										/>
									</div>
									<div className="p-5 sm:p-6">
										<p className="label text-accent-text">
											{type.code ?? `Type ${String(index + 1).padStart(2, "0")}`}
											{type.isNew ? " · New pilot session" : ""}
										</p>
										<h3 className="mt-1 text-xl">
											{type.name}
											{type.code ? ` (${type.code})` : ""}
										</h3>
										<p className="mt-1 font-medium text-muted italic">{type.tagline}</p>
										<p className="mt-3">{type.description}</p>
									</div>
								</article>
							</Stagger>
						);
					})}
				</ul>
			</Section>

			<Section id="schedule" index={3} label="Schedule" title="When we meet">
				<div className="grid gap-8 lg:grid-cols-3">
					{schedule.map((section) => (
						<Stagger key={section.id}>
							<h3 className="label text-accent-text">{section.title}</h3>
							<Paragraphs items={section.paragraphs} className="prose-club mt-3" />
						</Stagger>
					))}
				</div>
			</Section>

			<Section
				id="ideas"
				index={4}
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
							{ name: "name", label: "Full name", optional: true, autoComplete: "name" },
							{ name: "email", label: "Email", type: "email", optional: true, autoComplete: "email" },
							{ name: "message", label: "Suggestion", type: "textarea" },
						]}
					/>
				</div>
			</Section>
		</>
	);
}
