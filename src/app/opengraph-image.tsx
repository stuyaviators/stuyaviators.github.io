import { readFile } from "node:fs/promises";
import { renderOg } from "@/lib/og";

export const alt = "StuyAviators · StuyAviators";

export default async function Image() {
	return renderOg({
		title: "StuyAviators",
		eyebrow: "Stuyvesant High School’s Official Aviation Club",
		photo: await readFile(
			new URL("../assets/photos/hero-cessna-backseat.jpg", import.meta.url)
		),
		detail: "Making the skies inclusive and accessible",
	});
}

export { ogContentType as contentType, ogSize as size } from "@/lib/og";
