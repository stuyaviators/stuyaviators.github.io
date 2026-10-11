/* eslint-disable no-bitwise -- the permission number is a bit mask by design: each box is a power of two. */

/*
 * Who may do what in the dashboard. Each person has a permission number: one
 * value per box that is ticked, added together (opportunities and scholarships
 * 1, newsletters 2, gallery 4 …). The roles (Officer, Contributor …) are just
 * presets that tick a ready-made set of boxes; any mix of boxes is allowed.
 * Pure data and rules, safe in the browser too (the dashboard uses it to hide
 * what you can't use); the server checks the same rules again on every action.
 */

export type Permission = {
	key: PermissionKey;
	label: string;
	hint: string;
	value: number;
	// Only shown to people who can give it (admins); everyone else never sees it.
	isSecret?: boolean;
};

const permissionKeys = [
	"listings",
	"newsletters",
	"gallery",
	"testimonials",
	"crew",
	"announcement",
	"inbox",
	"officers",
	"settings",
	"deleteOthers",
	"trash",
] as const;
export type PermissionKey = (typeof permissionKeys)[number];

/**
The boxes, in order. Each value is a power of two, so every combination adds
up to a different number.
*/
export const permissionList: readonly Permission[] = [
	{
		key: "listings",
		label: "Opportunities & scholarships",
		hint: "Add, edit and publish cards",
		value: 1,
	},
	{
		key: "newsletters",
		label: "Newsletters",
		hint: "Build and publish newsletters",
		value: 2,
	},
	{
		key: "gallery",
		label: "Gallery",
		hint: "Add and edit photos",
		value: 4,
	},
	{
		key: "testimonials",
		label: "Testimonials",
		hint: "Add and edit quotes",
		value: 8,
	},
	{
		key: "crew",
		label: "Flight Crew",
		hint: "Edit the people on the Flight Crew page",
		value: 16,
	},
	{
		key: "announcement",
		label: "Announcement banner",
		hint: "Change the site-wide banner",
		value: 32,
	},
	{
		key: "inbox",
		label: "Inbox",
		hint: "Read and sort messages",
		value: 64,
	},
	{
		key: "officers",
		label: "Manage people",
		hint: "Add people and change their boxes (never more than you can give)",
		value: 128,
	},
	{
		key: "settings",
		label: "Settings",
		hint: "The Epsilon token and other site settings",
		value: 256,
	},
	{
		key: "deleteOthers",
		label: "Delete other people’s items",
		hint: "Without this, you can only delete what you added",
		value: 512,
	},
	{
		key: "trash",
		label: "Trash",
		hint: "Everything anyone deletes waits here for 30 days. Only this can see it, restore from it or delete for good",
		value: 1024,
		isSecret: true,
	},
];

export const allPermissions = permissionList.reduce(
	(sum, permission) => sum + permission.value,
	0
);

const valueOf = Object.fromEntries(
	permissionList.map((permission) => [permission.key, permission.value])
) as Record<PermissionKey, number>;

export function maskOf(keys: readonly PermissionKey[]): number {
	return keys.reduce((sum, key) => sum + valueOf[key], 0);
}

/**
What a page or action needs: one box of the dashboard, "upload" (any area
with pictures), or "any" (just being signed in).
*/
export type Access = Exclude<PermissionKey, "deleteOthers"> | "upload" | "any";

export const areas = permissionKeys.filter(
	(key): key is Exclude<PermissionKey, "deleteOthers"> => key !== "deleteOthers"
);

export const roles = ["admin", "officer", "manager", "contributor"] as const;
export type RoleName = (typeof roles)[number];
/*
 * What is stored: a preset's name, "custom" for any other mix of boxes, or
 * the retired "media" preset (still a value in the database).
 */
export type StoredRole = RoleName | "custom" | "media";

/**
The ready-made sets of boxes.
*/
export const presets: Record<RoleName, number> = {
	admin: allPermissions,
	officer: maskOf([
		"listings",
		"newsletters",
		"gallery",
		"testimonials",
		"announcement",
		"inbox",
		"deleteOthers",
	]),
	manager: maskOf([
		"listings",
		"newsletters",
		"gallery",
		"announcement",
		"inbox",
	]),
	contributor: maskOf(["listings", "newsletters", "gallery"]),
};

const uploadMask = maskOf([
	"listings",
	"newsletters",
	"gallery",
	"testimonials",
	"crew",
]);

/**
Is this box ticked in the permission number?
*/
export function hasPermission(mask: number, key: PermissionKey): boolean {
	return (mask & valueOf[key]) !== 0;
}

export function canAccess(mask: number, access: Access): boolean {
	if (access === "any") {
		return true;
	}

	return access === "upload"
		? (mask & uploadMask) !== 0
		: hasPermission(mask, access);
}

/**
Without "Delete other people's items" you can only delete what you added.
Things nobody is recorded as adding (imported or older ones) then need
someone who has it.
*/
export function canDelete(
	user: { permissions: number; email: string },
	addedBy: string | undefined
): boolean {
	return (
		hasPermission(user.permissions, "deleteOthers") ||
		addedBy?.toLowerCase() === user.email.toLowerCase()
	);
}

/**
Someone who can reach settings and manage people: the club always keeps at
least one of these.
*/
export const adminMask = maskOf(["officers", "settings"]);

export function isAdminMask(mask: number): boolean {
	return (mask & adminMask) === adminMask;
}

const contentMask = maskOf([
	"listings",
	"newsletters",
	"gallery",
	"testimonials",
	"crew",
]);

/**
The boxes a person may tick for someone else. Admins can give any; someone
who only manages people can give the plain content boxes, never "Manage
people", settings, deleting or the banner and inbox, so that permission can't
be used to climb past what it holds.
*/
export function grantableMask(mask: number): number {
	if (!hasPermission(mask, "officers")) {
		return 0;
	}

	return isAdminMask(mask) ? allPermissions : contentMask;
}

/**
True when every box in `mask` is also in `allowed`.
*/
export function isWithin(mask: number, allowed: number): boolean {
	return (mask & ~allowed) === 0;
}

/**
A whole number from zero up to everything, or undefined.
*/
export function readMask(value: unknown): number | undefined {
	return typeof value === "number" &&
		Number.isSafeInteger(value) &&
		value >= 0 &&
		value <= allPermissions
		? value
		: undefined;
}

/**
The preset these boxes add up to, or "custom".
*/
export function roleFor(mask: number): StoredRole {
	return roles.find((role) => presets[role] === mask) ?? "custom";
}

export const roleLabels: Record<StoredRole, string> = {
	admin: "Admin",
	officer: "Officer",
	manager: "Manager",
	contributor: "Contributor",
	media: "Media (retired)",
	custom: "Custom",
};

export const roleDescriptions: Record<RoleName, string> = {
	admin: "Everything, including settings and who can do what.",
	officer:
		"Opportunities, scholarships, newsletters, gallery, testimonials, the banner and the inbox. Not the Flight Crew page. Can delete anything.",
	manager:
		"Everything a Contributor does, plus the banner and the inbox. Not testimonials or the Flight Crew page, and can't manage people. Deletes only what they added.",
	contributor:
		"Opportunities, scholarships, newsletters and the gallery. Deletes only what they added.",
};

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
