import type { Database } from "@/db";
import {
	clubMeetings,
	crewMembers,
	galleryPhotos,
	listings,
	newsletters,
	submissions,
	testimonials,
	users,
} from "@/db/schema";
import { presets } from "@/lib/permissions";
import { createTestDb } from "@/test/pglite";
import { beforeEach, describe, expect, it, vi } from "vitest";

/*
 * Authorization, tested against the real Server Actions and Route Handlers
 * (not through the UI): only the Auth.js session and the database are faked.
 * Anyone who isn't signed in, isn't on the officer list, or doesn't have
 * the role must change nothing.
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
const putMock = vi.fn(async (pathname: string) => ({
	url: `https://store.public.blob.vercel-storage.com/${pathname}`,
}));
vi.mock("@vercel/blob", () => ({ put: putMock }));

const { auth } = await import("@/auth");
const { revalidatePath, updateTag } = await import("next/cache");
const listingActions = await import("./listings.ts");
const newsletterActions = await import("./newsletters.ts");
const announcementActions = await import("./announcement.ts");
const crewActions = await import("./crew.ts");
const meetingActions = await import("./meetings.ts");
const testimonialActions = await import("./testimonials.ts");
const galleryActions = await import("./gallery.ts");
const inboxActions = await import("./inbox.ts");
const officerActions = await import("./officers.ts");
const settingsActions = await import("./settings.ts");
const trashActions = await import("./trash.ts");
const uploadRoute = await import("@/app/api/upload/route");
const renderRoute = await import("@/app/api/newsletter/render/route");
const { defaultNewsletter } = await import("@/lib/newsletter/defaults");
const sharp = (await import("sharp")).default;

const authMock = auth as unknown as ReturnType<typeof vi.fn>;

function signInAs(email: string | undefined) {
	authMock.mockResolvedValue(
		email ? { user: { email, name: "Peter" }, expires: "2099-01-01" } : null
	);
}

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

const announcementInput = {
	text: "Applications close Friday",
	linkUrl: "/opportunities",
	linkLabel: "Apply",
	isOn: true,
	endsOn: "",
};

const crewInput = {
	groupId: "helpers",
	name: "Peter Stuyvesant",
	classOf: "'60",
	role: "Flight Attendant (Helper)",
	imageUrl: "",
};

const galleryInput = {
	alt: "A Cessna on final approach",
	imageUrl:
		"https://abc.public.blob.vercel-storage.com/uploads/highlight/a.jpg",
	width: 1600,
	height: 900,
};

const meetingInput = {
	title: "Flight sim night",
	code: "FSD",
	start: "2026-10-21T15:35",
	end: "2026-10-21T17:00",
	room: "313",
	status: "scheduled",
	description: "",
	linkUrl: "",
	linkLabel: "",
};

const notSignedIn = { ok: false, error: "Please sign in again." };
const notAllowed = {
	ok: false,
	error: "You don’t have permission to do that.",
};

async function count(
	table: typeof listings | typeof users | typeof newsletters
) {
	return (await testDb!.select().from(table)).length;
}

async function addUserRow(
	email: string,
	role: "admin" | "officer" | "manager"
) {
	const [row] = await testDb!
		.insert(users)
		.values({ email, role, permissions: presets[role] })
		.returning();
	return row!;
}

beforeEach(async () => {
	testDb = await createTestDb();
	authMock.mockReset();
	signInAs(undefined);
	putMock.mockClear();
	vi.mocked(updateTag).mockClear();
	vi.mocked(revalidatePath).mockClear();
	delete process.env.BLOB_READ_WRITE_TOKEN;
	delete process.env.DASHBOARD_OPEN_SIGNIN;
});

describe("signed out", () => {
	it("can't touch listings", async () => {
		const id = crypto.randomUUID();
		expect(await listingActions.saveListing(undefined, card)).toEqual(
			notSignedIn
		);
		expect(await listingActions.saveListing(id, card)).toEqual(notSignedIn);
		expect(await listingActions.publishListing(id, true)).toEqual(notSignedIn);
		expect(await listingActions.trashListing(id)).toEqual(notSignedIn);
		expect(await count(listings)).toBe(0);
		expect(updateTag).not.toHaveBeenCalled();
	});

	it("can't touch newsletters", async () => {
		const id = crypto.randomUUID();
		expect(await newsletterActions.createNewsletterAction()).toEqual(
			notSignedIn
		);
		expect(
			await newsletterActions.saveNewsletterAction(id, {}, undefined)
		).toEqual(notSignedIn);
		expect(await newsletterActions.publishNewsletterAction(id, "x")).toEqual(
			notSignedIn
		);
		expect(await newsletterActions.unpublishNewsletterAction(id)).toEqual(
			notSignedIn
		);
		expect(await newsletterActions.trashNewsletter(id)).toEqual(notSignedIn);
		expect(await newsletterActions.createDeadlineDigestAction()).toEqual(
			notSignedIn
		);
		expect(
			await newsletterActions.savePresetAction("x", defaultNewsletter())
		).toEqual(notSignedIn);
		expect(await count(newsletters)).toBe(0);
	});

	it("can't change the announcement", async () => {
		expect(
			await announcementActions.saveAnnouncementAction(announcementInput)
		).toEqual(notSignedIn);
	});

	it("can't edit the flight crew", async () => {
		const id = crypto.randomUUID();
		expect(await crewActions.addCrewMemberAction(crewInput)).toEqual(
			notSignedIn
		);
		expect(await crewActions.updateCrewMemberAction(id, crewInput)).toEqual(
			notSignedIn
		);
		expect(await crewActions.moveCrewMemberAction(id, "up")).toEqual(
			notSignedIn
		);
		expect(await crewActions.deleteCrewMemberAction(id)).toEqual(notSignedIn);
		expect(await crewActions.importCrewAction()).toEqual(notSignedIn);
		expect(await testDb!.select().from(crewMembers)).toHaveLength(0);
	});

	it("can't edit the gallery", async () => {
		const id = crypto.randomUUID();
		expect(await galleryActions.addGalleryPhotoAction(galleryInput)).toEqual(
			notSignedIn
		);
		expect(await galleryActions.updateGalleryAltAction(id, "x")).toEqual(
			notSignedIn
		);
		expect(await galleryActions.moveGalleryPhotoAction(id, "up")).toEqual(
			notSignedIn
		);
		expect(await galleryActions.deleteGalleryPhotoAction(id)).toEqual(
			notSignedIn
		);
		expect(await galleryActions.importGalleryAction()).toEqual(notSignedIn);
		expect(await testDb!.select().from(galleryPhotos)).toHaveLength(0);
	});

	it("can't edit testimonials", async () => {
		const id = crypto.randomUUID();
		const input = { quote: "Great club", author: "Peter" };
		expect(await testimonialActions.addTestimonialAction(input)).toEqual(
			notSignedIn
		);
		expect(await testimonialActions.updateTestimonialAction(id, input)).toEqual(
			notSignedIn
		);
		expect(await testimonialActions.moveTestimonialAction(id, "up")).toEqual(
			notSignedIn
		);
		expect(await testimonialActions.deleteTestimonialAction(id)).toEqual(
			notSignedIn
		);
		expect(await testimonialActions.importTestimonialsAction()).toEqual(
			notSignedIn
		);
		expect(await testDb!.select().from(testimonials)).toHaveLength(0);
	});

	it("can't edit meetings", async () => {
		const id = crypto.randomUUID();
		expect(await meetingActions.addMeetingAction(meetingInput)).toEqual(
			notSignedIn
		);
		expect(await meetingActions.updateMeetingAction(id, meetingInput)).toEqual(
			notSignedIn
		);
		expect(await meetingActions.deleteMeetingAction(id)).toEqual(notSignedIn);
		expect(await testDb!.select().from(clubMeetings)).toHaveLength(0);
	});

	it("can't triage the inbox", async () => {
		const id = crypto.randomUUID();
		expect(await inboxActions.markSubmission(id, "archived")).toEqual(
			notSignedIn
		);
	});

	it("can't manage officers or settings", async () => {
		expect(
			await officerActions.addOfficer("me@gmail.com", presets.admin)
		).toEqual(notSignedIn);
		expect(
			await officerActions.changeOfficerPermissions(
				crypto.randomUUID(),
				presets.admin
			)
		).toEqual(notSignedIn);
		expect(await officerActions.removeOfficer(crypto.randomUUID())).toEqual(
			notSignedIn
		);
		expect(
			await settingsActions.saveEpsilonTokenAction("refresh-token-12345")
		).toEqual(notSignedIn);
		expect(await settingsActions.removeEpsilonTokenAction()).toEqual(
			notSignedIn
		);
		expect(await settingsActions.testEpsilonAction()).toEqual(notSignedIn);
		expect(await count(users)).toBe(0);
	});

	it("gets 401 from the upload and render routes", async () => {
		const upload = await uploadRoute.POST(
			new Request("http://localhost/api/upload", { method: "POST" })
		);
		expect(upload.status).toBe(401);
		const render = await renderRoute.POST(
			new Request("http://localhost/api/newsletter/render", {
				method: "POST",
				body: JSON.stringify({ data: defaultNewsletter() }),
			})
		);
		expect(render.status).toBe(401);
		expect(putMock).not.toHaveBeenCalled();
	});
});

describe("signed in with Google, but not on the officer list", () => {
	beforeEach(async () => {
		await addUserRow("real-officer@gmail.com", "officer");
		signInAs("stranger@gmail.com");
	});

	it("is turned away from every action", async () => {
		expect(await listingActions.saveListing(undefined, card)).toEqual(
			notSignedIn
		);
		expect(await newsletterActions.createNewsletterAction()).toEqual(
			notSignedIn
		);
		expect(
			await officerActions.addOfficer("stranger@gmail.com", presets.admin)
		).toEqual(notSignedIn);
		expect(await count(listings)).toBe(0);
		expect(await count(newsletters)).toBe(0);
		expect(await count(users)).toBe(1);
	});

	it("is turned away from uploads", async () => {
		process.env.BLOB_READ_WRITE_TOKEN = "token";
		const body = new FormData();
		body.set(
			"file",
			new File([new Uint8Array([1, 2, 3])], "a.jpg", { type: "image/jpeg" })
		);
		body.set("purpose", "listing");
		const response = await uploadRoute.POST(
			new Request("http://localhost/api/upload", { method: "POST", body })
		);
		expect(response.status).toBe(401);
		expect(putMock).not.toHaveBeenCalled();
	});

	it("stays turned away even though the cookie is valid, if removed after signing in", async () => {
		const officer = await addUserRow("later-removed@gmail.com", "officer");
		signInAs("later-removed@gmail.com");
		expect((await listingActions.saveListing(undefined, card)).ok).toBe(true);
		await testDb!
			.delete(users)
			.where((await import("drizzle-orm")).eq(users.id, officer.id));
		expect(await listingActions.saveListing(undefined, card)).toEqual(
			notSignedIn
		);
	});

	it("ignores the open sign-in switch outside development", async () => {
		process.env.DASHBOARD_OPEN_SIGNIN = "true"; // NODE_ENV is "test"
		expect(await listingActions.saveListing(undefined, card)).toEqual(
			notSignedIn
		);
	});
});

describe("officers", () => {
	beforeEach(async () => {
		await addUserRow("officer@gmail.com", "officer");
		signInAs("officer@gmail.com");
	});

	it("can create, edit, reorder, publish and delete cards", async () => {
		const created = await listingActions.saveListing(undefined, card);
		expect(created.ok).toBe(true);
		const id = (created as { id: string }).id;
		expect(updateTag).toHaveBeenCalledWith("listings");

		expect(
			(await listingActions.saveListing(id, { ...card, title: "Renamed" })).ok
		).toBe(true);
		expect((await listingActions.publishListing(id, false)).ok).toBe(true);
		expect((await listingActions.trashListing(id)).ok).toBe(true);
		// Deleting only hides it: the row waits in the (admin-only) trash.
		const [hidden] = await testDb!.select().from(listings);
		expect(hidden?.deletedAt).not.toBeNull();
		expect(hidden?.deletedBy).toBe("officer@gmail.com");
		expect(await listingActions.trashListing(id)).toMatchObject({ ok: false });
	});

	it("get field errors for bad input and nothing is saved", async () => {
		const result = await listingActions.saveListing(undefined, {
			...card,
			url: "javascript:alert(1)",
			title: "",
		});
		expect(result).toMatchObject({
			ok: false,
			fieldErrors: { url: expect.any(String), title: expect.any(String) },
		});
		expect(
			await listingActions.saveListing(undefined, "not an object")
		).toMatchObject({ ok: false });
		expect(await count(listings)).toBe(0);
	});

	it("can't change a card's kind or edit one that doesn't exist", async () => {
		const created = (await listingActions.saveListing(undefined, card)) as {
			id: string;
		};
		expect(
			await listingActions.saveListing(created.id, {
				...card,
				kind: "scholarship",
			})
		).toMatchObject({ ok: false });
		expect(
			await listingActions.saveListing(crypto.randomUUID(), card)
		).toMatchObject({ ok: false });
		expect(await listingActions.saveListing("not-a-uuid", card)).toMatchObject({
			ok: false,
		});
		expect(
			await listingActions.publishListing("not-a-uuid", true)
		).toMatchObject({ ok: false });
	});

	it("can build, save and publish newsletters", async () => {
		const created = await newsletterActions.createNewsletterAction();
		expect(created.ok).toBe(true);
		const id = (created as { id: string }).id;
		const row = (await testDb!.select().from(newsletters))[0]!;
		const saved = await newsletterActions.saveNewsletterAction(
			id,
			{
				title: "October",
				data: { ...defaultNewsletter(), introHeading: "Hi" },
			},
			row.updatedAt.toISOString()
		);
		expect(saved.ok).toBe(true);
		expect(
			await newsletterActions.publishNewsletterAction(id, "october")
		).toEqual({ ok: true, slug: "october" });
	});

	it("get a clear message for a half-typed link, and nothing is saved", async () => {
		const created = (await newsletterActions.createNewsletterAction()) as {
			id: string;
		};
		const row = (await testDb!.select().from(newsletters))[0]!;
		const result = await newsletterActions.saveNewsletterAction(
			created.id,
			{ title: "x", data: { ...defaultNewsletter(), headerLogoUrl: "htt" } },
			row.updatedAt.toISOString()
		);
		expect(result).toMatchObject({
			ok: false,
			error: "Use a full link starting with https://",
		});
	});

	it("reports a conflict instead of overwriting", async () => {
		const created = (await newsletterActions.createNewsletterAction()) as {
			id: string;
		};
		const row = (await testDb!.select().from(newsletters))[0]!;
		const payload = { title: "x", data: defaultNewsletter() };
		await newsletterActions.saveNewsletterAction(
			created.id,
			payload,
			row.updatedAt.toISOString()
		);
		const stale = await newsletterActions.saveNewsletterAction(
			created.id,
			payload,
			row.updatedAt.toISOString()
		);
		expect(stale).toMatchObject({ ok: false, conflict: true });
	});

	it("can save the announcement, with bad links refused", async () => {
		expect(
			await announcementActions.saveAnnouncementAction(announcementInput)
		).toEqual({ ok: true });
		expect(updateTag).toHaveBeenCalledWith("announcement");
		const bad = await announcementActions.saveAnnouncementAction({
			...announcementInput,
			linkUrl: "javascript:alert(1)",
		});
		expect(bad.ok).toBe(false);
	});

	it("can import, add, edit, reorder and remove crew", async () => {
		// Only admins (or a custom mix) can edit the Flight Crew page.
		await addUserRow("crew-admin@gmail.com", "admin");
		signInAs("crew-admin@gmail.com");
		expect((await crewActions.importCrewAction()).ok).toBe(true);
		expect((await crewActions.importCrewAction()).ok).toBe(false);
		expect(await crewActions.addCrewMemberAction(crewInput)).toEqual({
			ok: true,
		});
		expect(updateTag).toHaveBeenCalledWith("crew");
		const rows = await testDb!.select().from(crewMembers);
		const mine = rows.find((row) => row.name === "Peter Stuyvesant")!;
		expect(
			await crewActions.updateCrewMemberAction(mine.id, {
				...crewInput,
				role: "Captain",
			})
		).toEqual({ ok: true });
		expect(await crewActions.moveCrewMemberAction(mine.id, "up")).toEqual({
			ok: true,
		});
		expect((await crewActions.moveCrewMemberAction(mine.id, "left")).ok).toBe(
			false
		);
		expect(await crewActions.deleteCrewMemberAction(mine.id)).toEqual({
			ok: true,
		});
		expect((await crewActions.deleteCrewMemberAction(mine.id)).ok).toBe(false);
	});

	it("can import, add, caption and remove gallery photos", async () => {
		expect((await galleryActions.importGalleryAction()).ok).toBe(true);
		expect((await galleryActions.importGalleryAction()).ok).toBe(false);
		expect(await galleryActions.addGalleryPhotoAction(galleryInput)).toEqual({
			ok: true,
		});
		expect(updateTag).toHaveBeenCalledWith("gallery");
		const rows = await testDb!.select().from(galleryPhotos);
		const mine = rows.find((row) => row.imageUrl !== null)!;
		expect(await galleryActions.updateGalleryAltAction(mine.id, "New")).toEqual(
			{ ok: true }
		);
		expect(
			await galleryActions.updateGalleryAltAction(mine.id, " ")
		).toMatchObject({ ok: false, fieldErrors: { alt: expect.any(String) } });
		expect(
			await galleryActions.addGalleryPhotoAction({
				...galleryInput,
				imageUrl: "https://example.org/a.jpg",
			})
		).toMatchObject({ ok: false });
		expect(await galleryActions.deleteGalleryPhotoAction(mine.id)).toEqual({
			ok: true,
		});
	});

	it("can import, add, edit and remove testimonials", async () => {
		expect((await testimonialActions.importTestimonialsAction()).ok).toBe(true);
		expect((await testimonialActions.importTestimonialsAction()).ok).toBe(
			false
		);
		const input = { quote: "Great club", author: "Peter" };
		expect(await testimonialActions.addTestimonialAction(input)).toEqual({
			ok: true,
		});
		expect(updateTag).toHaveBeenCalledWith("testimonials");
		const rows = await testDb!.select().from(testimonials);
		const mine = rows.find((row) => row.quote === "Great club")!;
		expect(
			await testimonialActions.updateTestimonialAction(mine.id, {
				...input,
				quote: "Greater club",
			})
		).toEqual({ ok: true });
		expect(
			(await testimonialActions.addTestimonialAction({ ...input, quote: "" }))
				.ok
		).toBe(false);
		expect(await testimonialActions.deleteTestimonialAction(mine.id)).toEqual({
			ok: true,
		});
	});

	it("adds, edits and removes meetings, and refreshes the board each time", async () => {
		await addUserRow("meetings-officer@gmail.com", "officer");
		signInAs("meetings-officer@gmail.com");
		expect(await meetingActions.addMeetingAction(meetingInput)).toEqual({
			ok: true,
		});
		expect(updateTag).toHaveBeenCalledWith("meetings");
		expect(revalidatePath).toHaveBeenCalledWith("/meetings", "layout");
		const [row] = await testDb!.select().from(clubMeetings);
		expect(row).toMatchObject({
			title: "Flight sim night",
			createdBy: "meetings-officer@gmail.com",
		});

		vi.mocked(updateTag).mockClear();
		expect(
			await meetingActions.updateMeetingAction(row!.id, {
				...meetingInput,
				status: "cancelled",
			})
		).toEqual({ ok: true });
		expect(updateTag).toHaveBeenCalledWith("meetings");
		expect(
			await meetingActions.addMeetingAction({ ...meetingInput, title: "" })
		).toMatchObject({ ok: false, fieldErrors: { title: expect.any(String) } });

		vi.mocked(updateTag).mockClear();
		expect(await meetingActions.deleteMeetingAction(row!.id)).toEqual({
			ok: true,
		});
		expect(updateTag).toHaveBeenCalledWith("meetings");
		// Deleting only hides it: the row waits in the (admin-only) trash.
		const [hidden] = await testDb!.select().from(clubMeetings);
		expect(hidden?.deletedAt).not.toBeNull();
	});

	it("keeps meetings from people without the Meetings box", async () => {
		await testDb!.insert(users).values({
			email: "plain@gmail.com",
			role: "contributor",
			permissions: presets.contributor,
		});
		signInAs("plain@gmail.com");
		expect(await meetingActions.addMeetingAction(meetingInput)).toEqual(
			notAllowed
		);
		expect(await testDb!.select().from(clubMeetings)).toHaveLength(0);
	});

	it("gets field errors for a bad crew photo link", async () => {
		// Only admins (or a custom mix) can edit the Flight Crew page.
		await addUserRow("crew-admin@gmail.com", "admin");
		signInAs("crew-admin@gmail.com");
		const result = await crewActions.addCrewMemberAction({
			...crewInput,
			imageUrl: "https://example.org/a.jpg",
		});
		expect(result).toMatchObject({
			ok: false,
			fieldErrors: { imageUrl: expect.any(String) },
		});
	});

	it("can triage the inbox", async () => {
		const rows = await testDb!
			.insert(submissions)
			.values({ type: "contact", name: "Peter", message: "Hi" })
			.returning();
		const id = rows.at(0)!.id;
		expect(await inboxActions.markSubmission(id, "read")).toEqual({ ok: true });
		expect(await inboxActions.markSubmission(id, "archived")).toEqual({
			ok: true,
		});
		const stored = await testDb!.select().from(submissions);
		expect(stored.at(0)?.status).toBe("archived");
		const missing = await inboxActions.markSubmission(
			crypto.randomUUID(),
			"read"
		);
		expect(missing.ok).toBe(false);
		const bad = await inboxActions.markSubmission(id, "deleted");
		expect(bad.ok).toBe(false);
	});

	it("can start a deadline digest only when a card is due", async () => {
		const empty = await newsletterActions.createDeadlineDigestAction();
		expect(empty.ok).toBe(false);
		expect(await count(newsletters)).toBe(0);

		const due = new Date(Date.now() + 17 * 86_400_000)
			.toISOString()
			.slice(0, 10);
		await listingActions.saveListing(undefined, {
			...card,
			deadline: due,
			status: "published",
		});
		const made = await newsletterActions.createDeadlineDigestAction();
		expect(made.ok).toBe(true);
		expect(await count(newsletters)).toBe(1);
	});

	it("can't manage officers or settings (admin only)", async () => {
		const target = await addUserRow("someone@gmail.com", "officer");
		expect(
			await officerActions.addOfficer("new@gmail.com", presets.officer)
		).toEqual(notAllowed);
		expect(
			await officerActions.changeOfficerPermissions(target.id, presets.admin)
		).toEqual(notAllowed);
		expect(await officerActions.removeOfficer(target.id)).toEqual(notAllowed);
		expect(
			await settingsActions.saveEpsilonTokenAction("refresh-token-12345")
		).toEqual(notAllowed);
		expect(await settingsActions.removeEpsilonTokenAction()).toEqual(
			notAllowed
		);
		expect(await settingsActions.testEpsilonAction()).toEqual(notAllowed);
		expect(await count(users)).toBe(2);
	});

	it("can upload images, with the type and size checked on the server", async () => {
		process.env.BLOB_READ_WRITE_TOKEN = "token";
		const photo = new Uint8Array(
			await sharp({
				create: { width: 2000, height: 1000, channels: 3, background: "#123" },
			})
				.jpeg()
				.toBuffer()
		);
		function request(
			file: File,
			purpose = "listing",
			headers: Record<string, string> = {}
		) {
			const body = new FormData();
			body.set("file", file);
			body.set("purpose", purpose);
			return new Request("http://localhost/api/upload", {
				method: "POST",
				body,
				headers,
			});
		}

		const ok = await uploadRoute.POST(
			request(new File([photo], "a.jpg", { type: "image/jpeg" }))
		);
		expect(ok.status).toBe(200);
		expect(await ok.json()).toMatchObject({
			url: expect.stringContaining("blob.vercel-storage.com/uploads/listing/"),
			width: 1200,
		});
		expect(putMock).toHaveBeenCalledTimes(1);

		const notImage = await uploadRoute.POST(
			request(
				new File(["<script>alert(1)</script>"], "x.jpg", { type: "image/jpeg" })
			)
		);
		expect(notImage.status).toBe(400);
		const badPurpose = await uploadRoute.POST(
			request(new File([photo], "a.jpg"), "avatar")
		);
		expect(badPurpose.status).toBe(400);
		const crossSite = await uploadRoute.POST(
			request(new File([photo], "a.jpg"), "listing", {
				origin: "https://evil.example",
			})
		);
		expect(crossSite.status).toBe(403);
		expect(putMock).toHaveBeenCalledTimes(1);
	});

	it("get a clear 503 when the Blob store is private", async () => {
		process.env.BLOB_READ_WRITE_TOKEN = "token";
		putMock.mockRejectedValueOnce(
			new Error(
				"Vercel Blob: Cannot use public access on a private store. The store is configured with private access."
			)
		);
		const photo = new Uint8Array(
			await sharp({
				create: { width: 400, height: 300, channels: 3, background: "#123" },
			})
				.jpeg()
				.toBuffer()
		);
		const body = new FormData();
		body.set("file", new File([photo], "a.jpg", { type: "image/jpeg" }));
		body.set("purpose", "listing");
		const response = await uploadRoute.POST(
			new Request("http://localhost/api/upload", { method: "POST", body })
		);
		expect(response.status).toBe(503);
		expect(await response.json()).toMatchObject({
			error: expect.stringContaining("public Vercel Blob store"),
		});
	});

	it("get a clear 503 when Blob isn't set up", async () => {
		const body = new FormData();
		body.set("file", new File([new Uint8Array([1])], "a.jpg"));
		body.set("purpose", "listing");
		const response = await uploadRoute.POST(
			new Request("http://localhost/api/upload", { method: "POST", body })
		);
		expect(response.status).toBe(503);
	});
});

describe("admins", () => {
	let admin: typeof users.$inferSelect;
	beforeEach(async () => {
		admin = await addUserRow("admin@gmail.com", "admin");
		signInAs("admin@gmail.com");
	});

	it("can add officers, change roles and remove them", async () => {
		expect(
			await officerActions.addOfficer(" New@Gmail.com ", presets.officer)
		).toEqual({ ok: true });
		const added = (await testDb!.select().from(users)).find(
			(user) => user.email === "new@gmail.com"
		)!;
		expect(added.addedBy).toBe("admin@gmail.com");
		expect(
			await officerActions.addOfficer("new@gmail.com", presets.officer)
		).toMatchObject({ ok: false });
		expect(
			await officerActions.changeOfficerPermissions(added.id, presets.admin)
		).toEqual({
			ok: true,
		});
		expect(await officerActions.removeOfficer(added.id)).toEqual({ ok: true });
	});

	it("validates emails and roles", async () => {
		expect(
			await officerActions.addOfficer("not-an-email", presets.officer)
		).toMatchObject({ ok: false });
		expect(
			await officerActions.addOfficer("a@gmail.com", 99_999)
		).toMatchObject({ ok: false });
		expect(
			await officerActions.changeOfficerPermissions(admin.id, -5)
		).toMatchObject({ ok: false });
		expect(await count(users)).toBe(1);
	});

	it("can't change its own permissions", async () => {
		expect(
			await officerActions.changeOfficerPermissions(admin.id, presets.officer)
		).toEqual({ ok: false, error: "You can’t change your own permissions." });
		expect((await testDb!.select().from(users))[0]?.permissions).toBe(
			presets.admin
		);
	});

	it("reject an Epsilon token that isn't a token", async () => {
		expect(await settingsActions.saveEpsilonTokenAction("hi")).toMatchObject({
			ok: false,
		});
		expect(await settingsActions.testEpsilonAction()).toMatchObject({
			ok: false,
		});
	});
});
