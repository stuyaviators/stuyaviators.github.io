"use client";

import { Monitor, Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";

type Theme = "system" | "light" | "dark";
const order: Theme[] = ["system", "light", "dark"];
const storageKey = "theme";

function readTheme(): Theme {
	try {
		const stored = localStorage.getItem(storageKey);
		return stored === "light" || stored === "dark" ? stored : "system";
	} catch {
		return "system";
	}
}

function applyTheme(theme: Theme) {
	const root = document.documentElement;
	if (theme === "system") delete root.dataset.theme;
	else root.dataset.theme = theme;
	try {
		if (theme === "system") localStorage.removeItem(storageKey);
		else localStorage.setItem(storageKey, theme);
	} catch {}
}

/** Inline, pre-paint script so the chosen theme never flashes. */
export const themeScript = `(function(){try{var t=localStorage.getItem("${storageKey}");if(t==="light"||t==="dark")document.documentElement.dataset.theme=t}catch(e){}})()`;

export default function ThemeToggle() {
	const [theme, setTheme] = useState<Theme>("system");

	useEffect(() => {
		setTheme(readTheme());
	}, []);

	const next = order[(order.indexOf(theme) + 1) % order.length];
	const Icon = theme === "light" ? Sun : theme === "dark" ? Moon : Monitor;
	const label = `Theme: ${theme}. Switch to ${next}.`;

	return (
		<button
			type="button"
			aria-label={label}
			title={label}
			className="inline-flex size-11 items-center justify-center rounded-md border border-hairline text-muted hover:text-text"
			onClick={() => {
				applyTheme(next);
				setTheme(next);
			}}
		>
			<Icon aria-hidden className="size-5" />
		</button>
	);
}
