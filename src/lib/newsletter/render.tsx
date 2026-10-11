import type { NewsletterData } from "./types.ts";
import { site } from "@/content/site";
import NewsletterEmail from "@/emails/Newsletter";
import { unsubscribeMailto } from "@/lib/google-forms";
import { render } from "@react-email/render";

export function newsletterUrls(slug?: string) {
	return {
		siteUrl: site.url,
		webUrl: slug ? `${site.url}/newsletter/${slug}` : undefined,
		unsubscribeUrl: unsubscribeMailto,
	};
}

/**
Full email HTML, ready for Gmail or download.
*/
export async function renderNewsletter(
	data: NewsletterData,
	slug?: string
): Promise<{ html: string; text: string }> {
	const element = <NewsletterEmail data={data} {...newsletterUrls(slug)} />;
	const [html, text] = await Promise.all([
		render(element),
		render(element, { plainText: true }),
	]);
	return { html, text };
}
