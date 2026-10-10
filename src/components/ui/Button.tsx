import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/cn";
import Link from "next/link";

type Variant = "primary" | "accent" | "secondary" | "ghost";

const variants: Record<Variant, string> = {
	primary: "bg-brand text-brand-ink hover:brightness-110",
	accent: "bg-accent text-accent-ink hover:brightness-105",
	secondary:
		"border border-field bg-surface text-text hover:border-brand hover:text-brand",
	ghost: "text-brand hover:bg-surface-2",
};

export function buttonClasses(
	variant: Variant = "primary",
	className?: string
) {
	return cn(
		"inline-flex min-h-11 items-center justify-center gap-2 rounded-md px-5 py-2.5 text-sm font-semibold transition-[filter,color,border-color,background-color] duration-150 disabled:cursor-not-allowed disabled:opacity-50 motion-reduce:transition-none",
		variants[variant],
		className
	);
}

export function Button({
	variant = "primary",
	className,
	type = "button",
	...props
}: ComponentProps<"button"> & { readonly variant?: Variant }) {
	return (
		<button
			type={type}
			className={buttonClasses(variant, className)}
			{...props}
		/>
	);
}

/** Internal links use next/link; http(s)/mailto links open externally. */
export function ButtonLink({
	href,
	variant = "primary",
	className,
	children,
	external,
}: {
	readonly href: string;
	readonly variant?: Variant;
	readonly className?: string;
	readonly children: ReactNode;
	readonly external?: boolean;
}) {
	const isExternal = external ?? /^(https?:|mailto:)/.test(href);
	if (isExternal) {
		return (
			<a
				href={href}
				className={buttonClasses(variant, className)}
				{...(href.startsWith("http")
					? { target: "_blank", rel: "noopener noreferrer" }
					: {})}
			>
				{children}
			</a>
		);
	}

	return (
		<Link href={href} className={buttonClasses(variant, className)}>
			{children}
		</Link>
	);
}
