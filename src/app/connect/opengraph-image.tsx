import { renderOg } from "@/lib/og";

export const alt = "Connect · StuyAviators";

export default async function Image() {
	return renderOg({
		title: "Connect",
		eyebrow: "Socials & contact",
		photo: "hero-sim-ryanair",
	});
}

export { ogContentType as contentType, ogSize as size } from "@/lib/og";
