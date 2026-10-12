/*
 * How a meeting's date and time are written: the meeting page and its Open
 * Graph card say it the same way, always in New York time.
 */
const zone = "America/New_York";

export const dayFormat = new Intl.DateTimeFormat("en-US", {
	timeZone: zone,
	weekday: "long",
	month: "long",
	day: "numeric",
	year: "numeric",
});
export const timeFormat = new Intl.DateTimeFormat("en-US", {
	timeZone: zone,
	hour: "numeric",
	minute: "2-digit",
});
const timeZoneFormat = new Intl.DateTimeFormat("en-US", {
	timeZone: zone,
	timeZoneName: "short",
	hour: "numeric",
});

export function meetingWhen(start: Date, end: Date | undefined) {
	const zoneName =
		timeZoneFormat.formatToParts(start).find((p) => p.type === "timeZoneName")
			?.value ?? "";
	const times = end
		? `${timeFormat.format(start)} – ${timeFormat.format(end)}`
		: timeFormat.format(start);
	return { day: dayFormat.format(start), time: `${times} ${zoneName}`.trim() };
}
