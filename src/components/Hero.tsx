import { ArrowRight } from "lucide-react";
import Image from "next/image";
import { photos } from "@/content/photos";
import { site } from "@/content/site";
import HeroVideo from "./HeroVideo";
import { Stagger } from "./TransitionProvider";
import { ButtonLink } from "./ui/Button";
import { Container } from "./ui/Section";

/*
 * Full-bleed homepage hero: club video (or poster photo) behind the text, a
 * navy scrim for contrast, and the contrail line drawing across under the
 * title (static under prefers-reduced-motion).
 */
export default function Hero() {
	const poster = photos.heroCessnaBackseat;
	return (
		<header className="on-dark relative isolate -mt-[5.5rem] overflow-hidden bg-navy pt-[5.5rem]">
			<Image
				src={poster.src}
				alt=""
				fill
				priority
				placeholder="blur"
				sizes="100vw"
				className="-z-30 object-cover"
			/>
			<HeroVideo />
			<div
				aria-hidden
				className="absolute inset-0 -z-10 bg-navy/70 lg:bg-transparent lg:bg-linear-to-r lg:from-navy/90 lg:via-navy/65 lg:to-navy/20"
			/>
			<Container className="flex min-h-[calc(100svh-1rem)] flex-col justify-center py-16 sm:min-h-[44rem]">
				<div className="max-w-2xl">
					<Stagger>
						<p className="label text-accent-text">{site.eyebrow} · Est. Nov 19, 2022</p>
					</Stagger>
					<Stagger className="relative">
						<h1 className="mt-4 text-5xl tracking-tight sm:text-7xl">StuyAviators</h1>
						<svg aria-hidden className="mt-2 h-8 w-full max-w-lg text-[#ddebff]" viewBox="0 0 520 32" fill="none">
							<path className="contrail-line" d="M2 26 C 140 26, 300 22, 470 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeDasharray="6 8" />
							<g className="contrail-plane" transform="translate(470 10) rotate(-12)">
								<path d="M14 0 L-6 -2 L-12 -12 L-16 -12 L-12 -2 L-18 -1.5 L-21 -6 L-24 -6 L-22 0 L-24 6 L-21 6 L-18 1.5 L-12 2 L-16 12 L-12 12 L-6 2 Z" fill="currentColor" />
							</g>
						</svg>
					</Stagger>
					<Stagger>
						<p className="mt-4 text-lg text-muted sm:text-xl">{site.tagline}</p>
					</Stagger>
					<Stagger>
						<div className="mt-8 flex flex-wrap gap-3">
							<ButtonLink href="/join" variant="accent">Join StuyAviators</ButtonLink>
							<ButtonLink href="/meetings" variant="secondary">
								See meetings <ArrowRight aria-hidden className="size-4" />
							</ButtonLink>
						</div>
					</Stagger>
				</div>
			</Container>
		</header>
	);
}
