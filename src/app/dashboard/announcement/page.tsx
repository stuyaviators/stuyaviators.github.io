import type { Metadata } from "next";
import AnnouncementForm from "@/components/dashboard/AnnouncementForm";
import { Notice, PageHeader } from "@/components/dashboard/ui";
import { getDb } from "@/db";
import { readAnnouncement } from "@/lib/announcement";
import { requirePageUser } from "@/lib/session";

export const metadata: Metadata = { title: "Announcement" };

export default async function AnnouncementPage() {
	await requirePageUser();
	const db = getDb();
	const current = db ? await readAnnouncement(db) : undefined;

	return (
		<>
			<PageHeader
				title="Announcement"
				description="A one-line banner under the header of every public page, for things like a deadline or a schedule change. Visitors can dismiss it."
			/>
			{current ? (
				<AnnouncementForm initial={current} />
			) : (
				<Notice tone="bad">
					The database isn’t connected (<code>DATABASE_URL</code>).
				</Notice>
			)}
		</>
	);
}
