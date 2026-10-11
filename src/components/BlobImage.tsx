"use client";

import type { StaticImageData } from "next/image";
import type { CSSProperties } from "react";
import { cn } from "@/lib/cn";
import { useBlobUrl } from "@/lib/use-blob-url";
import { getImageProps } from "next/image";
import { useEffect, useRef, useState } from "react";

/**
Image shown from an in-memory blob: URL, so its address isn't in the page's
HTML or easy to copy from the inspector. Shows the blur placeholder until the
optimized image (from next/image's loader) arrives; loads when near view.
*/
export default function BlobImage({
	src,
	alt,
	width,
	fill = false,
	className,
	imageClassName,
	style,
	onLoad,
}: {
	readonly src: StaticImageData;
	readonly alt: string;
	/**
	Display width in CSS px; the optimizer serves the 2× (retina) size.
	*/
	readonly width: number;
	readonly fill?: boolean;
	readonly className?: string;
	readonly imageClassName?: string;
	readonly style?: CSSProperties;
	readonly onLoad?: () => void;
}) {
	const ref = useRef<HTMLSpanElement>(null);
	const [isNear, setIsNear] = useState(false);
	const [isLoaded, setIsLoaded] = useState(false);
	const { props } = getImageProps({
		src,
		alt,
		width,
		height: Math.round((width * src.height) / src.width),
		quality: 80,
	});
	const blobUrl = useBlobUrl(props.src, isNear);

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

				setIsNear(true);
				observer.disconnect();
			},
			{ rootMargin: "400px" }
		);
		observer.observe(element);
		return () => {
			observer.disconnect();
		};
	}, []);

	return (
		<span
			ref={ref}
			role="img"
			aria-label={alt}
			className={cn(
				"block overflow-hidden bg-cover bg-center",
				fill ? "absolute inset-0" : "relative",
				className
			)}
			style={{
				...(!fill && { aspectRatio: `${src.width} / ${src.height}` }),
				backgroundImage: src.blurDataURL ? `url(${src.blurDataURL})` : undefined,
				...style,
			}}
		>
			{blobUrl ? (
				<img
					src={blobUrl}
					alt=""
					draggable={false}
					className={cn(
						"absolute inset-0 size-full object-cover transition-opacity duration-500",
						isLoaded ? "opacity-100" : "opacity-0",
						imageClassName
					)}
					onLoad={() => {
						setIsLoaded(true);
						onLoad?.();
					}}
				/>
			) : null}
		</span>
	);
}
