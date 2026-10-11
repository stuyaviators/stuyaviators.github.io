import { describe, expect, it } from "vitest";
import {
	daysUntil,
	isClosingSoon,
	isExpired,
	soonLabel,
} from "./listing-dates.ts";

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

	it("expires scholarships the day after the deadline (or end date)", () => {
		const card = { kind: "scholarship", startDate: null } as const;
		expect(
			isExpired({ ...card, deadline: "2026-10-10", endDate: null }, now)
		).toBe(false);
		expect(
			isExpired({ ...card, deadline: "2026-10-09", endDate: null }, now)
		).toBe(true);
		expect(
			isExpired({ ...card, deadline: null, endDate: "2026-10-01" }, now)
		).toBe(true);
		expect(isExpired({ ...card, deadline: null, endDate: null }, now)).toBe(
			false
		);
	});

	it("expires opportunities by their own dates, not the RSVP deadline", () => {
		const event = {
			kind: "opportunity",
			deadline: "2026-10-05",
			startDate: "2026-10-20",
			endDate: null,
		} as const;
		// The RSVP date has passed, the event hasn't happened yet.
		expect(isExpired(event, now)).toBe(false);
		expect(isExpired({ ...event, startDate: "2026-10-09" }, now)).toBe(true);
		expect(
			isExpired(
				{ ...event, startDate: "2026-10-01", endDate: "2026-10-12" },
				now
			)
		).toBe(false);
		// Only a deadline: it is the only date there is.
		expect(isExpired({ ...event, startDate: null }, now)).toBe(true);
		expect(isExpired({ ...event, startDate: null, deadline: null }, now)).toBe(
			false
		);
	});
});

describe("the coming-up tag", () => {
	const opportunity = {
		kind: "opportunity",
		deadline: null,
		startDate: null,
		endDate: null,
	} as const;

	it("says Closing soon for scholarships", () => {
		const scholarship = { ...opportunity, kind: "scholarship" } as const;
		expect(soonLabel({ ...scholarship, deadline: "2026-10-13" }, now)).toBe(
			"Closing soon · 3 days"
		);
		expect(soonLabel({ ...scholarship, deadline: "2026-10-10" }, now)).toBe(
			"Closing soon · today"
		);
		expect(soonLabel({ ...scholarship, deadline: "2026-11-30" }, now)).toBe(
			undefined
		);
	});

	it("says Happening in … for opportunities, from the start date", () => {
		expect(soonLabel({ ...opportunity, startDate: "2026-10-13" }, now)).toBe(
			"Happening in 3 days"
		);
		expect(soonLabel({ ...opportunity, startDate: "2026-10-11" }, now)).toBe(
			"Happening in 1 day"
		);
		expect(soonLabel({ ...opportunity, startDate: "2026-10-10" }, now)).toBe(
			"Happening today"
		);
		expect(soonLabel({ ...opportunity, startDate: "2026-10-25" }, now)).toBe(
			undefined
		);
	});

	it("uses the deadline when an opportunity has no start date", () => {
		expect(soonLabel({ ...opportunity, deadline: "2026-10-12" }, now)).toBe(
			"Happening in 2 days"
		);
		// The start date wins over an earlier RSVP deadline.
		expect(
			soonLabel(
				{ ...opportunity, deadline: "2026-10-11", startDate: "2026-10-20" },
				now
			)
		).toBe("Happening in 10 days");
		expect(
			soonLabel(
				{ ...opportunity, deadline: "2026-10-11", startDate: "2026-12-01" },
				now
			)
		).toBe(undefined);
	});

	it("says Happening now while a multi-day opportunity is under way", () => {
		expect(
			soonLabel(
				{ ...opportunity, startDate: "2026-10-08", endDate: "2026-10-12" },
				now
			)
		).toBe("Happening now");
		expect(
			soonLabel(
				{ ...opportunity, startDate: "2026-10-01", endDate: "2026-10-05" },
				now
			)
		).toBe(undefined);
		expect(soonLabel(opportunity, now)).toBe(undefined);
	});
});
