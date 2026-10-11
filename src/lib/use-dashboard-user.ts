"use client";

import { useEffect, useState } from "react";

/*
 * Is this visitor signed in to the dashboard? Asked once per page load, and
 * only on the client, so public pages stay static and fast for everyone.
 */
let request: Promise<boolean> | undefined;

async function isSignedInToDashboard(): Promise<boolean> {
	try {
		const response = await fetch("/api/dashboard/me", { cache: "no-store" });
		const data = (await response.json()) as { isSignedIn?: boolean };
		return data.isSignedIn === true;
	} catch {
		return false;
	}
}

export function useIsSignedIn(): boolean {
	const [isSignedIn, setIsSignedIn] = useState(false);
	useEffect(() => {
		request ??= isSignedInToDashboard();
		let isCurrent = true;
		void request.then((value) => {
			if (isCurrent) {
				setIsSignedIn(value);
			}
		});
		return () => {
			isCurrent = false;
		};
	}, []);
	return isSignedIn;
}
