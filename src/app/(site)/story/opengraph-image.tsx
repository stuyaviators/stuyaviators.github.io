import { readFile } from "node:fs/promises";
import { renderOg } from "@/lib/og";

export const alt = "Our Story · StuyAviators";

export default async function Image() {
	return renderOg({
		title: "Our Story",
		eyebrow: "About · Since 2022",
		photo: await readFile(
			new URL("../../../assets/photos/hero-landing-challenge.jpg", import.meta.url)
		),
	});
}

export { ogContentType as contentType, ogSize as size } from "@/lib/og";
