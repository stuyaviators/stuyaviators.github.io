import { describe, expect, it } from "vitest";
import { instantToNewYork, newYorkToInstant } from "./ny-time.ts";

describe("New York wall-clock time", () => {
	it("reads summer times as UTC-4 and winter times as UTC-5", () => {
		expect(newYorkToInstant("2026-10-12T15:30")?.toISOString()).toBe(
			"2026-10-12T19:30:00.000Z"
		);
		expect(newYorkToInstant("2026-12-03T15:30")?.toISOString()).toBe(
			"2026-12-03T20:30:00.000Z"
		);
	});

	it("round-trips, including the day the clocks change", () => {
		for (const value of [
			"2026-03-08T01:59",
			"2026-03-08T03:00",
			"2026-11-01T00:30",
			"2026-11-01T03:00",
			"2026-06-30T23:59",
		]) {
			const instant = newYorkToInstant(value);
			expect(instant).toBeDefined();
			expect(instantToNewYork(instant ?? new Date(0))).toBe(value);
		}
	});

	it("rejects text that isn't a real date and time", () => {
		expect(newYorkToInstant("")).toBeUndefined();
		expect(newYorkToInstant("2026-13-01T10:00")).toBeUndefined();
		expect(newYorkToInstant("2026-02-30T10:00")).toBeUndefined();
		expect(newYorkToInstant("tomorrow")).toBeUndefined();
		// 2:30 AM does not exist when the clocks spring forward.
		expect(newYorkToInstant("2026-03-08T02:30")).toBeUndefined();
	});
});
