import { renderOg } from "@/lib/og";

export const alt = "Club Charter & Rules · StuyAviators";

export default async function Image() {
	return renderOg({
		title: "Club Charter & Rules",
		eyebrow: "About",
		photo: "hero-sim-classroom",
	});
}

export { ogContentType as contentType, ogSize as size } from "@/lib/og";
