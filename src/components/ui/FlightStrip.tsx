import { cn } from "@/lib/cn";

/**
 Section eyebrow: a short brand-blue label above a heading, with an optional
 sequence number (used for charter articles).
 */
export function FlightStrip({
	index,
	label,
	className,
	as: Tag = "p",
}: {
	readonly index?: number | string;
	readonly label: string;
	readonly className?: string;
	readonly as?: "p" | "h2" | "div";
}) {
	return (
		<Tag className={cn("label text-accent-text", className)}>
			{index === undefined ? null : (
				<span className="mr-2 font-mono text-muted">
					{String(index).padStart(2, "0")}
				</span>
			)}
			{label}
		</Tag>
	);
}
