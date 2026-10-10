import { renderOg } from "@/lib/og";

export const alt = "Member Stories · StuyAviators";

export default async function Image() {
	return renderOg({
		title: "Member Stories",
		eyebrow: "Community",
		photo: "hero-cessna-backseat",
	});
}

export { ogContentType as contentType, ogSize as size } from "@/lib/og";
