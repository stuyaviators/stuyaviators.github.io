import type { NewsletterData } from "@/lib/newsletter/types";
import { getDb } from "@/db";
import { newsletterSchema } from "@/lib/newsletter/types";
import {
	getPublishedNewsletter,
	listPublishedNewsletters,
	newslettersTag,
} from "@/lib/newsletters";
import { unstable_cache } from "next/cache";

/*
 * The public side of newsletters (/newsletter/[slug]). Cached, and expired
 * by the publish/unpublish/delete actions through the "newsletters" tag.
 */

export type PublishedNewsletter = {
	slug: string;
	data: NewsletterData;
	publishedAt: string | undefined;
};

export const getPublishedWebVersion = unstable_cache(
	async (slug: string): Promise<PublishedNewsletter | undefined> => {
		const db = getDb();
		if (!db) {
			return undefined;
		}

		try {
			const newsletter = await getPublishedNewsletter(db, slug);
			const parsed = newsletterSchema.safeParse(newsletter?.published);
			if (!newsletter?.slug || !parsed.success) {
				return undefined;
			}

			return {
				slug: newsletter.slug,
				data: parsed.data,
				publishedAt: newsletter.publishedAt?.toISOString(),
			};
		} catch (error) {
			console.error("Could not load newsletter", error);
			return undefined;
		}
	},
	["published-newsletter"],
	{ tags: [newslettersTag], revalidate: 3600 }
);

export type NewsletterSummary = {
	slug: string;
	title: string;
	excerpt: string;
	publishedAt: string | undefined;
};

/**
One line for the archive: the preview text, or the start of the introduction.
*/
export function excerptOf(data: NewsletterData) {
	const text = data.previewText.trim() || data.introText.trim();
	const plain = text
		.replaceAll(/[#*>[\]_`]|\(https?:[^)]*\)/gu, "")
		.replaceAll(/\s+/gu, " ");
	return plain.length > 160 ? `${plain.slice(0, 157).trimEnd()}…` : plain;
}

export const getNewsletterArchive = unstable_cache(
	async (): Promise<NewsletterSummary[]> => {
		const db = getDb();
		if (!db) {
			return [];
		}

		try {
			const rows = await listPublishedNewsletters(db);
			return rows.flatMap((row) => {
				const parsed = newsletterSchema.safeParse(row.published);
				return row.slug && parsed.success
					? [
							{
								slug: row.slug,
								title: parsed.data.introHeading || parsed.data.headerTitle,
								excerpt: excerptOf(parsed.data),
								publishedAt: row.publishedAt?.toISOString(),
							},
						]
					: [];
			});
		} catch (error) {
			console.error("Could not load the newsletter archive", error);
			return [];
		}
	},
	["newsletter-archive"],
	{ tags: [newslettersTag], revalidate: 3600 }
);
