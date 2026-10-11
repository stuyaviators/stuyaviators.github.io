import { z } from "zod";

/*
 * Newsletter content, ported from recode's email builder (webcubed's
 * src/types/email-builder.ts). Blocks replace recode's "articles" list, and
 * every field is validated with Zod before it's saved or rendered.
 */

/**
An http(s) URL, or empty. Blocks javascript:, data: and other schemes.
*/
export const optionalUrl = z
	.string()
	.trim()
	.max(2000)
	.refine((value) => value === "" || /^https?:\/\/[^\s]+$/iu.test(value), {
		message: "Use a full link starting with https://",
	});

const id = z.string().min(1).max(64);
const line = z.string().max(200);
const paragraph = z.string().max(5000);

export const blockSchema = z.discriminatedUnion("type", [
	z.object({
		id,
		type: z.literal("article"),
		title: line,
		body: paragraph, // Markdown
		imageUrl: optionalUrl,
		buttonText: z.string().max(60),
		buttonUrl: optionalUrl,
	}),
	// A large section heading ("This month in aviation").
	z.object({ id, type: z.literal("separator"), title: line }),
	// A small caps label.
	z.object({ id, type: z.literal("subheading"), title: line }),
	z.object({
		id,
		type: z.literal("image"),
		imageUrl: optionalUrl,
		caption: paragraph,
	}),
]);

export const socialPlatforms = [
	"instagram",
	"discord",
	"youtube",
	"facebook",
	"epsilon",
] as const;

export const newsletterSchema = z.object({
	headerTitle: line,
	headerSubtitle: line,
	headerLogoUrl: optionalUrl,
	/**
	The grey preview line inboxes show next to the subject.
	*/
	previewText: line,
	introHeading: line,
	introText: paragraph, // Markdown
	blocks: z.array(blockSchema).max(60),
	footerText: z.string().max(500),
	footerLinks: z
		.array(z.object({ label: z.string().max(60), url: optionalUrl }))
		.max(8),
	socialLinks: z
		.array(z.object({ platform: z.enum(socialPlatforms), url: optionalUrl }))
		.max(8),
});

export type NewsletterData = z.infer<typeof newsletterSchema>;
export type Block = z.infer<typeof blockSchema>;
export type BlockType = Block["type"];
export type SocialPlatform = (typeof socialPlatforms)[number];
