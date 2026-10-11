import type { ReactNode } from "react";
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

export function Section({
	id,
	index,
	label,
	title,
	intro,
	children,
	className,
	action,
}: {
	readonly id?: string;
	readonly index?: number;
	readonly label?: string;
	readonly title?: ReactNode;
	readonly intro?: ReactNode;
	readonly children?: ReactNode;
	readonly className?: string;
	readonly action?: ReactNode;
}) {
	const headingId = id ? `${id}-heading` : undefined;
	const hasTitle = title !== undefined && title !== null;
	const hasIntro = intro !== undefined && intro !== null;
	return (
		<section
			id={id}
			aria-labelledby={hasTitle ? headingId : undefined}
			className={cn("py-14 sm:py-20", className)}
		>
			<Container>
				{label !== undefined || hasTitle ? (
					<Stagger className="mb-8 sm:mb-10">
						{label ? <FlightStrip index={index} label={label} /> : null}
						<div className="mt-5 flex flex-wrap items-end justify-between gap-4">
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
				) : null}
				{children}
			</Container>
		</section>
	);
}

export function RunwayDivider({ className }: { readonly className?: string }) {
	return (
		<Container className={className}>
			<div aria-hidden className="runway" />
		</Container>
	);
}
