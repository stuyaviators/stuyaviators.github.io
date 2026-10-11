import type { NewsletterData } from "@/lib/newsletter/types";
import { getDb } from "@/db";
import { newsletterSchema } from "@/lib/newsletter/types";
import { getPublishedNewsletter, newslettersTag } from "@/lib/newsletters";
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
