import { readFile } from "node:fs/promises";
import { renderOg } from "@/lib/og";

export const alt = "Future Careers · StuyAviators";

export default async function Image() {
	return renderOg({
		title: "Future Careers",
		eyebrow: "Explore",
		photo: await readFile(
			new URL("../../assets/photos/event-airline-booth.jpg", import.meta.url)
		),
		detail: "87 careers in aviation and aerospace",
	});
}

export { ogContentType as contentType, ogSize as size } from "@/lib/og";
