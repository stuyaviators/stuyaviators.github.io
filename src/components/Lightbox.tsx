"use client";

import type { MotionValue } from "motion/react";
import type { StaticImageData } from "next/image";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import {
	motion,
	useReducedMotion,
	useScroll,
	useTransform,
} from "motion/react";
import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";

export type LightboxImage = { src: StaticImageData; alt: string };

// How far each column drifts (px) across the grid's pass through the screen;
// alternating speeds give the staggered parallax.
const columnDrift = [60, -140, 20, -200];

function Column({
	items,
	drift,
	progress,
	onOpen,
}: {
	readonly items: Array<{ image: LightboxImage; index: number }>;
	readonly drift: number;
	readonly progress: MotionValue<number>;
	readonly onOpen: (index: number, trigger: HTMLButtonElement) => void;
}) {
	const isReducedMotion = useReducedMotion();
	const y = useTransform(progress, [0, 1], [0, drift]);
	return (
		<motion.ul
			className="flex flex-col gap-3 sm:gap-4"
			style={isReducedMotion ? undefined : { y }}
		>
			{items.map(({ image, index }) => (
				<li key={image.alt + index} className="clip-reveal">
					<button
						type="button"
						className="group block w-full overflow-hidden rounded-2xl bg-surface-2"
						onClick={(event) => {
							onOpen(index, event.currentTarget);
						}}
					>
						<Image
							src={image.src}
							alt={image.alt}
							placeholder="blur"
							sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
							className="h-auto w-full transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-105 motion-reduce:transition-none"
						/>
					</button>
				</li>
			))}
		</motion.ul>
	);
}

/**
Masonry columns that drift at different speeds while you scroll.
*/
function ParallaxColumns({
	images,
	onOpen,
}: {
	readonly images: LightboxImage[];
	readonly onOpen: (index: number, trigger: HTMLButtonElement) => void;
}) {
	const ref = useRef<HTMLDivElement>(null);
	const [columnCount, setColumnCount] = useState(3);
	const { scrollYProgress } = useScroll({
		target: ref,
		offset: ["start end", "end start"],
	});

	useEffect(() => {
		const large = globalThis.matchMedia("(min-width: 1024px)");
		const small = globalThis.matchMedia("(min-width: 640px)");
		const update = () => {
			setColumnCount(large.matches ? 4 : small.matches ? 3 : 2);
		};

		update();
		large.addEventListener("change", update);
		small.addEventListener("change", update);
		return () => {
			large.removeEventListener("change", update);
			small.removeEventListener("change", update);
		};
	}, []);

	const columns = Array.from({ length: columnCount }, (_, column) =>
		images
			.map((image, index) => ({ image, index }))
			.filter(({ index }) => index % columnCount === column)
	);

	return (
		<div
			ref={ref}
			className="grid items-start gap-3 py-16 sm:gap-4"
			style={{ gridTemplateColumns: `repeat(${columnCount}, minmax(0, 1fr))` }}
		>
			{columns.map((items, column) => (
				<Column
					key={column}
					items={items}
					drift={columnDrift[column] ?? 0}
					progress={scrollYProgress}
					onOpen={onOpen}
				/>
			))}
		</div>
	);
}

/**
Photo grid with an accessible <dialog> lightbox (arrow keys, Escape).
*/
export default function Lightbox({
	images,
}: {
	readonly images: LightboxImage[];
}) {
	const dialogRef = useRef<HTMLDialogElement>(null);
	const triggerRef = useRef<HTMLButtonElement | undefined>(null);
	const [index, setIndex] = useState<number | undefined>(undefined);

	const open = (i: number, trigger: HTMLButtonElement) => {
		triggerRef.current = trigger;
		setIndex(i);
		dialogRef.current?.showModal();
	};

	const step = useCallback(
		(delta: number) => {
			setIndex((i) =>
				i === undefined ? i : (i + delta + images.length) % images.length
			);
		},
		[images.length]
	);

	useEffect(() => {
		const dialog = dialogRef.current;
		if (!dialog) {
			return;
		}

		const onKey = (event: KeyboardEvent) => {
			if (event.key === "ArrowRight") {
				step(1);
			} else if (event.key === "ArrowLeft") {
				step(-1);
			}
		};

		const onClose = () => {
			setIndex(undefined);
			triggerRef.current?.focus();
		};

		dialog.addEventListener("keydown", onKey);
		dialog.addEventListener("close", onClose);
		return () => {
			dialog.removeEventListener("keydown", onKey);
			dialog.removeEventListener("close", onClose);
		};
	}, [step]);

	const current = index === undefined ? undefined : images[index];

	return (
		<>
			<ParallaxColumns
				images={images}
				onOpen={(i, trigger) => {
					open(i, trigger);
				}}
			/>
			<dialog
				ref={dialogRef}
				aria-label={current ? current.alt : "Photo viewer"}
				className="m-auto max-h-[92dvh] w-[min(96vw,1200px)] bg-transparent p-0 backdrop:bg-ink/90"
				onClick={(event) => {
					if (event.target === event.currentTarget) {
						dialogRef.current?.close();
					}
				}}
			>
				{current ? (
					<figure className="relative">
						<Image
							src={current.src}
							alt={current.alt}
							sizes="96vw"
							className="mx-auto h-auto max-h-[80dvh] w-auto rounded-md object-contain"
						/>
						<figcaption className="mt-3 flex items-center justify-between gap-3 text-sm text-white">
							<span>{current.alt}</span>
							<span className="font-mono whitespace-nowrap">
								{(index ?? 0) + 1} / {images.length}
							</span>
						</figcaption>
						<div className="absolute top-2 right-2 flex gap-2">
							<button
								type="button"
								aria-label="Previous photo"
								className="rounded-md bg-ink/80 p-2 text-white"
								onClick={() => {
									step(-1);
								}}
							>
								<ChevronLeft aria-hidden className="size-5" />
							</button>
							<button
								type="button"
								aria-label="Next photo"
								className="rounded-md bg-ink/80 p-2 text-white"
								onClick={() => {
									step(1);
								}}
							>
								<ChevronRight aria-hidden className="size-5" />
							</button>
							<button
								type="button"
								aria-label="Close"
								autoFocus
								className="rounded-md bg-ink/80 p-2 text-white"
								onClick={() => dialogRef.current?.close()}
							>
								<X aria-hidden className="size-5" />
							</button>
						</div>
					</figure>
				) : null}
			</dialog>
		</>
	);
}
