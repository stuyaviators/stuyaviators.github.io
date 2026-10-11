import DepartureBoard from "@/components/DepartureBoard";
import MembersScene from "@/components/home/MembersScene";
import HomeIntro from "@/components/HomeIntro";
import HorizontalShowcase from "@/components/motion/HorizontalShowcase";
import InView from "@/components/motion/InView";
import Parallax from "@/components/motion/Parallax";
import PinnedScene from "@/components/motion/PinnedScene";
import RevealText from "@/components/motion/RevealText";
import ScrollHighlight from "@/components/motion/ScrollHighlight";
import { ButtonLink } from "@/components/ui/Button";
import { FlightStrip } from "@/components/ui/FlightStrip";
import { Container } from "@/components/ui/Section";
import { home } from "@/content/home";
import { meetingImages } from "@/content/meeting-images";
import { meetings } from "@/content/meetings";
import { photos } from "@/content/photos";
import { getUpcomingMeetings } from "@/lib/meetings";
import { getPublicTestimonials } from "@/lib/testimonials";
import { ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export const revalidate = 900;

/*
 * Homepage: a short sequence of full-screen scenes, each locking in place
 * for a moment while you scroll (Apple-style), then handing off to the next.
 */
export default async function Home() {
	const upcoming = await getUpcomingMeetings();
	const testimonials = await getPublicTestimonials();

	return (
		<>
			<HomeIntro
				poster={photos.heroCessnaBackseat.src}
				posterAlt={photos.heroCessnaBackseat.alt}
			/>

			<PinnedScene id="departures" length={0.5} labelledBy="departures-heading">
				<Container>
					<FlightStrip label="Next departures" />
					<RevealText
						as="h2"
						id="departures-heading"
						text="Upcoming meetings"
						className="mt-3 block text-4xl sm:text-6xl"
					/>
					<p className="mt-4 max-w-2xl text-lg text-muted">
						Drop in whenever your schedule allows. No experience needed.
					</p>
					<InView className="mt-8 sm:mt-10">
						<DepartureBoard meetings={upcoming.slice(0, 3)} />
					</InView>
				</Container>
			</PinnedScene>

			<PinnedScene length={1} label="Our mission">
				<Container>
					<FlightStrip label="Our mission" />
					<ScrollHighlight
						text="Aviation didn’t formally exist at Stuyvesant—so we built the space for it."
						className="mt-6 max-w-5xl font-display text-4xl leading-[1.1] font-semibold sm:text-6xl lg:text-7xl"
					/>
					<ButtonLink href="/about" variant="secondary" className="mt-10">
						About Project Skylab{" "}
						<ArrowRight aria-hidden className="btn-arrow size-4" />
					</ButtonLink>
				</Container>
			</PinnedScene>

			<HorizontalShowcase
				header={
					<>
						<FlightStrip label="What we do" />
						<div className="mt-3 flex flex-wrap items-end justify-between gap-4">
							<RevealText
								as="h2"
								text="Eight ways to fly with us"
								className="max-w-3xl text-4xl sm:text-6xl"
							/>
							<ButtonLink
								href="/meetings#types"
								variant="ghost"
								className="hidden sm:inline-flex"
							>
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
							className="group on-dark relative isolate flex aspect-[4/5] w-[74vw] max-w-[24rem] shrink-0 snap-center flex-col justify-end overflow-hidden rounded-3xl bg-ink p-6 sm:w-[22rem]"
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
								className="absolute inset-0 -z-10 bg-linear-to-t from-black/85 via-black/35 to-transparent"
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

			<MembersScene
				heading={home.testimonialsHeading}
				intro={home.testimonialsIntro}
				testimonials={testimonials}
				poster={photos.homeGrassRunway.src}
			/>

			<section
				aria-labelledby="join-heading"
				className="scene-section min-h-svh py-24 sm:py-32"
			>
				<Container className="scene">
					<div className="clip-reveal on-dark relative isolate overflow-hidden rounded-3xl bg-ink px-6 py-16 sm:px-12 sm:py-24">
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
							className="absolute inset-0 -z-10 bg-black/55 sm:bg-transparent sm:bg-linear-to-r sm:from-black/80 sm:to-black/10"
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
							<a href="#mailing-list" className="group inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-white/40 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-white/10">
								Join the mailing list
							</a>
						</div>
					</div>
				</Container>
			</section>
		</>
	);
}
