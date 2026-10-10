import { renderOg } from "@/lib/og";

export const alt = "Opportunities · StuyAviators";

export default async function Image() {
	return renderOg({
		title: "Opportunities",
		eyebrow: "Explore",
		photo: "event-aviation-hs-panel",
		detail: "Programs, internships and experiences",
	});
}

export { ogContentType as contentType, ogSize as size } from "@/lib/og";
