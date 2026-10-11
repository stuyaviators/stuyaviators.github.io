"use client";

import type { RoleName } from "@/lib/permissions";
import { addedByLabel, canDelete } from "@/lib/permissions";
import { createContext, useContext, useMemo } from "react";

/*
 * Who is signed in and the names of the people who added things, so lists can
 * say "Added by …" and turn off the delete button on other people's work for
 * roles that may only delete their own. The server checks the same rule again
 * before deleting; this just keeps the screen honest.
 */

type Viewer = { email: string; role: RoleName };

type Value = {
	canDeleteItem: (addedBy: string | undefined) => boolean;
	addedBy: (email: string | undefined) => string | undefined;
};

const ViewerContext = createContext<Value>({
	canDeleteItem: () => false,
	addedBy: () => undefined,
});

export function ViewerProvider({
	viewer,
	names,
	children,
}: {
	readonly viewer: Viewer;
	readonly names: Record<string, string>;
	readonly children: React.ReactNode;
}) {
	const value = useMemo<Value>(
		() => ({
			canDeleteItem: (addedBy) => canDelete(viewer, addedBy),
			addedBy: (email) => addedByLabel(email, names),
		}),
		[viewer, names]
	);
	return (
		<ViewerContext.Provider value={value}>{children}</ViewerContext.Provider>
	);
}

export function useViewer() {
	return useContext(ViewerContext);
}

export const blockedDeleteHint =
	"Only the person who added this, or an officer, can delete it.";

/**
The small "Added by …" tag on a list row; nothing when nobody is recorded.
*/
export function AddedBy({ email }: { readonly email: string | undefined }) {
	const { addedBy } = useViewer();
	const text = addedBy(email);
	return text === undefined ? null : (
		<span className="inline-flex items-center rounded-full border border-hairline px-2 py-0.5 text-xs text-muted">
			{text}
		</span>
	);
}
