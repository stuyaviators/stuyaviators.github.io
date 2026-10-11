import type { Metadata } from "next";
import OfficersManager from "@/components/dashboard/OfficersManager";
import { Notice, PageHeader } from "@/components/dashboard/ui";
import { getDb } from "@/db";
import { grantableMask } from "@/lib/permissions";
import { requirePageUser } from "@/lib/session";
import { listUsers } from "@/lib/users";

export const metadata: Metadata = { title: "Officers" };

export default async function OfficersPage() {
	const user = await requirePageUser("officers");
	const db = getDb();
	const users = db ? await listUsers(db) : [];

	return (
		<>
			<PageHeader
				title="Officers"
				description="Who can sign in to this dashboard, and what each person can do."
			/>
			{db ? (
				<OfficersManager
					users={users}
					currentId={user.id}
					grantable={grantableMask(user.permissions)}
				/>
			) : (
				<Notice tone="bad">
					The database isn’t connected (<code>DATABASE_URL</code>).
				</Notice>
			)}
		</>
	);
}
