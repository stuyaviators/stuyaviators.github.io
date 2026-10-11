import type { Metadata } from "next";
import ListingRows from "@/components/dashboard/ListingRows";
import { Card, Notice, PageHeader } from "@/components/dashboard/ui";
import { buttonClasses } from "@/components/ui/Button";
import { getDb } from "@/db";
import { kindFromSlug } from "@/lib/dashboard-kinds";
import { listForDashboard } from "@/lib/listings-admin";
import { requirePageUser } from "@/lib/session";
import { Plus } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

export async function generateMetadata({
	params,
}: {
	readonly params: Promise<{ kind: string }>;
}): Promise<Metadata> {
	const { kind } = await params;
	const config = kindFromSlug(kind);
	return { title: config?.plural ?? "Dashboard" };
}

export default async function ListingsDashboardPage({
	params,
	searchParams,
}: {
	readonly params: Promise<{ kind: string }>;
	readonly searchParams: Promise<{ view?: string }>;
}) {
	await requirePageUser();
	const { kind } = await params;
	const config = kindFromSlug(kind);
	if (!config) {
		notFound();
	}

	const { view: viewParameter } = await searchParams;
	const view = viewParameter === "trash" ? "trash" : "active";
	const db = getDb();
	const listings = db ? await listForDashboard(db, config.kind, view) : [];
	const base = `/dashboard/${config.slug}`;

	return (
		<>
			<PageHeader
				title={config.plural}
				description={
					view === "trash"
						? "Deleted cards. Restore one to bring it back as a draft."
						: `Add, edit and order the ${config.plural.toLowerCase()} on the public page. Drafts stay hidden until you publish them.`
				}
				actions={
					view === "active" ? (
						<Link href={`${base}/new`} className={buttonClasses("primary")}>
							<Plus aria-hidden className="size-4" /> New {config.singular}
						</Link>
					) : undefined
				}
			/>

			<div className="mb-5 flex gap-2" role="tablist" aria-label="View">
				{(["active", "trash"] as const).map((tab) => (
					<Link
						key={tab}
						href={tab === "active" ? base : `${base}?view=trash`}
						role="tab"
						aria-selected={view === tab}
						className={buttonClasses(view === tab ? "primary" : "secondary")}
					>
						{tab === "active" ? "Cards" : "Trash"}
					</Link>
				))}
			</div>

			{db ? null : (
				<Notice tone="bad" className="mb-4">
					The database isn’t connected (<code>DATABASE_URL</code>).
				</Notice>
			)}

			{listings.length === 0 ? (
				<Card>
					<p className="font-semibold">
						{view === "trash"
							? "The trash is empty."
							: `No ${config.plural.toLowerCase()} yet.`}
					</p>
					{view === "active" ? (
						<p className="mt-1 text-sm text-muted">
							Until you publish one, visitors see the “no{" "}
							{config.plural.toLowerCase()}
							listed” message.
						</p>
					) : null}
				</Card>
			) : (
				<ListingRows listings={listings} slug={config.slug} view={view} />
			)}
		</>
	);
}
