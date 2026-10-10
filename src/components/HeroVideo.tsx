"use client";

import { Pause, Play } from "lucide-react";
import { useEffect, useState } from "react";

/*
 * Muted, looping YouTube background (the club's own "web-video-1", as on the
 * old homepage). Loaded only after hydration so the poster photo is the LCP
 * image; skipped entirely under prefers-reduced-motion. The pause button
 * satisfies WCAG 2.2.2 for auto-playing motion.
 */
const videoId = "eHTaCeVl_wo";
const embed = `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&mute=1&loop=1&playlist=${videoId}&controls=0&disablekb=1&fs=0&iv_load_policy=3&modestbranding=1&playsinline=1&rel=0`;

export default function HeroVideo() {
	const [playing, setPlaying] = useState(false);
	const [allowed, setAllowed] = useState(false);

	useEffect(() => {
		const query = globalThis.matchMedia("(prefers-reduced-motion: reduce)");
		const update = () => {
			setAllowed(!query.matches);
			setPlaying(!query.matches);
		};

		update();
		query.addEventListener("change", update);
		return () => {
			query.removeEventListener("change", update);
		};
	}, []);

	return (
		<>
			{playing ? (
				<div aria-hidden className="pointer-events-none absolute inset-0 -z-20 overflow-hidden">
					<iframe
						src={embed}
						title="StuyAviators background video"
						tabIndex={-1}
						allow="autoplay; encrypted-media; picture-in-picture"
						referrerPolicy="strict-origin-when-cross-origin"
						className="absolute top-1/2 left-1/2 aspect-video min-h-full w-[max(100%,177.78vh)] -translate-x-1/2 -translate-y-1/2 border-0"
					/>
				</div>
			) : null}
			{allowed ? (
				<button
					type="button"
					onClick={() => {
						setPlaying((value) => !value);
					}}
					aria-label={playing ? "Pause background video" : "Play background video"}
					className="absolute right-4 bottom-4 z-10 inline-flex size-10 items-center justify-center rounded-full border border-white/40 bg-navy/60 text-white hover:bg-navy/80"
				>
					{playing ? <Pause aria-hidden className="size-4" /> : <Play aria-hidden className="size-4" />}
				</button>
			) : null}
		</>
	);
}
