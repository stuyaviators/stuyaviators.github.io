import { describe, expect, it } from "vitest";
import { parseEpsilonMeetings } from "./meetings.ts";

describe("parseEpsilonMeetings", () => {
	it("maps Epsilon meetings and skips private ones", () => {
		const meetings = parseEpsilonMeetings([
			{
				meetings: [
					{
						id: 1,
						title: " FSD Night ",
						start_time: "2026-10-21T19:35:00+00:00",
						end_time: null,
						is_public: true,
						rooms: { name: "313" },
					},
					{
						id: 2,
						title: "Officers only",
						start_time: "2026-10-22T19:35:00+00:00",
						is_public: false,
						rooms: null,
					},
				],
			},
		]);
		expect(meetings).toEqual([
			{
				id: "epsilon-1",
				source: "epsilon",
				title: "FSD Night",
				code: "FSD",
				start: "2026-10-21T19:35:00+00:00",
				end: undefined,
				room: "313",
				status: "scheduled",
				description: undefined,
			},
		]);
	});

	it("throws on an unexpected payload so the board is shown as down", () => {
		expect(() => parseEpsilonMeetings({ message: "JWT expired" })).toThrow();
	});
});
