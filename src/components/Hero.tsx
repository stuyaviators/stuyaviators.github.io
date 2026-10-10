import { photos } from "@/content/photos";
import { site } from "@/content/site";
import HeroMedia from "./HeroMedia";
import { ArrowRight } from "lucide-react";
import { Stagger } from "./TransitionProvider.tsx";
import { ButtonLink } from "./ui/Button.tsx";
import { Container } from "./ui/Section.tsx";

/*
 * Homepage hero. The one "hero moment": a contrail line draws across under
 * the title and ends in a small aircraft. Under prefers-reduced-motion it is
 * rendered in its final state (see .contrail-* in globals.css).
 */
export default function Hero() {
	const photo = photos.heroCessnaBackseat;
	return (
		<header className="relative overflow-hidden border-b border-hairline bg-surface">
			<Container className="grid items-center gap-10 py-12 sm:py-16 lg:grid-cols-[1.05fr_0.95fr] lg:py-20">
				<div className="relative">
					<Stagger>
						<p className="label text-accent-text">
							{site.eyebrow} · Est. Nov 19, 2022
						</p>
					</Stagger>
					<Stagger className="relative">
						<h1 className="mt-4 text-5xl tracking-tight sm:text-6xl lg:text-7xl">
							StuyAviators
						</h1>
						<svg
							aria-hidden
							className="mt-2 h-8 w-full max-w-lg text-brand"
							viewBox="0 0 520 32"
							fill="none"
						>
							<path
								className="contrail-line"
								d="M2 26 C 140 26, 300 22, 470 10"
								stroke="currentColor"
								strokeWidth="2"
								strokeLinecap="round"
								strokeDasharray="6 8"
							/>
							<g
								className="contrail-plane"
								transform="translate(470 10) rotate(-12)"
							>
								<path
									d="M14 0 L-6 -2 L-12 -12 L-16 -12 L-12 -2 L-18 -1.5 L-21 -6 L-24 -6 L-22 0 L-24 6 L-21 6 L-18 1.5 L-12 2 L-16 12 L-12 12 L-6 2 Z"
									fill="currentColor"
								/>
							</g>
						</svg>
					</Stagger>
					<Stagger>
						<p className="mt-4 max-w-xl text-lg text-muted sm:text-xl">
							{site.tagline}
						</p>
					</Stagger>
					<Stagger>
						<div className="mt-8 flex flex-wrap gap-3">
							<ButtonLink href="/join" variant="accent">
								Join StuyAviators
							</ButtonLink>
							<ButtonLink href="/meetings" variant="secondary">
								See meetings <ArrowRight aria-hidden className="size-4" />
							</ButtonLink>
						</div>
					</Stagger>
				</div>
				<Stagger className="relative">
					<HeroMedia poster={photo.src} posterAlt={photo.alt} />
					<p className="label absolute -bottom-3 left-4 rounded-sm border border-hairline bg-surface px-2 py-1 text-muted">
						Club video · muted
					</p>
				</Stagger>
			</Container>
		</header>
	);
}
