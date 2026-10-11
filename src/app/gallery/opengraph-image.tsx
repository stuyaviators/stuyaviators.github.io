import { readFile } from "node:fs/promises";
import { renderOg } from "@/lib/og";

export const alt = "Community Highlights · StuyAviators";

export default async function Image() {
	return renderOg({
		title: "Gallery",
		eyebrow: "Community · Gallery",
		photo: await readFile(
			new URL(
				"../../assets/photos/gallery-strut-coastline.jpg",
				import.meta.url
			)
		),
	});
}

export { ogContentType as contentType, ogSize as size } from "@/lib/og";
