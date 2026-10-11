import type { Metadata } from "next";
import NewsletterList from "@/components/dashboard/NewsletterList";
import { Notice, PageHeader } from "@/components/dashboard/ui";
import { getDb } from "@/db";
import { listNewsletters, listPresets } from "@/lib/newsletters";
import { requirePageUser } from "@/lib/session";

export const metadata: Metadata = { title: "Newsletter" };

export default async function NewsletterDashboardPage() {
	await requirePageUser("newsletters");
	const db = getDb();
	const [newsletters, presets] = db
		? await Promise.all([listNewsletters(db), listPresets(db)])
		: [[], []];

	return (
		<>
			<PageHeader
				title="Newsletter"
				description="Build the email here, then copy it into Gmail and send it from the club account. Nothing is emailed from this site."
			/>
			{db ? null : (
				<Notice tone="bad" className="mb-4">
					The database isn’t connected (<code>DATABASE_URL</code>).
				</Notice>
			)}
			<NewsletterList newsletters={newsletters} presets={presets} />
		</>
	);
}
