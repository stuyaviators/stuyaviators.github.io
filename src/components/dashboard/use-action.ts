"use client";

import type { ActionError } from "@/lib/action-guard";
import { useToast } from "@/components/dashboard/Toast";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

/*
 * Runs a Server Action from a button. Shows the action's error message, and
 * refreshes the page's server data after a success (dashboard pages are
 * dynamic, so a refresh re-reads the database).
 */
export function useAction() {
	const router = useRouter();
	const { toast } = useToast();
	const [isPending, startTransition] = useTransition();
	const [error, setError] = useState<string>();
	// The row that is animating away while its action runs.
	const [leavingId, setLeavingId] = useState<string>();

	/**
	`success` is the message shown in the corner when the action works.
	*/
	function run<T extends { ok: boolean }>(
		action: () => Promise<T | ActionError>,
		onDone?: (result: T) => void,
		success?: string
	) {
		setError(undefined);
		startTransition(async () => {
			let result: T | ActionError;
			try {
				result = await action();
			} catch {
				setError("Couldn’t reach the server. Check your connection.");
				toast("Couldn’t reach the server. Check your connection.", "bad");
				setLeavingId(undefined);
				return;
			}

			if (!result.ok) {
				setError((result as ActionError).error);
				toast((result as ActionError).error, "bad");
				setLeavingId(undefined);
				return;
			}

			if (success !== undefined) {
				toast(success);
			}

			onDone?.(result);
			router.refresh();
		});
	}

	return {
		run,
		isPending,
		error,
		leavingId,
		toast,
		markLeaving: setLeavingId,
		clearError() {
			setError(undefined);
		},
	};
}
