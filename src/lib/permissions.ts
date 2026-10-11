/*
 * Who may do what in the dashboard. A role is a set of areas it can edit, and
 * some roles can only delete what they added themselves, so one account can't
 * wipe out other people's work. Pure data and rules, safe in the browser too
 * (the dashboard uses it to hide what you can't use); the server checks the
 * same rules again on every action.
 */

export const roles = [
	"admin",
	"officer",
	"manager",
	"contributor",
	"media",
] as const;
export type RoleName = (typeof roles)[number];

export const areas = [
	"listings",
	"newsletters",
	"gallery",
	"testimonials",
	"crew",
	"announcement",
	"inbox",
	"officers",
	"settings",
] as const;
export type Area = (typeof areas)[number];

/**
What a page or action needs: an area of the dashboard, "upload" (any area
with pictures), or "any" (just being signed in).
*/
export type Access = Area | "upload" | "any";

const contentAreas: readonly Area[] = [
	"listings",
	"newsletters",
	"gallery",
	"testimonials",
	"crew",
	"announcement",
	"inbox",
];

const rolePermissions: Record<RoleName, readonly Area[]> = {
	admin: areas,
	officer: contentAreas,
	manager: ["announcement", "inbox", "officers"],
	contributor: ["listings", "newsletters"],
	media: ["gallery", "testimonials", "crew"],
};

const uploadAreas: readonly Area[] = [
	"listings",
	"newsletters",
	"gallery",
	"testimonials",
	"crew",
];

export function canAccess(role: RoleName, access: Access): boolean {
	if (access === "any") {
		return true;
	}

	const granted = rolePermissions[role];
	return access === "upload"
		? uploadAreas.some((area) => granted.includes(area))
		: granted.includes(access);
}

/**
Officers and admins may delete anything they can edit; everyone else only what
they added themselves. Things nobody is recorded as adding (imported, older)
can only be deleted by an officer or admin.
*/
export function canDelete(
	user: { role: RoleName; email: string },
	addedBy: string | undefined
): boolean {
	return (
		user.role === "admin" ||
		user.role === "officer" ||
		addedBy?.toLowerCase() === user.email.toLowerCase()
	);
}

/**
"Added by Peter Stuyvesant", or nothing when no one is recorded.
*/
export function addedByLabel(
	email: string | undefined,
	names: Record<string, string>
): string | undefined {
	return email === undefined || email === ""
		? undefined
		: `Added by ${names[email.toLowerCase()] ?? email}`;
}

/**
The roles someone may give to, or take away from, other people. Admins
manage everyone; managers only the narrowest roles, so the role that manages
people can't promote anyone (or itself) past that.
*/
export function managedRoles(role: RoleName): readonly RoleName[] {
	if (role === "admin") {
		return roles;
	}

	return role === "manager" ? ["contributor", "media"] : [];
}

export const roleLabels: Record<RoleName, string> = {
	admin: "Admin",
	officer: "Officer",
	manager: "Manager",
	contributor: "Contributor",
	media: "Media",
};

export const roleDescriptions: Record<RoleName, string> = {
	admin: "Everything, including settings and all roles.",
	officer:
		"All content: opportunities, scholarships, newsletters, Flight Crew, gallery, testimonials, the banner and the inbox. Can delete anything.",
	manager:
		"The banner and the inbox, and adding or removing Contributors and Media. Deletes only what they added.",
	contributor:
		"Opportunities, scholarships and newsletters. Deletes only what they added.",
	media:
		"Gallery, testimonials and the Flight Crew page. Deletes only what they added.",
};
