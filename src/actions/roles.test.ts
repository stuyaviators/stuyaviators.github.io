import type { Database } from "@/db";
import {
	crewMembers,
	galleryPhotos,
	listings,
	testimonials,
	users,
} from "@/db/schema";
import { createTestDb } from "@/test/pglite";
import { eq } from "drizzle-orm";
import { beforeEach, describe, expect, it, vi } from "vitest";

/*
 * What each role may do, tested against the real Server Actions: only the
 * Auth.js session and the database are faked. A role must not reach areas it
 * doesn't cover, may only delete its own work if it is one of the limited
 * roles, and the people-managing role must not be able to promote anyone.
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
const inboxActions = await import("./inbox.ts");
const unreadRoute = await import("@/app/api/dashboard/unread/route");
const uploadRoute = await import("@/app/api/upload/route");

const authMock = auth as unknown as ReturnType<typeof vi.fn>;

type Role = "admin" | "officer" | "manager" | "contributor" | "media";

async function addPerson(email: string, role: Role) {
	const [row] = await testDb!.insert(users).values({ email, role }).returning();
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

beforeEach(async () => {
	testDb = await createTestDb();
	authMock.mockReset();
	delete process.env.DASHBOARD_OPEN_SIGNIN;
	delete process.env.BLOB_READ_WRITE_TOKEN;
});

async function listingId() {
	const rows = await testDb!.select().from(listings);
	return rows[0]!.id;
}

describe("contributor (cards and newsletters)", () => {
	beforeEach(async () => {
		await addPerson("contrib@stuy.edu", "contributor");
		signInAs("contrib@stuy.edu");
	});

	it("can add cards, but not reach anything else", async () => {
		expect((await listingActions.saveListing(undefined, card)).ok).toBe(true);
		expect(await galleryActions.addGalleryPhotoAction(photo)).toEqual(denied);
		expect(await testimonialActions.addTestimonialAction(quote)).toEqual(
			denied
		);
		expect(
			await announcementActions.saveAnnouncementAction({
				text: "Hi",
				linkUrl: "",
				linkLabel: "",
				isOn: true,
				endsOn: "",
			})
		).toEqual(denied);
		expect(await officerActions.addOfficer("x@stuy.edu", "media")).toEqual(
			denied
		);
		expect(await settingsActions.testEpsilonAction()).toEqual(denied);
		expect(
			await inboxActions.markSubmission(crypto.randomUUID(), "read")
		).toEqual(denied);
	});

	it("can delete its own card but not one added by someone else", async () => {
		await listingActions.saveListing(undefined, card);
		const mine = await listingId();
		expect(await listingActions.trashListing(mine)).toEqual({ ok: true });

		await testDb!.insert(listings).values({
			kind: "opportunity",
			slug: "theirs",
			title: "Theirs",
			organization: "Someone",
			summary: "Not mine",
			url: "https://example.org/theirs",
			createdBy: "officer@stuy.edu",
		});
		const theirs = (await testDb!.select().from(listings)).find(
			(row) => row.slug === "theirs"
		)!;
		const refused = await listingActions.trashListing(theirs.id);
		expect(refused.ok).toBe(false);
		expect((refused as { error: string }).error).toMatch(/you added/u);
		expect((await listingActions.deleteListingForever(theirs.id)).ok).toBe(
			false
		);
		expect(
			(await testDb!.select().from(listings)).find(
				(row) => row.id === theirs.id
			)?.deletedAt
		).toBeNull();
	});
});

describe("media (gallery, testimonials, crew)", () => {
	beforeEach(async () => {
		await addPerson("media@stuy.edu", "media");
		signInAs("media@stuy.edu");
	});

	it("can add photos and quotes, but not cards", async () => {
		expect((await galleryActions.addGalleryPhotoAction(photo)).ok).toBe(true);
		expect((await testimonialActions.addTestimonialAction(quote)).ok).toBe(
			true
		);
		expect(await listingActions.saveListing(undefined, card)).toEqual(denied);
	});

	it("records who added a photo and lets them delete only their own", async () => {
		await galleryActions.addGalleryPhotoAction(photo);
		const [mine] = await testDb!.select().from(galleryPhotos);
		expect(mine?.createdBy).toBe("media@stuy.edu");
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
		expect(await testDb!.select().from(galleryPhotos)).toHaveLength(1);
	});

	it("can't delete quotes or crew with no recorded creator", async () => {
		const [legacy] = await testDb!
			.insert(testimonials)
			.values({ ...quote })
			.returning();
		expect(
			(await testimonialActions.deleteTestimonialAction(legacy!.id)).ok
		).toBe(false);
		const [person] = await testDb!
			.insert(crewMembers)
			.values({
				groupId: "helpers",
				name: "Peter Stuyvesant",
				role: "Helper",
			})
			.returning();
		expect((await crewActions.deleteCrewMemberAction(person!.id)).ok).toBe(
			false
		);
		expect(await testDb!.select().from(crewMembers)).toHaveLength(1);
	});
});

describe("officer (all content)", () => {
	beforeEach(async () => {
		await addPerson("officer@stuy.edu", "officer");
		signInAs("officer@stuy.edu");
	});

	it("can delete things other people added", async () => {
		const [theirs] = await testDb!
			.insert(galleryPhotos)
			.values({ ...photo, createdBy: "media@stuy.edu" })
			.returning();
		expect((await galleryActions.deleteGalleryPhotoAction(theirs!.id)).ok).toBe(
			true
		);
	});

	it("still can't manage people or settings", async () => {
		expect(await officerActions.addOfficer("x@stuy.edu", "media")).toEqual(
			denied
		);
		expect(await settingsActions.testEpsilonAction()).toEqual(denied);
	});
});

describe("manager (banner, inbox, and Contributors and Media)", () => {
	let manager: Awaited<ReturnType<typeof addPerson>>;
	beforeEach(async () => {
		manager = await addPerson("manager@stuy.edu", "manager");
		signInAs("manager@stuy.edu");
	});

	it("reaches the banner and the inbox, but not content", async () => {
		expect(
			(
				await announcementActions.saveAnnouncementAction({
					text: "Applications close Friday",
					linkUrl: "",
					linkLabel: "",
					isOn: true,
					endsOn: "",
				})
			).ok
		).toBe(true);
		expect(await listingActions.saveListing(undefined, card)).toEqual(denied);
		expect(await galleryActions.addGalleryPhotoAction(photo)).toEqual(denied);
	});

	it("can add Contributors and Media, but never anyone who could do more", async () => {
		expect(
			(await officerActions.addOfficer("a@stuy.edu", "contributor")).ok
		).toBe(true);
		expect((await officerActions.addOfficer("b@stuy.edu", "media")).ok).toBe(
			true
		);
		const refused = await Promise.all(
			["admin", "officer", "manager"].map(async (role) =>
				officerActions.addOfficer(`${role}@stuy.edu`, role)
			)
		);
		expect(refused.map((result) => result.ok)).toEqual([false, false, false]);

		expect(
			(await testDb!.select().from(users)).map((user) => user.email).toSorted()
		).toEqual(["a@stuy.edu", "b@stuy.edu", "manager@stuy.edu"]);
	});

	it("can't promote anyone, change an officer or admin, or change itself", async () => {
		const contributor = await addPerson("c@stuy.edu", "contributor");
		const officer = await addPerson("o@stuy.edu", "officer");
		const admin = await addPerson("boss@stuy.edu", "admin");
		expect(
			(await officerActions.changeOfficerRole(contributor.id, "officer")).ok
		).toBe(false);
		expect(
			(await officerActions.changeOfficerRole(officer.id, "media")).ok
		).toBe(false);
		expect(
			(await officerActions.changeOfficerRole(manager.id, "admin")).ok
		).toBe(false);
		expect((await officerActions.removeOfficer(admin.id)).ok).toBe(false);
		expect((await officerActions.removeOfficer(officer.id)).ok).toBe(false);
		// What it may do: move a Contributor to Media, and remove one.
		expect(
			(await officerActions.changeOfficerRole(contributor.id, "media")).ok
		).toBe(true);
		expect((await officerActions.removeOfficer(contributor.id)).ok).toBe(true);
		const remaining = await testDb!.select().from(users);
		expect(remaining.find((user) => user.id === officer.id)?.role).toBe(
			"officer"
		);
		expect(remaining.find((user) => user.id === admin.id)?.role).toBe("admin");
	});

	it("gets the unread count, but not uploads", async () => {
		const unread = await unreadRoute.GET();
		expect(unread.status).toBe(200);
		const upload = await uploadRoute.POST(
			new Request("http://localhost/api/upload", { method: "POST" })
		);
		expect(upload.status).toBe(401);
	});
});

describe("admin", () => {
	it("can give any role, and can't demote itself away or the last admin", async () => {
		const boss = await addPerson("boss@stuy.edu", "admin");
		signInAs("boss@stuy.edu");
		const added = await Promise.all(
			["admin", "officer", "manager", "contributor", "media"].map(
				async (role) => officerActions.addOfficer(`${role}@stuy.edu`, role)
			)
		);
		expect(added.map((result) => result.ok)).toEqual([
			true,
			true,
			true,
			true,
			true,
		]);

		expect((await officerActions.changeOfficerRole(boss.id, "media")).ok).toBe(
			false
		);
		const rows = await testDb!
			.select()
			.from(users)
			.where(eq(users.id, boss.id));
		expect(rows[0]?.role).toBe("admin");
	});
});

describe("contributors can't read the inbox count", () => {
	it("gets 401 from the unread route", async () => {
		await addPerson("contrib@stuy.edu", "contributor");
		signInAs("contrib@stuy.edu");
		expect((await unreadRoute.GET()).status).toBe(401);
	});
});
