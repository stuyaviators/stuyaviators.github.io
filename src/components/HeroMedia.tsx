"use client";

import type { StaticImageData } from "next/image";
import { cn } from "@/lib/cn";
import { Pause, Play } from "lucide-react";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";

/*
 * Homepage media frame (static hero, used for reduced motion): the club video
 * plays muted and looping inside the photo frame over a poster photo. It
 * doesn't autoplay under prefers-reduced-motion; the play/pause button always
 * works (WCAG 2.2.2).
 */
const heroVideo = "/videos/club-hero.mp4";

export default function HeroMedia({
	poster,
	posterAlt,
}: {
	readonly poster: StaticImageData;
	readonly posterAlt: string;
}) {
	const videoRef = useRef<HTMLVideoElement>(null);
	const [isPlaying, setIsPlaying] = useState(false);
	const [isVisible, setIsVisible] = useState(false);

	useEffect(() => {
		setIsPlaying(
			!globalThis.matchMedia("(prefers-reduced-motion: reduce)").matches
		);
	}, []);

	useEffect(() => {
		const video = videoRef.current;
		if (!video) {
			return;
		}

		if (isPlaying) {
			video.play().catch(() => undefined);
		} else {
			video.pause();
		}
	}, [isPlaying]);

	return (
		<div className="relative aspect-[4/3] overflow-hidden rounded-3xl border border-hairline bg-navy shadow-card">
			<Image
				src={poster}
				alt={posterAlt}
				fill
				priority
				placeholder="blur"
				sizes="(min-width: 1024px) 45vw, 100vw"
				className="object-cover"
			/>
			<video
				ref={videoRef}
				src={heroVideo}
				muted
				loop
				playsInline
				preload="metadata"
				aria-hidden
				tabIndex={-1}
				className={cn(
					"absolute inset-0 size-full object-cover transition-opacity duration-700",
					isVisible ? "opacity-100" : "opacity-0"
				)}
				onPlaying={() => {
					setIsVisible(true);
				}}
			/>
			<button
				type="button"
				aria-label={isPlaying ? "Pause video" : "Play video"}
				aria-pressed={isPlaying}
				className="absolute right-3 bottom-3 inline-flex size-10 items-center justify-center rounded-full border border-white/40 bg-navy/70 text-white transition-colors hover:bg-navy/90"
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
	);
}
