export type BrandColor = {
	id: string;
	name: string;
	hex: string;
	rgb: [number, number, number];
	use: string;
	/**
	Text color that passes WCAG AA on this swatch.
	*/
	onColor: string;
};

/**
Official StuyAviators palette: brand blue on clean white and near-black,
with Ice and Night Navy from the logo artwork as secondary colors.
*/
export const palette: BrandColor[] = [
	{
		id: "blue",
		name: "Stuy Blue",
		hex: "#0B64A9",
		rgb: [11, 100, 169],
		use: "Logo, links, buttons and highlights",
		onColor: "#FFFFFF",
	},
	{
		id: "black",
		name: "Night",
		hex: "#0A0A0C",
		rgb: [10, 10, 12],
		use: "Dark backgrounds and text on light",
		onColor: "#F5F5F7",
	},
	{
		id: "white",
		name: "White",
		hex: "#FFFFFF",
		rgb: [255, 255, 255],
		use: "Light backgrounds, text on dark, logo fill",
		onColor: "#0A0A0C",
	},
	{
		id: "cloud",
		name: "Cloud",
		hex: "#F5F5F7",
		rgb: [245, 245, 247],
		use: "Cards and panels on white",
		onColor: "#0A0A0C",
	},
	{
		id: "ice",
		name: "Ice",
		hex: "#DDEBFF",
		rgb: [221, 235, 255],
		use: "Secondary: soft highlights and selection",
		onColor: "#0F1B32",
	},
	{
		id: "navy",
		name: "Night Navy",
		hex: "#0F1B32",
		rgb: [15, 27, 50],
		use: "Secondary: from the logo artwork",
		onColor: "#DDEBFF",
	},
];

export type Typeface = {
	id: string;
	name: string;
	role: string;
	use: string;
	/**
	CSS variable set by next/font in layout.tsx.
	*/
	variable: string;
	weights: Array<{ value: number; name: string }>;
	href: string;
};

/**
Type system, following Airbus's brand typography (Inter Tight for display
and graphic design, Inter for the web).
*/
export const typefaces: Typeface[] = [
	{
		id: "inter-tight",
		name: "Inter Tight",
		role: "Display",
		use: "Headlines, the StuyAviators wordmark, big numbers, posters, slides and social graphics.",
		variable: "var(--font-inter-tight)",
		weights: [
			{ value: 400, name: "Regular" },
			{ value: 500, name: "Medium" },
			{ value: 600, name: "Semibold" },
			{ value: 700, name: "Bold" },
		],
		href: "https://fonts.google.com/specimen/Inter+Tight",
	},
	{
		id: "inter",
		name: "Inter",
		role: "Text",
		use: "Body copy, interface, labels, captions and data (with tabular figures).",
		variable: "var(--font-inter)",
		weights: [
			{ value: 400, name: "Regular" },
			{ value: 500, name: "Medium" },
			{ value: 600, name: "Semibold" },
			{ value: 700, name: "Bold" },
		],
		href: "https://fonts.google.com/specimen/Inter",
	},
];

/**
The name as a wordmark (beside the logo) versus in running text.
*/
export const wordmark = {
	text: "STUYAVIATORS",
	spec: "Inter Tight Semibold · all caps · +0.08 em tracking",
	rules: [
		"In writing, the name is always StuyAviators: one word, capital S and capital A.",
		"Use STUYAVIATORS (all caps) where it looks better: the wordmark beside the logo, all-caps headlines, merch. Set it in Inter Tight Semibold, tracked +0.08 em.",
		"Never Stuy aviators, Stuy Aviators, Stuyaviators, stuyaviators or STUY AVIATORS.",
	],
};

/**
Typesetting rules, adapted from Airbus's typography guidelines.
*/
export const typeRules = [
	"Write in sentence case. Capitalize only the first word and proper nouns; career and course names use Title Case.",
	"Use all caps only for the STUYAVIATORS wordmark and short labels of up to three words.",
	"Set text upright. No italics.",
	"Left-align long copy; center only short headlines.",
	"Set headlines and body text at the typefaces’ default letter-spacing.",
];

export type LogoVariant = {
	id: string;
	name: string;
	use: string;
	/**
	Background to preview the logo on.
	*/
	preview: string;
	/**
	PNG export widths in px.
	*/
	widths: number[];
	aspect: "square" | "banner";
};

/**
Official logos from the StuyAviators Figma file.
*/
export const logoVariants: LogoVariant[] = [
	{
		id: "circle",
		name: "Circle",
		use: "Primary mark. Use on white, Cloud and light photos.",
		preview: "#FFFFFF",
		widths: [512, 1024, 2048],
		aspect: "square",
	},
	{
		id: "square",
		name: "Square",
		use: "Profile pictures and app icons, where a square crop is required.",
		preview: "#F5F5F7",
		widths: [512, 1024, 2048],
		aspect: "square",
	},
	{
		id: "banner-blue",
		name: "Banner, blue",
		use: "Wide layouts on light backgrounds: headers, flyers, slides.",
		preview: "#FFFFFF",
		widths: [1024, 2048, 4096],
		aspect: "banner",
	},
	{
		id: "banner-white",
		name: "Banner, white",
		use: "Wide layouts on Night, Stuy Blue or dark photos.",
		preview: "#0A0A0C",
		widths: [1024, 2048, 4096],
		aspect: "banner",
	},
];

export const brandRules = {
	do: [
		"Keep clear space around the logo of at least a quarter of its width.",
		"Use the logo at 48 px or larger on screens so the skyline stays legible.",
		"Pick the variant that contrasts with the background.",
		"Pair the circle logo with the STUYAVIATORS wordmark to its right, vertically centered.",
	],
	dont: [
		"Stretch, rotate, crop or redraw the logo.",
		"Recolor it outside the palette or add shadows, glows or outlines.",
		"Place the blue logos on dark or busy backgrounds; use the white banner or the square.",
	],
};
