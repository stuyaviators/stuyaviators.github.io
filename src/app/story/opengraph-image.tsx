import { ogContentType, ogSize, renderOg } from "@/lib/og";

export const alt = "Our Story · StuyAviators";
export const size = ogSize;
export const contentType = ogContentType;

export default async function Image() {
	return renderOg({
		title: "Our Story",
		eyebrow: "About · Since 2022",
		photo: "hero-landing-challenge",
	});
}
