import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "../src/db/schema.ts";

/*
 * Seeds the database: makes everyone in ADMIN_EMAILS an admin. Safe to run
 * any number of times (existing people are left alone).
 *
 *   pnpm db:seed
 *
 * Reads DATABASE_URL (or the Vercel integration's stuyaviators_DATABASE_URL)
 * and ADMIN_EMAILS from .env.local. The crew, testimonials and highlights are
 * still static content in src/content; moving them into the database is a
 * Phase 4 item.
 */

const url = process.env.DATABASE_URL ?? process.env.stuyaviators_DATABASE_URL;
if (!url) {
	throw new Error("DATABASE_URL is not set (put it in .env.local).");
}

const emails = [
	...new Set(
		(process.env.ADMIN_EMAILS ?? "")
			.split(/[\s,]+/u)
			.map((email) => email.trim().toLowerCase())
			.filter((email) => /^[^\s@]+@[^\s@]+$/u.test(email))
	),
];

if (emails.length === 0) {
	throw new Error(
		"ADMIN_EMAILS is empty. Add the first admin’s email to .env.local."
	);
}

const db = drizzle({ client: neon(url), schema, casing: "snake_case" });
const inserted = await db
	.insert(schema.users)
	.values(
		emails.map((email) => ({
			email,
			role: "admin" as const,
			addedBy: "db:seed",
		}))
	)
	.onConflictDoNothing()
	.returning({ email: schema.users.email });

const added = new Set(inserted.map((row) => row.email));
for (const email of emails) {
	console.log(
		`${added.has(email) ? "added admin" : "already listed"}: ${email}`
	);
}
