import { MapPin, Navigation } from "lucide-react";
import { buttonClasses } from "./ui/Button.tsx";
import { FlightStrip } from "./ui/FlightStrip.tsx";

/**
 Keyless Google Maps embed (no API key, no billing). Fixed aspect ratio so it
 doesn't shift layout; the buttons keep it useful if the iframe is blocked.
 */
export default function GoogleMap({
	embedUrl,
	openUrl,
	directionsUrl,
	title,
	label = "Location",
}: {
	readonly embedUrl: string;
	readonly openUrl: string;
	readonly directionsUrl: string;
	readonly title: string;
	readonly label?: string;
}) {
	return (
		<figure>
			<FlightStrip label={label} />
			<div className="mt-3 aspect-[4/3] overflow-hidden rounded-2xl border border-hairline bg-surface-2 sm:aspect-[16/10]">
				<iframe
					src={embedUrl}
					title={title}
					loading="lazy"
					referrerPolicy="no-referrer-when-downgrade"
					allowFullScreen
					className="size-full border-0"
				/>
			</div>
			<figcaption className="mt-3 flex flex-wrap gap-3">
				<a
					href={openUrl}
					target="_blank"
					rel="noopener noreferrer"
					className={buttonClasses("secondary")}
				>
					<MapPin aria-hidden className="size-4" /> Open in Google Maps
				</a>
				<a
					href={directionsUrl}
					target="_blank"
					rel="noopener noreferrer"
					className={buttonClasses("ghost")}
				>
					<Navigation aria-hidden className="size-4" /> Get directions
				</a>
			</figcaption>
		</figure>
	);
}
