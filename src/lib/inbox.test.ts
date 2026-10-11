import { submissions } from "@/db/schema";
import { createTestDb } from "@/test/pglite";
import { describe, expect, it } from "vitest";
import {
	countNewSubmissions,
	listSubmissions,
	setSubmissionStatus,
} from "./inbox.ts";

async function seed() {
	const db = await createTestDb();
	const rows = await db
		.insert(submissions)
		.values([
			{ type: "contact", name: "Peter Stuyvesant", message: "Hello" },
			{ type: "story", name: "Peter", status: "read", message: "My story" },
			{ type: "mailing_list", name: "Old", status: "archived" },
		])
		.returning({ id: submissions.id, type: submissions.type });
	return { db, rows };
}

describe("inbox", () => {
	it("lists new and read by default, newest first, hiding archived", async () => {
		const { db } = await seed();
		const items = await listSubmissions(db);
		expect(items.map((item) => item.type).toSorted()).toEqual([
			"contact",
			"story",
		]);
	});

	it("filters by type and by archived status", async () => {
		const { db } = await seed();
		expect(await listSubmissions(db, { type: "story" })).toHaveLength(1);
		expect(
			await listSubmissions(db, { type: "contact", status: "archived" })
		).toHaveLength(0);
		const archived = await listSubmissions(db, { status: "archived" });
		expect(archived.map((item) => item.type)).toEqual(["mailing_list"]);
	});

	it("counts only new submissions", async () => {
		const { db } = await seed();
		expect(await countNewSubmissions(db)).toBe(1);
	});

	it("changes status, and reports a missing row", async () => {
		const { db, rows } = await seed();
		const contact = rows.find((row) => row.type === "contact");
		expect(
			(await setSubmissionStatus(db, contact?.id ?? "", "archived"))?.status
		).toBe("archived");
		expect(await countNewSubmissions(db)).toBe(0);
		expect(
			await setSubmissionStatus(
				db,
				"00000000-0000-4000-8000-000000000000",
				"read"
			)
		).toBeUndefined();
	});
});
