import type { NavItem } from "@/components/dashboard/DashboardNav";
import type { Metadata } from "next";
import type { ReactNode } from "react";
import DashboardNav from "@/components/dashboard/DashboardNav";
import SignOutForm from "@/components/dashboard/SignOutForm";
import { Notice } from "@/components/dashboard/ui";
import ThemeToggle from "@/components/ThemeToggle";
import { getDb } from "@/db";
import { countNewSubmissions } from "@/lib/inbox";
import { isOpenSignIn } from "@/lib/open-signin";
import { hasRole, requirePageUser } from "@/lib/session";
import { ExternalLink } from "lucide-react";
import Link from "next/link";

export const metadata: Metadata = {
	title: { default: "Dashboard", template: "%s · Dashboard" },
	robots: { index: false, follow: false },
};

const baseItems: NavItem[] = [
	{ href: "/dashboard", label: "Overview", icon: "overview" },
	{ href: "/dashboard/inbox", label: "Inbox", icon: "inbox" },
	{
		href: "/dashboard/opportunities",
		label: "Opportunities",
		icon: "opportunities",
	},
	{
		href: "/dashboard/scholarships",
		label: "Scholarships",
		icon: "scholarships",
	},
	{ href: "/dashboard/newsletter", label: "Newsletter", icon: "newsletter" },
	{ href: "/dashboard/crew", label: "Flight crew", icon: "crew" },
	{
		href: "/dashboard/testimonials",
		label: "Testimonials",
		icon: "testimonials",
	},
	{
		href: "/dashboard/announcement",
		label: "Announcement",
		icon: "announcement",
	},
];
const adminItems: NavItem[] = [
	{ href: "/dashboard/officers", label: "Officers", icon: "officers" },
	{ href: "/dashboard/settings", label: "Settings", icon: "settings" },
];

export default async function DashboardLayout({
	children,
}: {
	readonly children: ReactNode;
}) {
	// First gate for the whole dashboard; every page and action checks again.
	const user = await requirePageUser();
	const db = getDb();
	const newMessages = db ? await countNewSubmissions(db) : 0;
	const shared = baseItems.map((item) =>
		item.icon === "inbox" ? { ...item, badge: newMessages } : item
	);
	const items = hasRole(user, "admin") ? [...shared, ...adminItems] : shared;

	return (
		<div className="dash-shell min-h-dvh md:grid md:grid-cols-[15rem_1fr]">
			<aside className="border-b border-hairline bg-surface px-4 py-3 md:sticky md:top-0 md:h-dvh md:border-r md:border-b-0 md:py-6">
				<div className="flex items-center justify-between gap-3 md:block">
					<Link
						href="/dashboard"
						className="text-lg font-semibold tracking-wide"
					>
						STUYAVIATORS
						<span className="label ml-2 text-muted">Dashboard</span>
					</Link>
					<div className="flex items-center gap-1 md:mt-4">
						<ThemeToggle />
						<Link
							href="/"
							className="inline-flex min-h-11 items-center gap-1.5 rounded-full px-3 text-sm font-semibold text-muted hover:text-text"
						>
							View site <ExternalLink aria-hidden className="size-3.5" />
						</Link>
					</div>
				</div>
				<div className="mt-3 md:mt-6">
					<DashboardNav items={items} />
				</div>
				<div className="mt-4 hidden border-t border-hairline pt-4 md:absolute md:inset-x-4 md:bottom-6 md:block md:border-t-0 md:pt-0">
					<p className="truncate text-sm font-semibold">
						{user.name ?? user.email}
					</p>
					<p className="label truncate text-muted">{user.role}</p>
					<SignOutForm className="mt-2" />
				</div>
			</aside>

			<div className="min-w-0">
				{isOpenSignIn() ? (
					<div className="border-b border-danger/60 bg-danger/10 px-4 py-2 text-center text-sm">
						<strong>Open sign-in is on.</strong> Any Google account can use this
						dashboard as an admin. This only works on your computer (
						<code>DASHBOARD_OPEN_SIGNIN</code> in <code>.env.local</code>) and
						is ignored on Vercel.
					</div>
				) : null}
				<main
					id="main"
					className="mx-auto w-full max-w-5xl px-4 py-6 sm:px-6 sm:py-10"
				>
					{children}
					<div className="mt-10 md:hidden">
						<p className="text-sm text-muted">Signed in as {user.email}</p>
						<SignOutForm className="mt-2" />
					</div>
				</main>
			</div>
		</div>
	);
}
