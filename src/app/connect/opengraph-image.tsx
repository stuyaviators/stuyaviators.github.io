import { ogContentType, ogSize, renderOg } from "@/lib/og";

export const alt = "Connect · StuyAviators";
export const size = ogSize;
export const contentType = ogContentType;

export default async function Image() {
	return renderOg({
		title: "Connect",
		eyebrow: "Socials & contact",
		photo: "hero-sim-ryanair",
	});
}
