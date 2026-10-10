import DepartureBoard from "@/components/DepartureBoard";
import HomeIntro from "@/components/HomeIntro";
import InstagramGrid from "@/components/InstagramGrid";
import { Stagger } from "@/components/TransitionProvider";
import { ButtonLink } from "@/components/ui/Button";
import { Container, Section } from "@/components/ui/Section";
import { home } from "@/content/home";
import { meetingImages } from "@/content/meeting-images";
import { meetings } from "@/content/meetings";
import { photos } from "@/content/photos";
import { getInstagramFeed } from "@/lib/behold";
import { getUpcomingMeetings } from "@/lib/meetings";
import { ArrowRight, Quote } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export const revalidate = 900;

// Four of the eight meeting types; the rest are on /meetings.
const featuredTypes = [0, 2, 6, 4];

export default async function Home() {
	const [upcoming, feed] = await Promise.all([
		getUpcomingMeetings(),
		getInstagramFeed(),
	]);

	return (
		<>
			<HomeIntro
				poster={photos.heroCessnaBackseat.src}
				posterAlt={photos.heroCessnaBackseat.alt}
			/>

			<Section
				id="departures"
				index={1}
				label="Next departures"
				title="Upcoming meetings"
				intro="Drop in whenever your schedule allows. No experience needed."
			>
				<Stagger>
					<DepartureBoard meetings={upcoming} />
				</Stagger>
			</Section>

			<Section
				id="what-we-do"
				index={2}
				label="What we do"
				title="Fly, investigate, present, explore"
				action={
					<ButtonLink href="/meetings#types" variant="ghost">
						All {meetings.types.length} meeting types{" "}
						<ArrowRight aria-hidden className="size-4" />
					</ButtonLink>
				}
			>
				<ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
					{featuredTypes.map((index) => {
						const type = meetings.types[index];
						const photo = meetingImages[index];
						return (
							<Stagger as="li" key={type.name}>
								<Link
									href={`/meetings#${type.code?.toLowerCase() ?? `type-${index + 1}`}`}
									className="group on-dark relative isolate flex aspect-[4/5] flex-col justify-end overflow-hidden rounded-lg bg-navy p-5"
								>
									<Image
										src={photo.src}
										alt={photo.alt}
										fill
										placeholder="blur"
										sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
										className="-z-20 object-cover transition-transform duration-500 group-hover:scale-105 motion-reduce:transition-none"
									/>
									<div
										aria-hidden
										className="absolute inset-0 -z-10 bg-linear-to-t from-navy via-navy/60 to-navy/10"
									/>
									<p className="label text-accent-text">
										{type.code ?? "Meeting"}
									</p>
									<p className="mt-1 text-xl font-semibold">{type.name}</p>
									<p className="mt-1 text-sm text-muted">{type.tagline}</p>
								</Link>
							</Stagger>
						);
					})}
				</ul>
			</Section>

			<Section
				id="members"
				index={3}
				label="From our members"
				title={home.testimonialsHeading}
			>
				<div className="grid gap-6 md:grid-cols-2">
					{home.testimonials.map((item) => (
						<Stagger key={item.author}>
							<figure className="h-full rounded-lg border border-hairline bg-surface p-6 shadow-card sm:p-8">
								<Quote aria-hidden className="size-7 text-brand" />
								<blockquote className="mt-4 text-lg">“{item.quote}”</blockquote>
								<figcaption className="label mt-5 text-muted">
									— {item.author}
								</figcaption>
							</figure>
						</Stagger>
					))}
				</div>
			</Section>

			{feed ? (
				<Section
					id="instagram"
					index={4}
					label="From the flight deck"
					title="Latest on Instagram"
					action={
						<ButtonLink
							href="https://www.instagram.com/stuyaviators"
							variant="ghost"
						>
							@stuyaviators <ArrowRight aria-hidden className="size-4" />
						</ButtonLink>
					}
				>
					<InstagramGrid posts={feed.posts} />
				</Section>
			) : null}

			<section aria-labelledby="join-heading" className="pb-20">
				<Container>
					<div className="on-dark relative isolate overflow-hidden rounded-lg bg-navy px-6 py-14 sm:px-12 sm:py-20">
						<Image
							src={photos.heroCessnaSunset.src}
							alt=""
							fill
							placeholder="blur"
							sizes="(min-width: 1152px) 1152px, 100vw"
							className="-z-20 object-cover"
						/>
						<div
							aria-hidden
							className="absolute inset-0 -z-10 bg-navy/75 sm:bg-transparent sm:bg-linear-to-r sm:from-navy/90 sm:to-navy/30"
						/>
						<p className="label text-accent-text">Cleared for takeoff</p>
						<h2
							id="join-heading"
							className="mt-2 max-w-xl text-3xl sm:text-4xl"
						>
							Join StuyAviators. No experience needed.
						</h2>
						<div className="mt-7 flex flex-wrap gap-3">
							<ButtonLink href="/join" variant="accent">
								How to join
							</ButtonLink>
							<ButtonLink href="/about" variant="secondary">
								About the club
							</ButtonLink>
						</div>
					</div>
				</Container>
			</section>
		</>
	);
}
