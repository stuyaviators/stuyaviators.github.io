"use client";

import { usePathname } from "next/navigation";
import React, { createContext, useContext, useRef } from "react";

/*
 * Ported from recode's TransitionProvider (webcubed). Each <Stagger> registers
 * itself in render order and gets an index; its entrance delay is
 * index × step. Changes from recode:
 * - The counter resets in render when the pathname changes (recode reset it in
 *   an effect, after the new page had already registered, so delays kept
 *   growing on every navigation).
 * - The animation is CSS (`.stagger` in globals.css) instead of motion's
 *   `initial`, so content is visible before hydration and without JS, and
 *   `prefers-reduced-motion` turns it off completely.
 * - Delays are capped so long pages don't wait seconds for lower items.
 */

const maxIndex = 8;

type StaggerContextValue = {
	register: () => number;
	stagger: number;
};

const StaggerContext = createContext<StaggerContextValue | undefined>(
	undefined
);

export function Stagger({
	children,
	className,
	duration = 0.4,
	y = 12,
	as: Tag = "div",
}: {
	readonly children: React.ReactNode;
	readonly className?: string;
	readonly duration?: number;
	readonly y?: number;
	readonly as?: "div" | "section" | "li" | "article";
}) {
	const context = useContext(StaggerContext);
	const indexRef = useRef<number | undefined>(undefined);
	indexRef.current ??= context?.register() ?? 0;
	const index = Math.min(indexRef.current, maxIndex);

	return (
		<Tag
			suppressHydrationWarning
			className={className ? `stagger ${className}` : "stagger"}
			style={
				{
					"--stagger-index": index,
					"--stagger-step": `${(context?.stagger ?? 0.06) * 1000}ms`,
					"--stagger-duration": `${duration}s`,
					"--stagger-y": `${y}px`,
				} as React.CSSProperties
			}
		>
			{children}
		</Tag>
	);
}

export default function TransitionProvider({
	children,
	stagger = 0.06,
}: {
	readonly children: React.ReactNode;
	readonly stagger?: number;
}) {
	const pathname = usePathname();
	const counter = useRef({ pathname, next: 0 });
	if (counter.current.pathname !== pathname) {
		counter.current = { pathname, next: 0 };
	}

	const value = useRef<StaggerContextValue>({
		register: () => counter.current.next++,
		stagger,
	});

	return (
		<StaggerContext.Provider value={value.current}>
			<div key={pathname} className="contents">
				{children}
			</div>
		</StaggerContext.Provider>
	);
}
