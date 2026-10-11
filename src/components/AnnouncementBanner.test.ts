import { describe, expect, it } from "vitest";
import { hasEnded } from "./AnnouncementBanner.tsx";

describe("hasEnded", () => {
	it("never ends without a date", () => {
		expect(hasEnded(undefined)).toBe(false);
	});

	it("still shows on the last day, in New York time", () => {
		// 11:30pm on Oct 31 in New York is already Nov 1 in UTC.
		expect(hasEnded("2026-10-31", new Date("2026-11-01T03:30:00Z"))).toBe(
			false
		);
		expect(hasEnded("2026-10-31", new Date("2026-11-01T05:00:00Z"))).toBe(true);
	});
});
