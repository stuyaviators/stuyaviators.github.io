"use client";

import type { PhotoSpec } from "@/content/photo-specs";
import type { StaticImageData } from "next/image";
import { Bot, ChevronLeft, ChevronRight, X } from "lucide-react";
import { cn } from "@/lib/cn";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";
import BlobImage from "./BlobImage.tsx";

export type LightboxImage = {
	src: StaticImageData;
	alt: string;
	// The description was written by AI, so the viewer says so.
	isAiCaption?: boolean;
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

const spring = { type: "spring", stiffness: 320, damping: 30, mass: 0.6 } as const;

function GridTile({
	image,
	index,
	columns,
	rows,
	hovered,
	onHover,
	onOpen,
}: {
	readonly image: LightboxImage;
	readonly index: number;
	readonly columns: number;
	readonly rows: number;
	readonly hovered: number | undefined;
	readonly onHover: (index: number | undefined) => void;
	readonly onOpen: (index: number, trigger: HTMLButtonElement) => void;
}) {
	const isReducedMotion = useReducedMotion();
	const column = index % columns;
	const row = Math.floor(index / columns);
	const isHovered = hovered === index;
	let animate: { scale: number; x: number; y: number; opacity: number } = {
		scale: 1,
		x: 0,
		y: 0,
		opacity: 1,
	};

	if (hovered !== undefined && !isHovered) {
		const dc = column - (hovered % columns);
		const dr = row - Math.floor(hovered / columns);
		const distance = Math.max(Math.abs(dc), Math.abs(dr));
		// Neighbors make room; everything else steps back.
		animate =
			distance === 1
				? {
						scale: 0.9,
						x: Math.sign(dc) * 6,
						y: Math.sign(dr) * 6,
						opacity: 0.7,
					}
				: { scale: 1, x: 0, y: 0, opacity: 0.45 };
	} else if (isHovered) {
		animate = { scale: 2.6, x: 0, y: 0, opacity: 1 };
	}

	// Grow away from the grid's edges so the enlarged photo stays inside.
	const originX = column === 0 ? "0%" : column === columns - 1 ? "100%" : "50%";
	const originY = row === 0 ? "0%" : row === rows - 1 ? "100%" : "50%";

	return (
		<motion.li
			className="relative aspect-square"
			style={{
				zIndex: isHovered ? 20 : 1,
				transformOrigin: `${originX} ${originY}`,
			}}
			animate={isReducedMotion ? undefined : animate}
			transition={spring}
		>
			<button
				type="button"
				aria-label={`Open photo: ${image.alt}`}
				className={cn(
					"relative block size-full overflow-hidden rounded-md bg-surface-2 transition-[box-shadow,border-radius] duration-300 sm:rounded-lg",
					isHovered && "rounded-xl shadow-2xl ring-1 ring-white/20"
				)}
				onPointerEnter={() => {
					onHover(index);
				}}
				onFocus={() => {
					onHover(index);
				}}
				onBlur={() => {
					onHover(undefined);
				}}
				onClick={(event) => {
					onOpen(index, event.currentTarget);
				}}
			>
				<BlobImage fill src={image.src} alt={image.alt} width={240} />
			</button>
		</motion.li>
	);
}

/**
Minesweeper-style grid of small square photos. Hovering one springs it up
to 2.6× while its neighbors make room and the rest dim back; clicking opens
the viewer. Hover is ignored while the page scrolls.
*/
function PhotoGrid({
	images,
	onOpen,
}: {
	readonly images: LightboxImage[];
	readonly onOpen: (index: number, trigger: HTMLButtonElement) => void;
}) {
	const ref = useRef<HTMLUListElement>(null);
	const [columns, setColumns] = useState(8);
	const [hovered, setHovered] = useState<number | undefined>(undefined);

	useEffect(() => {
		const large = globalThis.matchMedia("(min-width: 1024px)");
		const small = globalThis.matchMedia("(min-width: 640px)");
		const update = () => {
			setColumns(large.matches ? 10 : small.matches ? 8 : 5);
		};

		update();
		large.addEventListener("change", update);
		small.addEventListener("change", update);
		return () => {
			large.removeEventListener("change", update);
			small.removeEventListener("change", update);
		};
	}, []);

	// Ignore the cursor while scrolling, so tiles sliding under it don't pop.
	useEffect(() => {
		let timer: ReturnType<typeof setTimeout> | undefined;
		const onScroll = () => {
			ref.current?.classList.add("is-scrolling");
			setHovered(undefined);
			clearTimeout(timer);
			timer = setTimeout(() => {
				ref.current?.classList.remove("is-scrolling");
			}, 150);
		};

		window.addEventListener("scroll", onScroll, { passive: true });
		return () => {
			window.removeEventListener("scroll", onScroll);
			clearTimeout(timer);
		};
	}, []);

	const rows = Math.ceil(images.length / columns);
	return (
		<ul
			ref={ref}
			className="photo-grid my-10 grid gap-1.5 sm:gap-2"
			style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}
			onPointerLeave={() => {
				setHovered(undefined);
			}}
		>
			{images.map((image, index) => (
				<GridTile
					key={image.alt + index}
					image={image}
					index={index}
					columns={columns}
					rows={rows}
					hovered={hovered}
					onHover={setHovered}
					onOpen={onOpen}
				/>
			))}
		</ul>
	);
}

/**
The viewer's caption: the photo's description on one line. A mouse over it, or
a tap or Enter on it, swaps it for the camera specs from the photo's metadata
(italic "No data found" when there are none). A description written by AI gets
a small robot with a tooltip saying so. Both texts share one grid cell, so the
caption never changes height.
*/
function Caption({
	alt,
	isAi,
	specs,
}: {
	readonly alt: string;
	readonly isAi: boolean;
	readonly specs: string | undefined;
}) {
	const [isPinned, setIsPinned] = useState(false);
	const [isHovered, setIsHovered] = useState(false);
	const isShowingSpecs = isHovered || isPinned;
	// Both texts get exactly the same font, line height and centering, and sit
	// in the same spot, so swapping them changes nothing but the words.
	const line =
		"col-start-1 row-start-1 self-center text-center text-sm leading-normal font-normal transition-opacity duration-300 motion-reduce:transition-none";
	return (
		<motion.figcaption
			initial={{ opacity: 0, y: 8 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.4, delay: 0.15 }}
			className="mt-4 flex max-w-prose items-start justify-center gap-1.5"
		>
			<button
				type="button"
				className={cn(
					"grid cursor-pointer rounded-lg px-1 py-1 text-center text-sm transition-colors duration-200 hover:text-white active:text-white motion-reduce:transition-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white",
					isPinned ? "text-white" : "text-white/70"
				)}
				onPointerEnter={(event) => {
					// Only a real mouse hovers; a tap toggles with the click below.
					setIsHovered(event.pointerType === "mouse");
				}}
				onPointerLeave={() => {
					setIsHovered(false);
				}}
				onClick={() => {
					setIsPinned((value) => !value);
				}}
			>
				<span
					aria-hidden={isShowingSpecs}
					className={cn(line, isShowingSpecs ? "opacity-0" : "opacity-100")}
				>
					{alt}
				</span>
				<span
					aria-hidden={!isShowingSpecs}
					className={cn(line, isShowingSpecs ? "opacity-100" : "opacity-0")}
				>
					{specs ?? <em>No data found</em>}
				</span>
			</button>
			{isAi ? (
				<span
					tabIndex={0}
					role="img"
					aria-label="AI-Generated Caption, may be inaccurate"
					className="group/tip relative mt-1 inline-flex h-5 shrink-0 cursor-help items-center rounded text-white/60 transition-colors duration-200 hover:text-white focus-visible:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
				>
					<Bot aria-hidden className="size-4" />
					<span
						aria-hidden
						className="pointer-events-none absolute top-full left-1/2 z-10 mt-2 w-max max-w-56 -translate-x-1/2 rounded-md bg-black px-2.5 py-1.5 text-center text-xs text-white opacity-0 shadow-lg ring-1 ring-white/15 transition-opacity duration-200 group-hover/tip:opacity-100 group-focus/tip:opacity-100 motion-reduce:transition-none"
					>
						AI-Generated Caption. May be inaccurate.
					</span>
				</span>
			) : null}
		</motion.figcaption>
	);
}

/**
Photo grid with an accessible <dialog> lightbox (arrow keys,
Escape). Each photo in the viewer has a caption that swaps to the camera
specs from the photo's metadata when the mouse is over it.
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
			<PhotoGrid
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
								<BlobImage
									src={current.src}
									alt={current.alt}
									width={960}
									className="rounded-2xl shadow-2xl"
									style={{
										width: `min(92vw - 8rem, calc(76dvh * ${current.src.width / current.src.height}))`,
									}}
									onLoad={() => {
										setLoadedIndex(index);
									}}
								/>
								{/* Only once the photo has loaded. */}
								{loadedIndex === index ? (
									<Caption
										alt={current.alt}
										isAi={current.isAiCaption === true}
										specs={formatSpec(current.spec)}
									/>
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
