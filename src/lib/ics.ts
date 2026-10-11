import type { Meeting } from "@/lib/meetings";

/*
 * Calendar output (iCalendar, RFC 5545) for the meetings. Lines end in CRLF,
 * are folded at 75 bytes, and text values are escaped. Times are written in
 * UTC, so every calendar app shows them in the viewer's own time zone.
 */

const defaultLength = 60 * 60 * 1000;
const encoder = new TextEncoder();

export function escapeText(value: string) {
	return value
		.replaceAll("\\", String.raw`\\`)
		.replaceAll(/\r\n|\r|\n/gu, String.raw`\n`)
		.replaceAll(";", String.raw`\;`)
		.replaceAll(",", String.raw`\,`);
}

/**
Folds one content line to 75 bytes, never splitting a character.
*/
export function foldLine(line: string): string[] {
	const parts: string[] = [];
	let current = "";
	let size = 0;
	// Continuation lines start with a space, which counts toward the limit.
	let limit = 75;
	for (const char of line) {
		const bytes = encoder.encode(char).length;
		if (size + bytes > limit) {
			parts.push(current);
			current = " ";
			size = 1;
			limit = 75;
		}

		current += char;
		size += bytes;
	}

	parts.push(current);
	return parts;
}

function formatUtc(date: Date) {
	return date.toISOString().replaceAll(/[-:]|\.\d{3}/gu, "");
}

const statusMap = {
	scheduled: "CONFIRMED",
	moved: "CONFIRMED",
	cancelled: "CANCELLED",
} as const;

export function buildCalendar(
	meetings: readonly Meeting[],
	options: { siteUrl: string; now?: Date }
): string {
	const now = options.now ?? new Date();
	const lines = [
		"BEGIN:VCALENDAR",
		"VERSION:2.0",
		"PRODID:-//StuyAviators//Meetings//EN",
		"CALSCALE:GREGORIAN",
		"METHOD:PUBLISH",
		"X-WR-CALNAME:StuyAviators meetings",
	];

	for (const meeting of meetings) {
		const start = new Date(meeting.start);
		if (Number.isNaN(start.getTime())) {
			continue;
		}

		const parsedEnd = meeting.end ? new Date(meeting.end) : undefined;
		const end =
			parsedEnd && parsedEnd > start
				? parsedEnd
				: new Date(start.getTime() + defaultLength);
		const location = [
			"Stuyvesant High School",
			meeting.room ? `Room ${meeting.room}` : undefined,
		]
			.filter(Boolean)
			.join(", ");

		lines.push(
			"BEGIN:VEVENT",
			`UID:${meeting.id}@stuyaviators`,
			`DTSTAMP:${formatUtc(now)}`,
			`DTSTART:${formatUtc(start)}`,
			`DTEND:${formatUtc(end)}`,
			`SUMMARY:${escapeText(meeting.title)}`,
			`LOCATION:${escapeText(location)}`,
			`STATUS:${statusMap[meeting.status]}`,
			`URL:${options.siteUrl}/meetings/${meeting.id}`
		);
		if (meeting.description) {
			lines.push(`DESCRIPTION:${escapeText(meeting.description)}`);
		}

		lines.push("END:VEVENT");
	}

	lines.push("END:VCALENDAR");
	return lines.flatMap((line) => foldLine(line)).join("\r\n") + "\r\n";
}
