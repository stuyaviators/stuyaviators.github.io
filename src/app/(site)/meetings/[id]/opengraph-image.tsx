import { readFile } from "node:fs/promises";
import { getMeeting } from "@/lib/meetings";
import { renderOg } from "@/lib/og";

export const alt = "StuyAviators meeting";

const zone = "America/New_York";
const dayFormat = new Intl.DateTimeFormat("en-US", {
	timeZone: zone,
	weekday: "long",
	month: "long",
	day: "numeric",
});
const timeFormat = new Intl.DateTimeFormat("en-US", {
	timeZone: zone,
	hour: "numeric",
	minute: "2-digit",
});

export default async function Image({
	params,
}: {
	readonly params: Promise<{ id: string }>;
}) {
	const { id } = await params;
	const meeting = await getMeeting(id);
	const photo = await readFile(
		new URL("../../../../assets/photos/hero-sim-setup.jpg", import.meta.url)
	);
	if (!meeting) {
		return renderOg({ title: "Meeting", eyebrow: "StuyAviators", photo });
	}

	const start = new Date(meeting.start);
	const detail = [
		`${dayFormat.format(start)}, ${timeFormat.format(start)}`,
		meeting.room ? `Room ${meeting.room}` : undefined,
	]
		.filter(Boolean)
		.join(" · ");

	return renderOg({
		title: meeting.title.slice(0, 90),
		eyebrow: `Meeting${meeting.code ? ` · ${meeting.code}` : ""}`,
		photo,
		detail,
	});
}

export { ogContentType as contentType, ogSize as size } from "@/lib/og";
