import { renderOg } from "@/lib/og";

export const alt = "Community Highlights · StuyAviators";

export default async function Image() {
	return renderOg({
		title: "Community Highlights",
		eyebrow: "Community · Gallery",
		photo: "gallery-strut-coastline",
	});
}

export { ogContentType as contentType, ogSize as size } from "@/lib/og";
