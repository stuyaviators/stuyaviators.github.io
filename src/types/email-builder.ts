export type Article = {
	id: string;
	type?: "article" | "separator" | "subheading" | "image";
	title?: string;
	description?: string;
	imageUrl?: string;
	buttonText?: string;
	buttonUrl?: string;
};

export type NewsletterFormData = {
	headerTitle: string;
	headerSubtitle: string;
	headerLogoUrl: string;
	introHeading: string;
	introText: string;
	articles: Article[];
	footerText: string;
	footerLinks: Array<{
		label: string;
		url: string;
	}>;
	socialLinks: Array<{
		platform: string;
		url: string;
	}>;
	viewInBrowserUrl: string;
};
