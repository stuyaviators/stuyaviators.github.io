import { readFile } from "node:fs/promises";
import { renderOg } from "@/lib/og";

export const alt = "The Flight Crew · StuyAviators";

export default async function Image() {
	return renderOg({
		title: "Flight Crew",
		eyebrow: "Community",
		photo: await readFile(
			new URL("../../assets/photos/hero-classroom-meeting.jpg", import.meta.url)
		),
	});
}

export { ogContentType as contentType, ogSize as size } from "@/lib/og";
