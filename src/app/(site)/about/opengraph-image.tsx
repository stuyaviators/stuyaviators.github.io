import { readFile } from "node:fs/promises";
import { renderOg } from "@/lib/og";

export const alt = "Our Mission & Project Skylab · StuyAviators";

export default async function Image() {
	return renderOg({
		title: "Our Mission & Project Skylab",
		eyebrow: "About",
		photo: await readFile(
			new URL("../../../assets/photos/hero-sim-display.jpg", import.meta.url)
		),
	});
}

export { ogContentType as contentType, ogSize as size } from "@/lib/og";
