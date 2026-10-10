import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import { PGlite } from "@electric-sql/pglite";
import { drizzle } from "drizzle-orm/pglite";
import type { Database } from "@/db";
import * as schema from "@/db/schema";

/** In-memory Postgres with the real migrations applied (tests only). */
export async function createTestDb(): Promise<Database> {
	const client = new PGlite();
	const dir = path.resolve("drizzle");
	for (const file of readdirSync(dir).filter((f) => f.endsWith(".sql")).sort()) {
		const sql = readFileSync(path.join(dir, file), "utf8");
		for (const statement of sql.split("--> statement-breakpoint")) {
			if (statement.trim()) {
				// eslint-disable-next-line no-await-in-loop
				await client.exec(statement);
			}
		}
	}

	return drizzle({ client, schema, casing: "snake_case" }) as unknown as Database;
}
