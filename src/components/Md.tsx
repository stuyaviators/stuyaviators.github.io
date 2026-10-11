import { cn } from "@/lib/cn";
import { renderInline, renderMarkdown } from "@/lib/markdown";

/**
 Renders club copy that contains markdown links/emphasis. markdown-it runs
 with HTML disabled, so output is safe to inject.
 */
export function Md({
	children,
	block = false,
	className,
}: {
	readonly children: string;
	readonly block?: boolean;
	readonly className?: string;
}) {
	if (block) {
		return (
			<div
				className={cn("body-links", className)}
				dangerouslySetInnerHTML={{ __html: renderMarkdown(children) }}
			/>
		);
	}

	return (
		<span
			className={cn("body-links", className)}
			dangerouslySetInnerHTML={{ __html: renderInline(children) }}
		/>
	);
}

export function Paragraphs({
	items,
	className,
}: {
	readonly items: readonly string[];
	readonly className?: string;
}) {
	return (
		<div className={className ?? "prose-club"}>
			{items.map((text) => (
				<p key={text.slice(0, 48)}>
					<Md>{text}</Md>
				</p>
			))}
		</div>
	);
}
