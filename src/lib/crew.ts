import type { CrewGroup, CrewMember } from "@/content/crew";
import type { Database } from "@/db";
import {
	crewGroups,
	crewPhotoKey,
	pastAllianceMembers,
	staticCrewPhotos,
} from "@/content/crew";
import { getDb } from "@/db";
import { crewMembers } from "@/db/schema";
import { optionalBlobUrl } from "@/lib/blob-url";
import { crewGroupIds } from "@/lib/crew-groups";
import { and, asc, eq, isNull, sql } from "drizzle-orm";
import { unstable_cache } from "next/cache";
import { z } from "zod";

/*
 * The flight crew, edited in the dashboard. Group titles and intro text stay
 * in src/content/crew.ts; this table holds the people. Until someone is
 * imported (or added), the public page keeps showing the bundled roster.
 */

export const crewTag = "crew";

export type CrewRow = typeof crewMembers.$inferSelect;

export const crewMemberSchema = z.object({
	groupId: z.enum(crewGroupIds),
	name: z.string().trim().min(1, "Enter a name").max(80),
	classOf: z.string().trim().max(10),
	role: z.string().trim().min(1, "Enter a role").max(120),
	imageUrl: optionalBlobUrl,
});

export type CrewMemberInput = z.infer<typeof crewMemberSchema>;

async function findCrewRow(db: Database, id: string) {
	const rows = await db
		.select()
		.from(crewMembers)
		.where(eq(crewMembers.id, id))
		.limit(1);
	return rows.at(0);
}

export async function listCrewRows(db: Database): Promise<CrewRow[]> {
	return db
		.select()
		.from(crewMembers)
		.where(isNull(crewMembers.deletedAt))
		.orderBy(asc(crewMembers.sortOrder), asc(crewMembers.createdAt));
}

async function nextSortOrder(db: Database, groupId: string) {
	const rows = await db
		.select({
			next: sql<number>`coalesce(max(${crewMembers.sortOrder}) + 1, 0)::int`,
		})
		.from(crewMembers)
		.where(eq(crewMembers.groupId, groupId));
	return rows.at(0)?.next ?? 0;
}

export async function addCrewMember(
	db: Database,
	input: CrewMemberInput,
	by: string
) {
	await db.insert(crewMembers).values({
		groupId: input.groupId,
		name: input.name,
		classOf: input.classOf || null,
		role: input.role,
		imageUrl: input.imageUrl || null,
		photoKey: null,
		sortOrder: await nextSortOrder(db, input.groupId),
		createdBy: by,
		updatedBy: by,
	});
}

/**
Returns the updated row, or undefined when the person was removed meanwhile.
*/
export async function updateCrewMember(
	db: Database,
	id: string,
	input: CrewMemberInput,
	by: string
): Promise<CrewRow | undefined> {
	const current = await findCrewRow(db, id);
	if (!current) {
		return undefined;
	}

	const isMoving = current.groupId !== input.groupId;
	const rows = await db
		.update(crewMembers)
		.set({
			groupId: input.groupId,
			name: input.name,
			classOf: input.classOf || null,
			role: input.role,
			imageUrl: input.imageUrl || null,
			// A new upload replaces the bundled photo; clearing it removes both.
			photoKey:
				input.imageUrl === "" && current.imageUrl === null
					? current.photoKey
					: null,
			sortOrder: isMoving
				? await nextSortOrder(db, input.groupId)
				: current.sortOrder,
			updatedAt: new Date(),
			updatedBy: by,
		})
		.where(eq(crewMembers.id, id))
		.returning();
	return rows.at(0);
}

/**
Moves a person one place within their group.
*/
export async function moveCrewMember(
	db: Database,
	id: string,
	direction: "up" | "down"
): Promise<CrewRow | undefined> {
	const current = await findCrewRow(db, id);
	if (!current) {
		return undefined;
	}

	const group = await db
		.select({ id: crewMembers.id })
		.from(crewMembers)
		.where(eq(crewMembers.groupId, current.groupId))
		.orderBy(asc(crewMembers.sortOrder), asc(crewMembers.createdAt));
	const ids = group.map((row) => row.id);
	const index = ids.indexOf(id);
	const target = direction === "up" ? index - 1 : index + 1;
	if (target >= 0 && target < ids.length) {
		ids.splice(target, 0, ...ids.splice(index, 1));
		await Promise.all(
			ids.map(async (memberId, order) =>
				db
					.update(crewMembers)
					.set({ sortOrder: order })
					.where(
						and(
							eq(crewMembers.id, memberId),
							sql`${crewMembers.sortOrder} <> ${order}`
						)
					)
			)
		);
	}

	return current;
}

/**
Copies the roster in src/content/crew.ts into the table. Only when the table
is empty, so it can't duplicate people. Returns how many were added.
*/
export async function importStaticCrew(db: Database): Promise<number> {
	const existing = await db
		.select({ id: crewMembers.id })
		.from(crewMembers)
		.limit(1);
	if (existing.length > 0) {
		return 0;
	}

	const groups = [
		...crewGroups,
		{ id: "past-alliance", members: pastAllianceMembers },
	];
	const rows = groups.flatMap((group) =>
		group.members.map((member, order) => ({
			groupId: group.id,
			name: member.name,
			classOf: member.classOf ?? null,
			role: member.role,
			photoKey: member.photo ? crewPhotoKey(member.name) : null,
			sortOrder: order,
			updatedBy: "import",
		}))
	);
	await db.insert(crewMembers).values(rows);
	return rows.length;
}

function toMember(row: CrewRow): CrewMember {
	const bundled = row.photoKey ? staticCrewPhotos[row.photoKey] : undefined;
	return {
		name: row.name,
		classOf: row.classOf ?? undefined,
		role: row.role,
		photo: row.imageUrl
			? { src: row.imageUrl, width: 640, height: 640 }
			: bundled,
	};
}

export type PublicCrew = { groups: CrewGroup[]; pastExtra: CrewMember[] };

export function toPublicCrew(rows: readonly CrewRow[]): PublicCrew {
	return {
		groups: crewGroups.map((group) => ({
			...group,
			members: rows
				.filter((row) => row.groupId === group.id)
				.map((row) => toMember(row)),
		})),
		pastExtra: rows
			.filter((row) => row.groupId === "past-alliance")
			.map((row) => toMember(row)),
	};
}

/**
What the public page shows: the database roster, or the bundled one while
the table is empty or unreachable.
*/
export const getPublicCrew = unstable_cache(
	async (): Promise<PublicCrew> => {
		const db = getDb();
		if (db) {
			try {
				const rows = await listCrewRows(db);
				if (rows.length > 0) {
					return toPublicCrew(rows);
				}
			} catch (error) {
				console.error("Could not load the crew", error);
			}
		}

		return { groups: crewGroups, pastExtra: pastAllianceMembers };
	},
	["crew"],
	{ tags: [crewTag], revalidate: 3600 }
);
