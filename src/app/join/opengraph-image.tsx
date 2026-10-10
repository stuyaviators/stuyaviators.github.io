import { ogContentType, ogSize, renderOg } from "@/lib/og";

export const alt = "Join StuyAviators · StuyAviators";
export const size = ogSize;
export const contentType = ogContentType;

export default async function Image() {
	return renderOg({
		title: "Join StuyAviators",
		eyebrow: "No experience needed",
		photo: "hero-joystick",
	});
}
