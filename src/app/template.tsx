import type { ReactNode } from "react";

/**
Re-mounts on every navigation, so each page fades/rises in.
*/
export default function Template({
	children,
}: {
	readonly children: ReactNode;
}) {
	return <div className="page-enter">{children}</div>;
}
