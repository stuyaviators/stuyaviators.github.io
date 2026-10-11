import { site } from "@/content/site";
import { buildCalendar } from "@/lib/ics";
import { getMeetingBoard } from "@/lib/meetings";

/**
The meetings as an .ics file: download it to add them once, or subscribe to
the webcal:// address to keep them up to date. When Epsilon can't be read the
answer is "try again later" (503), not an empty calendar, so subscribed
calendars keep the events they already have.
*/
export async function GET() {
	const board = await getMeetingBoard(new Date(), 50);
	if (!board.isUp) {
		return new Response("The meetings board is down. Try again later.", {
			status: 503,
			headers: {
				"Content-Type": "text/plain; charset=utf-8",
				"Retry-After": "900",
				"Cache-Control": "no-store",
			},
		});
	}

	return new Response(buildCalendar(board.meetings, { siteUrl: site.url }), {
		headers: {
			"Content-Type": "text/calendar; charset=utf-8",
			"Content-Disposition": 'inline; filename="stuyaviators-meetings.ics"',
			"Cache-Control": "public, max-age=900, s-maxage=900",
		},
	});
}
