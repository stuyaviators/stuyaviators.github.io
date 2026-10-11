"use client";

import { cn } from "@/lib/cn";
import {
	FileText,
	Gauge,
	GraduationCap,
	Newspaper,
	Plane,
	Settings,
	Users,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const icons = {
	overview: Gauge,
	opportunities: Plane,
	scholarships: GraduationCap,
	newsletter: Newspaper,
	officers: Users,
	settings: Settings,
} as const;

export type NavItem = {
	href: string;
	label: string;
	icon: keyof typeof icons;
};

/**
Sidebar on desktop; a horizontally scrolling row of pills on phones.
*/
export default function DashboardNav({
	items,
}: {
	readonly items: readonly NavItem[];
}) {
	const pathname = usePathname();
	return (
		<nav aria-label="Dashboard">
			<ul className="dash-stagger -mx-4 flex gap-1 overflow-x-auto px-4 pb-1 md:mx-0 md:flex-col md:overflow-visible md:px-0 md:pb-0">
				{items.map((item) => {
					const Icon = icons[item.icon] ?? FileText;
					const isCurrent =
						item.href === "/dashboard"
							? pathname === "/dashboard"
							: pathname === item.href || pathname.startsWith(`${item.href}/`);
					return (
						<li key={item.href} className="shrink-0">
							<Link
								href={item.href}
								aria-current={isCurrent ? "page" : undefined}
								className={cn(
									"flex min-h-11 items-center gap-2 rounded-full px-4 text-sm font-semibold transition-colors md:rounded-xl",
									isCurrent
										? "bg-brand text-brand-ink"
										: "text-muted hover:bg-surface-2 hover:text-text"
								)}
							>
								<Icon aria-hidden className="size-4" />
								{item.label}
							</Link>
						</li>
					);
				})}
			</ul>
		</nav>
	);
}
