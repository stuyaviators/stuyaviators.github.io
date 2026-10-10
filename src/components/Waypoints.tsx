import type { ReactNode } from "react";
import { Stagger } from "./TransitionProvider";

/** Dashed flight path with diamond waypoints linking timeline items. */
export default function Waypoints({
	items,
}: {
	readonly items: Array<{ key: string; label: string; content: ReactNode }>;
}) {
	return (
		<ol className="relative ml-2 border-l-2 border-dashed border-field">
			{items.map((item) => (
				<Stagger as="li" key={item.key} className="relative pb-12 pl-8 last:pb-0 sm:pl-10">
					<span
						aria-hidden
						className="absolute top-1.5 -left-[9px] size-4 rotate-45 border-2 border-brand bg-bg"
					/>
					<p className="label text-accent-text">{item.label}</p>
					<div className="mt-2">{item.content}</div>
				</Stagger>
			))}
		</ol>
	);
}
