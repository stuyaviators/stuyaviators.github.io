import type { NavItem } from "@/components/dashboard/DashboardNav";
import type { Metadata } from "next";
import type { ReactNode } from "react";
import logo from "@/assets/brand/logo.png";
import bannerPhoto from "@/assets/photos/hero-cessna-sunset.jpg";
import DashboardNav from "@/components/dashboard/DashboardNav";
import SignOutForm from "@/components/dashboard/SignOutForm";
import TabBadge from "@/components/dashboard/TabBadge";
import { ToastProvider } from "@/components/dashboard/Toast";
import { Notice } from "@/components/dashboard/ui";
import ThemeToggle from "@/components/ThemeToggle";
import { getDb } from "@/db";
import { countNewSubmissions } from "@/lib/inbox";
import { isOpenSignIn } from "@/lib/open-signin";
import { hasRole, requirePageUser } from "@/lib/session";
import { ArrowLeft } from "lucide-react";
import Image from "next/image";
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
	{ href: "/dashboard/crew", label: "Flight Crew", icon: "crew" },
	{ href: "/dashboard/gallery", label: "Gallery", icon: "gallery" },
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
		<ToastProvider>
			<TabBadge initial={newMessages} />
			<div className="dash-shell relative min-h-dvh md:grid md:grid-cols-[16rem_1fr]">
				<aside className="relative z-10 flex flex-col border-b border-hairline bg-surface/90 px-4 py-3 backdrop-blur-md md:sticky md:top-0 md:h-dvh md:overflow-y-auto md:border-r md:border-b-0 md:py-5">
					<div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1 md:block">
						<Link
							href="/dashboard"
							className="group relative isolate flex min-w-0 items-center gap-3 overflow-hidden rounded-2xl md:min-h-32 md:items-end md:p-4"
						>
							<Image
								src={bannerPhoto}
								alt=""
								fill
								sizes="256px"
								className="-z-20 hidden object-cover transition-transform duration-700 group-hover:scale-105 motion-reduce:transition-none md:block"
							/>
							<span
								aria-hidden
								className="absolute inset-0 -z-10 hidden bg-linear-to-t from-black/85 via-black/45 to-black/10 md:block"
							/>
							<Image
								src={logo}
								alt=""
								width={36}
								height={36}
								className="size-9 shrink-0 rounded-lg"
							/>
							<span className="min-w-0 md:text-white">
								<span className="block truncate text-base font-semibold tracking-wide">
									STUYAVIATORS
								</span>
								<span className="label block truncate text-muted md:text-white/80">
									Crew Dashboard
								</span>
							</span>
						</Link>
						<div className="flex items-center gap-1 md:mt-3">
							<ThemeToggle />
							<Link
								href="/"
								className="inline-flex min-h-11 items-center gap-1.5 rounded-full px-3 text-sm font-semibold text-muted hover:text-text"
							>
								<ArrowLeft aria-hidden className="size-3.5" /> Back to site
							</Link>
						</div>
					</div>
					<div className="mt-3 md:mt-4 md:flex-1">
						<DashboardNav items={items} />
					</div>
					<div className="mt-4 hidden border-t border-hairline pt-4 md:block">
						<p className="truncate text-sm font-semibold">
							{user.name ?? user.email}
						</p>
						<p className="label truncate text-muted">{user.role}</p>
						<SignOutForm className="mt-2" />
					</div>
				</aside>

				<div className="relative z-10 min-w-0">
					{isOpenSignIn() ? (
						<div className="border-b border-danger/60 bg-danger/10 px-4 py-2 text-center text-sm">
							<strong>Local mode.</strong> Google sign-in is skipped and you are
							an admin. This only works on your computer (
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
		</ToastProvider>
	);
}
