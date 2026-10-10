import { renderOg } from "@/lib/og";

export const alt = "Scholarships · StuyAviators";

export default async function Image() {
	return renderOg({
		title: "Scholarships",
		eyebrow: "Explore",
		photo: "hero-cessna-sunset",
		detail: "Funding for school and flight training",
	});
}

export { ogContentType as contentType, ogSize as size } from "@/lib/og";
