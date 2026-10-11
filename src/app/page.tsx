import DepartureBoard from "@/components/DepartureBoard";
import HomeIntro from "@/components/HomeIntro";
import InstagramGrid from "@/components/InstagramGrid";
import BackgroundVideo from "@/components/motion/BackgroundVideo";
import HorizontalShowcase from "@/components/motion/HorizontalShowcase";
import Parallax from "@/components/motion/Parallax";
import RevealText from "@/components/motion/RevealText";
import ScrollHighlight from "@/components/motion/ScrollHighlight";
import { Stagger } from "@/components/TransitionProvider";
import { ButtonLink } from "@/components/ui/Button";
import { FlightStrip } from "@/components/ui/FlightStrip";
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

			<section aria-label="Our mission" className="py-20 sm:py-28">
				<Container>
					<FlightStrip index={2} label="Our mission" />
					<ScrollHighlight
						text="Aviation didn’t formally exist at Stuyvesant—so we built the space for it."
						className="mt-10 max-w-5xl font-display text-4xl leading-[1.08] font-semibold tracking-tight sm:text-6xl lg:text-7xl"
					/>
					<ButtonLink href="/about" variant="secondary" className="mt-10">
						About Project Skylab{" "}
						<ArrowRight aria-hidden className="btn-arrow size-4" />
					</ButtonLink>
				</Container>
			</section>

			<HorizontalShowcase
				header={
					<>
						<FlightStrip index={3} label="What we do" />
						<div className="mt-5 flex flex-wrap items-end justify-between gap-4">
							<RevealText
								as="h2"
								text="Eight ways to fly with us"
								className="max-w-3xl text-4xl sm:text-5xl"
							/>
							<ButtonLink href="/meetings#types" variant="ghost">
								All meeting types{" "}
								<ArrowRight aria-hidden className="btn-arrow size-4" />
							</ButtonLink>
						</div>
					</>
				}
			>
				{meetings.types.map((type, index) => {
					const photo = meetingImages[index];
					return (
						<Link
							key={type.name}
							href={`/meetings#${type.code?.toLowerCase() ?? `type-${index + 1}`}`}
							className="group on-dark relative isolate flex aspect-[4/5] w-[78vw] max-w-[24rem] shrink-0 snap-start flex-col justify-end overflow-hidden rounded-3xl bg-navy p-6 sm:w-[22rem]"
						>
							<Image
								src={photo.src}
								alt={photo.alt}
								fill
								placeholder="blur"
								sizes="(min-width: 640px) 384px, 78vw"
								className="-z-20 object-cover transition-transform duration-700 ease-out group-hover:scale-110 motion-reduce:transition-none"
							/>
							<div
								aria-hidden
								className="absolute inset-0 -z-10 bg-linear-to-t from-navy via-navy/55 to-navy/0"
							/>
							<p className="label text-accent-text">
								{type.code ?? "Meeting"}
								{type.isNew ? " · New" : ""}
							</p>
							<p className="mt-1 font-display text-2xl font-semibold">
								{type.name}
							</p>
							<p className="mt-1 text-sm text-muted">{type.tagline}</p>
						</Link>
					);
				})}
			</HorizontalShowcase>

			<section
				aria-labelledby="members-heading"
				className="on-dark relative isolate overflow-hidden bg-navy py-24 sm:py-32"
			>
				<BackgroundVideo
					src="/videos/club-members.mp4"
					poster={photos.homeGrassRunway.src}
					label="StuyAviators club video (muted)"
					className="-z-20"
				/>
				<div aria-hidden className="absolute inset-0 -z-10 bg-navy/75" />
				<Container>
					<FlightStrip
						index={4}
						label="From our members"
						className="bg-navy/40"
					/>
					<RevealText
						as="h2"
						id="members-heading"
						text={home.testimonialsHeading}
						className="mt-6 block text-4xl sm:text-5xl"
					/>
					<p className="mt-4 max-w-2xl text-lg text-muted">
						{home.testimonialsIntro}
					</p>
					<div className="mt-10 grid gap-6 md:grid-cols-2">
						{home.testimonials.map((item) => (
							<Stagger key={item.author}>
								<figure className="h-full rounded-3xl border border-white/15 bg-navy/50 p-6 backdrop-blur-md sm:p-8">
									<Quote aria-hidden className="size-7 text-brand" />
									<blockquote className="mt-4 text-lg leading-relaxed">
										“{item.quote}”
									</blockquote>
									<figcaption className="label mt-5 text-muted">
										— {item.author}
									</figcaption>
								</figure>
							</Stagger>
						))}
					</div>
				</Container>
			</section>

			{feed ? (
				<Section
					id="instagram"
					index={5}
					label="From the flight deck"
					title="Latest on Instagram"
					action={
						<ButtonLink
							href="https://www.instagram.com/stuyaviators"
							variant="ghost"
						>
							@stuyaviators{" "}
							<ArrowRight aria-hidden className="btn-arrow size-4" />
						</ButtonLink>
					}
				>
					<InstagramGrid posts={feed.posts} />
				</Section>
			) : null}

			<section aria-labelledby="join-heading" className="pb-24">
				<Container>
					<div className="clip-reveal on-dark relative isolate overflow-hidden rounded-3xl bg-navy px-6 py-16 sm:px-12 sm:py-24">
						<div className="absolute inset-0 -z-20">
							<Parallax distance={60}>
								<Image
									src={photos.heroCessnaSunset.src}
									alt=""
									fill
									placeholder="blur"
									sizes="(min-width: 1152px) 1152px, 100vw"
									className="object-cover"
								/>
							</Parallax>
						</div>
						<div
							aria-hidden
							className="absolute inset-0 -z-10 bg-navy/70 sm:bg-transparent sm:bg-linear-to-r sm:from-navy/90 sm:to-navy/30"
						/>
						<p className="label text-accent-text">Cleared for takeoff</p>
						<RevealText
							as="h2"
							id="join-heading"
							text="Join StuyAviators. No experience needed."
							className="mt-3 block max-w-xl text-4xl sm:text-5xl"
						/>
						<div className="mt-8 flex flex-wrap gap-3">
							<ButtonLink href="/join" variant="accent">
								How to join{" "}
								<ArrowRight aria-hidden className="btn-arrow size-4" />
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
