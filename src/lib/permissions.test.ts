import { describe, expect, it } from "vitest";
import {
	addedByLabel,
	allPermissions,
	areas,
	canAccess,
	canDelete,
	grantableMask,
	hasPermission,
	isAdminMask,
	isWithin,
	maskOf,
	permissionList,
	presets,
	readMask,
	roleFor,
	roles,
} from "./permissions.ts";

describe("the permission number", () => {
	it("gives every box its own power of two, so every mix is a different number", () => {
		const values = permissionList.map((permission) => permission.value);
		expect(values).toEqual(values.map((_, index) => 2 ** index));
		expect(allPermissions).toBe(2 ** values.length - 1);
	});

	it("adds up the ticked boxes", () => {
		expect(maskOf(["listings", "newsletters"])).toBe(3);
		expect(maskOf(["listings", "newsletters", "gallery"])).toBe(7);
		expect(maskOf([])).toBe(0);
	});

	it("reads a box out of the number", () => {
		expect(hasPermission(3, "listings")).toBe(true);
		expect(hasPermission(3, "newsletters")).toBe(true);
		expect(hasPermission(3, "gallery")).toBe(false);
	});

	it("only accepts whole numbers from zero to everything", () => {
		expect(readMask(0)).toBe(0);
		expect(readMask(allPermissions)).toBe(allPermissions);
		for (const bad of [
			-1,
			1.5,
			allPermissions + 1,
			"7",
			undefined,
			Number("x"),
		]) {
			expect(readMask(bad)).toBeUndefined();
		}
	});
});

describe("the ready-made roles", () => {
	it("are Admin, Officer, Manager and Contributor", () => {
		expect(roles).toEqual(["admin", "officer", "manager", "contributor"]);
		expect(presets).toEqual({
			admin: 2047,
			officer: 623,
			manager: 103,
			contributor: 7,
		});
	});

	it("are recognised from their number, and anything else is custom", () => {
		for (const role of roles) {
			expect(roleFor(presets[role])).toBe(role);
		}

		expect(roleFor(maskOf(["listings", "crew"]))).toBe("custom");
		expect(roleFor(0)).toBe("custom");
	});

	it("only admins reach settings or manage people", () => {
		expect(
			roles.filter((role) => canAccess(presets[role], "settings"))
		).toEqual(["admin"]);
		expect(
			roles.filter((role) => canAccess(presets[role], "officers"))
		).toEqual(["admin"]);
	});

	it("contributors do cards, newsletters and the gallery", () => {
		expect(
			areas.filter((area) => canAccess(presets.contributor, area))
		).toEqual(["listings", "newsletters", "gallery"]);
	});

	it("officers are contributors plus testimonials, the banner and inbox, but not the Flight Crew", () => {
		expect(areas.filter((area) => canAccess(presets.officer, area))).toEqual([
			"listings",
			"newsletters",
			"gallery",
			"testimonials",
			"announcement",
			"inbox",
		]);
		expect(canAccess(presets.officer, "crew")).toBe(false);
		expect(hasPermission(presets.officer, "deleteOthers")).toBe(true);
	});

	it("managers are contributors plus the banner and inbox: no testimonials, no Flight Crew, no people", () => {
		expect(areas.filter((area) => canAccess(presets.manager, area))).toEqual([
			"listings",
			"newsletters",
			"gallery",
			"announcement",
			"inbox",
		]);
		expect(canAccess(presets.manager, "testimonials")).toBe(false);
		expect(canAccess(presets.manager, "crew")).toBe(false);
		expect(hasPermission(presets.manager, "deleteOthers")).toBe(false);
	});

	it("only officers and admins reach testimonials", () => {
		expect(
			roles.filter((role) => canAccess(presets[role], "testimonials"))
		).toEqual(["admin", "officer"]);
	});

	it("only admins reach the Flight Crew page", () => {
		expect(roles.filter((role) => canAccess(presets[role], "crew"))).toEqual([
			"admin",
		]);
	});

	it("uploads need a box with pictures; anyone signed in passes 'any'", () => {
		expect(canAccess(presets.contributor, "upload")).toBe(true);
		expect(canAccess(maskOf(["inbox", "announcement"]), "upload")).toBe(false);
		expect(canAccess(0, "any")).toBe(true);
	});
});

describe("deleting", () => {
	const email = "pstuyvesant60@stuy.edu";

	it("is anything for those with 'Delete other people's items'", () => {
		for (const role of ["officer", "admin"] as const) {
			const user = { permissions: presets[role], email };
			expect(canDelete(user, "someone@stuy.edu")).toBe(true);
			expect(canDelete(user, undefined)).toBe(true);
		}
	});

	it("is only your own work without it", () => {
		for (const role of ["contributor", "manager"] as const) {
			const user = { permissions: presets[role], email };
			expect(canDelete(user, email)).toBe(true);
			expect(canDelete(user, email.toUpperCase())).toBe(true);
			expect(canDelete(user, "someone@stuy.edu")).toBe(false);
			expect(canDelete(user, undefined)).toBe(false);
		}
	});

	it("can be ticked for any custom mix", () => {
		const user = {
			permissions: maskOf(["gallery", "deleteOthers"]),
			email,
		};
		expect(canDelete(user, "someone@stuy.edu")).toBe(true);
	});
});

describe("giving boxes to other people", () => {
	it("admins (settings and people) can give every box", () => {
		expect(isAdminMask(presets.admin)).toBe(true);
		expect(grantableMask(presets.admin)).toBe(allPermissions);
	});

	it("no ready-made role but Admin can give anything", () => {
		for (const role of ["officer", "manager", "contributor"] as const) {
			expect(grantableMask(presets[role])).toBe(0);
		}
	});

	it("a custom 'Manage people' without settings can only give the plain content boxes", () => {
		const given = grantableMask(maskOf(["officers", "gallery"]));
		expect(given).toBe(
			maskOf(["listings", "newsletters", "gallery", "testimonials", "crew"])
		);
		expect(isWithin(presets.contributor, given)).toBe(true);
		for (const role of ["officer", "manager", "admin"] as const) {
			expect(isWithin(presets[role], given)).toBe(false);
		}
	});

	it("a custom mix with settings and people counts as an admin", () => {
		expect(isAdminMask(maskOf(["settings", "officers", "gallery"]))).toBe(true);
		expect(isAdminMask(maskOf(["settings"]))).toBe(false);
	});
});

describe("addedByLabel", () => {
	const names = { "peter@stuy.edu": "Peter Stuyvesant" };

	it("uses the name when known, else the email", () => {
		expect(addedByLabel("Peter@stuy.edu", names)).toBe(
			"Added by Peter Stuyvesant"
		);
		expect(addedByLabel("gone@stuy.edu", names)).toBe("Added by gone@stuy.edu");
	});

	it("says nothing when nobody is recorded", () => {
		expect(addedByLabel(undefined, names)).toBeUndefined();
		expect(addedByLabel("", names)).toBeUndefined();
	});
});
