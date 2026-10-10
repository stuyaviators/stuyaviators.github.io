"use client";

import type { StaticImageData } from "next/image";
import { Pause, Play } from "lucide-react";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";

/*
 * Homepage media frame: the club's own YouTube video ("web-video-1", the old
 * homepage background) plays muted and looping inside the photo frame, over a
 * poster photo. It autoplays unless the visitor prefers reduced motion; the
 * play/pause button always works (WCAG 2.2.2). The player stays invisible
 * until YouTube reports it is actually playing, so the poster never flashes
 * to a black loading screen.
 */
const videoId = "eHTaCeVl_wo";
const embed = `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&mute=1&loop=1&playlist=${videoId}&controls=0&disablekb=1&fs=0&iv_load_policy=3&playsinline=1&rel=0&enablejsapi=1`;

export default function HeroMedia({
	poster,
	posterAlt,
}: {
	readonly poster: StaticImageData;
	readonly posterAlt: string;
}) {
	const [isPlaying, setIsPlaying] = useState(false);
	const [isVisible, setIsVisible] = useState(false);
	const frameRef = useRef<HTMLIFrameElement>(null);

	// Listen for the player's state over the IFrame API's postMessage channel.
	useEffect(() => {
		if (!isPlaying) {
			setIsVisible(false);
			return;
		}

		const onMessage = (event: MessageEvent) => {
			if (!/^https:\/\/www\.youtube(-nocookie)?\.com$/v.test(event.origin))
				return;
			try {
				const data = (
					typeof event.data === "string" ? JSON.parse(event.data) : event.data
				) as {
					info?: { playerState?: number };
				};
				if (data.info?.playerState === 1) setIsVisible(true);
			} catch {}
		};

		globalThis.addEventListener("message", onMessage);
		// Fallback in case the player never reports its state.
		const fallback = setTimeout(() => {
			setIsVisible(true);
		}, 3000);
		return () => {
			globalThis.removeEventListener("message", onMessage);
			clearTimeout(fallback);
		};
	}, [isPlaying]);

	useEffect(() => {
		const reduced = globalThis.matchMedia(
			"(prefers-reduced-motion: reduce)"
		).matches;
		setIsPlaying(!reduced);
	}, []);

	return (
		<div className="relative aspect-[4/3] overflow-hidden rounded-lg border border-hairline bg-navy shadow-card">
			<Image
				src={poster}
				alt={posterAlt}
				fill
				priority
				placeholder="blur"
				sizes="(min-width: 1024px) 45vw, 100vw"
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
							JSON.stringify({ event: "listening", id: 1, channel: "widget" }),
							"*"
						);
					}}
					className={`pointer-events-none absolute transition-opacity duration-700 motion-reduce:transition-none ${isVisible ? "opacity-100" : "opacity-0"}`}
					style={{
						top: "50%",
						left: "50%",
						height: "100%",
						aspectRatio: "16 / 9",
						minWidth: "100%",
						transform: "translate(-50%, -50%) scale(1.45)",
						border: 0,
					}}
				/>
			) : null}
			<button
				type="button"
				aria-label={isPlaying ? "Pause video" : "Play video"}
				aria-pressed={isPlaying}
				className="absolute right-3 bottom-3 inline-flex size-10 items-center justify-center rounded-full border border-white/40 bg-navy/70 text-white hover:bg-navy/90"
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
