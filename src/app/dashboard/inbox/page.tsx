import type { InboxFilter } from "@/lib/inbox";
import type { Metadata } from "next";
import InboxList from "@/components/dashboard/InboxList";
import { Notice, PageHeader } from "@/components/dashboard/ui";
import { getDb } from "@/db";
import { cn } from "@/lib/cn";
import {
	listSubmissions,
	submissionStatuses,
	submissionTypes,
	typeLabels,
} from "@/lib/inbox";
import { requirePageUser } from "@/lib/session";
import Link from "next/link";

export const metadata: Metadata = { title: "Inbox" };

type Parameters_ = { type?: string; status?: string };

const statusTabs = [
	{ value: "open", label: "Open" },
	{ value: "archived", label: "Archived" },
] as const;

function parseFilter({ type, status }: Parameters_): InboxFilter & {
	status: NonNullable<InboxFilter["status"]>;
} {
	return {
		type: submissionTypes.find((value) => value === type),
		status: submissionStatuses.find((value) => value === status) ?? "open",
	};
}

function href(filter: { type?: string; status?: string }) {
	const query = new URLSearchParams();
	if (filter.type) {
		query.set("type", filter.type);
	}

	if (filter.status && filter.status !== "open") {
		query.set("status", filter.status);
	}

	const text = query.toString();
	return text ? `/dashboard/inbox?${text}` : "/dashboard/inbox";
}

export default async function InboxPage({
	searchParams,
}: {
	readonly searchParams: Promise<Parameters_>;
}) {
	await requirePageUser("inbox");
	const filter = parseFilter(await searchParams);
	const db = getDb();
	const items = db ? await listSubmissions(db, filter) : [];

	return (
		<>
			<PageHeader
				title="Inbox"
				description="Everything visitors send through the site: contact messages, stories, photos, meeting ideas and mailing-list sign-ups."
			/>
			{db ? (
				<>
					<div className="mb-4 flex flex-wrap items-center gap-x-6 gap-y-3">
						<nav aria-label="Status" className="flex gap-1">
							{statusTabs.map((tab) => (
								<FilterLink
									key={tab.value}
									to={href({ type: filter.type, status: tab.value })}
									active={filter.status === tab.value}
								>
									{tab.label}
								</FilterLink>
							))}
						</nav>
						<nav aria-label="Type" className="flex flex-wrap gap-1">
							<FilterLink
								to={href({ status: filter.status })}
								active={filter.type === undefined}
							>
								All types
							</FilterLink>
							{submissionTypes.map((type) => (
								<FilterLink
									key={type}
									to={href({ type, status: filter.status })}
									active={filter.type === type}
								>
									{typeLabels[type]}
								</FilterLink>
							))}
						</nav>
					</div>
					<InboxList items={items} />
				</>
			) : (
				<Notice tone="bad">
					The database isn’t connected (<code>DATABASE_URL</code>).
				</Notice>
			)}
		</>
	);
}

function FilterLink({
	to,
	active,
	children,
}: {
	readonly to: string;
	readonly active: boolean;
	readonly children: string;
}) {
	return (
		<Link
			href={to}
			aria-current={active ? "true" : undefined}
			className={cn(
				"inline-flex min-h-11 items-center rounded-full px-4 text-sm font-semibold transition-colors",
				active
					? "bg-surface-2 text-text"
					: "text-muted hover:bg-surface-2 hover:text-text"
			)}
		>
			{children}
		</Link>
	);
}
