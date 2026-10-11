"use client";

import type { MotionValue } from "motion/react";
import {
	motion,
	useReducedMotion,
	useScroll,
	useTransform,
} from "motion/react";
import { useRef } from "react";

function Word({
	word,
	index,
	total,
	progress,
}: {
	readonly word: string;
	readonly index: number;
	readonly total: number;
	readonly progress: MotionValue<number>;
}) {
	const start = index / total;
	const opacity = useTransform(progress, [start, start + 1 / total], [0.16, 1]);
	return (
		<motion.span style={{ opacity }} className="inline">
			{word}{" "}
		</motion.span>
	);
}

/**
Large statement whose words light up one by one as you scroll past it
(scroll-synchronized word highlighting).
*/
export default function ScrollHighlight({
	text,
	className,
}: {
	readonly text: string;
	readonly className?: string;
}) {
	const ref = useRef<HTMLParagraphElement>(null);
	const isReducedMotion = useReducedMotion();
	const { scrollYProgress } = useScroll({
		target: ref,
		offset: ["start 85%", "end 45%"],
	});
	const words = text.split(" ");
	if (isReducedMotion) {
		return (
			<p ref={ref} className={className}>
				{text}
			</p>
		);
	}

	return (
		<p ref={ref} className={className} aria-label={text}>
			<span aria-hidden>
				{words.map((word, index) => (
					<Word
						key={`${word}-${index}`}
						word={word}
						index={index}
						total={words.length}
						progress={scrollYProgress}
					/>
				))}
			</span>
		</p>
	);
}
