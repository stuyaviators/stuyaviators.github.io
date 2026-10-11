"use client";

import type { StaticImageData } from "next/image";
import { cn } from "@/lib/cn";
import { Pause, Play } from "lucide-react";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";

/*
 * Muted, looping background video behind a section. Plays only while the
 * section is on screen and the tab is visible (pauses otherwise), fades in
 * over a poster once playing, and skips autoplay under reduced motion.
 * Uses a self-hosted MP4 when `src` is given, otherwise the club's YouTube
 * video via the IFrame API's postMessage commands.
 */
const youtubeOrigin = /^https:\/\/www\.youtube(?:-nocookie)?\.com$/u;

export default function BackgroundVideo({
	youtubeId,
	src,
	poster,
	label,
	className,
}: {
	readonly youtubeId?: string;
	readonly src?: string;
	readonly poster: StaticImageData;
	readonly label: string;
	readonly className?: string;
}) {
	const wrapperRef = useRef<HTMLDivElement>(null);
	const iframeRef = useRef<HTMLIFrameElement>(null);
	const videoRef = useRef<HTMLVideoElement>(null);
	const [isEnabled, setIsEnabled] = useState(false);
	const [isUserPaused, setIsUserPaused] = useState(false);
	const [isInView, setIsInView] = useState(false);
	const [isVisible, setIsVisible] = useState(false);

	useEffect(() => {
		setIsEnabled(
			!globalThis.matchMedia("(prefers-reduced-motion: reduce)").matches
		);
		const element = wrapperRef.current;
		if (!element) {
			return;
		}

		const observer = new IntersectionObserver(([entry]) => {
			setIsInView(entry?.isIntersecting ?? false);
		});
		observer.observe(element);
		return () => {
			observer.disconnect();
		};
	}, []);

	const shouldPlay = isEnabled && isInView && !isUserPaused;

	// Play/pause on viewport, tab visibility and the user's choice.
	useEffect(() => {
		const command = (isPlay: boolean) => {
			videoRef.current?.[isPlay ? "play" : "pause"]()?.catch(() => undefined);
			iframeRef.current?.contentWindow?.postMessage(
				JSON.stringify({
					event: "command",
					func: isPlay ? "playVideo" : "pauseVideo",
					args: [],
				}),
				"*"
			);
		};

		const onVisibility = () => {
			command(shouldPlay && document.visibilityState === "visible");
		};

		onVisibility();
		document.addEventListener("visibilitychange", onVisibility);
		return () => {
			document.removeEventListener("visibilitychange", onVisibility);
		};
	}, [shouldPlay]);

	// Fade the YouTube player in once it reports "playing" (fallback 3 s).
	useEffect(() => {
		if (
			youtubeId === undefined ||
			src !== undefined ||
			!isEnabled ||
			!isInView
		) {
			return;
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
					setIsVisible(true);
				}
			} catch {}
		};

		globalThis.addEventListener("message", onMessage);
		const fallback = setTimeout(() => {
			setIsVisible(true);
		}, 3000);
		return () => {
			globalThis.removeEventListener("message", onMessage);
			clearTimeout(fallback);
		};
	}, [youtubeId, src, isEnabled, isInView]);

	const embed = youtubeId
		? `https://www.youtube-nocookie.com/embed/${youtubeId}?autoplay=1&mute=1&loop=1&playlist=${youtubeId}&controls=0&disablekb=1&fs=0&iv_load_policy=3&playsinline=1&rel=0&enablejsapi=1`
		: undefined;

	return (
		<div
			ref={wrapperRef}
			className={cn("absolute inset-0 overflow-hidden", className)}
		>
			<Image
				src={poster}
				alt=""
				fill
				placeholder="blur"
				sizes="100vw"
				className="object-cover"
			/>
			{isEnabled && src ? (
				<video
					ref={videoRef}
					src={src}
					muted
					loop
					playsInline
					autoPlay
					preload="metadata"
					aria-label={label}
					className={cn(
						"absolute inset-0 size-full object-cover transition-opacity duration-1000",
						isVisible ? "opacity-100" : "opacity-0"
					)}
					onPlaying={() => {
						setIsVisible(true);
					}}
				/>
			) : null}
			{isEnabled && !src && embed && (isInView || isVisible) ? (
				<iframe
					ref={iframeRef}
					src={embed}
					title={label}
					tabIndex={-1}
					allow="autoplay; encrypted-media; picture-in-picture"
					referrerPolicy="strict-origin-when-cross-origin"
					onLoad={() => {
						iframeRef.current?.contentWindow?.postMessage(
							JSON.stringify({ event: "listening", id: 2, channel: "widget" }),
							"*"
						);
					}}
					className={cn(
						"pointer-events-none absolute border-0 transition-opacity duration-1000",
						isVisible ? "opacity-100" : "opacity-0"
					)}
					style={{
						top: "50%",
						left: "50%",
						width: "max(100%, 177.78vh)",
						height: "max(100%, 56.25vw)",
						transform: "translate(-50%, -50%) scale(1.2)",
					}}
				/>
			) : null}
			{isEnabled ? (
				<button
					type="button"
					aria-label={
						isUserPaused ? "Play background video" : "Pause background video"
					}
					aria-pressed={!isUserPaused}
					className="absolute right-4 bottom-4 z-10 inline-flex size-10 items-center justify-center rounded-full border border-white/40 bg-ink/60 text-white backdrop-blur transition-colors hover:bg-ink/80"
					onClick={() => {
						setIsUserPaused((value) => !value);
					}}
				>
					{isUserPaused ? (
						<Play aria-hidden className="size-4" />
					) : (
						<Pause aria-hidden className="size-4" />
					)}
				</button>
			) : null}
		</div>
	);
}
