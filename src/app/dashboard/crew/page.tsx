import type { Metadata } from "next";
import CrewManager from "@/components/dashboard/CrewManager";
import { Notice, PageHeader } from "@/components/dashboard/ui";
import { staticCrewPhotos } from "@/content/crew";
import { getDb } from "@/db";
import { listCrewRows } from "@/lib/crew";
import { requirePageUser } from "@/lib/session";

export const metadata: Metadata = { title: "Flight crew" };

export default async function CrewDashboardPage() {
	await requirePageUser();
	const db = getDb();
	const rows = db ? await listCrewRows(db) : [];
	const people = rows.map((row) => ({
		id: row.id,
		groupId: row.groupId,
		name: row.name,
		classOf: row.classOf ?? "",
		role: row.role,
		imageUrl: row.imageUrl ?? "",
		// What the page shows today: the upload, or the bundled photo.
		photoSrc:
			row.imageUrl ??
			(row.photoKey ? staticCrewPhotos[row.photoKey]?.src : undefined),
	}));

	return (
		<>
			<PageHeader
				title="Flight crew"
				description="The people on the Flight Crew page: officers, advisors, helpers and past leadership. Changes show up on the site within a minute or so."
			/>
			{db ? (
				<CrewManager people={people} />
			) : (
				<Notice tone="bad">
					The database isn’t connected (<code>DATABASE_URL</code>).
				</Notice>
			)}
		</>
	);
}
