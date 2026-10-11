"use client";

import type { ReactNode } from "react";
import { useIsSignedIn } from "@/lib/use-dashboard-user";
import { LayoutDashboard } from "lucide-react";
import Link from "next/link";

/**
The "Join" button for visitors; for officers who are already signed in, it
becomes a shortcut to the dashboard instead.
*/
export default function JoinOrDashboardLink({
	className,
	tabIndex,
	children,
	signedInLabel = "Dashboard",
}: {
	readonly className?: string;
	readonly tabIndex?: number;
	readonly children: ReactNode;
	readonly signedInLabel?: string;
}) {
	const isSignedIn = useIsSignedIn();
	return isSignedIn ? (
		<Link
			href="/dashboard"
			prefetch={false}
			tabIndex={tabIndex}
			className={className}
		>
			<LayoutDashboard aria-hidden className="size-4" />
			{signedInLabel}
		</Link>
	) : (
		<Link href="/join" tabIndex={tabIndex} className={className}>
			{children}
		</Link>
	);
}
