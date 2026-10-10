import { ogContentType, ogSize, renderOg } from "@/lib/og";

export const alt = "Meetings · StuyAviators";
export const size = ogSize;
export const contentType = ogContentType;

export default async function Image() {
	return renderOg({
		title: "Meetings",
		eyebrow: "Explore",
		photo: "hero-sim-setup",
		detail: "Flight sims, crash labs, ATC and more",
	});
}
