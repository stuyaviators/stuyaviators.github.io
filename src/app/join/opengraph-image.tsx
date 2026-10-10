import { readFile } from "node:fs/promises";
import { renderOg } from "@/lib/og";

export const alt = "Join StuyAviators · StuyAviators";

export default async function Image() {
	return renderOg({
		title: "Join StuyAviators",
		eyebrow: "No experience needed",
		photo: await readFile(
			new URL("../../assets/photos/hero-joystick.jpg", import.meta.url)
		),
	});
}

export { ogContentType as contentType, ogSize as size } from "@/lib/og";
