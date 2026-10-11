"use client";

import { ArrowUp } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";

/**
Floating "back to top" button, shown once you've scrolled a screen down.
*/
export default function ScrollToTop() {
	const [isShown, setIsShown] = useState(false);
	const sentinelRef = useRef<HTMLSpanElement>(null);

	// The sentinel sits one screen down the page; once it has scrolled above
	// the viewport, show the button.
	useEffect(() => {
		const sentinel = sentinelRef.current;
		if (!sentinel) {
			return;
		}

		const observer = new IntersectionObserver(([entry]) => {
			setIsShown(
				entry !== undefined &&
					!entry.isIntersecting &&
					entry.boundingClientRect.top < 0
			);
		});
		observer.observe(sentinel);
		return () => {
			observer.disconnect();
		};
	}, []);

	return (
		<>
		<span
			ref={sentinelRef}
			aria-hidden
			className="pointer-events-none absolute top-[100svh] left-0 h-px w-px"
		/>
		<AnimatePresence>
			{isShown ? (
				<motion.button
					type="button"
					aria-label="Scroll to top"
					title="Scroll to top"
					initial={{ opacity: 0, scale: 0.6, y: 16 }}
					animate={{ opacity: 1, scale: 1, y: 0 }}
					exit={{ opacity: 0, scale: 0.6, y: 16 }}
					transition={{ type: "spring", stiffness: 380, damping: 26 }}
					className="group fixed right-4 bottom-4 z-40 inline-flex size-12 items-center justify-center rounded-full border border-hairline bg-bg/80 text-text shadow-card backdrop-blur-xl transition-colors hover:border-brand hover:text-brand sm:right-6 sm:bottom-6"
					onClick={() => {
						const isReduced = globalThis.matchMedia(
							"(prefers-reduced-motion: reduce)"
						).matches;
						window.scrollTo({ top: 0, behavior: isReduced ? "auto" : "smooth" });
					}}
				>
					<ArrowUp
						aria-hidden
						className="size-5 transition-transform duration-300 group-hover:-translate-y-0.5"
					/>
				</motion.button>
			) : null}
		</AnimatePresence>
		</>
	);
}
