import { ogContentType, ogSize, renderOg } from "@/lib/og";

export const alt = "Our Mission & Project Skylab · StuyAviators";
export const size = ogSize;
export const contentType = ogContentType;

export default async function Image() {
	return renderOg({
		title: "Our Mission & Project Skylab",
		eyebrow: "About",
		photo: "hero-sim-display",
	});
}
