import type { Database } from "@/db";
import { home } from "@/content/home";
import { getDb } from "@/db";
import { testimonials } from "@/db/schema";
import { moveId } from "@/lib/reorder";
import { asc, eq, isNull, sql } from "drizzle-orm";
import { unstable_cache } from "next/cache";
import { z } from "zod";

/*
 * "What our members say" on the home page. Until the first quote is imported
 * (or added) the page keeps showing the ones in src/content/home.ts.
 */

export const testimonialsTag = "testimonials";

export type Testimonial = typeof testimonials.$inferSelect;
export type PublicTestimonial = { quote: string; author: string };

export const testimonialSchema = z.object({
	quote: z.string().trim().min(1, "Write the quote").max(700),
	author: z.string().trim().min(1, "Say who said it").max(80),
});

export type TestimonialInput = z.infer<typeof testimonialSchema>;

export async function listTestimonials(db: Database): Promise<Testimonial[]> {
	return db
		.select()
		.from(testimonials)
		.where(isNull(testimonials.deletedAt))
		.orderBy(asc(testimonials.sortOrder), asc(testimonials.createdAt));
}

export async function addTestimonial(
	db: Database,
	input: TestimonialInput,
	by: string
) {
	const last = await db
		.select({
			next: sql<number>`coalesce(max(${testimonials.sortOrder}) + 1, 0)::int`,
		})
		.from(testimonials);
	await db.insert(testimonials).values({
		...input,
		sortOrder: last.at(0)?.next ?? 0,
		createdBy: by,
		updatedBy: by,
	});
}

/**
The updated row, or undefined when it was removed meanwhile.
*/
export async function updateTestimonial(
	db: Database,
	id: string,
	input: TestimonialInput,
	by: string
): Promise<Testimonial | undefined> {
	const rows = await db
		.update(testimonials)
		.set({ ...input, updatedAt: new Date(), updatedBy: by })
		.where(eq(testimonials.id, id))
		.returning();
	return rows.at(0);
}

/**
Returns the order saved, or undefined when the quote doesn't exist.
*/
export async function moveTestimonial(
	db: Database,
	id: string,
	direction: "up" | "down"
): Promise<string[] | undefined> {
	const rows = await listTestimonials(db);
	const order = moveId(
		rows.map((row) => row.id),
		id,
		direction
	);
	if (order) {
		await Promise.all(
			order.map(async (rowId, sortOrder) =>
				db
					.update(testimonials)
					.set({ sortOrder })
					.where(eq(testimonials.id, rowId))
			)
		);
	}

	return order;
}

/**
Copies the quotes in src/content/home.ts. Only when the table is empty.
*/
export async function importStaticTestimonials(db: Database): Promise<number> {
	const existing = await db
		.select({ id: testimonials.id })
		.from(testimonials)
		.limit(1);
	if (existing.length > 0) {
		return 0;
	}

	const rows = home.testimonials.map((item, sortOrder) => ({
		quote: item.quote,
		author: item.author,
		sortOrder,
		updatedBy: "import",
	}));
	await db.insert(testimonials).values(rows);
	return rows.length;
}

export const getPublicTestimonials = unstable_cache(
	async (): Promise<PublicTestimonial[]> => {
		const db = getDb();
		if (db) {
			try {
				const rows = await listTestimonials(db);
				if (rows.length > 0) {
					return rows.map((row) => ({
						quote: row.quote,
						author: row.author,
					}));
				}
			} catch (error) {
				console.error("Could not load testimonials", error);
			}
		}

		return home.testimonials.map((item) => ({ ...item }));
	},
	["testimonials"],
	{ tags: [testimonialsTag], revalidate: 3600 }
);
