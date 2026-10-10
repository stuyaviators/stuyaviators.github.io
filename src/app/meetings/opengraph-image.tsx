import { renderOg } from "@/lib/og";

export const alt = "Meetings · StuyAviators";

export default async function Image() {
	return renderOg({
		title: "Meetings",
		eyebrow: "Explore",
		photo: "hero-sim-setup",
		detail: "Flight sims, crash labs, ATC and more",
	});
}

export { ogContentType as contentType, ogSize as size } from "@/lib/og";
