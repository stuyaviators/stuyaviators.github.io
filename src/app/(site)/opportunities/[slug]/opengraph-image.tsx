import { readFile } from "node:fs/promises";
import { renderListingOg } from "@/components/listings/listing-page";

export const alt = "StuyAviators opportunity";

export default async function Image({
	params,
}: {
	readonly params: Promise<{ slug: string }>;
}) {
	return renderListingOg({
		kind: "opportunity",
		parameters: params,
		photo: await readFile(
			new URL(
				"../../../../assets/photos/event-aviation-hs-panel.jpg",
				import.meta.url
			)
		),
	});
}

export { ogContentType as contentType, ogSize as size } from "@/lib/og";
