/**
URL-safe slug from a card title: "NASA Summer Camp!" → "nasa-summer-camp".
*/
export function listingSlug(title: string): string {
	return (
		title
			.normalize("NFKD")
			.replaceAll(/\p{Mark}/gu, "")
			.toLowerCase()
			.replaceAll(/[^\da-z]+/gu, "-")
			.replaceAll(/^-|-$/gu, "")
			.slice(0, 80)
			.replaceAll(/-$/gu, "") || "listing"
	);
}
