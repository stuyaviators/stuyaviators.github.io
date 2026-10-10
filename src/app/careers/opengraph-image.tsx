import { renderOg } from "@/lib/og";

export const alt = "Future Careers · StuyAviators";

export default async function Image() {
	return renderOg({
		title: "Future Careers",
		eyebrow: "Explore",
		photo: "event-airline-booth",
		detail: "87 careers in aviation and aerospace",
	});
}

export { ogContentType as contentType, ogSize as size } from "@/lib/og";
