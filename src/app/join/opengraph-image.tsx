import { renderOg } from "@/lib/og";

export const alt = "Join StuyAviators · StuyAviators";

export default async function Image() {
	return renderOg({
		title: "Join StuyAviators",
		eyebrow: "No experience needed",
		photo: "hero-joystick",
	});
}

export { ogContentType as contentType, ogSize as size } from "@/lib/og";
