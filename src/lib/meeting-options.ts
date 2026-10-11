import { meetings as meetingsContent } from "@/content/meetings";

/*
 * The fixed choices for a meeting, free of any server code so the dashboard
 * form (a client component) can use them too.
 */

export const meetingStatuses = ["scheduled", "moved", "cancelled"] as const;
export const meetingStatusLabels: Record<
	(typeof meetingStatuses)[number],
	string
> = {
	scheduled: "On time",
	moved: "Moved",
	cancelled: "Cancelled",
};

/**
The meeting types an officer can pick: the codes from the Meetings page.
*/
export const meetingTypes = meetingsContent.types.flatMap((type) =>
	type.code ? [{ code: type.code, name: type.name }] : []
);

/**
New meetings start and end at the club's usual after-school times (New York
time, 24-hour clock, as a time box wants them).
*/
export const defaultStartTime = "15:35";
export const defaultEndTime = "17:00";
