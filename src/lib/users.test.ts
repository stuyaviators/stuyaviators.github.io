import type { Database } from "@/db";
import { users } from "@/db/schema";
import { presets } from "@/lib/permissions";
import { createTestDb } from "@/test/pglite";
import { beforeEach, describe, expect, it } from "vitest";
import {
	addUser,
	adminEmailsFromEnv,
	authorizeSignIn,
	findUser,
	listUsers,
	removeUser,
	setPermissions,
} from "./users.ts";

let db: Database;
beforeEach(async () => {
	db = await createTestDb();
});

const first = { email: "pstuyvesant60@stuy.edu", name: "Peter Stuyvesant" };

describe("adminEmailsFromEnv", () => {
	it("splits on commas and whitespace, lowercases, drops junk", () => {
		expect(
			adminEmailsFromEnv("A@x.com, b@y.org\n not-an-email ,C@Z.io")
		).toEqual(["a@x.com", "b@y.org", "c@z.io"]);
		expect(adminEmailsFromEnv(undefined)).toEqual([]);
	});
});

describe("authorizeSignIn", () => {
	it("turns away anyone who isn't on the list", async () => {
		expect(await authorizeSignIn(db, first, [])).toBeUndefined();
		expect(await listUsers(db)).toHaveLength(0);
	});

	it("makes ADMIN_EMAILS the first admin, case-insensitively", async () => {
		const user = await authorizeSignIn(
			db,
			{ ...first, email: "PStuyvesant60@Stuy.edu" },
			[first.email]
		);
		expect(user).toMatchObject({
			email: first.email,
			permissions: presets.admin,
		});
		expect(user?.lastSignInAt).toBeInstanceOf(Date);
	});

	it("only bootstraps while there are no admins at all", async () => {
		await authorizeSignIn(db, first, [first.email, "other@gmail.com"]);
		expect(
			await authorizeSignIn(db, { email: "other@gmail.com" }, [
				first.email,
				"other@gmail.com",
			])
		).toBeUndefined();
	});

	it("doesn't resurrect a removed admin from ADMIN_EMAILS", async () => {
		await authorizeSignIn(db, first, [first.email]);
		await addUser(
			db,
			{ email: "second@gmail.com", permissions: presets.admin },
			"test"
		);
		const removed = await findUser(db, first.email);
		await removeUser(db, removed!.id);
		expect(await authorizeSignIn(db, first, [first.email])).toBeUndefined();
	});

	it("lets an added officer in and records the visit", async () => {
		await addUser(
			db,
			{ email: "Officer@Gmail.com", permissions: presets.officer },
			"admin"
		);
		const user = await authorizeSignIn(db, {
			email: "officer@gmail.com",
			name: "Amelia Earhart",
			image: "https://example.com/a.png",
		});
		expect(user).toMatchObject({
			email: "officer@gmail.com",
			role: "officer",
			name: "Amelia Earhart",
		});
	});
});

describe("roles and the last-admin guard", () => {
	async function twoPeople() {
		await addUser(
			db,
			{ email: "boss@gmail.com", permissions: presets.admin },
			"test"
		);
		await addUser(
			db,
			{ email: "helper@gmail.com", permissions: presets.officer },
			"test"
		);
		const [boss, helper] = await Promise.all([
			findUser(db, "boss@gmail.com"),
			findUser(db, "helper@gmail.com"),
		]);
		return { boss: boss!, helper: helper! };
	}

	it("refuses duplicate emails", async () => {
		await addUser(
			db,
			{ email: "a@gmail.com", permissions: presets.officer },
			"x"
		);
		const again = await addUser(
			db,
			{ email: "A@GMAIL.com", permissions: presets.admin },
			"x"
		);
		expect(again).toEqual({
			ok: false,
			error: "a@gmail.com is already on the list.",
		});
	});

	it("can't demote the last admin", async () => {
		const { boss } = await twoPeople();
		expect(await setPermissions(db, boss.id, presets.officer)).toEqual({
			ok: false,
			error: "There must always be at least one admin.",
		});
		expect((await findUser(db, boss.email))?.role).toBe("admin");
	});

	it("can't remove the last admin", async () => {
		const { boss } = await twoPeople();
		const result = await removeUser(db, boss.id);
		expect(result.ok).toBe(false);
		expect(await findUser(db, boss.email)).toBeDefined();
	});

	it("allows demoting an admin when another remains", async () => {
		const { boss, helper } = await twoPeople();
		expect(await setPermissions(db, helper.id, presets.admin)).toEqual({
			ok: true,
		});
		expect(await setPermissions(db, boss.id, presets.officer)).toEqual({
			ok: true,
		});
		expect((await findUser(db, boss.email))?.role).toBe("officer");
	});

	it("two admins demoting each other at once leaves one", async () => {
		const { boss, helper } = await twoPeople();
		await setPermissions(db, helper.id, presets.admin);
		await Promise.all([
			setPermissions(db, boss.id, presets.officer),
			setPermissions(db, helper.id, presets.officer),
		]);
		const remaining = (await db.select().from(users)).filter(
			(user) => user.role === "admin"
		);
		expect(remaining.length).toBeGreaterThanOrEqual(1);
	});

	it("removes officers, and removing someone already gone is fine", async () => {
		const { helper } = await twoPeople();
		expect(await removeUser(db, helper.id)).toEqual({ ok: true });
		expect(await findUser(db, helper.email)).toBeUndefined();
		expect(await removeUser(db, helper.id)).toEqual({ ok: true });
	});

	it("reports a role change for someone who's gone", async () => {
		const { helper } = await twoPeople();
		await removeUser(db, helper.id);
		expect(await setPermissions(db, helper.id, presets.admin)).toEqual({
			ok: false,
			error: "That person is no longer on the list.",
		});
	});
});
