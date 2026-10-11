import { readFile } from "node:fs/promises";
import { slugSchema } from "@/lib/newsletters";
import { getPublishedWebVersion } from "@/lib/newsletters-public";
import { renderOg } from "@/lib/og";

export const alt = "StuyAviators newsletter";

const monthYear = new Intl.DateTimeFormat("en-US", {
	month: "long",
	year: "numeric",
	timeZone: "America/New_York",
});

/**
The card for one published issue: its headline and month. An unknown or
unpublished address gets the generic newsletter card.
*/
export default async function Image({
	params,
}: {
	readonly params: Promise<{ slug: string }>;
}) {
	const { slug } = await params;
	const newsletter = slugSchema.safeParse(slug).success
		? await getPublishedWebVersion(slug)
		: undefined;
	const photo = await readFile(
		new URL("../../../../assets/photos/hero-presentation.jpg", import.meta.url)
	);
	if (!newsletter) {
		return renderOg({ title: "Newsletter", eyebrow: "StuyAviators", photo });
	}

	const { data, publishedAt } = newsletter;
	return renderOg({
		title: (data.introHeading || data.headerTitle).slice(0, 90),
		eyebrow: "Newsletter",
		photo,
		detail: publishedAt ? monthYear.format(new Date(publishedAt)) : undefined,
	});
}

export { ogContentType as contentType, ogSize as size } from "@/lib/og";
