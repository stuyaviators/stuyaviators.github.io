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
}: {
	readonly params: Promise<{ kind: string }>;
}) {
	await requirePageUser("listings");
	const { kind } = await params;
	const config = kindFromSlug(kind);
	if (!config) {
		notFound();
	}

	const db = getDb();
	const listings = db ? await listForDashboard(db, config.kind) : [];
	const base = `/dashboard/${config.slug}`;

	return (
		<>
			<PageHeader
				title={config.plural}
				description={`Add and edit the ${config.plural.toLowerCase()} on the public page. They sort themselves by date, soonest first: the deadline for scholarships, the start date for opportunities. Drafts stay hidden until you publish them.`}
				actions={
					<Link href={`${base}/new`} className={buttonClasses("primary")}>
						<Plus aria-hidden className="size-4" /> New {config.singular}
					</Link>
				}
			/>

			{db ? null : (
				<Notice tone="bad" className="mb-4">
					The database isn’t connected (<code>DATABASE_URL</code>).
				</Notice>
			)}

			{listings.length === 0 ? (
				<Card>
					<p className="font-semibold">No {config.plural.toLowerCase()} yet.</p>
					<p className="mt-1 text-sm text-muted">
						Until you publish one, visitors see the “no{" "}
						{config.plural.toLowerCase()}
						listed” message.
					</p>
				</Card>
			) : (
				<ListingRows listings={listings} slug={config.slug} />
			)}
		</>
	);
}
