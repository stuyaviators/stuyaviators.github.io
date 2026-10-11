import type { Database } from "@/db";
import type { User } from "./users.ts";
import { galleryPhotos, testimonials, users } from "@/db/schema";
import { createTestDb } from "@/test/pglite";
import { beforeEach, describe, expect, it } from "vitest";
import { canDeleteRow, namesByEmail, ownerOf } from "./ownership.ts";

let db: Database;
beforeEach(async () => {
	db = await createTestDb();
});

const person = (email: string, role: User["role"]): User => ({
	id: crypto.randomUUID(),
	email,
	name: null,
	image: null,
	role,
	addedBy: null,
	createdAt: new Date(),
	lastSignInAt: null,
});

async function addQuote(createdBy: string | undefined) {
	const rows = await db
		.insert(testimonials)
		.values({ quote: "Great club", author: "A member", createdBy })
		.returning({ id: testimonials.id });
	return rows[0]?.id ?? "";
}

describe("who added what", () => {
	it("reads the recorded creator, and knows when a row is gone", async () => {
		const id = await addQuote("media@stuy.edu");
		expect(await ownerOf(db, "testimonial", id)).toEqual({
			found: true,
			owner: "media@stuy.edu",
		});
		expect(await ownerOf(db, "testimonial", crypto.randomUUID())).toEqual({
			found: false,
			owner: undefined,
		});
	});

	it("lets a media account delete its own work but not other people's", async () => {
		const mine = await addQuote("media@stuy.edu");
		const theirs = await addQuote("someone@stuy.edu");
		const unknown = await addQuote(undefined);
		const media = person("media@stuy.edu", "media");
		expect(await canDeleteRow(db, media, "testimonial", mine)).toBe(true);
		expect(await canDeleteRow(db, media, "testimonial", theirs)).toBe(false);
		expect(await canDeleteRow(db, media, "testimonial", unknown)).toBe(false);
	});

	it("lets officers and admins delete anything", async () => {
		const theirs = await addQuote("someone@stuy.edu");
		const unknown = await addQuote(undefined);
		const roles = ["officer", "admin"] as const;
		const results = await Promise.all(
			roles.flatMap((role) =>
				[theirs, unknown].map(async (id) =>
					canDeleteRow(db, person("boss@stuy.edu", role), "testimonial", id)
				)
			)
		);
		expect(results).toEqual([true, true, true, true]);
	});

	it("treats a missing row as deletable so the action can say it's gone", async () => {
		const media = person("media@stuy.edu", "media");
		expect(await canDeleteRow(db, media, "gallery", crypto.randomUUID())).toBe(
			true
		);
	});

	it("works for the gallery too", async () => {
		const rows = await db
			.insert(galleryPhotos)
			.values({ alt: "A plane", createdBy: "media@stuy.edu" })
			.returning({ id: galleryPhotos.id });
		const id = rows[0]?.id ?? "";
		expect(
			await canDeleteRow(db, person("media@stuy.edu", "media"), "gallery", id)
		).toBe(true);
		expect(
			await canDeleteRow(db, person("other@stuy.edu", "media"), "gallery", id)
		).toBe(false);
	});
});

describe("names", () => {
	it("maps emails to display names, falling back to the email", async () => {
		await db.insert(users).values([
			{ email: "a@stuy.edu", name: "Alex", role: "officer" },
			{ email: "b@stuy.edu", role: "media" },
		]);
		expect(await namesByEmail(db)).toEqual({
			"a@stuy.edu": "Alex",
			"b@stuy.edu": "b@stuy.edu",
		});
	});
});
