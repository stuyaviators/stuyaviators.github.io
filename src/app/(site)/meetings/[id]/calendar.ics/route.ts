import { site } from "@/content/site";
import { buildCalendar } from "@/lib/ics";
import { getMeeting } from "@/lib/meetings";

/**
One meeting as an .ics file, for the "Add to calendar" button on its page.
*/
export async function GET(
	_request: Request,
	{ params }: { readonly params: Promise<{ id: string }> }
) {
	const { id } = await params;
	const meeting = await getMeeting(id);
	if (!meeting) {
		return new Response("There is no such meeting.", {
			status: 404,
			headers: { "Content-Type": "text/plain; charset=utf-8" },
		});
	}

	return new Response(buildCalendar([meeting], { siteUrl: site.url }), {
		headers: {
			"Content-Type": "text/calendar; charset=utf-8",
			"Content-Disposition": 'inline; filename="stuyaviators-meeting.ics"',
			"Cache-Control": "public, max-age=900, s-maxage=900",
		},
	});
}
