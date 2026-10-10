import { renderOg } from "@/lib/og";

export const alt = "Brand Guidelines · StuyAviators";

export default async function Image() {
	return renderOg({
		title: "Brand Guidelines",
		eyebrow: "Logos, colors & type",
	});
}

export { ogContentType as contentType, ogSize as size } from "@/lib/og";
