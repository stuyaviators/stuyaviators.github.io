import { ogContentType, ogSize, renderOg } from "@/lib/og";

export const alt = "Brand Guidelines · StuyAviators";
export const size = ogSize;
export const contentType = ogContentType;

export default async function Image() {
	return renderOg({
		title: "Brand Guidelines",
		eyebrow: "Logos, colors & type",
	});
}
