import { readFile } from "node:fs/promises";
import { renderOg } from "@/lib/og";

export const alt = "Club Charter & Rules · StuyAviators";

export default async function Image() {
	return renderOg({
		title: "Club Charter & Rules",
		eyebrow: "About",
		photo: await readFile(
			new URL("../../../assets/photos/hero-sim-classroom.jpg", import.meta.url)
		),
	});
}

export { ogContentType as contentType, ogSize as size } from "@/lib/og";
