import { ogContentType, ogSize, renderOg } from "@/lib/og";

export const alt = "Scholarships · StuyAviators";
export const size = ogSize;
export const contentType = ogContentType;

export default async function Image() {
	return renderOg({
		title: "Scholarships",
		eyebrow: "Explore",
		photo: "hero-cessna-sunset",
		detail: "Funding for school and flight training",
	});
}
