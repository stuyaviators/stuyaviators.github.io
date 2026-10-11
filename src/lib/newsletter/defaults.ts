import type { Block, BlockType, NewsletterData } from "./types.ts";
import { site, socials } from "@/content/site";

function socialUrl(key: string) {
	return socials.find((social) => social.key === key)?.href ?? "";
}

/**
A fresh newsletter, adapted from recode's defaultFormData.
*/
export function defaultNewsletter(now = new Date()): NewsletterData {
	const month = new Intl.DateTimeFormat("en-US", {
		month: "long",
		timeZone: "America/New_York",
	}).format(now);
	return {
		headerTitle: "StuyAviators",
		headerSubtitle: "Stuyvesant High School’s Official Aviation Club",
		headerLogoUrl: `${site.url}/brand/logo-256.png`,
		previewText: "",
		introHeading: `StuyAviators ${month} Newsletter`,
		introText: "Here’s what’s new with StuyAviators.",
		blocks: [
			newBlock("separator", "sep-1", { title: "This month" }),
			newBlock("article", "art-1"),
		],
		footerText: `© ${now.getFullYear()} StuyAviators · ${site.address.line}`,
		footerLinks: [{ label: "Website", url: site.url }],
		socialLinks: [
			{ platform: "instagram", url: socialUrl("instagram") },
			{ platform: "discord", url: socialUrl("discord") },
			{ platform: "epsilon", url: socialUrl("epsilon") },
		],
	};
}

export function newBlock(
	type: BlockType,
	id: string,
	values: { title?: string } = {}
): Block {
	switch (type) {
		case "article": {
			return {
				id,
				type,
				title: values.title ?? "",
				body: "",
				imageUrl: "",
				buttonText: "",
				buttonUrl: "",
			};
		}

		case "image": {
			return { id, type, imageUrl: "", caption: "" };
		}

		default: {
			return { id, type, title: values.title ?? "" };
		}
	}
}

/**
URL-safe slug from a title: "October Newsletter!" → "october-newsletter".
*/
export function slugify(title: string): string {
	return (
		title
			.normalize("NFKD")
			.replaceAll(/[̀-ͯ]/gu, "")
			.toLowerCase()
			.replaceAll(/[^a-z\d]+/gu, "-")
			.replaceAll(/^-+|-+$/gu, "")
			.slice(0, 80) || "newsletter"
	);
}
