import { ogContentType, ogSize, renderOg } from "@/lib/og";

export const alt = "Opportunities · StuyAviators";
export const size = ogSize;
export const contentType = ogContentType;

export default async function Image() {
	return renderOg({
		title: "Opportunities",
		eyebrow: "Explore",
		photo: "event-aviation-hs-panel",
		detail: "Programs, internships and experiences",
	});
}
