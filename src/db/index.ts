import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import type { PgDatabase, PgQueryResultHKT } from "drizzle-orm/pg-core";
import * as schema from "./schema";

export type Database = PgDatabase<PgQueryResultHKT, typeof schema>;

/** The Vercel ↔ Neon integration prefixes variables with the store name. */
export function databaseUrl(): string | undefined {
	return process.env.DATABASE_URL ?? process.env.stuyaviators_DATABASE_URL;
}

let cached: Database | undefined;

/** Returns undefined when no database is configured (e.g. a fresh clone). */
export function getDb(): Database | undefined {
	if (cached) return cached;
	const url = databaseUrl();
	if (!url) return undefined;
	cached = drizzle({ client: neon(url), schema, casing: "snake_case" });
	return cached;
}

export { schema };
