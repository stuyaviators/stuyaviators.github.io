import { listings } from "@/db/schema";
import { asc, desc } from "drizzle-orm";

/**
Cards sort themselves: the soonest deadline first, cards without a deadline
(rolling ones) after the dated ones, and the newest first among those.
(Postgres puts empty deadlines last when sorting upward.)
*/
export const deadlineOrder = [
	asc(listings.deadline),
	desc(listings.createdAt),
] as const;
