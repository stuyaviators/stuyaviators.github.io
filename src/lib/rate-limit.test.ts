import type { Database } from "@/db";
import { createTestDb } from "@/test/pglite";
import { sql } from "drizzle-orm";
import { beforeAll, describe, expect, it } from "vitest";
import { hitRateLimit } from "./rate-limit";

let db: Database;
beforeAll(async () => {
	db = await createTestDb();
});

describe("hitRateLimit (Postgres)", () => {
	it("allows up to the limit, then blocks", async () => {
		const results = [];
		for (let i = 0; i < 4; i++) {
			// eslint-disable-next-line no-await-in-loop
			results.push(await hitRateLimit(db, "ip-a", 3, 60));
		}

		expect(results.map((r) => r.allowed)).toEqual([true, true, true, false]);
		expect(results.at(-1)?.count).toBe(4);
	});

	it("keeps separate counters per key", async () => {
		expect((await hitRateLimit(db, "ip-b", 1, 60)).allowed).toBe(true);
		expect((await hitRateLimit(db, "ip-c", 1, 60)).allowed).toBe(true);
	});

	it("starts a new window once the old one expires", async () => {
		await hitRateLimit(db, "ip-d", 1, 60);
		expect((await hitRateLimit(db, "ip-d", 1, 60)).allowed).toBe(false);
		await db.execute(
			sql`update rate_limits set window_start = now() - interval '2 minutes' where key = 'ip-d'`
		);
		const next = await hitRateLimit(db, "ip-d", 1, 60);
		expect(next).toEqual({ allowed: true, count: 1 });
	});
});
