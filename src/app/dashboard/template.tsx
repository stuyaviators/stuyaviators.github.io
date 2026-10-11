import type { ReactNode } from "react";

/**
Re-mounts on every dashboard navigation, so each page's content rises in
one piece after another.
*/
export default function DashboardTemplate({
	children,
}: {
	readonly children: ReactNode;
}) {
	return <div className="dash-stagger">{children}</div>;
}
