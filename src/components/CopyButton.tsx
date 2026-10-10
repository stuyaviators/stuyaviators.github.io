"use client";

import copy from "@/lib/copy";
import { Check, Copy } from "lucide-react";
import { useEffect, useState } from "react";

/**
Copy-to-clipboard with visible and announced feedback.
*/
export default function CopyButton({
	value,
	label,
}: {
	readonly value: string;
	readonly label: string;
}) {
	const [status, setStatus] = useState<"idle" | "copied" | "failed">("idle");

	useEffect(() => {
		if (status === "idle") {
			return;
		}

		const timer = setTimeout(() => {
			setStatus("idle");
		}, 2000);
		return () => {
			clearTimeout(timer);
		};
	}, [status]);

	return (
		<>
			<button
				type="button"
				title={`Copy ${label}`}
				aria-label={`Copy ${label}`}
				className="inline-flex size-11 shrink-0 items-center justify-center rounded-md border border-hairline text-muted hover:border-brand hover:text-brand"
				onClick={() => {
					void copy(value).then(setStatus);
				}}
			>
				{status === "copied" ? (
					<Check aria-hidden className="size-4 text-success" />
				) : (
					<Copy aria-hidden className="size-4" />
				)}
			</button>
			<span role="status" className="sr-only">
				{status === "copied"
					? `${label} copied`
					: status === "failed"
						? "Couldn’t copy"
						: ""}
			</span>
		</>
	);
}
