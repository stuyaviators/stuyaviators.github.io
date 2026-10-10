import { cn } from "@/lib/cn";

/**
 * Section label styled like an ATC flight progress strip: amber bar, sequence
 * number, title, and a right-aligned code.
 */
export function FlightStrip({
	index,
	label,
	code = "STUY · EST 2022",
	className,
	as: Tag = "p",
}: {
	readonly index?: number | string;
	readonly label: string;
	readonly code?: string;
	readonly className?: string;
	readonly as?: "p" | "h2" | "div";
}) {
	return (
		<Tag
			className={cn(
				"label flex items-stretch overflow-hidden rounded-sm border border-hairline bg-surface text-muted",
				className
			)}
		>
			<span aria-hidden className="w-1.5 shrink-0 bg-accent" />
			{index === undefined ? null : (
				<span className="border-r border-hairline px-3 py-1.5 font-mono text-text">
					{String(index).padStart(2, "0")}
				</span>
			)}
			<span className="px-3 py-1.5 font-bold text-text">{label}</span>
			{code ? (
				<span className="ml-auto hidden border-l border-hairline px-3 py-1.5 sm:block">
					{code}
				</span>
			) : null}
		</Tag>
	);
}
