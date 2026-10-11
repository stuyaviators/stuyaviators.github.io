import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

export type PassField = { label: string; value: ReactNode };

/**
 Boarding-pass card: main body plus a perforated stub of data fields.
 Stacks vertically on narrow screens.
 */
export function BoardingPass({
	children,
	stub,
	stubTitle,
	stubImage,
	className,
	highlight,
	as: Tag = "article",
}: {
	readonly children: ReactNode;
	readonly stub: PassField[];
	readonly stubTitle?: string;
	/**
	Fills the top half of the stub (the whole top on narrow screens).
	*/
	readonly stubImage?: ReactNode;
	readonly className?: string;
	readonly highlight?: boolean;
	readonly as?: "article" | "li" | "div";
}) {
	return (
		<Tag
			className={cn(
				"relative flex flex-col overflow-hidden rounded-2xl border bg-surface shadow-card sm:flex-row",
				highlight ? "border-accent" : "border-hairline",
				className
			)}
		>
			<div className="min-w-0 flex-1 p-5 sm:p-6">{children}</div>
			<div aria-hidden className="perforation h-3 sm:h-auto sm:w-3" />
			<div className="flex flex-col border-t border-hairline bg-surface-2 sm:w-56 sm:shrink-0 sm:border-t-0 sm:border-l">
				{stubImage === undefined ? null : (
					<div className="relative h-36 shrink-0 overflow-hidden sm:h-auto sm:min-h-36 sm:flex-1">
						{stubImage}
					</div>
				)}
				<dl className="grid grid-cols-2 gap-x-4 gap-y-3 p-5 sm:flex-1 sm:grid-cols-1 sm:p-5">
					{stubTitle ? (
						<div className="label col-span-2 text-muted sm:col-span-1">
							{stubTitle}
						</div>
					) : null}
					{stub.map((field, index) => (
						<div key={`${field.label}-${index}`}>
							<dt className="label text-[0.68rem] text-muted">{field.label}</dt>
							<dd className="mt-0.5 font-mono text-sm text-text">
								{field.value}
							</dd>
						</div>
					))}
				</dl>
			</div>
		</Tag>
	);
}
