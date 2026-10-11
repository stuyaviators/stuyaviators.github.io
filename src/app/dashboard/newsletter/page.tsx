import type { Metadata } from "next";
import NewsletterList from "@/components/dashboard/NewsletterList";
import { Notice, PageHeader } from "@/components/dashboard/ui";
import { buttonClasses } from "@/components/ui/Button";
import { getDb } from "@/db";
import { listNewsletters, listPresets } from "@/lib/newsletters";
import { requirePageUser } from "@/lib/session";
import Link from "next/link";

export const metadata: Metadata = { title: "Newsletter" };

export default async function NewsletterDashboardPage({
	searchParams,
}: {
	readonly searchParams: Promise<{ view?: string }>;
}) {
	await requirePageUser();
	const { view: viewParameter } = await searchParams;
	const view = viewParameter === "trash" ? "trash" : "active";
	const db = getDb();
	const [newsletters, presets] = db
		? await Promise.all([listNewsletters(db, view), listPresets(db)])
		: [[], []];

	return (
		<>
			<PageHeader
				title="Newsletter"
				description="Build the email here, then copy it into Gmail and send it from the club account. Nothing is emailed from this site."
			/>
			<div className="mb-5 flex gap-2" role="tablist" aria-label="View">
				{(["active", "trash"] as const).map((tab) => (
					<Link
						key={tab}
						href={
							tab === "active"
								? "/dashboard/newsletter"
								: "/dashboard/newsletter?view=trash"
						}
						role="tab"
						aria-selected={view === tab}
						className={buttonClasses(view === tab ? "primary" : "secondary")}
					>
						{tab === "active" ? "Newsletters" : "Trash"}
					</Link>
				))}
			</div>
			{db ? null : (
				<Notice tone="bad" className="mb-4">
					The database isn’t connected (<code>DATABASE_URL</code>).
				</Notice>
			)}
			<NewsletterList newsletters={newsletters} presets={presets} view={view} />
		</>
	);
}
