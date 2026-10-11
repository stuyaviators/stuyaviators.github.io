import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { PGlite } from "@electric-sql/pglite";
import { describe, expect, it } from "vitest";

/*
 * The slug migration gives cards that already exist an address. This runs
 * the earlier migrations, adds cards, then applies it.
 */

async function run(client: PGlite, file: string) {
	const sql = readFileSync(path.resolve("drizzle", file), "utf8");
	for (const statement of sql.split("--> statement-breakpoint")) {
		if (statement.trim()) {
			// eslint-disable-next-line no-await-in-loop
			await client.exec(statement);
		}
	}
}

describe("0005_listing_slugs", () => {
	it("backfills unique slugs from titles", async () => {
		const client = new PGlite();
		const files = readdirSync(path.resolve("drizzle"))
			.filter((file) => file.endsWith(".sql"))
			.toSorted();
		const slugFile = "0005_listing_slugs.sql";
		const earlier = files.filter((name) => name < slugFile);
		for (const file of earlier) {
			// eslint-disable-next-line no-await-in-loop
			await run(client, file);
		}

		const insert = async (kind: string, title: string, created: string) =>
			client.query(
				`insert into listings (kind, title, organization, summary, url, created_at)
				 values ($1, $2, 'Org', 'Summary', 'https://example.org', $3)`,
				[kind, title, created]
			);
		await insert("opportunity", "NASA Summer Camp!", "2026-01-01");
		await insert("opportunity", "NASA Summer Camp", "2026-01-02");
		await insert("scholarship", "NASA Summer Camp", "2026-01-03");
		await insert("scholarship", "★★★", "2026-01-04");
		await run(client, slugFile);

		const result = await client.query<{ kind: string; slug: string }>(
			"select kind, slug from listings order by created_at"
		);
		const slugs = result.rows.map((row) => row.slug);
		expect(slugs[0]).toBe("nasa-summer-camp");
		expect(slugs[1]).toMatch(/^nasa-summer-camp-[\da-f]{4}$/u);
		expect(slugs[2]).toBe("nasa-summer-camp");
		expect(slugs[3]).toBe("listing");
		await client.close();
	});
});
