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
		expect(maskOf(["gallery", "testimonials", "crew"])).toBe(28);
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
	it("match the numbers saved in the database migration", () => {
		expect(presets).toEqual({
			admin: 1023,
			officer: 639,
			manager: 224,
			contributor: 3,
			media: 28,
		});
	});

	it("are recognised from their number, and anything else is custom", () => {
		for (const role of roles) {
			expect(roleFor(presets[role])).toBe(role);
		}

		expect(roleFor(maskOf(["listings", "gallery"]))).toBe("custom");
		expect(roleFor(0)).toBe("custom");
	});

	it("only admins reach settings", () => {
		expect(
			roles.filter((role) => canAccess(presets[role], "settings"))
		).toEqual(["admin"]);
	});

	it("officers edit all content, delete anything, but not people or settings", () => {
		for (const area of [
			"listings",
			"newsletters",
			"gallery",
			"testimonials",
			"crew",
			"announcement",
			"inbox",
		] as const) {
			expect(canAccess(presets.officer, area)).toBe(true);
		}

		expect(canAccess(presets.officer, "officers")).toBe(false);
		expect(canAccess(presets.officer, "settings")).toBe(false);
		expect(hasPermission(presets.officer, "deleteOthers")).toBe(true);
	});

	it("contributors do cards and newsletters only", () => {
		expect(
			areas.filter((area) => canAccess(presets.contributor, area))
		).toEqual(["listings", "newsletters"]);
	});

	it("media do gallery, testimonials and the crew only", () => {
		expect(areas.filter((area) => canAccess(presets.media, area))).toEqual([
			"gallery",
			"testimonials",
			"crew",
		]);
	});

	it("managers do the banner, inbox and people only", () => {
		expect(areas.filter((area) => canAccess(presets.manager, area))).toEqual([
			"announcement",
			"inbox",
			"officers",
		]);
	});

	it("uploads need a box with pictures; anyone signed in passes 'any'", () => {
		expect(canAccess(presets.contributor, "upload")).toBe(true);
		expect(canAccess(presets.media, "upload")).toBe(true);
		expect(canAccess(presets.manager, "upload")).toBe(false);
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
		for (const role of ["contributor", "media", "manager"] as const) {
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

	it("a manager can only give the plain content boxes, so it can't climb", () => {
		const given = grantableMask(presets.manager);
		expect(given).toBe(
			maskOf(["listings", "newsletters", "gallery", "testimonials", "crew"])
		);
		expect(isWithin(presets.contributor, given)).toBe(true);
		expect(isWithin(presets.media, given)).toBe(true);
		for (const role of ["officer", "manager", "admin"] as const) {
			expect(isWithin(presets[role], given)).toBe(false);
		}
	});

	it("without 'Manage people' you can give nothing", () => {
		for (const role of ["officer", "contributor", "media"] as const) {
			expect(grantableMask(presets[role])).toBe(0);
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
