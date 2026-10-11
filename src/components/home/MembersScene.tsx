"use client";

import type { MotionValue } from "motion/react";
import type { StaticImageData } from "next/image";
import BackgroundVideo from "@/components/motion/BackgroundVideo";
import PinnedScene, { useSceneProgress } from "@/components/motion/PinnedScene";
import RevealText from "@/components/motion/RevealText";
import { Container } from "@/components/ui/Section";
import { Quote } from "lucide-react";
import { motion, useTransform } from "motion/react";

type Testimonial = { readonly quote: string; readonly author: string };

/*
 * "What our members say": the club video grows from a rounded card to full
 * screen as the section locks, then each quote takes its turn while you
 * scroll. Unpinned (reduced motion, short screens) it's a plain grid.
 */
function QuoteCard({ item }: { readonly item: Testimonial }) {
	return (
		<figure className="rounded-3xl border border-white/15 bg-black/30 p-6 backdrop-blur-md sm:p-8">
			<Quote aria-hidden className="size-7 text-brand" />
			<blockquote className="mt-4 text-lg leading-relaxed sm:text-xl">
				“{item.quote}”
			</blockquote>
			<figcaption className="label mt-5 text-muted">— {item.author}</figcaption>
		</figure>
	);
}

function SequencedQuote({
	item,
	index,
	total,
	progress,
}: {
	readonly item: Testimonial;
	readonly index: number;
	readonly total: number;
	readonly progress: MotionValue<number>;
}) {
	const span = 0.75 / total;
	const start = 0.2 + index * span;
	const end = start + span;
	const isLast = index === total - 1;
	const opacity = useTransform(
		progress,
		isLast ? [start - 0.04, start + 0.04] : [start - 0.04, start + 0.04, end - 0.04, end + 0.04],
		isLast ? [0, 1] : [0, 1, 1, 0]
	);
	const y = useTransform(
		progress,
		isLast ? [start - 0.04, start + 0.04] : [start - 0.04, start + 0.04, end - 0.04, end + 0.04],
		isLast ? [24, 0] : [24, 0, 0, -24]
	);
	return (
		<motion.div className="[grid-area:1/1]" style={{ opacity, y }}>
			<QuoteCard item={item} />
		</motion.div>
	);
}

function Dot({
	index,
	total,
	progress,
}: {
	readonly index: number;
	readonly total: number;
	readonly progress: MotionValue<number>;
}) {
	const span = 0.75 / total;
	const start = 0.2 + index * span;
	const width = useTransform(
		progress,
		[start - 0.04, start + 0.04, start + span - 0.04, start + span + 0.04],
		[8, 28, 28, index === total - 1 ? 28 : 8]
	);
	return (
		<motion.span
			aria-hidden
			className="block h-2 rounded-full bg-white/70"
			style={{ width }}
		/>
	);
}

function MembersContent({
	heading,
	intro,
	testimonials,
	poster,
}: {
	readonly heading: string;
	readonly intro: string;
	readonly testimonials: readonly Testimonial[];
	readonly poster: StaticImageData;
}) {
	const { progress, isPinned } = useSceneProgress();
	const clipPath = useTransform(progress, (value) => {
		const t = Math.min(1, value / 0.18);
		const eased = 1 - (1 - t) ** 3;
		const inset = 5 * (1 - eased);
		return `inset(${inset}% ${inset * 1.2}% round ${32 * (1 - eased)}px)`;
	});

	return (
		<>
			<motion.div
				className="absolute inset-0 -z-10"
				style={isPinned ? { clipPath } : undefined}
			>
				<BackgroundVideo
					src="/videos/club-members.mp4"
					poster={poster}
					label="StuyAviators club video (muted)"
				/>
				<div
					aria-hidden
					className="pointer-events-none absolute inset-0 bg-linear-to-t from-black/65 via-black/25 to-black/20"
				/>
			</motion.div>
			<Container className="text-lift">
				<RevealText
					as="h2"
					id="members-heading"
					text={heading}
					className="block text-4xl sm:text-6xl"
				/>
				<p className="mt-4 max-w-2xl text-lg text-white/85">{intro}</p>
				{isPinned ? (
					<div className="mt-10 max-w-3xl [text-shadow:none]">
						<div className="grid">
							{testimonials.map((item, index) => (
								<SequencedQuote
									key={item.quote}
									item={item}
									index={index}
									total={testimonials.length}
									progress={progress}
								/>
							))}
						</div>
						<div className="mt-6 flex gap-2">
							{testimonials.map((item, index) => (
								<Dot
									key={item.quote}
									index={index}
									total={testimonials.length}
									progress={progress}
								/>
							))}
						</div>
					</div>
				) : (
					<div className="mt-10 grid gap-6 [text-shadow:none] md:grid-cols-2">
						{testimonials.map((item) => (
							<QuoteCard key={item.quote} item={item} />
						))}
					</div>
				)}
			</Container>
		</>
	);
}

export default function MembersScene(props: {
	readonly heading: string;
	readonly intro: string;
	readonly testimonials: readonly Testimonial[];
	readonly poster: StaticImageData;
}) {
	return (
		<PinnedScene
			length={1.6}
			labelledBy="members-heading"
			isEntranceAnimated={false}
			className="on-dark isolate"
		>
			<MembersContent {...props} />
		</PinnedScene>
	);
}
