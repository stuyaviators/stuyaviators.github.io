import type { Metadata } from "next";
import { site } from "@/content/site";
import { NewsletterContent } from "@/emails/Newsletter";
import { newsletterUrls } from "@/lib/newsletter/render";
import { slugSchema } from "@/lib/newsletters";
import { getPublishedWebVersion } from "@/lib/newsletters-public";
import { notFound } from "next/navigation";

export const revalidate = 3600;

async function load(slug: string) {
	return slugSchema.safeParse(slug).success
		? getPublishedWebVersion(slug)
		: undefined;
}

export async function generateMetadata({
	params,
}: {
	readonly params: Promise<{ slug: string }>;
}): Promise<Metadata> {
	const { slug } = await params;
	const newsletter = await load(slug);
	if (!newsletter) {
		return { title: "Newsletter", robots: { index: false } };
	}

	const { data } = newsletter;
	return {
		title: data.introHeading || data.headerTitle,
		description: data.previewText || data.introText.slice(0, 160) || undefined,
		alternates: { canonical: `${site.url}/newsletter/${newsletter.slug}` },
	};
}

/**
The web version of a published newsletter (the email’s “View in browser”).
*/
export default async function NewsletterPage({
	params,
}: {
	readonly params: Promise<{ slug: string }>;
}) {
	const { slug } = await params;
	const newsletter = await load(slug);
	if (!newsletter) {
		notFound();
	}

	return (
		<div className="px-3 pt-28 pb-16 sm:pt-32">
			<h1 className="sr-only">
				{newsletter.data.introHeading || newsletter.data.headerTitle}
			</h1>
			<NewsletterContent
				data={newsletter.data}
				{...newsletterUrls(newsletter.slug)}
				// Already the web version; no “View in browser” link.
				webUrl={undefined}
			/>
		</div>
	);
}
