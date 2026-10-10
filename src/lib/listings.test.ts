import { describe, expect, it } from "vitest";
import { daysUntil, isClosingSoon, isExpired } from "./listings";

const now = new Date("2026-10-10T16:00:00Z"); // Noon in New York

describe("listing dates", () => {
	it("counts days in New York time", () => {
		expect(daysUntil("2026-10-10", now)).toBe(0);
		expect(daysUntil("2026-10-24", now)).toBe(14);
		expect(daysUntil("2026-10-09", now)).toBe(-1);
	});

	it("flags deadlines within 14 days as closing soon", () => {
		expect(isClosingSoon({ deadline: "2026-10-24" }, now)).toBe(true);
		expect(isClosingSoon({ deadline: "2026-10-25" }, now)).toBe(false);
		expect(isClosingSoon({ deadline: "2026-10-09" }, now)).toBe(false);
		expect(isClosingSoon({ deadline: null }, now)).toBe(false);
	});

	it("expires the day after the deadline (or end date)", () => {
		expect(isExpired({ deadline: "2026-10-10", endDate: null }, now)).toBe(
			false
		);
		expect(isExpired({ deadline: "2026-10-09", endDate: null }, now)).toBe(
			true
		);
		expect(isExpired({ deadline: null, endDate: "2026-10-01" }, now)).toBe(
			true
		);
		expect(isExpired({ deadline: null, endDate: null }, now)).toBe(false);
	});
});
