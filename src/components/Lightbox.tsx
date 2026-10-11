"use client";

import type { MotionValue } from "motion/react";
import type { PhotoSpec } from "@/content/photo-specs";
import type { StaticImageData } from "next/image";
import type { CSSProperties } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import {
	AnimatePresence,
	motion,
	useReducedMotion,
	useScroll,
	useTransform,
} from "motion/react";
import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";

export type LightboxImage = {
	src: StaticImageData;
	alt: string;
	spec?: PhotoSpec;
};

function formatSpec(spec: PhotoSpec | undefined) {
	if (!spec) {
		return undefined;
	}

	const date = spec.date
		? new Date(`${spec.date}T12:00:00`).toLocaleDateString("en-US", {
				month: "short",
				day: "numeric",
				year: "numeric",
			})
		: undefined;
	return [
		spec.camera?.replace(/^Apple /u, ""),
		spec.focal,
		spec.aperture,
		spec.shutter,
		spec.iso === undefined ? undefined : `ISO ${spec.iso}`,
		date,
	]
		.filter(Boolean)
		.join(" · ");
}

// Deterministic jitter so the scatter is the same on every render.
function jitter(seed: number) {
	const x = Math.sin(seed * 12.9898) * 43_758.5453;
	return x - Math.floor(x);
}

function FloatingPhoto({
	image,
	index,
	columns,
	rows,
	drift,
	onOpen,
}: {
	readonly image: LightboxImage;
	readonly index: number;
	readonly columns: number;
	readonly rows: number;
	readonly drift: MotionValue<number>;
	readonly onOpen: (index: number, trigger: HTMLButtonElement) => void;
}) {
	const isReducedMotion = useReducedMotion();
	const column = index % columns;
	const row = Math.floor(index / columns);
	// Stagger alternate rows so the scatter doesn't read as a grid.
	const left =
		((column + (row % 2) * 0.5 + jitter(index + 1) * 0.45) / (columns + 0.5)) *
		100;
	const top = ((row + jitter(index + 50) * 0.6) / rows) * 100;
	const width = 8 + jitter(index + 100) * 5; // Rem
	const tilt = (jitter(index + 150) - 0.5) * 14;
	const depth = (jitter(index + 200) - 0.5) * 2;
	const y = useTransform(drift, [0, 1], [depth * 160, depth * -160]);
	// Each photo wanders its own slow loop.
	const wanderStyle: Record<string, string> = {
		"--wander-d": `${14 + jitter(index + 250) * 12}s`,
		"--wander-delay": `${-jitter(index + 300) * 20}s`,
		"--wx": `${16 + jitter(index + 350) * 28}px`,
		"--wy": `${12 + jitter(index + 400) * 22}px`,
		"--wr": `${tilt > 0 ? 3 : -3}deg`,
	};

	return (
		<li
			className="absolute z-0 hover:z-30 focus-within:z-30"
			style={{
				left: `${left}%`,
				top: `${top}%`,
				width: `clamp(5.5rem, ${width * 1.6}vw, ${width}rem)`,
			}}
		>
			<motion.div style={isReducedMotion ? undefined : { y }}>
				<div className="wander" style={wanderStyle}>
					<button
						type="button"
						aria-label={`Open photo: ${image.alt}`}
						className="gallery-photo block w-full overflow-hidden rounded-xl shadow-card transition-[transform,filter,opacity,box-shadow] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] hover:scale-[2.1] hover:rotate-0 hover:shadow-2xl focus-visible:scale-[2.1] focus-visible:rotate-0 motion-reduce:transition-none"
						style={{ rotate: `${tilt}deg` }}
						onClick={(event) => {
							onOpen(index, event.currentTarget);
						}}
					>
						<Image
							src={image.src}
							alt={image.alt}
							placeholder="blur"
							sizes="(min-width: 1024px) 400px, 50vw"
							className="h-auto w-full"
						/>
					</button>
				</div>
			</motion.div>
		</li>
	);
}

/**
Photos clumped across the page at different depths, each wandering a slow loop;
hovering one brings it forward and enlarges it while the rest blur back.
*/
function FloatingStage({
	images,
	onOpen,
}: {
	readonly images: LightboxImage[];
	readonly onOpen: (index: number, trigger: HTMLButtonElement) => void;
}) {
	const ref = useRef<HTMLUListElement>(null);
	const [columns, setColumns] = useState(5);
	const { scrollYProgress } = useScroll({
		target: ref,
		offset: ["start end", "end start"],
	});

	useEffect(() => {
		const large = globalThis.matchMedia("(min-width: 1024px)");
		const small = globalThis.matchMedia("(min-width: 640px)");
		const update = () => {
			setColumns(large.matches ? 5 : small.matches ? 4 : 3);
		};

		update();
		large.addEventListener("change", update);
		small.addEventListener("change", update);
		return () => {
			large.removeEventListener("change", update);
			small.removeEventListener("change", update);
		};
	}, []);

	const rows = Math.ceil(images.length / columns);
	return (
		<ul
			ref={ref}
			className="floating-stage relative my-16"
			// Rows overlap, so photos clump together.
			style={{ height: `calc(${rows} * clamp(6.5rem, 19vw, 11.5rem) + 8rem)` }}
		>
			{images.map((image, index) => (
				<FloatingPhoto
					key={image.alt + index}
					image={image}
					index={index}
					columns={columns}
					rows={rows}
					drift={scrollYProgress}
					onOpen={onOpen}
				/>
			))}
		</ul>
	);
}

/**
Floating photo scatter with an accessible <dialog> lightbox (arrow keys,
Escape). The viewer shows camera specs from the photo's metadata, when
there are any, instead of a caption.
*/
export default function Lightbox({
	images,
}: {
	readonly images: LightboxImage[];
}) {
	const dialogRef = useRef<HTMLDialogElement>(null);
	const triggerRef = useRef<HTMLButtonElement | undefined>(null);
	const [index, setIndex] = useState<number | undefined>(undefined);
	const [direction, setDirection] = useState(1);
	const [loadedIndex, setLoadedIndex] = useState<number | undefined>(
		undefined
	);
	const isReducedMotion = useReducedMotion();

	const open = (i: number, trigger: HTMLButtonElement) => {
		triggerRef.current = trigger;
		setIndex(i);
		dialogRef.current?.showModal();
	};

	const step = useCallback(
		(delta: number) => {
			setDirection(delta);
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
			<FloatingStage
				images={images}
				onOpen={(i, trigger) => {
					open(i, trigger);
				}}
			/>
			<dialog
				ref={dialogRef}
				aria-label={current ? current.alt : "Photo viewer"}
				className="fixed inset-0 m-0 h-dvh max-h-none w-screen max-w-none overflow-hidden bg-transparent p-0 text-white backdrop:bg-black/90 backdrop:backdrop-blur-sm"
			>
				<div
					className="flex size-full items-center justify-center px-16 py-20 sm:px-24"
					onClick={(event) => {
						// Clicking the empty area around the photo closes the viewer.
						if (event.target === event.currentTarget) {
							dialogRef.current?.close();
						}
					}}
				>
					<AnimatePresence mode="wait" custom={direction} initial={false}>
						{current && index !== undefined ? (
							<motion.figure
								key={index}
								custom={direction}
								className="flex max-h-full max-w-full flex-col items-center"
								initial={{
									opacity: 0,
									x: isReducedMotion ? 0 : direction * 80,
									scale: 0.96,
								}}
								animate={
									loadedIndex === index
										? { opacity: 1, x: 0, scale: 1 }
										: {
												opacity: 0,
												x: isReducedMotion ? 0 : direction * 40,
												scale: 0.98,
											}
								}
								exit={{
									opacity: 0,
									x: isReducedMotion ? 0 : direction * -80,
									scale: 0.96,
								}}
								transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
							>
								<Image
									src={current.src}
									alt={current.alt}
									sizes="92vw"
									className="h-auto max-h-[76dvh] w-auto max-w-full rounded-2xl object-contain shadow-2xl"
									onLoad={() => {
										setLoadedIndex(index);
									}}
								/>
								{/* Only once the photo has loaded. */}
								{loadedIndex === index && formatSpec(current.spec) ? (
									<motion.figcaption
										initial={{ opacity: 0, y: 8 }}
										animate={{ opacity: 1, y: 0 }}
										transition={{ duration: 0.4, delay: 0.15 }}
										className="mt-4 text-center text-sm text-white/75"
									>
										{formatSpec(current.spec)}
									</motion.figcaption>
								) : null}
							</motion.figure>
						) : null}
					</AnimatePresence>
				</div>

				{/* Controls stay in the same place for every photo. */}
				<motion.button
					type="button"
					aria-label="Close"
					autoFocus
					whileHover={{ scale: 1.08 }}
					whileTap={{ scale: 0.92 }}
					className="fixed top-4 right-4 inline-flex size-11 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-md transition-colors hover:bg-white/20"
					onClick={() => dialogRef.current?.close()}
				>
					<X aria-hidden className="size-5" />
				</motion.button>
				<motion.button
					type="button"
					aria-label="Previous photo"
					whileHover={{ scale: 1.08, x: -2 }}
					whileTap={{ scale: 0.9 }}
					className="fixed top-[calc(50%-1.5rem)] left-3 inline-flex size-12 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-md transition-colors hover:bg-white/20 sm:left-6"
					onClick={() => {
						step(-1);
					}}
				>
					<ChevronLeft aria-hidden className="size-6" />
				</motion.button>
				<motion.button
					type="button"
					aria-label="Next photo"
					whileHover={{ scale: 1.08, x: 2 }}
					whileTap={{ scale: 0.9 }}
					className="fixed top-[calc(50%-1.5rem)] right-3 inline-flex size-12 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-md transition-colors hover:bg-white/20 sm:right-6"
					onClick={() => {
						step(1);
					}}
				>
					<ChevronRight aria-hidden className="size-6" />
				</motion.button>
				<p className="fixed bottom-5 left-1/2 -translate-x-1/2 font-mono text-sm text-white/70">
					{(index ?? 0) + 1} / {images.length}
				</p>
			</dialog>
		</>
	);
}
