"use client";

import andrewImage from "@/assets/andrew-ryanair.jpg";
import { Card } from "@/components/Card";
import { flavors } from "@/lib/theme";
import { ArrowUpRight, Copy, Mail, MailPlus, MapPin } from "lucide-react";
import mapboxgl from "mapbox-gl";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { siDiscord, siFacebook, siInstagram } from "simple-icons/icons";

import "mapbox-gl/dist/mapbox-gl.css";

const socials = [
	{ label: "Discord", href: "#", Icon: DiscordIcon },
	{ label: "Instagram", href: "#", Icon: InstagramIcon },
	{ label: "Facebook", href: "#", Icon: FacebookIcon },
];

const contacts = [
	{
		label: "School",
		value: "aviators-outreach@stuy.edu",
		href: "mailto:aviators-outreach@stuy.edu",
		Icon: Mail,
	},
	{
		label: "Other",
		value: "stuyaviators@gmail.com",
		href: "mailto:stuyaviators@gmail.com",
		Icon: MailPlus,
	},
	{
		label: "Address",
		value: "345 Chambers St, New York, NY 10282",
		href: "https://maps.google.com/?q=345+Chambers+St,+New+York,+NY+10282",
		Icon: MapPin,
	},
];

const mapStyleByFlavor: Record<string, string> = {
	latte: "mapbox://styles/webcubed/cmjeqj7mi006701qoegh3165c",
	mocha: "mapbox://styles/webcubed/cmjeqn9mt001u01s1a3mzasqn",
	macchiato: "mapbox://styles/webcubed/cmjeq8rau006601s8hpua6pht",
	frappe: "mapbox://styles/webcubed/cmjeqm02j006801qo62lc4cca",
};

const MAP_COORDINATES: [number, number] = [-74.0138398, 40.7179857];
const MAP_ZOOM = 15.5;

async function copyValue(value: string) {
	try {
		if (
			typeof navigator !== "undefined" &&
			typeof window !== "undefined" &&
			window.isSecureContext &&
			navigator.clipboard?.writeText
		) {
			await navigator.clipboard.writeText(value);
			return true;
		}
	} catch (_error) {
		// continue to fallback paths
	}

	if (typeof navigator !== "undefined" && navigator.share) {
		try {
			await navigator.share({ text: value });
			return true;
		} catch (_error) {
			// sharing cancelled or unsupported
		}
	}

	return false;
}
export default function Connect() {
	const [mapStyleId, setMapStyleId] = useState(mapStyleByFlavor["mocha"] ?? "");
	const mapContainerRef = useRef<HTMLDivElement | null>(null);
	const mapRef = useRef<mapboxgl.Map | null>(null);
	const markerRef = useRef<mapboxgl.Marker | null>(null);

	useEffect(() => {
		const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
		if (!token) {
			// No token, skip init to avoid runtime errors.
			return undefined;
		}
		mapboxgl.accessToken = token;

		if (!mapContainerRef.current) return undefined;

		const createMarker = () => {
			if (!mapRef.current) return;
			if (!markerRef.current) {
				markerRef.current = new mapboxgl.Marker({
					color: flavors.find(
						(flavor) =>
							flavor.value ===
							(localStorage.getItem("catppuccin-flavor") ?? "mocha")
					)?.swatch[1],
				}).setLngLat(MAP_COORDINATES);
			}
			markerRef.current.addTo(mapRef.current);
		};

		if (!mapRef.current) {
			mapRef.current = new mapboxgl.Map({
				container: mapContainerRef.current,
				style: mapStyleId,
				center: MAP_COORDINATES,
				zoom: MAP_ZOOM,
				attributionControl: true,
			});

			mapRef.current.addControl(
				new mapboxgl.NavigationControl({ visualizePitch: true }),
				"top-right"
			);

			mapRef.current.once("load", () => {
				createMarker();
			});
		} else {
			mapRef.current.setStyle(mapStyleId);
			mapRef.current.once("styledata", () => {
				createMarker();
			});
		}

		return () => {
			mapRef.current?.remove();
			mapRef.current = null;
			markerRef.current = null;
		};
	}, [mapStyleId]);

	useEffect(() => {
		const computeStyle = () => {
			const flavor =
				document.documentElement.getAttribute("data-catppuccin") ?? "mocha";
			const mapped = mapStyleByFlavor[flavor] ?? mapStyleByFlavor["mocha"];
			setMapStyleId(mapped);
		};

		computeStyle();

		const observer = new MutationObserver(computeStyle);
		observer.observe(document.documentElement, {
			attributes: true,
			attributeFilter: ["data-catppuccin"],
		});

		window.addEventListener("storage", computeStyle);

		return () => {
			observer.disconnect();
			window.removeEventListener("storage", computeStyle);
		};
	}, []);

	return (
		<main className="flex min-h-screen flex-col items-center justify-center px-4 sm:px-6 py-8 sm:py-12">
			<div className="text-center">
				<h1 className="text-3xl sm:text-4xl font-bold">Connect</h1>
				<p className="mt-3 sm:mt-4 text-base sm:text-lg text-ctp-subtext0">
					Get in touch with StuyAviators
				</p>
			</div>

			<section className="mt-8 sm:mt-12 grid w-full max-w-5xl grid-cols-1 items-center gap-6 sm:gap-8 lg:grid-cols-2">
				<Card className="w-full">
					<h2 className="text-2xl font-semibold mb-4">Socials</h2>
					<div className="mt-2 space-y-3">
						{socials.map(({ label, href, Icon }) => (
							<a
								key={label}
								href={href}
								target="_blank"
								rel="noopener noreferrer"
								className="flex items-center justify-between gap-2 sm:gap-3 rounded-md border border-ctp-overlay1/40 bg-ctp-surface0/60 px-3 sm:px-4 py-2 sm:py-3 text-ctp-text transition-all duration-200 hover:-translate-y-0.5 hover:border-ctp-overlay1/70 hover:bg-ctp-surface0/80"
							>
								<span className="flex items-center gap-2 sm:gap-3">
									<span className="flex h-8 sm:h-10 w-8 sm:w-10 aspect-square items-center justify-center rounded-full bg-ctp-surface1 text-ctp-text/90 shrink-0">
										<Icon className="h-4 sm:h-5 w-4 sm:w-5" aria-hidden />
									</span>
									<span className="font-semibold text-sm sm:text-base truncate">
										{label}
									</span>
								</span>
								<ArrowUpRight
									className="h-4 sm:h-5 w-4 sm:w-5 text-ctp-subtext1 ml-2 sm:ml-5 shrink-0"
									aria-hidden
								/>
							</a>
						))}
					</div>
				</Card>

				<div className="relative aspect-4/3 w-full overflow-hidden rounded-xl border border-ctp-overlay1/40 bg-ctp-surface0/40 shadow-[0px_10px_30px_rgba(0,0,0,0.2)]">
					<Image
						src={andrewImage}
						alt="Team photo"
						fill
						priority
						className="object-cover"
						sizes="(min-width: 1024px) 50vw, 100vw"
					/>
					<div className="pointer-events-none absolute inset-0 bg-linear-to-t from-transparent via-transparent to-ctp-crust/40" />
				</div>
			</section>

			<section className="mt-8 sm:mt-10 grid w-full max-w-5xl grid-cols-1 items-start gap-6 sm:gap-8 lg:grid-cols-2 lg:items-center">
				<div className="relative h-48 sm:h-64 lg:h-80 w-full overflow-hidden rounded-xl border border-ctp-overlay1/40 bg-ctp-surface0/40 shadow-[0px_10px_30px_rgba(0,0,0,0.2)]">
					<div ref={mapContainerRef} className="h-full w-full" />
				</div>
				<Card className="w-full max-w-xl mx-auto lg:mx-0">
					<h2 className="text-2xl font-semibold mb-4">Contact Us</h2>
					<div className="space-y-3">
						{contacts.map(({ label, value, href, Icon }) => (
							<div
								key={label}
								className="w-full flex items-center gap-2 sm:gap-3 rounded-md border border-ctp-overlay1/40 bg-ctp-surface0/60 px-3 sm:px-4 py-2 sm:py-3 text-ctp-text transition-all duration-200 hover:-translate-y-0.5 hover:border-ctp-overlay1/70 hover:bg-ctp-surface0/80"
								role="group"
							>
								<a
									href={href}
									target="_blank"
									rel="noopener noreferrer"
									className="flex items-center gap-3 flex-1 min-w-0"
								>
									<span className="flex h-8 sm:h-10 w-8 sm:w-10 aspect-square items-center justify-center rounded-full bg-ctp-surface1 text-ctp-text/90 shrink-0">
										<Icon className="h-4 sm:h-5 w-4 sm:w-5" aria-hidden />
									</span>
									<span className="flex flex-col text-left w-full min-w-0">
										<span className="text-xs sm:text-sm font-semibold text-ctp-subtext1">
											{label}
										</span>
										<span className="font-semibold truncate text-sm sm:text-base">
											{value}
										</span>
									</span>
								</a>
								<button
									type="button"
									onClick={async (event) => {
										event.preventDefault();
										event.stopPropagation();
										await copyValue(value);
									}}
									title="Copy to clipboard"
									className="cursor-pointer inline-flex h-8 ml-2 sm:ml-5 sm:h-10 w-8 sm:w-10 items-center justify-center rounded-lg border border-ctp-overlay1/60 bg-ctp-surface1/60 text-ctp-subtext1 shadow-[0px_6px_12px_rgba(0,0,0,0.18)] transition duration-150 hover:-translate-y-px hover:border-ctp-lavender/60 hover:bg-ctp-surface1/90 hover:text-ctp-text hover:shadow-[0px_10px_18px_rgba(0,0,0,0.22)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ctp-lavender/60 shrink-0"
								>
									<Copy className="h-4 sm:h-5 w-4 sm:w-5" aria-hidden />
									<span className="sr-only">Copy {label}</span>
								</button>
							</div>
						))}
					</div>
				</Card>
			</section>
		</main>
	);
}

function SimpleIconSvg({
	icon,
	...props
}: { icon: { path: string } } & React.SVGProps<SVGSVGElement>) {
	return (
		<svg
			aria-hidden
			viewBox="0 0 24 24"
			fill="currentColor"
			role="img"
			focusable="false"
			{...props}
		>
			<path d={icon.path} />
		</svg>
	);
}

function DiscordIcon(props: React.SVGProps<SVGSVGElement>) {
	return <SimpleIconSvg icon={siDiscord} {...props} />;
}

function InstagramIcon(props: React.SVGProps<SVGSVGElement>) {
	return <SimpleIconSvg icon={siInstagram} {...props} />;
}

function FacebookIcon(props: React.SVGProps<SVGSVGElement>) {
	return <SimpleIconSvg icon={siFacebook} {...props} />;
}
