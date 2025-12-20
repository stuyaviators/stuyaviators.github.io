"use client";

import { Flavor, flavors } from "@/lib/theme";
import { useEffect, useState } from "react";

export function useTheme() {
	const [flavor, setFlavor] = useState<Flavor>("mocha");
	const [mounted, setMounted] = useState(false);

	const flavorClasses = flavors.map((entry) => entry.value);

	const applyTheme = (nextFlavor: Flavor) => {
		const meta = flavors.find((entry) => entry.value === nextFlavor);
		const isDark = meta ? meta.isDark : true;

		flavorClasses.forEach((cls) => {
			document.documentElement.classList.remove(cls);
			document.body.classList.remove(cls);
		});

		document.documentElement.classList.toggle("dark", isDark);
		document.body.classList.toggle("dark", isDark);
		document.documentElement.setAttribute("data-catppuccin", nextFlavor);
		document.documentElement.classList.add(nextFlavor);
		document.body.classList.add(nextFlavor);
	};

	const setFlavorAndPersist = (nextFlavor: Flavor) => {
		setFlavor(nextFlavor);
		applyTheme(nextFlavor);
		localStorage.setItem("catppuccin-flavor", nextFlavor);
	};

	useEffect(() => {
		const stored = localStorage.getItem("catppuccin-flavor");
		const nextFlavor: Flavor = flavors.some((entry) => entry.value === stored)
			? (stored as Flavor)
			: "mocha";

		setFlavor(nextFlavor);
		applyTheme(nextFlavor);

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
