import type { StaticImageData } from "next/image";
import type { ReactNode } from "react";
import Parallax from "@/components/motion/Parallax";
import RevealText from "@/components/motion/RevealText";
import { Stagger } from "@/components/TransitionProvider";
import Image from "next/image";
import { Container } from "./Section.tsx";

/**
 Interior page header. With an image, the photo fills the header and the
 text sits on a navy scrim (left-weighted on desktop, even on mobile) so it
 keeps AA contrast over any photo.
 */
export function PageHero({
	eyebrow,
	title,
	intro,
	image,
	imageAlt,
	children,
}: {
	readonly eyebrow: string;
	readonly title: string;
	readonly intro?: ReactNode;
	readonly image?: StaticImageData;
	readonly imageAlt?: string;
	readonly children?: ReactNode;
}) {
	const content = (
		<>
			<Stagger>
				<p className="label text-accent-text">{eyebrow}</p>
			</Stagger>
			<RevealText
				as="h1"
				text={title}
				delay={120}
				className="mt-3 block text-5xl sm:text-6xl lg:text-7xl"
			/>
			{intro === undefined ? null : (
				<Stagger>
					<div className="mt-5 max-w-2xl text-lg text-muted">{intro}</div>
				</Stagger>
			)}
			{children === undefined ? null : (
				<Stagger>
					<div className="mt-7 flex flex-wrap gap-3">{children}</div>
				</Stagger>
			)}
		</>
	);

	if (!image) {
		return (
			<header className="border-b border-hairline bg-surface">
				<Container className="py-14 sm:py-20">{content}</Container>
			</header>
		);
	}

	return (
		<header className="on-dark relative isolate -mt-[5.5rem] overflow-hidden bg-navy pt-[5.5rem]">
			<div className="absolute inset-0 -z-20">
				<Parallax distance={120}>
					<Image
						src={image}
						alt={imageAlt ?? ""}
						fill
						priority
						placeholder="blur"
						sizes="100vw"
						className="object-cover"
					/>
				</Parallax>
			</div>
			<div
				aria-hidden
				className="absolute inset-0 -z-10 bg-navy/80 lg:bg-transparent lg:bg-linear-to-r lg:from-navy/95 lg:via-navy/80 lg:to-navy/35"
			/>
			<Container className="flex min-h-[26rem] flex-col justify-end py-14 sm:min-h-[30rem] sm:py-20">
				<div className="max-w-3xl">{content}</div>
			</Container>
		</header>
	);
}
