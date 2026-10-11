import type { Metadata } from "next";
import TrashList from "@/components/dashboard/TrashList";
import { Notice, PageHeader } from "@/components/dashboard/ui";
import { getDb } from "@/db";
import { requirePageUser } from "@/lib/session";
import { listTrash, trashDays } from "@/lib/trash";

export const metadata: Metadata = { title: "Trash" };

export default async function TrashPage() {
	await requirePageUser("trash");
	const db = getDb();
	const items = db ? await listTrash(db) : [];

	return (
		<>
			<PageHeader
				title="Trash"
				description={`Everything anyone deletes waits here for ${trashDays} days, then it is removed for good. Only people with the Trash permission can see this screen: everyone else just sees things disappear.`}
			/>
			{db ? (
				<TrashList items={items} />
			) : (
				<Notice tone="bad">
					The database isn’t connected (<code>DATABASE_URL</code>).
				</Notice>
			)}
		</>
	);
}
