"use client";

import type { ActionError } from "@/lib/action-guard";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

/*
 * Runs a Server Action from a button. Shows the action's error message, and
 * refreshes the page's server data after a success (dashboard pages are
 * dynamic, so a refresh re-reads the database).
 */
export function useAction() {
	const router = useRouter();
	const [isPending, startTransition] = useTransition();
	const [error, setError] = useState<string>();

	function run<T extends { ok: boolean }>(
		action: () => Promise<T | ActionError>,
		onDone?: (result: T) => void
	) {
		setError(undefined);
		startTransition(async () => {
			let result: T | ActionError;
			try {
				result = await action();
			} catch {
				setError("Couldn’t reach the server. Check your connection.");
				return;
			}

			if (!result.ok) {
				setError((result as ActionError).error);
				return;
			}

			onDone?.(result);
			router.refresh();
		});
	}

	return {
		run,
		isPending,
		error,
		clearError() {
			setError(undefined);
		},
	};
}
