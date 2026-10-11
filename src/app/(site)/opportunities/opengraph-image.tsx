import { readFile } from "node:fs/promises";
import { renderOg } from "@/lib/og";

export const alt = "Opportunities · StuyAviators";

export default async function Image() {
	return renderOg({
		title: "Opportunities",
		eyebrow: "Explore",
		photo: await readFile(
			new URL(
				"../../assets/photos/event-aviation-hs-panel.jpg",
				import.meta.url
			)
		),
		detail: "Programs, internships and experiences",
	});
}

export { ogContentType as contentType, ogSize as size } from "@/lib/og";
