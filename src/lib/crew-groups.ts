/*
 * The groups on the Flight Crew page, in page order. Kept apart from
 * src/content/crew.ts (which imports the photos) so the dashboard's client
 * code can use it; crew.test.ts checks the two lists agree.
 */
export const crewGroupOptions = [
	{ id: "cockpit", title: "Cockpit Crew" },
	{ id: "officers", title: "Officers" },
	{ id: "advisors", title: "Faculty Advisors" },
	{ id: "helpers", title: "Helpers & Contributors" },
	{ id: "past", title: "Past Leadership" },
	{ id: "past-helpers", title: "Past Helpers & Contributors" },
	{ id: "past-alliance", title: "Past Alliance" },
] as const;

export type CrewGroupId = (typeof crewGroupOptions)[number]["id"];

export const crewGroupIds = crewGroupOptions.map((group) => group.id) as [
	CrewGroupId,
	...CrewGroupId[],
];
