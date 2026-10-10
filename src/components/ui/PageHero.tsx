import Image, { type StaticImageData } from "next/image";
import type { ReactNode } from "react";
import { Stagger } from "@/components/TransitionProvider";
import { Container } from "./Section";

/** Interior page header: label, title, intro, optional photo. */
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
	return (
		<header className="border-b border-hairline bg-surface">
			<Container className="grid items-center gap-8 py-12 sm:py-16 lg:grid-cols-[1.1fr_0.9fr] lg:gap-12">
				<div>
					<Stagger>
						<p className="label text-accent-text">{eyebrow}</p>
					</Stagger>
					<Stagger>
						<h1 className="mt-3 text-4xl sm:text-5xl">{title}</h1>
					</Stagger>
					{intro ? (
						<Stagger>
							<div className="mt-5 max-w-2xl text-lg text-muted">{intro}</div>
						</Stagger>
					) : null}
					{children ? (
						<Stagger>
							<div className="mt-7 flex flex-wrap gap-3">{children}</div>
						</Stagger>
					) : null}
				</div>
				{image ? (
					<Stagger className="relative aspect-[4/3] overflow-hidden rounded-lg border border-hairline bg-surface-2">
						<Image
							src={image}
							alt={imageAlt ?? ""}
							fill
							priority
							placeholder="blur"
							sizes="(min-width: 1024px) 40vw, 100vw"
							className="object-cover"
						/>
					</Stagger>
				) : null}
			</Container>
		</header>
	);
}
