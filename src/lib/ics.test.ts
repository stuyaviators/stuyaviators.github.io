import type { Meeting } from "@/lib/meetings";
import { describe, expect, it } from "vitest";
import { buildCalendar, escapeText, foldLine } from "./ics.ts";

const meeting: Meeting = {
	id: "epsilon-1",
	title: "Flight sim, part 2; bring snacks",
	start: "2026-10-16T19:35:00Z",
	end: "2026-10-16T21:00:00Z",
	room: "313",
	status: "scheduled",
	description: "Line one\nLine two, with a \\ backslash",
};

const options = {
	siteUrl: "https://stuyaviators.vercel.app",
	now: new Date("2026-10-11T12:00:00Z"),
};

describe("escapeText", () => {
	it("escapes backslashes, semicolons, commas and newlines", () => {
		expect(escapeText("a\\b;c,d\ne")).toBe(String.raw`a\\b\;c\,d\ne`);
	});
});

describe("foldLine", () => {
	it("leaves short lines alone", () => {
		expect(foldLine("SUMMARY:Hi")).toEqual(["SUMMARY:Hi"]);
	});

	it("folds at 75 bytes without splitting a character", () => {
		const parts = foldLine(`SUMMARY:${"é".repeat(60)}`);
		expect(parts.length).toBeGreaterThan(1);
		for (const part of parts) {
			expect(new TextEncoder().encode(part).length).toBeLessThanOrEqual(75);
		}

		const joined = parts
			.map((part, index) => (index === 0 ? part : part.slice(1)))
			.join("");
		expect(joined).toBe(`SUMMARY:${"é".repeat(60)}`);
	});
});

describe("buildCalendar", () => {
	const text = buildCalendar([meeting], options);

	it("uses CRLF for every line and ends with one", () => {
		expect(text.endsWith("END:VCALENDAR\r\n")).toBe(true);
		expect(text.replaceAll("\r\n", "")).not.toMatch(/[\n\r]/u);
	});

	it("writes the event in UTC with escaped text", () => {
		expect(text).toContain("DTSTART:20261016T193500Z");
		expect(text).toContain("DTEND:20261016T210000Z");
		expect(text).toContain(
			String.raw`SUMMARY:Flight sim\, part 2\; bring snacks`
		);
		expect(text).toContain(
			String.raw`LOCATION:Stuyvesant High School\, Room 313`
		);
		expect(text).toContain("UID:epsilon-1@stuyaviators");
		expect(text).toContain("STATUS:CONFIRMED");
	});

	it("defaults to one hour, and marks cancelled meetings", () => {
		const output = buildCalendar(
			[{ ...meeting, end: undefined, room: undefined, status: "cancelled" }],
			options
		);
		expect(output).toContain("DTEND:20261016T203500Z");
		expect(output).toContain("LOCATION:Stuyvesant High School\r\n");
		expect(output).toContain("STATUS:CANCELLED");
	});

	it("skips a meeting with an unreadable date", () => {
		const output = buildCalendar([{ ...meeting, start: "soon" }], options);
		expect(output).not.toContain("BEGIN:VEVENT");
	});
});
