/* eslint-disable no-await-in-loop -- these tests run their steps one after another, on purpose. */

import type { Database } from "@/db";
import {
	crewMembers,
	galleryPhotos,
	listings,
	testimonials,
	users,
} from "@/db/schema";
import { maskOf, presets } from "@/lib/permissions";
import { createTestDb } from "@/test/pglite";
import { eq } from "drizzle-orm";
import { beforeEach, describe, expect, it, vi } from "vitest";

/*
 * What each role may do, tested against the real Server Actions: only the
 * Auth.js session and the database are faked. A role must not reach areas it
 * doesn't cover, may only delete its own work without "Delete other people's
 * items", and nobody can give boxes they aren't allowed to give.
 */

let testDb: Database | undefined;
vi.mock("@/db", () => ({ getDb: () => testDb }));
vi.mock("@/auth", () => ({ auth: vi.fn() }));
vi.mock("next/cache", () => ({
	revalidatePath: vi.fn(),
	updateTag: vi.fn(),
	unstable_cache: <T>(function_: T) => function_,
}));
vi.mock("next/navigation", () => ({
	redirect(url: string) {
		throw new Error(`redirect:${url}`);
	},
}));
vi.mock("@vercel/blob", () => ({
	put: async (pathname: string) => ({
		url: `https://store.public.blob.vercel-storage.com/${pathname}`,
	}),
}));

const { auth } = await import("@/auth");
const listingActions = await import("./listings.ts");
const announcementActions = await import("./announcement.ts");
const galleryActions = await import("./gallery.ts");
const testimonialActions = await import("./testimonials.ts");
const crewActions = await import("./crew.ts");
const officerActions = await import("./officers.ts");
const settingsActions = await import("./settings.ts");
const trashActions = await import("./trash.ts");
const inboxActions = await import("./inbox.ts");
const unreadRoute = await import("@/app/api/dashboard/unread/route");
const uploadRoute = await import("@/app/api/upload/route");

const authMock = auth as unknown as ReturnType<typeof vi.fn>;

type Role = "admin" | "officer" | "manager" | "contributor";

async function addPerson(email: string, role: Role | "custom", mask?: number) {
	const permissions = mask ?? presets[role as Role];
	const [row] = await testDb!
		.insert(users)
		.values({ email, role, permissions })
		.returning();
	return row!;
}

function signInAs(email: string) {
	authMock.mockResolvedValue({
		user: { email, name: "Peter" },
		expires: "2099-01-01",
	});
}

const denied = {
	ok: false,
	error: "You don’t have permission to do that.",
};

const card = {
	kind: "opportunity",
	title: "Summer flight camp",
	organization: "Peter Stuyvesant Aviation",
	summary: "A week of flying.",
	description: "",
	url: "https://example.org/camp",
	imageUrl: "",
	deadline: "",
	amount: "",
	startDate: "",
	endDate: "",
	location: "",
	eligibility: "",
	tags: "",
	featured: false,
	status: "published",
};

const photo = {
	alt: "A Cessna on final approach",
	imageUrl:
		"https://abc.public.blob.vercel-storage.com/uploads/highlight/a.jpg",
	width: 1600,
	height: 900,
};

const quote = { quote: "Great club", author: "A member" };

const banner = {
	text: "Applications close Friday",
	linkUrl: "",
	linkLabel: "",
	isOn: true,
	endsOn: "",
};

const crewPerson = {
	groupId: "helpers",
	name: "Peter Stuyvesant",
	classOf: "'60",
	role: "Helper",
	imageUrl: "",
};

beforeEach(async () => {
	testDb = await createTestDb();
	authMock.mockReset();
	delete process.env.DASHBOARD_OPEN_SIGNIN;
	delete process.env.BLOB_READ_WRITE_TOKEN;
});

describe("contributor (cards, newsletters, gallery)", () => {
	beforeEach(async () => {
		await addPerson("contrib@stuy.edu", "contributor");
		signInAs("contrib@stuy.edu");
	});

	it("can add cards and photos, but not reach anything else", async () => {
		expect((await listingActions.saveListing(undefined, card)).ok).toBe(true);
		expect((await galleryActions.addGalleryPhotoAction(photo)).ok).toBe(true);
		expect(await testimonialActions.addTestimonialAction(quote)).toEqual(
			denied
		);
		expect(await crewActions.addCrewMemberAction(crewPerson)).toEqual(denied);
		expect(await announcementActions.saveAnnouncementAction(banner)).toEqual(
			denied
		);
		expect(
			await officerActions.addOfficer("x@stuy.edu", presets.contributor)
		).toEqual(denied);
		expect(await settingsActions.testEpsilonAction()).toEqual(denied);
		expect(
			await inboxActions.markSubmission(crypto.randomUUID(), "read")
		).toEqual(denied);
	});

	it("can delete its own card but not one added by someone else", async () => {
		await listingActions.saveListing(undefined, card);
		const [mine] = await testDb!.select().from(listings);
		expect(await listingActions.trashListing(mine!.id)).toEqual({ ok: true });

		const [theirs] = await testDb!
			.insert(listings)
			.values({
				kind: "opportunity",
				slug: "theirs",
				title: "Theirs",
				organization: "Someone",
				summary: "Not mine",
				url: "https://example.org/theirs",
				createdBy: "officer@stuy.edu",
			})
			.returning();
		const refused = await listingActions.trashListing(theirs!.id);
		expect(refused.ok).toBe(false);
		expect((refused as { error: string }).error).toMatch(/you added/u);
		const [still] = await testDb!
			.select()
			.from(listings)
			.where(eq(listings.id, theirs!.id));
		expect(still?.deletedAt).toBeNull();
	});

	it("records who added a photo and deletes only its own", async () => {
		await galleryActions.addGalleryPhotoAction(photo);
		const [mine] = await testDb!.select().from(galleryPhotos);
		expect(mine?.createdBy).toBe("contrib@stuy.edu");
		const [theirs] = await testDb!
			.insert(galleryPhotos)
			.values({ ...photo, createdBy: "officer@stuy.edu" })
			.returning();
		expect((await galleryActions.deleteGalleryPhotoAction(theirs!.id)).ok).toBe(
			false
		);
		expect((await galleryActions.deleteGalleryPhotoAction(mine!.id)).ok).toBe(
			true
		);
		// Deleting only hides it; the other person's photo is untouched.
		const rows = await testDb!.select().from(galleryPhotos);
		expect(rows.filter((row) => row.deletedAt === null)).toHaveLength(1);
		expect(rows.find((row) => row.id === mine!.id)?.deletedAt).not.toBeNull();
	});

	it("can't delete photos with no recorded creator", async () => {
		const [legacy] = await testDb!
			.insert(galleryPhotos)
			.values({ ...photo })
			.returning();
		expect((await galleryActions.deleteGalleryPhotoAction(legacy!.id)).ok).toBe(
			false
		);
	});
});

describe("officer (contributor plus testimonials, banner and inbox, no Flight Crew)", () => {
	beforeEach(async () => {
		await addPerson("officer@stuy.edu", "officer");
		signInAs("officer@stuy.edu");
	});

	it("reaches testimonials, the banner and inbox, but not the Flight Crew", async () => {
		expect((await testimonialActions.addTestimonialAction(quote)).ok).toBe(
			true
		);
		expect((await announcementActions.saveAnnouncementAction(banner)).ok).toBe(
			true
		);
		expect(await crewActions.addCrewMemberAction(crewPerson)).toEqual(denied);
		expect(await crewActions.importCrewAction()).toEqual(denied);
	});

	it("can delete things other people added", async () => {
		const [theirs] = await testDb!
			.insert(galleryPhotos)
			.values({ ...photo, createdBy: "contrib@stuy.edu" })
			.returning();
		expect((await galleryActions.deleteGalleryPhotoAction(theirs!.id)).ok).toBe(
			true
		);
	});

	it("can't manage people or settings", async () => {
		expect(
			await officerActions.addOfficer("x@stuy.edu", presets.contributor)
		).toEqual(denied);
		expect(await settingsActions.testEpsilonAction()).toEqual(denied);
	});
});

describe("manager (contributor plus banner and inbox, no testimonials, no Flight Crew, no people)", () => {
	beforeEach(async () => {
		await addPerson("manager@stuy.edu", "manager");
		signInAs("manager@stuy.edu");
	});

	it("reaches everything a contributor does, plus the banner and inbox", async () => {
		expect((await listingActions.saveListing(undefined, card)).ok).toBe(true);
		expect((await galleryActions.addGalleryPhotoAction(photo)).ok).toBe(true);
		expect((await announcementActions.saveAnnouncementAction(banner)).ok).toBe(
			true
		);
		expect((await unreadRoute.GET()).status).toBe(200);
	});

	it("can't edit testimonials or the Flight Crew page", async () => {
		expect(await testimonialActions.addTestimonialAction(quote)).toEqual(
			denied
		);
		expect(await crewActions.addCrewMemberAction(crewPerson)).toEqual(denied);
		expect(await crewActions.importCrewAction()).toEqual(denied);
		expect(
			await crewActions.updateCrewMemberAction(crypto.randomUUID(), crewPerson)
		).toEqual(denied);
		expect(
			await crewActions.deleteCrewMemberAction(crypto.randomUUID())
		).toEqual(denied);
	});

	it("can't manage people or settings", async () => {
		expect(
			await officerActions.addOfficer("x@stuy.edu", presets.contributor)
		).toEqual(denied);
		expect(await settingsActions.testEpsilonAction()).toEqual(denied);
	});

	it("deletes only what it added", async () => {
		const [theirs] = await testDb!
			.insert(galleryPhotos)
			.values({ ...photo, createdBy: "officer@stuy.edu" })
			.returning();
		expect((await galleryActions.deleteGalleryPhotoAction(theirs!.id)).ok).toBe(
			false
		);
		await galleryActions.addGalleryPhotoAction(photo);
		const mine = (await testDb!.select().from(galleryPhotos)).find(
			(row) => row.createdBy === "manager@stuy.edu"
		)!;
		expect((await galleryActions.deleteGalleryPhotoAction(mine.id)).ok).toBe(
			true
		);
	});

	it("gets uploads for its areas", async () => {
		process.env.BLOB_READ_WRITE_TOKEN = "token";
		const upload = await uploadRoute.POST(
			new Request("http://localhost/api/upload", { method: "POST" })
		);
		// Allowed through the permission check; the empty request then fails.
		expect(upload.status).toBe(400);
	});
});

describe("a custom 'manage people' account without settings", () => {
	let helper: Awaited<ReturnType<typeof addPerson>>;
	beforeEach(async () => {
		helper = await addPerson(
			"people@stuy.edu",
			"custom",
			maskOf(["officers", "gallery"])
		);
		signInAs("people@stuy.edu");
	});

	it("can only give the plain content boxes", async () => {
		expect(
			(await officerActions.addOfficer("a@stuy.edu", presets.contributor)).ok
		).toBe(true);
		for (const mask of [
			presets.officer,
			presets.manager,
			presets.admin,
			maskOf(["inbox"]),
			maskOf(["officers"]),
			maskOf(["gallery", "deleteOthers"]),
		]) {
			const result = await officerActions.addOfficer("b@stuy.edu", mask);
			expect(result.ok).toBe(false);
		}

		expect(
			(await testDb!.select().from(users)).map((user) => user.email).toSorted()
		).toEqual(["a@stuy.edu", "people@stuy.edu"]);
	});

	it("can't promote anyone, edit an officer or admin, or change itself", async () => {
		const contributor = await addPerson("c@stuy.edu", "contributor");
		const officer = await addPerson("o@stuy.edu", "officer");
		const admin = await addPerson("boss@stuy.edu", "admin");
		const refusals = await Promise.all([
			officerActions.changeOfficerPermissions(contributor.id, presets.officer),
			officerActions.changeOfficerPermissions(officer.id, presets.contributor),
			officerActions.changeOfficerPermissions(helper.id, presets.admin),
			officerActions.removeOfficer(admin.id),
			officerActions.removeOfficer(officer.id),
		]);
		expect(refusals.map((result) => result.ok)).toEqual([
			false,
			false,
			false,
			false,
			false,
		]);
		// What it may do: change a contributor to another plain mix, and remove one.
		expect(
			(
				await officerActions.changeOfficerPermissions(
					contributor.id,
					maskOf(["gallery"])
				)
			).ok
		).toBe(true);
		expect((await officerActions.removeOfficer(contributor.id)).ok).toBe(true);
		const remaining = await testDb!.select().from(users);
		expect(remaining.find((user) => user.id === officer.id)?.permissions).toBe(
			presets.officer
		);
		expect(remaining.find((user) => user.id === admin.id)?.permissions).toBe(
			presets.admin
		);
	});
});

describe("admin", () => {
	it("can give any permissions, and records the matching role", async () => {
		await addPerson("boss@stuy.edu", "admin");
		signInAs("boss@stuy.edu");
		const roleMasks = [
			presets.admin,
			presets.officer,
			presets.manager,
			presets.contributor,
		];
		const added = await Promise.all(
			roleMasks.map(async (mask, index) =>
				officerActions.addOfficer(`user${index}@stuy.edu`, mask)
			)
		);
		expect(added.map((result) => result.ok)).toEqual([true, true, true, true]);
		const custom = await officerActions.addOfficer(
			"custom@stuy.edu",
			maskOf(["gallery", "inbox"])
		);
		expect(custom.ok).toBe(true);
		const rows = await testDb!.select().from(users);
		expect(rows.map((row) => row.role).toSorted()).toEqual([
			"admin",
			"admin",
			"contributor",
			"custom",
			"manager",
			"officer",
		]);
	});

	it("can change anyone else, but not itself, and rejects bad numbers", async () => {
		const boss = await addPerson("boss@stuy.edu", "admin");
		const other = await addPerson("other@stuy.edu", "contributor");
		signInAs("boss@stuy.edu");
		expect(
			(await officerActions.changeOfficerPermissions(other.id, presets.officer))
				.ok
		).toBe(true);
		expect(
			(
				await officerActions.changeOfficerPermissions(
					boss.id,
					presets.contributor
				)
			).ok
		).toBe(false);
		for (const bad of [0, -3, 99_999, 1.5]) {
			expect((await officerActions.addOfficer("z@stuy.edu", bad)).ok).toBe(
				false
			);
		}

		const rows = await testDb!
			.select()
			.from(users)
			.where(eq(users.id, boss.id));
		expect(rows[0]?.permissions).toBe(presets.admin);
	});
});

describe("the inbox count", () => {
	it("is refused to accounts without the inbox box", async () => {
		await addPerson("contrib@stuy.edu", "contributor");
		signInAs("contrib@stuy.edu");
		expect((await unreadRoute.GET()).status).toBe(401);
	});
});

describe("the trash", () => {
	async function deleteAsContributor() {
		await addPerson("contrib@stuy.edu", "contributor");
		signInAs("contrib@stuy.edu");
		await listingActions.saveListing(undefined, card);
		const [made] = await testDb!.select().from(listings);
		expect(await listingActions.trashListing(made!.id)).toEqual({ ok: true });
		return made!.id;
	}

	it("holds what anyone deletes, and only admins can bring it back or delete it for good", async () => {
		const id = await deleteAsContributor();
		const [hidden] = await testDb!.select().from(listings);
		expect(hidden?.deletedAt).not.toBeNull();
		expect(hidden?.deletedBy).toBe("contrib@stuy.edu");

		// Nobody below admin can reach the trash, not even officers.
		for (const [email, role] of [
			["contrib@stuy.edu", "contributor"],
			["officer@stuy.edu", "officer"],
			["manager@stuy.edu", "manager"],
		] as const) {
			if (role !== "contributor") {
				await addPerson(email, role);
			}

			signInAs(email);
			expect(await trashActions.restoreTrashItemAction("listing", id)).toEqual(
				denied
			);
			expect(await trashActions.deleteTrashItemAction("listing", id)).toEqual(
				denied
			);
			expect(await trashActions.emptyTrashAction()).toEqual(denied);
		}

		await addPerson("boss@stuy.edu", "admin");
		signInAs("boss@stuy.edu");
		expect(await trashActions.restoreTrashItemAction("listing", id)).toEqual({
			ok: true,
		});
		const [back] = await testDb!.select().from(listings);
		expect(back).toMatchObject({ deletedAt: null, status: "draft" });

		await listingActions.trashListing(id);
		expect(await trashActions.deleteTrashItemAction("listing", id)).toEqual({
			ok: true,
		});
		expect(await testDb!.select().from(listings)).toHaveLength(0);
	});

	it("can be emptied by an admin", async () => {
		await deleteAsContributor();
		await addPerson("boss@stuy.edu", "admin");
		signInAs("boss@stuy.edu");
		expect(await trashActions.emptyTrashAction()).toEqual({
			ok: true,
			removed: 1,
		});
		expect(await testDb!.select().from(listings)).toHaveLength(0);
	});

	it("rejects bad kinds and ids", async () => {
		await addPerson("boss@stuy.edu", "admin");
		signInAs("boss@stuy.edu");
		expect(
			(await trashActions.restoreTrashItemAction("users", crypto.randomUUID()))
				.ok
		).toBe(false);
		expect(
			(await trashActions.deleteTrashItemAction("listing", "nope")).ok
		).toBe(false);
	});
});
