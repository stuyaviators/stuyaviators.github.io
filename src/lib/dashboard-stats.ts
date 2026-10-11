import type { Database } from "@/db";
import { listings, newsletters, users } from "@/db/schema";
import { isNull, sql } from "drizzle-orm";

export type DashboardStats = {
	opportunities: { published: number; draft: number };
	scholarships: { published: number; draft: number };
	newsletters: { published: number; draft: number };
	officers: number;
};

type Count = { kind: string; status: string; count: number };

function pick(rows: Count[], kind: string, status: string) {
	return (
		rows.find((row) => row.kind === kind && row.status === status)?.count ?? 0
	);
}

export async function getDashboardStats(db: Database): Promise<DashboardStats> {
	const [listingRows, newsletterRows, officerRows] = await Promise.all([
		db
			.select({
				kind: listings.kind,
				status: listings.status,
				count: sql<number>`count(*)::int`,
			})
			.from(listings)
			.where(isNull(listings.deletedAt))
			.groupBy(listings.kind, listings.status),
		db
			.select({
				kind: sql<string>`'newsletter'`,
				status: newsletters.status,
				count: sql<number>`count(*)::int`,
			})
			.from(newsletters)
			.where(isNull(newsletters.deletedAt))
			.groupBy(newsletters.status),
		db.select({ count: sql<number>`count(*)::int` }).from(users),
	]);

	return {
		opportunities: {
			published: pick(listingRows, "opportunity", "published"),
			draft: pick(listingRows, "opportunity", "draft"),
		},
		scholarships: {
			published: pick(listingRows, "scholarship", "published"),
			draft: pick(listingRows, "scholarship", "draft"),
		},
		newsletters: {
			published: pick(newsletterRows, "newsletter", "published"),
			draft: pick(newsletterRows, "newsletter", "draft"),
		},
		officers: officerRows[0]?.count ?? 0,
	};
}
