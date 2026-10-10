"use client";

import type { StaticImageData } from "next/image";
import { site } from "@/content/site";
import { cn } from "@/lib/cn";
import { ArrowRight, ChevronDown, Pause, Play } from "lucide-react";
import {
	motion,
	useMotionValueEvent,
	useScroll,
	useTransform,
} from "motion/react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import Hero from "./Hero.tsx";
import { buttonClasses } from "./ui/Button.tsx";

/*
 * Apple-style homepage intro.
 * 1. The club video fills the screen; once it's playing, the title,
 *    contrail and tagline fade up over it.
 * 2. Scrolling shrinks the video into a rounded card on the right while the
 *    split-hero text fades in on the left, ending in the same arrangement as
 *    the static hero.
 * Reduced-motion visitors get <Hero /> instead (see app/page.tsx).
 */
const videoId = "eHTaCeVl_wo";
const embed = `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&mute=1&loop=1&playlist=${videoId}&controls=0&disablekb=1&fs=0&iv_load_policy=3&playsinline=1&rel=0&enablejsapi=1`;
const youtubeOrigin = /^https:\/\/www\.youtube(?:-nocookie)?\.com$/v;

// Final card position as inset percentages [top, right, bottom, left] + radius.
const cardInset = {
	desktop: [24, 7, 22, 53, 16],
	mobile: [12, 4, 62, 4, 16],
} as const;

function clamp01(value: number) {
	return Math.min(1, Math.max(0, value));
}

function Contrail({ className }: { readonly className?: string }) {
	return (
		<svg aria-hidden className={className} viewBox="0 0 520 32" fill="none">
			<path
				className="contrail-line"
				d="M2 26 C 140 26, 300 22, 470 10"
				stroke="currentColor"
				strokeWidth="2"
				strokeLinecap="round"
				strokeDasharray="6 8"
			/>
			<g className="contrail-plane" transform="translate(470 10) rotate(-12)">
				<path
					d="M14 0 L-6 -2 L-12 -12 L-16 -12 L-12 -2 L-18 -1.5 L-21 -6 L-24 -6 L-22 0 L-24 6 L-21 6 L-18 1.5 L-12 2 L-16 12 L-12 12 L-6 2 Z"
					fill="currentColor"
				/>
			</g>
		</svg>
	);
}

export default function HomeIntro({
	poster,
	posterAlt,
}: {
	readonly poster: StaticImageData;
	readonly posterAlt: string;
}) {
	const sectionRef = useRef<HTMLElement>(null);
	const frameRef = useRef<HTMLIFrameElement>(null);
	// Read after mount (not during render) so server and client HTML match.
	const [isReducedMotion, setIsReducedMotion] = useState(false);
	const [isPlaying, setIsPlaying] = useState(true);
	const [isVideoVisible, setIsVideoVisible] = useState(false);
	const [isIntroReady, setIsIntroReady] = useState(false);
	const isDesktopRef = useRef(true);
	const [isDesktop, setIsDesktop] = useState(true);
	const [isSplit, setIsSplit] = useState(false);

	const { scrollYProgress } = useScroll({
		target: sectionRef,
		offset: ["start start", "end end"],
	});
	// Interpolated per frame so it always matches the current breakpoint.
	const clipPath = useTransform(scrollYProgress, (value) => {
		const t = clamp01((value - 0.08) / 0.47);
		const eased = 1 - (1 - t) ** 3;
		const target = isDesktopRef.current ? cardInset.desktop : cardInset.mobile;
		const [top, right, bottom, left, radius] = target.map((n) => n * eased);
		return `inset(${top}% ${right}% ${bottom}% ${left}% round ${radius}px)`;
	});
	const scrimOpacity = useTransform(scrollYProgress, [0.08, 0.45], [1, 0]);
	const introOpacity = useTransform(scrollYProgress, [0.04, 0.28], [1, 0]);
	const introY = useTransform(scrollYProgress, [0.04, 0.28], [0, -60]);
	const splitOpacity = useTransform(scrollYProgress, [0.45, 0.7], [0, 1]);
	const splitY = useTransform(scrollYProgress, [0.45, 0.7], [40, 0]);
	const cueOpacity = useTransform(scrollYProgress, [0, 0.08], [1, 0]);

	useMotionValueEvent(scrollYProgress, "change", (value) => {
		setIsSplit(value > 0.5);
	});

	useEffect(() => {
		const query = globalThis.matchMedia("(prefers-reduced-motion: reduce)");
		const update = () => {
			setIsReducedMotion(query.matches);
		};

		update();
		query.addEventListener("change", update);
		return () => {
			query.removeEventListener("change", update);
		};
	}, []);

	useEffect(() => {
		const query = globalThis.matchMedia("(min-width: 1024px)");
		const update = () => {
			isDesktopRef.current = query.matches;
			setIsDesktop(query.matches);
		};

		update();
		query.addEventListener("change", update);
		return () => {
			query.removeEventListener("change", update);
		};
	}, []);

	// Reveal the video once YouTube reports "playing" (fallback after 3 s),
	// and fade the intro text in shortly after (never later than 1.6 s).
	useEffect(() => {
		const textTimer = setTimeout(() => {
			setIsIntroReady(true);
		}, 1600);
		if (!isPlaying) {
			setIsVideoVisible(false);
			return () => {
				clearTimeout(textTimer);
			};
		}

		const onMessage = (event: MessageEvent) => {
			if (!youtubeOrigin.test(event.origin)) {
				return;
			}

			try {
				const data = (
					typeof event.data === "string" ? JSON.parse(event.data) : event.data
				) as { info?: { playerState?: number } };
				if (data.info?.playerState === 1) {
					setIsVideoVisible(true);
					setTimeout(() => {
						setIsIntroReady(true);
					}, 500);
				}
			} catch {}
		};

		globalThis.addEventListener("message", onMessage);
		const videoTimer = setTimeout(() => {
			setIsVideoVisible(true);
		}, 3000);
		return () => {
			globalThis.removeEventListener("message", onMessage);
			clearTimeout(videoTimer);
			clearTimeout(textTimer);
		};
	}, [isPlaying]);

	// Reduced motion: the static split hero (no scroll-linked animation).
	if (isReducedMotion) {
		return <Hero />;
	}

	return (
		<section
			ref={sectionRef}
			aria-label="Welcome to StuyAviators"
			className="relative -mt-[5.5rem] h-[260svh]"
		>
			<div className="sticky top-0 h-svh overflow-hidden bg-surface">
				{/* Video layer, clipped from full-screen down to a card. */}
				<motion.div className="absolute inset-0 bg-navy" style={{ clipPath }}>
					<Image
						src={poster}
						alt={posterAlt}
						fill
						priority
						placeholder="blur"
						sizes="100vw"
						className="object-cover"
					/>
					{isPlaying ? (
						<iframe
							ref={frameRef}
							src={embed}
							title="StuyAviators club video (muted)"
							allow="autoplay; encrypted-media; picture-in-picture"
							referrerPolicy="strict-origin-when-cross-origin"
							tabIndex={-1}
							onLoad={() => {
								frameRef.current?.contentWindow?.postMessage(
									JSON.stringify({
										event: "listening",
										id: 1,
										channel: "widget",
									}),
									"*"
								);
							}}
							className={cn(
								"pointer-events-none absolute border-0 transition-opacity duration-1000",
								isVideoVisible ? "opacity-100" : "opacity-0"
							)}
							style={{
								top: "50%",
								left: "50%",
								width: "max(100vw, 177.78svh)",
								aspectRatio: "16 / 9",
								transform: "translate(-50%, -50%) scale(1.15)",
							}}
						/>
					) : null}
					<motion.div
						aria-hidden
						className="absolute inset-0 bg-navy/55"
						style={{ opacity: scrimOpacity }}
					/>
				</motion.div>

				{/* Stage 1: centered intro over the full-screen video. */}
				<motion.div
					className="on-dark pointer-events-none absolute inset-0 flex flex-col items-center justify-center px-6 text-center"
					style={{ opacity: introOpacity, y: introY }}
					aria-hidden={isSplit}
				>
					<div
						className={cn(
							"intro-reveal flex flex-col items-center",
							isIntroReady && "is-ready"
						)}
					>
						<p className="label text-accent-text">{site.eyebrow}</p>
						<h1 className="mt-4 text-5xl font-semibold tracking-tight sm:text-8xl lg:text-9xl">
							StuyAviators
						</h1>
						<Contrail className="mt-3 h-8 w-full max-w-xl text-[#ddebff]" />
						<p className="mt-5 max-w-2xl text-lg text-muted sm:text-xl">
							{site.tagline}
						</p>
					</div>
				</motion.div>

				{/* Scroll cue. */}
				<motion.div
					aria-hidden
					className="on-dark absolute bottom-8 left-1/2 flex -translate-x-1/2 flex-col items-center gap-1 text-muted"
					style={{ opacity: cueOpacity }}
				>
					<span className="label">Scroll</span>
					<ChevronDown className="scroll-cue size-5" />
				</motion.div>

				{/* Stage 2: split hero text beside the video card. */}
				<motion.div
					className="pointer-events-none absolute inset-0"
					style={{ opacity: splitOpacity, y: splitY }}
				>
					<div className="mx-auto flex h-full max-w-6xl items-end px-4 pb-[6svh] sm:px-6 lg:items-center lg:px-8 lg:pb-0">
						<div
							className={cn(
								"max-w-xl lg:max-w-[46%]",
								isSplit && "pointer-events-auto"
							)}
						>
							<p className="label text-accent-text">
								{site.eyebrow} · Est. Nov 19, 2022
							</p>
							<p
								aria-hidden
								className="mt-3 text-4xl font-semibold tracking-tight sm:text-6xl lg:mt-4 lg:text-7xl"
							>
								StuyAviators
							</p>
							<Contrail className="mt-2 h-8 w-full max-w-lg text-brand" />
							<p className="mt-4 text-lg text-muted sm:text-xl">
								{site.tagline}
							</p>
							<div className="mt-8 flex flex-wrap gap-3">
								<Link
									href="/join"
									tabIndex={isSplit ? undefined : -1}
									className={buttonClasses("accent")}
								>
									Join StuyAviators
								</Link>
								<Link
									href="/meetings"
									tabIndex={isSplit ? undefined : -1}
									className={buttonClasses("secondary")}
								>
									See meetings <ArrowRight aria-hidden className="size-4" />
								</Link>
							</div>
						</div>
					</div>
				</motion.div>

				<button
					type="button"
					aria-label={isPlaying ? "Pause video" : "Play video"}
					aria-pressed={isPlaying}
					className="absolute z-10 inline-flex size-10 items-center justify-center rounded-full border border-white/40 bg-navy/70 text-white hover:bg-navy/90"
					style={
						isSplit
							? (() => {
									const [, right, bottom] = isDesktop
										? cardInset.desktop
										: cardInset.mobile;
									return {
										right: `calc(${right}% + 12px)`,
										bottom: `calc(${bottom}% + 12px)`,
									};
								})()
							: { right: 16, bottom: 16 }
					}
					onClick={() => {
						setIsPlaying((value) => !value);
					}}
				>
					{isPlaying ? (
						<Pause aria-hidden className="size-4" />
					) : (
						<Play aria-hidden className="size-4" />
					)}
				</button>
			</div>
		</section>
	);
}
