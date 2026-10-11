import type { Database } from "@/db";
import type { Listing, ListingKind } from "@/lib/listings";
import { listings } from "@/db/schema";
import { listingSlug } from "@/lib/listing-slug";
import { optionalUrl } from "@/lib/newsletter/types";
import { and, asc, desc, eq, isNotNull, isNull, like, sql } from "drizzle-orm";
import { z } from "zod";

/*
 * Dashboard side of opportunities and scholarships: validation, create/edit,
 * ordering and soft delete (deleted cards go to a trash and can be restored).
 */

const date = z
	.string()
	.trim()
	.refine((value) => value === "" || /^\d{4}-\d{2}-\d{2}$/u.test(value), {
		message: "Use a date like 2026-11-01",
	})
	.transform((value) => value || undefined);

const optionalText = (max: number) =>
	z
		.string()
		.trim()
		.max(max)
		.transform((value) => value || undefined);

export const listingInput = z
	.object({
		kind: z.enum(["opportunity", "scholarship"]),
		title: z.string().trim().min(1, "Add a title").max(160),
		organization: z
			.string()
			.trim()
			.min(1, "Add the organization or provider")
			.max(120),
		summary: z
			.string()
			.trim()
			.min(1, "Add a short description")
			.max(400, "Keep the short description under 400 characters"),
		description: optionalText(8000),
		url: optionalUrl.refine((value) => value !== "", {
			message: "Add the link people should visit",
		}),
		imageUrl: optionalUrl.transform((value) => value || undefined),
		deadline: date,
		amount: optionalText(60),
		startDate: date,
		endDate: date,
		location: optionalText(120),
		eligibility: optionalText(160),
		tags: z
			.string()
			.max(400)
			.transform((value) =>
				[
					...new Set(
						value
							.split(",")
							.map((tag) => tag.trim())
							.filter(Boolean)
					),
				].slice(0, 12)
			),
		featured: z.boolean(),
		status: z.enum(["draft", "published"]),
	})
	.refine(
		(value) =>
			!value.startDate || !value.endDate || value.startDate <= value.endDate,
		{ message: "The end date is before the start date", path: ["endDate"] }
	);

export type ListingInput = z.input<typeof listingInput>;
export type ListingValues = z.output<typeof listingInput>;

/**
Only the fields that apply to the kind are stored.
*/
function columns(values: ListingValues) {
	const isScholarship = values.kind === "scholarship";
	return {
		kind: values.kind,
		title: values.title,
		organization: values.organization,
		summary: values.summary,
		description: values.description ?? null,
		url: values.url,
		imageUrl: values.imageUrl ?? null,
		deadline: values.deadline ?? null,
		amount: isScholarship ? (values.amount ?? null) : null,
		startDate: isScholarship ? null : (values.startDate ?? null),
		endDate: isScholarship ? null : (values.endDate ?? null),
		location: isScholarship ? null : (values.location ?? null),
		eligibility: values.eligibility ?? null,
		tags: values.tags,
		featured: values.featured,
		status: values.status,
	};
}

export async function listForDashboard(
	db: Database,
	kind: ListingKind,
	view: "active" | "trash" = "active"
): Promise<Listing[]> {
	return db
		.select()
		.from(listings)
		.where(
			and(
				eq(listings.kind, kind),
				view === "trash"
					? isNotNull(listings.deletedAt)
					: isNull(listings.deletedAt)
			)
		)
		.orderBy(
			view === "trash" ? desc(listings.deletedAt) : asc(listings.sortOrder),
			asc(listings.createdAt)
		);
}

export async function getListing(
	db: Database,
	id: string
): Promise<Listing | undefined> {
	const listingRows = await db
		.select()
		.from(listings)
		.where(eq(listings.id, id))
		.limit(1);
	const listing = listingRows.at(0);
	return listing;
}

/**
A slug no other card of this kind uses: "nasa-camp", then "nasa-camp-2", …
*/
export async function availableListingSlug(
	db: Database,
	kind: ListingKind,
	title: string
): Promise<string> {
	const base = listingSlug(title);
	const taken = await db
		.select({ slug: listings.slug })
		.from(listings)
		.where(and(eq(listings.kind, kind), like(listings.slug, `${base}%`)));
	const used = new Set(taken.map((row) => row.slug));
	let slug = base;
	for (let attempt = 2; used.has(slug); attempt++) {
		slug = `${base}-${attempt}`;
	}

	return slug;
}

export async function createListing(
	db: Database,
	values: ListingValues,
	by: string
): Promise<Listing> {
	const lastRows = await db
		.select({
			next: sql<number>`coalesce(max(${listings.sortOrder}), -1)::int + 1`,
		})
		.from(listings)
		.where(eq(listings.kind, values.kind));
	const last = lastRows.at(0);
	const next = last?.next ?? 0;
	const createdRows = await db
		.insert(listings)
		.values({
			...columns(values),
			slug: await availableListingSlug(db, values.kind, values.title),
			sortOrder: next,
			createdBy: by,
			updatedBy: by,
		})
		.returning();
	const created = createdRows.at(0);
	if (!created) {
		throw new Error("Insert returned no row");
	}

	return created;
}

export async function updateListing(
	db: Database,
	id: string,
	values: ListingValues,
	by: string
): Promise<Listing | undefined> {
	const updatedRows = await db
		.update(listings)
		.set({ ...columns(values), updatedBy: by, updatedAt: new Date() })
		.where(eq(listings.id, id))
		.returning();
	const updated = updatedRows.at(0);
	return updated;
}

export async function setDeleted(
	db: Database,
	id: string,
	isDeleted: boolean,
	by: string
) {
	await db
		.update(listings)
		.set({
			deletedAt: isDeleted ? new Date() : null,
			// Restored cards come back as drafts so nothing reappears by surprise.
			...(!isDeleted && { status: "draft" as const }),
			updatedBy: by,
			updatedAt: new Date(),
		})
		.where(eq(listings.id, id));
}

export async function setListingStatus(
	db: Database,
	id: string,
	status: Listing["status"],
	by: string
): Promise<Listing | undefined> {
	const updatedRows = await db
		.update(listings)
		.set({ status, updatedBy: by, updatedAt: new Date() })
		.where(and(eq(listings.id, id), isNull(listings.deletedAt)))
		.returning();
	const updated = updatedRows.at(0);
	return updated;
}

export async function deleteForever(db: Database, id: string) {
	await db
		.delete(listings)
		.where(and(eq(listings.id, id), isNotNull(listings.deletedAt)));
}

/**
Moves a card one place up or down, renumbering its kind in one statement.
*/
export async function moveListing(
	db: Database,
	id: string,
	direction: "up" | "down"
): Promise<ListingKind | undefined> {
	const listing = await getListing(db, id);
	if (!listing) {
		return undefined;
	}

	const ordered = await listForDashboard(db, listing.kind);
	const index = ordered.findIndex((item) => item.id === id);
	const target = direction === "up" ? index - 1 : index + 1;
	if (index === -1 || target < 0 || target >= ordered.length) {
		return listing.kind;
	}

	const ids = ordered.map((item) => item.id);
	ids.splice(target, 0, ...ids.splice(index, 1));
	const cases = sql.join(
		ids.map((item, order) => sql`when ${item}::uuid then ${order}::int`),
		sql` `
	);
	await db
		.update(listings)
		.set({ sortOrder: sql`case ${listings.id} ${cases} end` })
		.where(
			sql`${listings.id} in (${sql.join(
				ids.map((item) => sql`${item}::uuid`),
				sql`, `
			)})`
		);
	return listing.kind;
}

/**
Published cards that have a deadline; the digest picks the ones due soon.
*/
export async function listWithDeadlines(db: Database): Promise<Listing[]> {
	return db
		.select()
		.from(listings)
		.where(
			and(
				eq(listings.status, "published"),
				isNull(listings.deletedAt),
				isNotNull(listings.deadline)
			)
		);
}
