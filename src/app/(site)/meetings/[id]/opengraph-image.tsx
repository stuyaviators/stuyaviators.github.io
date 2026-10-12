import { renderMarkdown } from "@/lib/markdown";
import { meetingStatusLabels } from "@/lib/meeting-options";
import { meetingWhen } from "@/lib/meeting-when";
import { getMeeting } from "@/lib/meetings";
import { renderMeetingOg } from "@/lib/og";

export const alt = "StuyAviators meeting";

const entities: Record<string, string> = {
	"&amp;": "&",
	"&lt;": "<",
	"&gt;": ">",
	"&quot;": '"',
	"&#39;": "'",
};

/**
The description as one line of plain words, cut to fit under the card's facts.
*/
function aboutText(markdown: string | undefined, limit: number) {
	if (!markdown) {
		return undefined;
	}

	const text = renderMarkdown(markdown)
		.replaceAll(/<[^<>]*>/gu, " ")
		.replaceAll(
			/&(?:amp|lt|gt|quot|#39);/gu,
			(entity) => entities[entity] ?? entity
		)
		.replaceAll(/\s+/gu, " ")
		.trim();
	if (text.length <= limit) {
		return text || undefined;
	}

	return `${text.slice(0, limit).replace(/\s+\S*$/u, "")}…`;
}

export default async function Image({
	params,
}: {
	readonly params: Promise<{ id: string }>;
}) {
	const { id } = await params;
	const meeting = await getMeeting(id);
	if (!meeting) {
		return renderMeetingOg({
			title: "Meeting",
			eyebrow: "StuyAviators",
			facts: [],
		});
	}

	const { day, time } = meetingWhen(
		new Date(meeting.start),
		meeting.end ? new Date(meeting.end) : undefined
	);
	const status =
		meeting.status === "scheduled"
			? ""
			: ` · ${meetingStatusLabels[meeting.status]}`;

	return renderMeetingOg({
		title: meeting.title.slice(0, 90),
		eyebrow: `Meeting${meeting.code ? ` · ${meeting.code}` : ""}${status}`,
		facts: [
			{ label: "Date", value: day.replace(/, \d{4}$/u, "") },
			{ label: "Time", value: time },
			{ label: "Room", value: meeting.room ?? "To be announced" },
		],
		// A long title takes two lines, so the description gets less room.
		about: aboutText(meeting.description, meeting.title.length > 40 ? 90 : 170),
	});
}

export { ogContentType as contentType, ogSize as size } from "@/lib/og";
