import { readFile } from "node:fs/promises";
import { renderOg } from "@/lib/og";

export const alt = "Connect · StuyAviators";

export default async function Image() {
	return renderOg({
		title: "Connect",
		eyebrow: "Socials & contact",
		photo: await readFile(
			new URL("../../../assets/photos/hero-sim-ryanair.jpg", import.meta.url)
		),
	});
}

export { ogContentType as contentType, ogSize as size } from "@/lib/og";
