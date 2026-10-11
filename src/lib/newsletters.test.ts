import type { Database } from "@/db";
import { defaultNewsletter } from "@/lib/newsletter/defaults";
import { didDeleteFromTrash, didMoveToTrash, didRestoreFromTrash } from "@/lib/trash";
import { createTestDb } from "@/test/pglite";
import { beforeEach, describe, expect, it } from "vitest";
import {
	availableSlug,
	createNewsletter,
	createPreset,
	getNewsletter,
	getPublishedNewsletter,
	listNewsletters,
	listPresets,
	listPublishedNewsletters,
	publishNewsletter,
	saveNewsletter,
	slugSchema,
	unpublishNewsletter,
} from "./newsletters.ts";

let db: Database;
beforeEach(async () => {
	db = await createTestDb();
});

function draft(headline = "Hello") {
	return {
		title: "October newsletter",
		data: { ...defaultNewsletter(), introHeading: headline },
	};
}

describe("saving drafts", () => {
	it("saves when the editor has the latest version", async () => {
		const created = await createNewsletter(db, draft(), "a@gmail.com");
		const saved = await saveNewsletter(
			db,
			created.id,
			draft("Edited"),
			created.updatedAt.toISOString(),
			"b@gmail.com"
		);
		expect(saved).toMatchObject({ ok: true });
		const current = await getNewsletter(db, created.id);
		expect(current?.data.introHeading).toBe("Edited");
		expect(current?.updatedBy).toBe("b@gmail.com");
	});

	it("refuses to overwrite a newer save by someone else", async () => {
		const created = await createNewsletter(db, draft(), "a@gmail.com");
		const startedFrom = created.updatedAt.toISOString();
		await saveNewsletter(
			db,
			created.id,
			draft("Officer A's text"),
			startedFrom,
			"a@gmail.com"
		);

		const stale = await saveNewsletter(
			db,
			created.id,
			draft("Officer B's text"),
			startedFrom,
			"b@gmail.com"
		);
		expect(stale).toEqual({
			ok: false,
			conflict: true,
			updatedBy: "a@gmail.com",
		});
		expect((await getNewsletter(db, created.id))?.data.introHeading).toBe(
			"Officer A's text"
		);
	});

	it("chains saves from the same editor", async () => {
		const created = await createNewsletter(db, draft(), "a@gmail.com");
		const one = await saveNewsletter(
			db,
			created.id,
			draft("1"),
			created.updatedAt.toISOString(),
			"a"
		);
		expect(one.ok).toBe(true);
		if (!one.ok) {
			return;
		}

		const two = await saveNewsletter(
			db,
			created.id,
			draft("2"),
			one.updatedAt,
			"a"
		);
		expect(two.ok).toBe(true);
	});

	it("overwrites on purpose when no version is expected", async () => {
		const created = await createNewsletter(db, draft(), "a");
		await saveNewsletter(
			db,
			created.id,
			draft("theirs"),
			created.updatedAt.toISOString(),
			"a"
		);
		const mine = await saveNewsletter(
			db,
			created.id,
			draft("mine"),
			undefined,
			"b"
		);
		expect(mine.ok).toBe(true);
		expect((await getNewsletter(db, created.id))?.data.introHeading).toBe(
			"mine"
		);
	});

	it("says so when the newsletter was deleted meanwhile", async () => {
		const created = await createNewsletter(db, draft(), "a");
		await didMoveToTrash(db, "newsletter", created.id, "b");
		const result = await saveNewsletter(
			db,
			created.id,
			draft("x"),
			created.updatedAt.toISOString(),
			"a"
		);
		expect(result).toMatchObject({ ok: false, conflict: false });
		const missing = await saveNewsletter(
			db,
			crypto.randomUUID(),
			draft("x"),
			undefined,
			"a"
		);
		expect(missing).toMatchObject({ ok: false, conflict: false });
	});
});

describe("web versions", () => {
	it("publishes a snapshot that later edits don't change", async () => {
		const created = await createNewsletter(db, draft("First"), "a");
		expect(await publishNewsletter(db, created.id, "october")).toEqual({
			ok: true,
			slug: "october",
		});
		await saveNewsletter(
			db,
			created.id,
			draft("Second"),
			created.updatedAt.toISOString(),
			"a"
		);

		const live = await getPublishedNewsletter(db, "october");
		expect(live?.published?.introHeading).toBe("First");
		expect(live?.data.introHeading).toBe("Second");

		await publishNewsletter(db, created.id, "october");
		expect(
			(await getPublishedNewsletter(db, "october"))?.published?.introHeading
		).toBe("Second");
	});

	it("doesn't change the draft's version when publishing, so open editors stay in sync", async () => {
		const created = await createNewsletter(db, draft(), "a");
		await publishNewsletter(db, created.id, "october");
		const after = await getNewsletter(db, created.id);
		expect(after?.updatedAt.getTime()).toBe(created.updatedAt.getTime());
	});

	it("takes the page down when unpublished or deleted", async () => {
		const created = await createNewsletter(db, draft(), "a");
		await publishNewsletter(db, created.id, "october");
		await unpublishNewsletter(db, created.id);
		expect(await getPublishedNewsletter(db, "october")).toBeUndefined();

		await publishNewsletter(db, created.id, "october");
		await didMoveToTrash(db, "newsletter", created.id, "a");
		expect(await getPublishedNewsletter(db, "october")).toBeUndefined();
		expect((await getNewsletter(db, created.id))?.status).toBe("draft");
	});

	it("lists published issues newest first, leaving out drafts, unpublished and deleted ones", async () => {
		const first = await createNewsletter(db, draft("First"), "a");
		const second = await createNewsletter(db, draft("Second"), "a");
		const hidden = await createNewsletter(db, draft("Hidden"), "a");
		await createNewsletter(db, draft("Never published"), "a");
		await publishNewsletter(db, first.id, "september");
		await publishNewsletter(db, second.id, "october");
		await publishNewsletter(db, hidden.id, "hidden");
		await unpublishNewsletter(db, hidden.id);

		const issues = await listPublishedNewsletters(db);
		expect(issues.map((issue) => issue.slug)).toEqual(["october", "september"]);

		await didMoveToTrash(db, "newsletter", second.id, "a");
		expect(
			(await listPublishedNewsletters(db)).map((issue) => issue.slug)
		).toEqual(["september"]);
	});

	it("keeps addresses unique and reserves real pages", async () => {
		const one = await createNewsletter(db, draft(), "a");
		const two = await createNewsletter(db, draft(), "a");
		await publishNewsletter(db, one.id, "october");
		expect(await publishNewsletter(db, two.id, "october")).toMatchObject({
			ok: false,
		});
		expect(await publishNewsletter(db, one.id, "october")).toMatchObject({
			ok: true,
		}); // Re-publishing itself
		expect(await publishNewsletter(db, two.id, "unsubscribe")).toMatchObject({
			ok: false,
		});
	});

	it("suggests a free address", async () => {
		const one = await createNewsletter(db, draft(), "a");
		const two = await createNewsletter(db, draft(), "a");
		await publishNewsletter(db, one.id, "october-update");
		expect(await availableSlug(db, "October Update!", two.id)).toBe(
			"october-update-2"
		);
		expect(await availableSlug(db, "October Update!", one.id)).toBe(
			"october-update"
		);
		expect(await availableSlug(db, "Unsubscribe", two.id)).toBe(
			"unsubscribe-2"
		);
		expect(await availableSlug(db, "???", two.id)).toBe("newsletter");
	});

	it("validates addresses", () => {
		expect(slugSchema.safeParse("october-2026").success).toBe(true);
		for (const bad of ["Oct ober", "-x", "x-", "a/b", "../x", "a--b", ""]) {
			expect(slugSchema.safeParse(bad).success).toBe(false);
		}
	});
});

describe("trash and presets", () => {
	it("moves to the trash, restores, and deletes for good only from the trash", async () => {
		const created = await createNewsletter(db, draft(), "a");
		expect(await didDeleteFromTrash(db, "newsletter", created.id)).toBe(false);
		expect(await getNewsletter(db, created.id)).toBeDefined();

		expect(await didMoveToTrash(db, "newsletter", created.id, "a")).toBe(true);
		expect(await listNewsletters(db)).toHaveLength(0);
		expect(await didRestoreFromTrash(db, "newsletter", created.id, "a")).toBe(
			true
		);
		expect(await listNewsletters(db)).toHaveLength(1);

		await didMoveToTrash(db, "newsletter", created.id, "a");
		expect(await didDeleteFromTrash(db, "newsletter", created.id)).toBe(true);
		expect(await getNewsletter(db, created.id)).toBeUndefined();
	});

	it("saves, lists (by name) and deletes presets", async () => {
		await createPreset(
			db,
			{ name: "Monthly update", data: defaultNewsletter() },
			"a"
		);
		await createPreset(
			db,
			{ name: "Deadline digest", data: defaultNewsletter() },
			"a"
		);
		const presets = await listPresets(db);
		expect(presets.map((preset) => preset.name)).toEqual([
			"Deadline digest",
			"Monthly update",
		]);
		await didMoveToTrash(db, "preset", presets[0]!.id, "a");
		expect(await listPresets(db)).toHaveLength(1);
	});
});
