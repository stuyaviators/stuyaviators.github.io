import type { ReactNode } from "react";
import PinnedScene from "@/components/motion/PinnedScene";
import RevealText from "@/components/motion/RevealText";
import { Stagger } from "@/components/TransitionProvider";
import { cn } from "@/lib/cn";
import { FlightStrip } from "./FlightStrip.tsx";

export function Container({
	children,
	className,
}: {
	readonly children: ReactNode;
	readonly className?: string;
}) {
	return (
		<div
			className={cn("mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8", className)}
		>
			{children}
		</div>
	);
}

/**
Eyebrow, heading and intro used at the top of every section.
*/
export function SectionHeader({
	headingId,
	eyebrow,
	title,
	intro,
	action,
}: {
	readonly headingId?: string;
	readonly eyebrow?: string;
	readonly title?: ReactNode;
	readonly intro?: ReactNode;
	readonly action?: ReactNode;
}) {
	const hasTitle = title !== undefined && title !== null;
	const hasIntro = intro !== undefined && intro !== null;
	return (
		<Stagger className="mb-8 sm:mb-10">
			{eyebrow ? <FlightStrip label={eyebrow} /> : null}
			<div className="mt-3 flex flex-wrap items-end justify-between gap-4">
				{hasTitle ? (
					typeof title === "string" ? (
						<RevealText
							as="h2"
							id={headingId}
							text={title}
							className="max-w-3xl text-4xl sm:text-5xl"
						/>
					) : (
						<h2 id={headingId} className="max-w-3xl text-4xl sm:text-5xl">
							{title}
						</h2>
					)
				) : null}
				{action}
			</div>
			{hasIntro ? (
				<div className="mt-4 max-w-3xl text-lg text-muted">{intro}</div>
			) : null}
		</Stagger>
	);
}

export function Section({
	id,
	label,
	title,
	intro,
	children,
	className,
	action,
	pin,
}: {
	readonly id?: string;
	readonly label?: string;
	readonly title?: ReactNode;
	readonly intro?: ReactNode;
	readonly children?: ReactNode;
	readonly className?: string;
	readonly action?: ReactNode;
	/**
	Lock the section on screen while scrolling (true = half a screen of
	extra scroll, or a number of screen heights). Falls back to a normal
	section when the content is taller than the screen.
	*/
	readonly pin?: boolean | number;
}) {
	const headingId = id ? `${id}-heading` : undefined;
	const hasTitle = title !== undefined && title !== null;
	// A label that only repeats the title is noise.
	const eyebrow = label === title ? undefined : label;
	const header =
		eyebrow !== undefined || hasTitle ? (
			<SectionHeader
				headingId={headingId}
				eyebrow={eyebrow}
				title={title}
				intro={intro}
				action={action}
			/>
		) : null;

	if (pin !== undefined && pin !== false) {
		return (
			<PinnedScene
				id={id}
				labelledBy={hasTitle ? headingId : undefined}
				length={typeof pin === "number" ? pin : 0.5}
				className={className}
			>
				<Container>
					{header}
					{children}
				</Container>
			</PinnedScene>
		);
	}

	return (
		<section
			id={id}
			aria-labelledby={hasTitle ? headingId : undefined}
			className={cn("scene-section py-12 sm:py-16", className)}
		>
			<Container className="scene">
				{header}
				{children}
			</Container>
		</section>
	);
}
