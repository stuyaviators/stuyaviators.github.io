import { ogContentType, ogSize, renderOg } from "@/lib/og";

export const alt = "Member Stories · StuyAviators";
export const size = ogSize;
export const contentType = ogContentType;

export default async function Image() {
	return renderOg({
		title: "Member Stories",
		eyebrow: "Community",
		photo: "hero-cessna-backseat",
	});
}
