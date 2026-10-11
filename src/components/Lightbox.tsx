"use client";

import type { MotionValue } from "motion/react";
import type { PhotoSpec } from "@/content/photo-specs";
import type { StaticImageData } from "next/image";
import type { CSSProperties } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import {
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
	const top = ((row + jitter(index + 50) * 0.5) / rows) * 100;
	const width = 7 + jitter(index + 100) * 5; // Rem
	const tilt = (jitter(index + 150) - 0.5) * 14;
	const depth = (jitter(index + 200) - 0.5) * 2;
	const y = useTransform(drift, [0, 1], [depth * 120, depth * -120]);
	const floatStyle: Record<string, string> = {
		"--float-d": `${6 + jitter(index + 250) * 5}s`,
		"--float-delay": `${-jitter(index + 300) * 6}s`,
		"--float-rot": `${tilt > 0 ? 2 : -2}deg`,
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
				<div className="float" style={floatStyle}>
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
Photos scattered across the page at different depths, gently floating;
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
			style={{ height: `calc(${rows} * clamp(8rem, 26vw, 15rem))` }}
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
			<FloatingStage
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
							<span>{formatSpec(current.spec) ?? ""}</span>
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
