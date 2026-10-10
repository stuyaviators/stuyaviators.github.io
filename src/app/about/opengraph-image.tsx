import { renderOg } from "@/lib/og";

export const alt = "Our Mission & Project Skylab · StuyAviators";

export default async function Image() {
	return renderOg({
		title: "Our Mission & Project Skylab",
		eyebrow: "About",
		photo: "hero-sim-display",
	});
}

export { ogContentType as contentType, ogSize as size } from "@/lib/og";
