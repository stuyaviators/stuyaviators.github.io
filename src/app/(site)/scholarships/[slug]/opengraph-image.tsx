import { readFile } from "node:fs/promises";
import { renderListingOg } from "@/components/listings/listing-page";

export const alt = "StuyAviators scholarship";

export default async function Image({
	params,
}: {
	readonly params: Promise<{ slug: string }>;
}) {
	return renderListingOg({
		kind: "scholarship",
		parameters: params,
		photo: await readFile(
			new URL(
				"../../../../assets/photos/hero-cessna-sunset.jpg",
				import.meta.url
			)
		),
	});
}

export { ogContentType as contentType, ogSize as size } from "@/lib/og";
