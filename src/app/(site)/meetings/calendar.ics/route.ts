import { site } from "@/content/site";
import { buildCalendar } from "@/lib/ics";
import { getUpcomingMeetings } from "@/lib/meetings";

export const revalidate = 3600;

/**
The meetings as an .ics file: download it to add them once, or subscribe to
the webcal:// address to keep them up to date.
*/
export async function GET() {
	const meetings = await getUpcomingMeetings(new Date(), 50);
	return new Response(buildCalendar(meetings, { siteUrl: site.url }), {
		headers: {
			"Content-Type": "text/calendar; charset=utf-8",
			"Content-Disposition": 'inline; filename="stuyaviators-meetings.ics"',
		},
	});
}
