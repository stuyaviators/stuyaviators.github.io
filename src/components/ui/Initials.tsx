import { cn } from "@/lib/cn";

/** Neutral placeholder used where a real photo hasn't been supplied. */
export function Initials({
	name,
	className,
}: {
	readonly name: string;
	readonly className?: string;
}) {
	const initials = name
		.split(/\s+/)
		.filter((part) => /^\p{L}/u.test(part))
		.map((part) => part[0])
		.slice(0, 2)
		.join("")
		.toUpperCase();
	return (
		<div
			role="img"
			aria-label={`${name} (photo coming soon)`}
			className={cn(
				"flex items-center justify-center bg-surface-2 font-label text-3xl font-bold text-muted",
				className
			)}
		>
			<span aria-hidden>{initials}</span>
		</div>
	);
}

/** Generic image placeholder (no AI-generated imagery). */
export function ImagePlaceholder({
	label,
	className,
}: {
	readonly label: string;
	readonly className?: string;
}) {
	return (
		<div
			role="img"
			aria-label={label}
			className={cn(
				"flex items-center justify-center bg-surface-2 text-muted",
				className
			)}
		>
			<span className="label px-4 text-center">{label}</span>
		</div>
	);
}
