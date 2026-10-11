"use client";

import { X } from "lucide-react";
import { useEffect, useRef } from "react";
import MailingListForm from "./MailingListForm.tsx";

/*
 * Site-wide mailing-list sign-up in a modal. Any link to "#mailing-list"
 * opens it (header, footer, pages), so server components need no client
 * code to trigger it, and /#mailing-list deep-links straight to it.
 */
export const mailingListHash = "#mailing-list";

export default function MailingListModal({
	fallbackUrl,
}: {
	readonly fallbackUrl: string;
}) {
	const dialogRef = useRef<HTMLDialogElement>(null);

	useEffect(() => {
		const dialog = dialogRef.current;
		if (!dialog) {
			return;
		}

		const open = () => {
			if (!dialog.open) {
				dialog.showModal();
			}
		};

		const onClick = (event: MouseEvent) => {
			const link = (event.target as Element | undefined)?.closest?.("a[href]");
			if (!link?.getAttribute("href")?.endsWith(mailingListHash)) {
				return;
			}

			event.preventDefault();
			open();
		};

		// Drop the hash on close so the same link can reopen it.
		const onClose = () => {
			if (globalThis.location.hash === mailingListHash) {
				history.replaceState(
					history.state,
					"",
					globalThis.location.pathname + globalThis.location.search
				);
			}
		};

		const onHash = () => {
			if (globalThis.location.hash === mailingListHash) {
				open();
			}
		};

		onHash();
		document.addEventListener("click", onClick);
		globalThis.addEventListener("hashchange", onHash);
		dialog.addEventListener("close", onClose);
		return () => {
			document.removeEventListener("click", onClick);
			globalThis.removeEventListener("hashchange", onHash);
			dialog.removeEventListener("close", onClose);
		};
	}, []);

	return (
		<dialog
			ref={dialogRef}
			aria-labelledby="mailing-list-title"
			className="m-auto w-[calc(100%-2rem)] max-w-lg rounded-3xl border border-hairline bg-bg p-0 text-text shadow-card backdrop:bg-black/50 backdrop:backdrop-blur-sm"
			onClick={(event) => {
				// Click on the backdrop (the dialog element itself) closes it.
				if (event.target === event.currentTarget) {
					event.currentTarget.close();
				}
			}}
		>
			<div className="relative p-6 sm:p-8">
				<button
					type="button"
					aria-label="Close"
					className="absolute top-4 right-4 inline-flex size-10 items-center justify-center rounded-full text-muted transition-colors hover:bg-surface hover:text-text"
					onClick={() => {
						dialogRef.current?.close();
					}}
				>
					<X aria-hidden className="size-5" />
				</button>
				<p className="label text-accent-text">Mailing list</p>
				<h2 id="mailing-list-title" className="mt-2 pr-10 text-3xl">
					Stay in the loop
				</h2>
				<p className="mt-2 text-muted">
					Meeting updates, events and opportunities in your inbox.
				</p>
				<MailingListForm compact className="mt-6" fallbackUrl={fallbackUrl} />
			</div>
		</dialog>
	);
}
