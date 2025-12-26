import type { Article, NewsletterFormData } from "@/types/email-builder";

const storageKey = "newsletter-draft";
const presetsKey = "newsletter-presets";

export const defaultFormData: NewsletterFormData = {
	headerTitle: "StuyAviators",
	headerSubtitle: "",
	headerLogoUrl: "https://stuyaviators.vercel.app/stuyaviators.png",
	introHeading: "StuyAviators January Newsletter",
	introText: "Check out what's new with StuyAviators!",
	articles: [
		{
			id: "sep-1",
			type: "separator",
			title: "This Week in Aviation",
		},
		{
			id: "art-1",
			type: "article",
			title: "Article Title",
			description: "Article description goes here",
			imageUrl: "",
			buttonText: "Read More",
			buttonUrl: "",
		},
	],
	footerText: "© 2025 StuyAviators. All rights reserved.",
	footerLinks: [{ label: "Website", url: "https://stuyaviators.vercel.app" }],
	socialLinks: [
		{ platform: "epsilon", url: "https://stuyaviators.github.io" },
		{ platform: "instagram", url: "https://instagram.com/stuyaviators" },
		{ platform: "discord", url: "https://discord.gg/PCywWHervk" },
	],
	viewInBrowserUrl: "https://stuyaviators.vercel.app/newsletter",
};

export const saveFormData = (data: NewsletterFormData): void => {
	if (globalThis.window !== undefined) {
		try {
			localStorage.setItem(storageKey, JSON.stringify(data));
		} catch (error) {
			console.error("Failed to save form data:", error);
		}
	}
};

export const loadFormData = (): NewsletterFormData => {
	if (globalThis.window === undefined) {
		return defaultFormData;
	}

	try {
		const stored = localStorage.getItem(storageKey);
		if (stored) {
			return JSON.parse(stored) as NewsletterFormData;
		}
	} catch (error) {
		console.error("Failed to load form data:", error);
	}

	return defaultFormData;
};

export const clearFormData = (): void => {
	if (globalThis.window !== undefined) {
		try {
			localStorage.removeItem(storageKey);
		} catch (error) {
			console.error("Failed to clear form data:", error);
		}
	}
};

export type Preset = {
	id: string;
	name: string;
	data: NewsletterFormData;
	createdAt: number;
};

export const savePreset = (name: string, data: NewsletterFormData): void => {
	if (globalThis.window === undefined) return;

	try {
		const presets = loadPresets();
		const newPreset: Preset = {
			id: Date.now().toString(),
			name,
			data,
			createdAt: Date.now(),
		};
		presets.push(newPreset);
		localStorage.setItem(presetsKey, JSON.stringify(presets));
	} catch (error) {
		console.error("Failed to save preset:", error);
	}
};

export const loadPresets = (): Preset[] => {
	if (globalThis.window === undefined) return [];

	try {
		const stored = localStorage.getItem(presetsKey);
		return stored ? (JSON.parse(stored) as Preset[]) : [];
	} catch (error) {
		console.error("Failed to load presets:", error);
		return [];
	}
};

export const deletePreset = (presetId: string): void => {
	if (globalThis.window === undefined) return;

	try {
		const presets = loadPresets();
		const filtered = presets.filter((preset) => preset.id !== presetId);
		localStorage.setItem(presetsKey, JSON.stringify(filtered));
	} catch (error) {
		console.error("Failed to delete preset:", error);
	}
};

export const loadPreset = (
	presetId: string
): NewsletterFormData | undefined => {
	try {
		const presets = loadPresets();
		const preset = presets.find((p) => p.id === presetId);
		return preset?.data;
	} catch (error) {
		console.error("Failed to load preset:", error);
	}
};
