"use client";

import type { ElementType } from "react";
import { useEffect, useRef, useState } from "react";

/**
Word-by-word reveal with blur-to-sharp and slide-up, triggered once when the
text enters the viewport. Words are server-rendered, so the text is readable
without JS and by search engines; CSS in globals.css does the motion.
*/
export default function RevealText({
	text,
	as: Tag = "span",
	className,
	delay = 0,
	id,
}: {
	readonly text: string;
	readonly as?: ElementType;
	readonly className?: string;
	readonly delay?: number;
	readonly id?: string;
}) {
	const ref = useRef<HTMLElement>(null);
	const [state, setState] = useState<"out" | "in">("out");

	useEffect(() => {
		const element = ref.current;
		if (!element) {
			return;
		}

		const observer = new IntersectionObserver(
			([entry]) => {
				if (!entry?.isIntersecting) {
					return;
				}

				setState("in");
				observer.disconnect();
			},
			{ rootMargin: "0px 0px -8% 0px" }
		);
		observer.observe(element);
		return () => {
			observer.disconnect();
		};
	}, []);

	const words = text.split(/\s+/u);
	return (
		<Tag
			ref={ref}
			id={id}
			className={className}
			data-reveal={state}
			aria-label={text}
			style={{ "--reveal-delay": `${delay}ms` } as React.CSSProperties}
		>
			{words.map((word, index) => (
				<span
					key={`${word}-${index}`}
					aria-hidden
					className="reveal-word"
					style={{ "--i": index } as React.CSSProperties}
				>
					<span>{word}</span>
					{index < words.length - 1 ? " " : null}
				</span>
			))}
		</Tag>
	);
}
