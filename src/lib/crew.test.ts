import type { Database } from "@/db";
import { crewGroups } from "@/content/crew";
import { crewGroupOptions } from "@/lib/crew-groups";
import { createTestDb } from "@/test/pglite";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/db", () => ({ getDb: () => undefined }));
vi.mock("next/cache", () => ({
	unstable_cache: <T>(function_: T) => function_,
}));

const {
	addCrewMember,
	crewMemberSchema,
	deleteCrewMember,
	getPublicCrew,
	importStaticCrew,
	listCrewRows,
	moveCrewMember,
	toPublicCrew,
	updateCrewMember,
} = await import("./crew.ts");

let db: Database;
beforeEach(async () => {
	db = await createTestDb();
});

const person = {
	groupId: "helpers" as const,
	name: "Peter Stuyvesant",
	classOf: "'60",
	role: "Flight Attendant (Helper)",
	imageUrl: "",
};

describe("crew groups", () => {
	it("match the groups in src/content/crew.ts", () => {
		expect(crewGroupOptions.slice(0, -1).map((group) => group.id)).toEqual(
			crewGroups.map((group) => group.id)
		);
		expect(crewGroupOptions.slice(0, -1).map((group) => group.title)).toEqual(
			crewGroups.map((group) => group.title)
		);
	});
});

describe("importing the bundled crew", () => {
	it("copies everyone once, keeping order and photo keys", async () => {
		const total =
			crewGroups.reduce((sum, group) => sum + group.members.length, 0) + 1;
		expect(await importStaticCrew(db)).toBe(total);
		expect(await importStaticCrew(db)).toBe(0);

		const rows = await listCrewRows(db);
		expect(rows).toHaveLength(total);
		const andrew = rows.find((row) => row.name === "Andrew Zhang");
		expect(andrew).toMatchObject({
			groupId: "cockpit",
			photoKey: "andrew-zhang",
			sortOrder: 0,
		});
		expect(rows.find((row) => row.groupId === "past-alliance")?.name).toBe(
			"Esther Lee"
		);
	});

	it("renders the same page data as the bundled roster", async () => {
		await importStaticCrew(db);
		const crew = toPublicCrew(await listCrewRows(db));
		expect(crew.groups.map((group) => group.id)).toEqual(
			crewGroups.map((group) => group.id)
		);
		for (const [index, group] of crewGroups.entries()) {
			const imported = crew.groups.at(index)?.members ?? [];
			expect(imported.map((member) => member.name)).toEqual(
				group.members.map((member) => member.name)
			);
			expect(imported.map((member) => member.photo)).toEqual(
				group.members.map((member) => member.photo)
			);
		}
	});

	it("is the fallback while the database has no crew", async () => {
		expect((await getPublicCrew()).groups).toBe(crewGroups);
	});
});

describe("managing people", () => {
	it("adds to the end of a group, edits, and removes", async () => {
		await addCrewMember(db, person, "a@b.co");
		await addCrewMember(db, { ...person, name: "Second" }, "a@b.co");
		const [first, second] = await listCrewRows(db);
		expect(first?.sortOrder).toBe(0);
		expect(second?.sortOrder).toBe(1);

		const updated = await updateCrewMember(
			db,
			second?.id ?? "",
			{ ...person, name: "Renamed", classOf: "" },
			"a@b.co"
		);
		expect(updated).toMatchObject({ name: "Renamed", classOf: null });
		expect(await deleteCrewMember(db, second?.id ?? "")).toBe(1);
		expect(await deleteCrewMember(db, second?.id ?? "")).toBe(0);
		expect(await listCrewRows(db)).toHaveLength(1);
	});

	it("moving to another group puts them last there", async () => {
		await addCrewMember(db, person, "a@b.co");
		await addCrewMember(db, { ...person, groupId: "past", name: "Old" }, "a");
		const [mine] = await listCrewRows(db);
		const moved = await updateCrewMember(
			db,
			mine?.id ?? "",
			{ ...person, groupId: "past" },
			"a"
		);
		expect(moved?.groupId).toBe("past");
		expect(moved?.sortOrder).toBe(1);
	});

	it("a new upload replaces the bundled photo, and keeping it leaves it alone", async () => {
		await importStaticCrew(db);
		const rows = await listCrewRows(db);
		const andrew = rows.find((row) => row.name === "Andrew Zhang");
		const base = {
			groupId: "cockpit" as const,
			name: "Andrew Zhang",
			classOf: "'27",
			role: "Captain (Co-President)",
			imageUrl: "",
		};
		const kept = await updateCrewMember(db, andrew?.id ?? "", base, "a");
		expect(kept?.photoKey).toBe("andrew-zhang");

		const url = "https://abc.public.blob.vercel-storage.com/headshot/x.jpg";
		const replaced = await updateCrewMember(
			db,
			andrew?.id ?? "",
			{ ...base, imageUrl: url },
			"a"
		);
		expect(replaced).toMatchObject({ imageUrl: url, photoKey: null });
	});

	it("moves up and down within the group only", async () => {
		await addCrewMember(db, { ...person, name: "A" }, "a");
		await addCrewMember(db, { ...person, name: "B" }, "a");
		await addCrewMember(db, { ...person, name: "C" }, "a");
		await addCrewMember(db, { ...person, groupId: "past", name: "Other" }, "a");
		const find = async (name: string) =>
			(await listCrewRows(db)).find((row) => row.name === name);
		const names = async () =>
			(await listCrewRows(db))
				.filter((row) => row.groupId === "helpers")
				.map((row) => row.name);

		await moveCrewMember(db, (await find("C"))?.id ?? "", "up");
		expect(await names()).toEqual(["A", "C", "B"]);
		await moveCrewMember(db, (await find("A"))?.id ?? "", "up");
		expect(await names()).toEqual(["A", "C", "B"]);
		await moveCrewMember(db, (await find("A"))?.id ?? "", "down");
		expect(await names()).toEqual(["C", "A", "B"]);
		expect(
			await moveCrewMember(db, "00000000-0000-4000-8000-000000000000", "up")
		).toBeUndefined();
	});

	it("shows an uploaded photo on the page", async () => {
		const url = "https://abc.public.blob.vercel-storage.com/headshot/x.jpg";
		await addCrewMember(db, { ...person, imageUrl: url }, "a");
		const crew = toPublicCrew(await listCrewRows(db));
		const helpers = crew.groups.find((group) => group.id === "helpers");
		expect(helpers?.members.at(0)?.photo).toMatchObject({ src: url });
	});
});

describe("validation", () => {
	it("accepts blob photos only, and trims text", () => {
		const parse = (imageUrl: string) =>
			crewMemberSchema.safeParse({ ...person, imageUrl });
		expect(parse("").success).toBe(true);
		expect(
			parse("https://abc.public.blob.vercel-storage.com/a.jpg").success
		).toBe(true);
		expect(parse("https://example.org/a.jpg").success).toBe(false);
		expect(
			parse("http://abc.public.blob.vercel-storage.com/a.jpg").success
		).toBe(false);
		expect(parse("javascript:alert(1)").success).toBe(false);
	});

	it("rejects blank names, unknown groups and long text", () => {
		expect(crewMemberSchema.safeParse({ ...person, name: " " }).success).toBe(
			false
		);
		expect(
			crewMemberSchema.safeParse({ ...person, groupId: "nope" }).success
		).toBe(false);
		expect(
			crewMemberSchema.safeParse({ ...person, role: "x".repeat(121) }).success
		).toBe(false);
	});
});
