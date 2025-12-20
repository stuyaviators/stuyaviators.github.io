export type Flavor = "mocha" | "macchiato" | "frappe" | "latte";

export type FlavorMeta = {
	value: Flavor;
	label: string;
	swatch: [string, string, string];
	isDark: boolean;
	note: string;
	icon: string;
	backgrounds: [string, string, string];
	textColor: string;
};

export const flavors: FlavorMeta[] = [
	{
		value: "latte",
		label: "Latte",
		swatch: ["#ccd0da", "#1e66f5", "#8839ef"],
		isDark: false,
		note: "Light",
		icon: "🌻",
		backgrounds: ["#dce0e8", "#ccd0da", "#8c8fa1"],
		textColor: "#1e1e2e",
	},
	{
		value: "frappe",
		label: "Frappé",
		swatch: ["#737994", "#8caaee", "#ca9ee6"],
		isDark: true,
		note: "Dark (muted)",
		icon: "🪴",
		backgrounds: ["#232634", "#414559", "#838ba7"],
		textColor: "#c6d0f5",
	},
	{
		value: "macchiato",
		label: "Macchiato",
		swatch: ["#6e738d", "#8aadf4", "#c6a0f6"],
		isDark: true,
		note: "Dark (balanced)",
		icon: "🌸",
		backgrounds: ["#181926", "#363a4f", "#8087a2"],
		textColor: "#cad3f5",
	},
	{
		value: "mocha",
		label: "Mocha",
		swatch: ["#585b70", "#89b4fa", "#cba6f7"],
		isDark: true,
		note: "Dark (rich)",
		icon: "🌿",
		backgrounds: ["#11111b", "#313244", "#7f849c"],
		textColor: "#cdd6f4",
	},
];
