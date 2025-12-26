"use client";

import type { Flavor } from "@/lib/theme";
import { flavors } from "@/lib/theme";
import { useEffect, useState } from "react";

export function useTheme() {
	const [flavor, setFlavor] = useState<Flavor>("mocha"); // Default mocha
	const [mounted, setMounted] = useState(false);

	const flavorClasses = flavors.map((entry) => entry.value);

	const applyTheme = (nextFlavor: Flavor) => {
		const meta = flavors.find((entry) => entry.value === nextFlavor);
		const isDark = meta ? meta.isDark : true;

		for (const className of flavorClasses) {
			document.documentElement.classList.remove(className);
			document.body.classList.remove(className);
		}

		// Only need to add dark class and flavor class
		document.documentElement.classList.toggle("dark", isDark);
		document.body.classList.toggle("dark", isDark);
		document.documentElement.dataset.catppuccin = nextFlavor;
		document.documentElement.classList.add(nextFlavor);
		document.body.classList.add(nextFlavor);
	};

	const setFlavorAndPersist = (nextFlavor: Flavor) => {
		// Store in localstorage
		setFlavor(nextFlavor);
		applyTheme(nextFlavor);
		localStorage.setItem("catppuccin-flavor", nextFlavor);
	};

	useEffect(() => {
		const stored = localStorage.getItem("catppuccin-flavor"); // Current flavor (?)
		const nextFlavor: Flavor = flavors.some((entry) => entry.value === stored) // Fancy way of defaulting to mocha
			? (stored as Flavor)
			: "mocha";
		// (re) Set and apply
		setFlavor(nextFlavor);
		applyTheme(nextFlavor);
		// NextFlavor will be set, but not he localstorage item, so go ahead and do that
		if (!stored) {
			localStorage.setItem("catppuccin-flavor", nextFlavor);
		}

		setMounted(true);
	}, []);

	return {
		flavor,
		setFlavor: setFlavorAndPersist,
		mounted,
	};
}
