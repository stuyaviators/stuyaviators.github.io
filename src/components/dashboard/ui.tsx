import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

/*
 * Small presentational pieces shared by the dashboard screens. No hooks, so
 * they work in Server and Client Components alike.
 */

export function PageHeader({
	title,
	description,
	actions,
}: {
	readonly title: string;
	readonly description?: ReactNode;
	readonly actions?: ReactNode;
}) {
	return (
		<header className="mb-6 flex flex-wrap items-end justify-between gap-4">
			<div className="min-w-0">
				<h1 className="text-3xl sm:text-4xl">{title}</h1>
				{description === undefined ? null : (
					<p className="mt-2 max-w-2xl text-muted">{description}</p>
				)}
			</div>
			{actions === undefined ? null : (
				<div className="flex flex-wrap gap-2">{actions}</div>
			)}
		</header>
	);
}

export function Card({
	children,
	className,
	as: Tag = "section",
	...props
}: {
	readonly children: ReactNode;
	readonly className?: string;
	readonly as?: "section" | "div" | "li" | "article";
	readonly "aria-labelledby"?: string;
}) {
	return (
		<Tag
			className={cn(
				"rounded-2xl border border-hairline bg-surface p-5 sm:p-6",
				className
			)}
			{...props}
		>
			{children}
		</Tag>
	);
}

type Tone = "neutral" | "good" | "warn" | "bad" | "brand";

const tones: Record<Tone, string> = {
	neutral: "border-hairline text-muted",
	good: "border-success/50 text-success",
	warn: "border-field text-text",
	bad: "border-danger/60 text-danger",
	brand: "border-brand/60 text-brand",
};

export function Badge({
	tone = "neutral",
	children,
}: {
	readonly tone?: Tone;
	readonly children: ReactNode;
}) {
	return (
		<span
			className={cn(
				"label inline-flex items-center rounded-sm border px-2 py-0.5",
				tones[tone]
			)}
		>
			{children}
		</span>
	);
}

/**
Inline message. Errors are announced immediately, other tones politely.
*/
export function Notice({
	tone = "neutral",
	children,
	className,
}: {
	readonly tone?: "neutral" | "good" | "bad" | "warn";
	readonly children: ReactNode;
	readonly className?: string;
}) {
	return (
		<div
			role={tone === "bad" ? "alert" : "status"}
			className={cn(
				"dash-pop rounded-xl border px-4 py-3 text-sm",
				tone === "bad" && "border-danger/60 bg-danger/10 text-text",
				tone === "good" && "border-success/50 bg-success/10 text-text",
				tone === "warn" && "border-field bg-surface-2 text-text",
				tone === "neutral" && "border-hairline bg-surface-2 text-muted",
				className
			)}
		>
			{children}
		</div>
	);
}

export const dateTimeFormat = new Intl.DateTimeFormat("en-US", {
	dateStyle: "medium",
	timeStyle: "short",
	timeZone: "America/New_York",
});

export function formatWhen(value: Date | number | string | undefined) {
	return value === undefined
		? "—"
		: dateTimeFormat.format(
				typeof value === "number" ? new Date(value) : new Date(value)
			);
}
