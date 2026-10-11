"use client";

import { Button } from "@/components/ui/Button";
import { useEffect, useRef } from "react";

/*
 * Confirmation dialog, ported from recode's Confirm (webcubed) and rebuilt on
 * a native <dialog>: focus is trapped and restored, Esc cancels, and the
 * background is inert while it's open.
 */
export default function Confirm({
	isOpen,
	title = "Are you sure?",
	description,
	confirmLabel = "Confirm",
	cancelLabel = "Cancel",
	isDanger = true,
	onConfirm,
	onCancel,
}: {
	readonly isOpen: boolean;
	readonly title?: string;
	readonly description?: string;
	readonly confirmLabel?: string;
	readonly cancelLabel?: string;
	readonly isDanger?: boolean;
	readonly onConfirm: () => void;
	readonly onCancel: () => void;
}) {
	const ref = useRef<HTMLDialogElement>(null);

	useEffect(() => {
		const dialog = ref.current;
		if (!dialog) {
			return;
		}

		if (isOpen && !dialog.open) {
			dialog.showModal();
		} else if (!isOpen && dialog.open) {
			dialog.close();
		}
	}, [isOpen]);

	return (
		<dialog
			ref={ref}
			aria-labelledby="confirm-title"
			className="m-auto w-[min(26rem,calc(100vw-2rem))] rounded-2xl border border-hairline bg-bg p-6 text-text shadow-card backdrop:bg-black/50"
			onCancel={(event) => {
				event.preventDefault();
				onCancel();
			}}
		>
			<h2 id="confirm-title" className="text-xl">
				{title}
			</h2>
			{description ? <p className="mt-2 text-muted">{description}</p> : null}
			<div className="mt-6 flex flex-wrap justify-end gap-3">
				<Button variant="secondary" onClick={onCancel}>
					{cancelLabel}
				</Button>
				<Button
					autoFocus
					className={isDanger ? "bg-danger text-white hover:brightness-110" : undefined}
					onClick={onConfirm}
				>
					{confirmLabel}
				</Button>
			</div>
		</dialog>
	);
}
