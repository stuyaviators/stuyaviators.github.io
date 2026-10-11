import type { Metadata } from "next";
import OfficersManager from "@/components/dashboard/OfficersManager";
import { Notice, PageHeader } from "@/components/dashboard/ui";
import { getDb } from "@/db";
import { requirePageUser } from "@/lib/session";
import { listUsers } from "@/lib/users";

export const metadata: Metadata = { title: "Officers" };

export default async function OfficersPage() {
	const user = await requirePageUser("admin");
	const db = getDb();
	const users = db ? await listUsers(db) : [];

	return (
		<>
			<PageHeader
				title="Officers"
				description="Who can sign in to this dashboard. Officers edit content; admins also manage this list and the settings. There is always at least one admin."
			/>
			{db ? (
				<OfficersManager users={users} currentId={user.id} />
			) : (
				<Notice tone="bad">
					The database isn’t connected (<code>DATABASE_URL</code>).
				</Notice>
			)}
		</>
	);
}
