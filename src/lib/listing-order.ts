import { listings } from "@/db/schema";
import { desc, sql } from "drizzle-orm";

/**
Cards sort themselves by when they are on: a scholarship's deadline, or an
opportunity's start date (its deadline if it has no start date). The soonest
comes first, cards with no date go after the dated ones, and the newest comes
first among those.
*/
export const deadlineOrder = [
	sql`coalesce(${listings.startDate}, ${listings.deadline}) asc nulls last`,
	desc(listings.createdAt),
] as const;
