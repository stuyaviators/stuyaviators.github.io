import { describe, expect, it } from "vitest";
import {
	addedByLabel,
	areas,
	canAccess,
	canDelete,
	managedRoles,
	roles,
} from "./permissions.ts";

describe("what each role can reach", () => {
	it("admins can reach everything, settings included", () => {
		for (const area of areas) {
			expect(canAccess("admin", area)).toBe(true);
		}
	});

	it("only admins reach settings", () => {
		expect(roles.filter((role) => canAccess(role, "settings"))).toEqual([
			"admin",
		]);
	});

	it("officers edit all content but not people or settings", () => {
		for (const area of [
			"listings",
			"newsletters",
			"gallery",
			"testimonials",
			"crew",
			"announcement",
			"inbox",
		] as const) {
			expect(canAccess("officer", area)).toBe(true);
		}

		expect(canAccess("officer", "officers")).toBe(false);
		expect(canAccess("officer", "settings")).toBe(false);
	});

	it("contributors do cards and newsletters only", () => {
		const reach = areas.filter((area) => canAccess("contributor", area));
		expect(reach).toEqual(["listings", "newsletters"]);
	});

	it("media do gallery, testimonials and the crew only", () => {
		const reach = areas.filter((area) => canAccess("media", area));
		expect(reach).toEqual(["gallery", "testimonials", "crew"]);
	});

	it("managers do the banner, inbox and people only", () => {
		const reach = areas.filter((area) => canAccess("manager", area));
		expect(reach).toEqual(["announcement", "inbox", "officers"]);
	});

	it("uploads need an area with pictures; anyone signed in passes 'any'", () => {
		expect(canAccess("contributor", "upload")).toBe(true);
		expect(canAccess("media", "upload")).toBe(true);
		expect(canAccess("manager", "upload")).toBe(false);
		for (const role of roles) {
			expect(canAccess(role, "any")).toBe(true);
		}
	});
});

describe("deleting", () => {
	const email = "pstuyvesant60@stuy.edu";

	it("officers and admins can delete anything, owner or not", () => {
		for (const role of ["officer", "admin"] as const) {
			expect(canDelete({ role, email }, "someone@stuy.edu")).toBe(true);
			expect(canDelete({ role, email }, undefined)).toBe(true);
		}
	});

	it("other roles can delete only what they added", () => {
		for (const role of ["contributor", "media", "manager"] as const) {
			expect(canDelete({ role, email }, email)).toBe(true);
			expect(canDelete({ role, email }, email.toUpperCase())).toBe(true);
			expect(canDelete({ role, email }, "someone@stuy.edu")).toBe(false);
			expect(canDelete({ role, email }, undefined)).toBe(false);
		}
	});
});

describe("managing people", () => {
	it("admins manage every role", () => {
		expect(managedRoles("admin")).toEqual(roles);
	});

	it("managers only manage the narrowest roles, so they can't promote", () => {
		expect(managedRoles("manager")).toEqual(["contributor", "media"]);
	});

	it("nobody else manages people", () => {
		for (const role of ["officer", "contributor", "media"] as const) {
			expect(managedRoles(role)).toEqual([]);
		}
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
