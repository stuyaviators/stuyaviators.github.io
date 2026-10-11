import type { Meeting } from "@/lib/meetings";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import DepartureBoard from "./DepartureBoard.tsx";

const meetings: Meeting[] = [
	{
		id: "epsilon-7",
		source: "epsilon",
		title: "FSD Night",
		start: "2026-10-21T19:35:00Z",
		status: "scheduled",
	},
	{
		id: "5b1f0a0e-0f43-4d8c-9b86-1b7c4f0c2a11",
		source: "club",
		title: "Guest speaker",
		start: "2026-10-22T19:35:00Z",
		status: "cancelled",
	},
];

describe("the departure board", () => {
	it("links every row to that meeting's own page", () => {
		const html = renderToStaticMarkup(<DepartureBoard meetings={meetings} />);
		for (const meeting of meetings) {
			// Once for the table row and once for the phone layout.
			expect(html.split(`href="/meetings/${meeting.id}"`)).toHaveLength(3);
		}
	});

	it("tells people to check Epsilon when it couldn't be read but other meetings are shown", () => {
		const html = renderToStaticMarkup(
			<DepartureBoard meetings={meetings} isEpsilonUp={false} />
		);
		expect(html).toContain("Check Epsilon");
		expect(html).toContain("for the most up-to-date info.");
		expect(html).not.toContain("couldn’t be reached");
	});

	it('shows that note even where the "All meetings" link is hidden', () => {
		const html = renderToStaticMarkup(
			<DepartureBoard
				meetings={meetings}
				isEpsilonUp={false}
				showAllLink={false}
			/>
		);
		expect(html).toContain("for the most up-to-date info.");
		expect(html).not.toContain("All meetings");
	});

	it("keeps the footer quiet when Epsilon is fine and the link is hidden", () => {
		const html = renderToStaticMarkup(
			<DepartureBoard meetings={meetings} showAllLink={false} />
		);
		expect(html).not.toContain("up-to-date");
		expect(html).not.toContain("New York time");
	});

	it("shows the down notice, not rows, when the board is down", () => {
		const html = renderToStaticMarkup(
			<DepartureBoard meetings={[]} status="down" />
		);
		expect(html).toContain("Check Epsilon");
		expect(html).not.toContain("/meetings/");
	});
});
