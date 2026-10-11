import type { Database } from "@/db";
import { createTestDb } from "@/test/pglite";
import { beforeEach, describe, expect, it } from "vitest";
import {
	addClubMeeting,
	clubMeetingSchema,
	listClubMeetings,
	toFormValues,
	toMeeting,
	updateClubMeeting,
} from "./club-meetings.ts";
import { didMoveToTrash } from "./trash.ts";

const valid = {
	title: "  Flight sim night ",
	code: "FSD",
	start: "2026-10-21T15:35",
	end: "2026-10-21T17:00",
	room: " 313 ",
	status: "scheduled",
	description: "Bring a friend",
	linkUrl: "https://example.org/signup",
	linkLabel: "Sign up",
};

describe("the meeting form", () => {
	it("reads New York times and trims the text", () => {
		const parsed = clubMeetingSchema.parse(valid);
		expect(parsed.title).toBe("Flight sim night");
		expect(parsed.room).toBe("313");
		expect(parsed.startsAt.toISOString()).toBe("2026-10-21T19:35:00.000Z");
		expect(parsed.endsAt?.toISOString()).toBe("2026-10-21T21:00:00.000Z");
	});

	it("turns blank optional boxes into nothing", () => {
		const parsed = clubMeetingSchema.parse({
			...valid,
			code: "",
			end: "",
			room: "",
			description: "",
			linkUrl: "",
			linkLabel: "Sign up",
		});
		expect(parsed).toMatchObject({
			code: null,
			endsAt: null,
			room: null,
			description: null,
			linkUrl: null,
			// A button name means nothing without a link.
			linkLabel: null,
		});
	});

	it("says what is wrong, box by box", () => {
		const fields = (input: unknown) => {
			const result = clubMeetingSchema.safeParse(input);
			return result.success
				? []
				: result.error.issues.map((issue) => String(issue.path[0]));
		};

		expect(fields({ ...valid, title: " " })).toEqual(["title"]);
		expect(fields({ ...valid, start: "" })).toEqual(["start"]);
		expect(fields({ ...valid, start: "2026-02-30T10:00" })).toEqual(["start"]);
		expect(fields({ ...valid, end: "2026-10-21T15:35" })).toEqual(["end"]);
		expect(fields({ ...valid, end: "2026-10-21T14:00" })).toEqual(["end"]);
		expect(fields({ ...valid, code: "XYZ" })).toEqual(["code"]);
		expect(fields({ ...valid, status: "postponed" })).toEqual(["status"]);
		expect(fields({ ...valid, linkUrl: "javascript:alert(1)" })).toEqual([
			"linkUrl",
		]);
	});
});

describe("meetings added by hand", () => {
	let db: Database;
	beforeEach(async () => {
		db = await createTestDb();
	});

	it("are saved, listed soonest first, edited and shaped for the board", async () => {
		await addClubMeeting(
			db,
			clubMeetingSchema.parse({
				...valid,
				title: "Later",
				start: "2026-11-02T15:35",
				end: "",
			}),
			"a@stuy.edu"
		);
		await addClubMeeting(db, clubMeetingSchema.parse(valid), "a@stuy.edu");

		const rows = await listClubMeetings(db);
		expect(rows.map((row) => row.title)).toEqual(["Flight sim night", "Later"]);
		expect(rows[0]?.createdBy).toBe("a@stuy.edu");

		const meeting = toMeeting(rows[0]!);
		expect(meeting).toMatchObject({
			source: "club",
			title: "Flight sim night",
			code: "FSD",
			start: "2026-10-21T19:35:00.000Z",
			end: "2026-10-21T21:00:00.000Z",
			room: "313",
			status: "scheduled",
			linkUrl: "https://example.org/signup",
			linkLabel: "Sign up",
		});
		// The edit form shows New York time again.
		expect(toFormValues(rows[0]!)).toMatchObject({
			start: "2026-10-21T15:35",
			end: "2026-10-21T17:00",
		});

		const updated = await updateClubMeeting(
			db,
			rows[0]!.id,
			clubMeetingSchema.parse({ ...valid, status: "cancelled" }),
			"b@stuy.edu"
		);
		expect(updated?.status).toBe("cancelled");
		expect(updated?.updatedBy).toBe("b@stuy.edu");
	});

	it("disappear from the list and can't be edited once deleted", async () => {
		await addClubMeeting(db, clubMeetingSchema.parse(valid), "a@stuy.edu");
		const [row] = await listClubMeetings(db);
		expect(await didMoveToTrash(db, "meeting", row!.id, "b@stuy.edu")).toBe(
			true
		);
		expect(await listClubMeetings(db)).toHaveLength(0);
		expect(
			await updateClubMeeting(
				db,
				row!.id,
				clubMeetingSchema.parse(valid),
				"b@stuy.edu"
			)
		).toBeUndefined();
	});
});
