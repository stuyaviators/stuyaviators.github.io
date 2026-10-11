import { createTestDb } from "@/test/pglite";
import { describe, expect, it } from "vitest";
import {
	announcementSchema,
	emptyAnnouncement,
	readAnnouncement,
	saveAnnouncement,
} from "./announcement.ts";

const valid = {
	text: "Applications close Friday",
	linkUrl: "/opportunities",
	linkLabel: "Apply",
	isOn: true,
	endsOn: "2026-11-01",
};

describe("announcement", () => {
	it("is empty and off until one is saved", async () => {
		const db = await createTestDb();
		expect(await readAnnouncement(db)).toEqual(emptyAnnouncement);
	});

	it("saves one row and overwrites it on the next save", async () => {
		const db = await createTestDb();
		await saveAnnouncement(db, { ...valid, endsOn: valid.endsOn }, "a@b.co");
		await saveAnnouncement(
			db,
			{ ...valid, text: "New message", endsOn: undefined, isOn: false },
			"a@b.co"
		);
		expect(await readAnnouncement(db)).toEqual({
			...valid,
			text: "New message",
			endsOn: undefined,
			isOn: false,
		});
	});

	it("accepts https links, site paths and no link", () => {
		for (const linkUrl of ["https://example.org/x", "/meetings", ""]) {
			expect(
				announcementSchema.safeParse({
					...valid,
					linkUrl,
					linkLabel: linkUrl === "" ? "" : "Go",
				}).success
			).toBe(true);
		}
	});

	it("rejects other schemes, protocol-relative links and a link without text", () => {
		for (const linkUrl of [
			"javascript:alert(1)",
			"data:text/html,x",
			"//evil.example",
			"ftp://x.org",
		]) {
			expect(announcementSchema.safeParse({ ...valid, linkUrl }).success).toBe(
				false
			);
		}

		expect(
			announcementSchema.safeParse({ ...valid, linkLabel: "" }).success
		).toBe(false);
		expect(announcementSchema.safeParse({ ...valid, text: " " }).success).toBe(
			false
		);
		expect(
			announcementSchema.safeParse({ ...valid, endsOn: "tomorrow" }).success
		).toBe(false);
	});
});
