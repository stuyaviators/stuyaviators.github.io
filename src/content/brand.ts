export type BrandColor = {
	id: string;
	name: string;
	hex: string;
	rgb: [number, number, number];
	use: string;
	/** Text color that passes WCAG AA on this swatch. */
	onColor: string;
};

/** Official StuyAviators palette. */
export const palette: BrandColor[] = [
	{
		id: "navy",
		name: "Night Navy",
		hex: "#0F1B32",
		rgb: [15, 27, 50],
		use: "Primary dark: backgrounds, body text on light",
		onColor: "#DDEBFF",
	},
	{
		id: "blue",
		name: "Stuy Blue",
		hex: "#0B64A9",
		rgb: [11, 100, 169],
		use: "Logo, links, buttons",
		onColor: "#FFFFFF",
	},
	{
		id: "ice",
		name: "Ice",
		hex: "#DDEBFF",
		rgb: [221, 235, 255],
		use: "Light backgrounds, highlights, text on navy",
		onColor: "#0F1B32",
	},
	{
		id: "white",
		name: "White",
		hex: "#FFFFFF",
		rgb: [255, 255, 255],
		use: "Cards and logo fill",
		onColor: "#0F1B32",
	},
];

export type LogoVariant = {
	id: string;
	name: string;
	use: string;
	/** Background to preview the logo on. */
	preview: string;
	/** PNG export widths in px. */
	widths: number[];
	aspect: "square" | "banner";
};

/** Official logos from the StuyAviators Figma file. */
export const logoVariants: LogoVariant[] = [
	{
		id: "circle",
		name: "Circle",
		use: "Primary mark. Use on white, Ice and light photos.",
		preview: "#FFFFFF",
		widths: [512, 1024, 2048],
		aspect: "square",
	},
	{
		id: "square",
		name: "Square",
		use: "Profile pictures and app icons, where a square crop is required.",
		preview: "#DDEBFF",
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
		use: "Wide layouts on Night Navy, Stuy Blue or dark photos.",
		preview: "#0F1B32",
		widths: [1024, 2048, 4096],
		aspect: "banner",
	},
];

export const brandRules = {
	do: [
		"Keep clear space around the logo of at least a quarter of its width.",
		"Use the logo at 48 px or larger on screens so the skyline stays legible.",
		"Pick the variant that contrasts with the background.",
	],
	dont: [
		"Stretch, rotate, crop or redraw the logo.",
		"Recolor it outside the palette or add shadows, glows or outlines.",
		"Place the blue logos on dark or busy backgrounds; use the white banner or the square.",
	],
};
