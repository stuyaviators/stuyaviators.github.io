"use client";

import { cn } from "@/lib/cn";
import { motion } from "motion/react";
import { useEffect, useState } from "react";

/**
"On this page" list for the charter: sticks beside the articles and
highlights the one you're reading, with a sliding marker.
*/
export default function CharterToc({
	items,
}: {
	readonly items: ReadonlyArray<{ id: string; title: string }>;
}) {
	const [active, setActive] = useState<string | undefined>(undefined);

	useEffect(() => {
		const observer = new IntersectionObserver(
			(entries) => {
				for (const entry of entries) {
					if (entry.isIntersecting) {
						setActive(entry.target.id);
					}
				}
			},
			// A thin band across the middle of the screen.
			{ rootMargin: "-45% 0px -50% 0px" }
		);
		for (const item of items) {
			const element = document.querySelector(`#${CSS.escape(item.id)}`);
			if (element) {
				observer.observe(element);
			}
		}

		return () => {
			observer.disconnect();
		};
	}, [items]);

	return (
		<nav
			aria-label="On this page"
			className="pt-14 lg:sticky lg:top-28 lg:self-start"
		>
			<p className="label text-muted">On this page</p>
			<ol className="mt-3 space-y-1 border-l border-hairline text-sm">
				{items.map((item) => {
					const isActive = item.id === active;
					return (
						<li key={item.id} className="relative">
							{isActive ? (
								<motion.span
									layoutId="toc-marker"
									className="absolute top-0 -left-px h-full w-0.5 bg-brand"
									transition={{ type: "spring", stiffness: 400, damping: 34 }}
								/>
							) : null}
							<a
								href={`#${item.id}`}
								aria-current={isActive ? "location" : undefined}
								className={cn(
									"block py-1 pl-3 transition-colors hover:text-text",
									isActive ? "font-medium text-text" : "text-muted"
								)}
							>
								{item.title}
							</a>
						</li>
					);
				})}
			</ol>
		</nav>
	);
}
