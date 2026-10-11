import type { Metadata } from "next";
import MeetingsManager from "@/components/dashboard/MeetingsManager";
import { Notice, PageHeader } from "@/components/dashboard/ui";
import { getDb } from "@/db";
import { listClubMeetings, toFormValues } from "@/lib/club-meetings";
import { requirePageUser } from "@/lib/session";

export const metadata: Metadata = { title: "Meetings" };

const timeFormat = new Intl.DateTimeFormat("en-US", {
	timeZone: "America/New_York",
	hour: "numeric",
	minute: "2-digit",
});
const dayFormat = new Intl.DateTimeFormat("en-US", {
	timeZone: "America/New_York",
	weekday: "short",
	month: "short",
	day: "numeric",
	year: "numeric",
});

export default async function MeetingsDashboardPage() {
	await requirePageUser("meetings");
	const db = getDb();
	const rows = db ? await listClubMeetings(db) : [];
	const now = new Date();
	const items = rows.map((row) => ({
		id: row.id,
		draft: toFormValues(row),
		when: `${dayFormat.format(row.startsAt)}, ${timeFormat.format(row.startsAt)}${
			row.endsAt ? ` – ${timeFormat.format(row.endsAt)}` : ""
		}`,
		createdBy: row.createdBy ?? undefined,
		isPast: (row.endsAt ?? row.startsAt) < now,
	}));

	return (
		<>
			<PageHeader
				title="Meetings"
				description="Add or change meetings on the departure board. Each one gets its own page."
			/>
			{db ? (
				<MeetingsManager
					upcoming={items.filter((item) => !item.isPast)}
					past={items.filter((item) => item.isPast).toReversed()}
				/>
			) : (
				<Notice tone="bad">
					The database isn’t connected (<code>DATABASE_URL</code>).
				</Notice>
			)}
		</>
	);
}
