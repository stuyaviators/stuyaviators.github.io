import { renderOg } from "@/lib/og";

export const alt = "The Flight Crew · StuyAviators";

export default async function Image() {
	return renderOg({
		title: "The Flight Crew",
		eyebrow: "Community",
		photo: "hero-classroom-meeting",
	});
}

export { ogContentType as contentType, ogSize as size } from "@/lib/og";
