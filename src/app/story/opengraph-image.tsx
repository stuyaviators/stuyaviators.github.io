import { renderOg } from "@/lib/og";

export const alt = "Our Story · StuyAviators";

export default async function Image() {
	return renderOg({
		title: "Our Story",
		eyebrow: "About · Since 2022",
		photo: "hero-landing-challenge",
	});
}

export { ogContentType as contentType, ogSize as size } from "@/lib/og";
