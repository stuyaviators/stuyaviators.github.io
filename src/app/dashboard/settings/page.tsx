import type { Metadata } from "next";
import EpsilonSettings from "@/components/dashboard/EpsilonSettings";
import { Notice, PageHeader } from "@/components/dashboard/ui";
import { getDb } from "@/db";
import { getEpsilonStatus } from "@/lib/epsilon-token";
import { requirePageUser } from "@/lib/session";

export const metadata: Metadata = { title: "Settings" };

export default async function SettingsPage() {
	await requirePageUser("settings");
	const db = getDb();
	const status = db
		? await getEpsilonStatus(db).catch(() => undefined)
		: undefined;

	return (
		<>
			<PageHeader
				title="Settings"
				description="Connections the site relies on. Admins only."
			/>
			{status ? (
				<EpsilonSettings status={status} />
			) : (
				<Notice tone="bad">
					The database isn’t connected, so settings can’t be read or saved.
				</Notice>
			)}
		</>
	);
}
