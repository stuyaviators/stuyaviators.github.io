"use client";

import { motion } from "motion/react";
import { usePathname } from "next/navigation";
import React, {
	createContext,
	useCallback,
	useContext,
	useEffect,
	useRef,
} from "react";

// TODO: reduced motion support
// This is my context, ref, and effect lab basically

// Context = way to act as a global variable
/* When "registered" per element, they get an index.
Stagger is a context, and each element's delay/cue to start sliding in 
is just their index multiplied (*) by the stagger delay thing */

const StaggerContext = createContext<
	| {
			register: () => number;
			stagger: number;
	  }
	| undefined
>(undefined);

export function Stagger({
	children,
	className,
	duration = 0.4,
	y = 12,
}: {
	children: React.ReactNode;
	className?: string;
	duration?: number;
	y?: number;
}) {
	// I guess this is standard notation
	const ctx = useContext(StaggerContext);
	// A ref has a "current" prop, which you use for everything. Set with useRef(value)
	// To get it to update, one way is to use a state, then useEffect hooked up to the state
	// So ref.current is updated
	// And the good thing about this is that it doesn't re-render on update
	// useRef persists across renders and updating it doesn't trigger a re-render (unlike state updates); plain local variables reset on each render.
	const indexRef = useRef<number | undefined>(undefined);
	indexRef.current ??= ctx?.register();
	const index = indexRef.current ?? 0;
	const delay = (ctx?.stagger ?? 0.06) * index;

	return (
		<motion.div
			className={className} // Preserve styles
			initial={{ opacity: 0, y }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration, delay, ease: "easeOut" }}
		>
			{children}
		</motion.div>
	);
}

export default function TransitionProvider({
	children,
	stagger = 0.06,
}: {
	children: React.ReactNode;
	stagger?: number;
}) {
	const pathname = usePathname();
	const indexRef = useRef(0);
	// On page (route) change
	useEffect(() => {
		indexRef.current = 0; // Reset
	}, [pathname]); // Depend on pathname/run when pathname updates
	// Defines the register from our context earlier
	const register = useCallback(() => indexRef.current++, []);
	return (
		<StaggerContext.Provider value={{ register, stagger }}>
			{/* Defines both things, this wraps around each stagger element so we get the context, run register, which increments index/counter */}
			<motion.div key={pathname} className="w-full h-full">
				{children}
			</motion.div>
		</StaggerContext.Provider>
	);
}
