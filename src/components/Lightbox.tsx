"use client";

import type { StaticImageData } from "next/image";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";

export type LightboxImage = { src: StaticImageData; alt: string };

/** Photo grid with an accessible <dialog> lightbox (arrow keys, Escape). */
export default function Lightbox({
	images,
}: {
	readonly images: LightboxImage[];
}) {
	const dialogRef = useRef<HTMLDialogElement>(null);
	const triggerRef = useRef<HTMLButtonElement | null>(null);
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
		if (!dialog) return;
		const onKey = (event: KeyboardEvent) => {
			if (event.key === "ArrowRight") step(1);
			if (event.key === "ArrowLeft") step(-1);
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
			<ul className="columns-2 gap-3 sm:columns-3 lg:columns-4 [&>li]:mb-3">
				{images.map((image, i) => (
					<li key={image.alt + i} className="break-inside-avoid">
						<button
							type="button"
							className="group block w-full overflow-hidden rounded-md bg-surface-2"
							onClick={(event) => {
								open(i, event.currentTarget);
							}}
						>
							<Image
								src={image.src}
								alt={image.alt}
								placeholder="blur"
								sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
								className="h-auto w-full transition-transform duration-300 group-hover:scale-[1.02] motion-reduce:transition-none"
							/>
						</button>
					</li>
				))}
			</ul>
			<dialog
				ref={dialogRef}
				aria-label={current ? current.alt : "Photo viewer"}
				className="m-auto max-h-[92dvh] w-[min(96vw,1200px)] bg-transparent p-0 backdrop:bg-navy/90"
				onClick={(event) => {
					if (event.target === event.currentTarget) dialogRef.current?.close();
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
								className="rounded-md bg-navy/80 p-2 text-white"
								onClick={() => {
									step(-1);
								}}
							>
								<ChevronLeft aria-hidden className="size-5" />
							</button>
							<button
								type="button"
								aria-label="Next photo"
								className="rounded-md bg-navy/80 p-2 text-white"
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
								className="rounded-md bg-navy/80 p-2 text-white"
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
