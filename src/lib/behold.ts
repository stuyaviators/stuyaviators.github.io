import { z } from "zod";

/*
 * Instagram feed via Behold (https://behold.so), fetched server-side with ISR
 * so visitors never load Behold's widget. Only `sizes.*.mediaUrl`
 * (behold.pictures) is used for images; the top-level mediaUrl/thumbnailUrl
 * are signed Instagram CDN links that expire. See docs/behold-setup.md.
 */

const size = z.object({
	width: z.number(),
	height: z.number(),
	mediaUrl: z.url(),
});

const post = z.object({
	id: z.string(),
	permalink: z.url(),
	timestamp: z.string(),
	mediaType: z.enum(["IMAGE", "VIDEO", "CAROUSEL_ALBUM"]),
	caption: z.string().optional().default(""),
	prunedCaption: z.string().optional().default(""),
	likeCount: z.number().optional(),
	commentsCount: z.number().optional(),
	colorPalette: z
		.object({ dominant: z.string().optional(), muted: z.string().optional() })
		.partial()
		.optional(),
	sizes: z.object({
		small: size,
		medium: size,
		large: size,
		full: size,
	}),
});

const feed = z.object({
	username: z.string(),
	biography: z.string().optional().default(""),
	profilePictureUrl: z.url().optional(),
	followersCount: z.number().optional(),
	posts: z.array(z.unknown()),
});

export type BeholdPost = z.infer<typeof post> & { placeholder: string };
export type BeholdFeed = {
	username: string;
	biography: string;
	profilePictureUrl?: string;
	followersCount?: number;
	posts: BeholdPost[];
};

const allowedHosts = new Set(["behold.pictures", "cdn2.behold.pictures"]);

function isBeholdImage(url: string) {
	try {
		return allowedHosts.has(new URL(url).hostname);
	} catch {
		return false;
	}
}

/**
"157,145,140" → "rgb(157 145 140)" for the tile's loading background.
*/
export function paletteColor(value?: string): string {
	const parts = value?.split(",").map((n) => Number(n.trim()));
	return parts?.length !== 3 || parts.some((n) => !Number.isFinite(n))
		? "var(--surface-2)"
		: `rgb(${parts.join(" ")})`;
}

/**
Validates the payload; unknown fields are ignored, bad posts are skipped.
*/
export function parseFeed(data: unknown): BeholdFeed | undefined {
	const parsed = feed.safeParse(data);
	if (!parsed.success) {
		return undefined;
	}

	const posts: BeholdPost[] = [];
	for (const raw of parsed.data.posts) {
		const result = post.safeParse(raw);
		if (!result.success) {
			continue;
		}

		const { sizes } = result.data;
		if (
			[sizes.small, sizes.medium, sizes.large, sizes.full].some(
				(s) => !isBeholdImage(s.mediaUrl)
			)
		) {
			continue;
		}

		posts.push({
			...result.data,
			placeholder: paletteColor(
				result.data.colorPalette?.dominant ?? result.data.colorPalette?.muted
			),
		});
	}

	return {
		username: parsed.data.username,
		biography: parsed.data.biography,
		profilePictureUrl:
			parsed.data.profilePictureUrl &&
			isBeholdImage(parsed.data.profilePictureUrl)
				? parsed.data.profilePictureUrl
				: undefined,
		followersCount: parsed.data.followersCount,
		posts,
	};
}

/**
Returns undefined on any failure so callers can hide the section.
*/
export async function getInstagramFeed(): Promise<BeholdFeed | undefined> {
	const url =
		process.env.BEHOLD_FEED_URL ??
		"https://feeds.behold.so/CDSpFlcqkbtsbwbH8PR1";
	if (!url) {
		return undefined;
	}

	try {
		const response = await fetch(url, {
			next: { revalidate: 3600, tags: ["instagram"] },
			signal: AbortSignal.timeout(4000),
		});
		if (!response.ok) {
			return undefined;
		}

		const result = parseFeed(await response.json());
		return result && result.posts.length > 0 ? result : undefined;
	} catch {
		return undefined;
	}
}
