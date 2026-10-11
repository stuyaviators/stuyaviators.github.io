import { readFile } from "node:fs/promises";
import { renderOg } from "@/lib/og";

export const alt = "Meetings · StuyAviators";

export default async function Image() {
	return renderOg({
		title: "Meetings",
		eyebrow: "Explore",
		photo: await readFile(
			new URL("../../../assets/photos/hero-sim-setup.jpg", import.meta.url)
		),
		detail: "Flight sims, crash labs, ATC and more",
	});
}

export { ogContentType as contentType, ogSize as size } from "@/lib/og";
