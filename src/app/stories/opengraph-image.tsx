import { readFile } from "node:fs/promises";
import { renderOg } from "@/lib/og";

export const alt = "Member Stories · StuyAviators";

export default async function Image() {
	return renderOg({
		title: "Member Stories",
		eyebrow: "Community",
		photo: await readFile(
			new URL("../../assets/photos/hero-cessna-backseat.jpg", import.meta.url)
		),
	});
}

export { ogContentType as contentType, ogSize as size } from "@/lib/og";
