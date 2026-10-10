import { readFile } from "node:fs/promises";
import { renderOg } from "@/lib/og";

export const alt = "Scholarships · StuyAviators";

export default async function Image() {
	return renderOg({
		title: "Scholarships",
		eyebrow: "Explore",
		photo: await readFile(
			new URL("../../assets/photos/hero-cessna-sunset.jpg", import.meta.url)
		),
		detail: "Funding for school and flight training",
	});
}

export { ogContentType as contentType, ogSize as size } from "@/lib/og";
