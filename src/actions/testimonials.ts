"use server";

import type { ActionResult } from "@/lib/action-guard";
import { actionError, guarded, invalid } from "@/lib/action-guard";
import { canDeleteRow, notYours } from "@/lib/ownership";
import {
	addTestimonial,
	deleteTestimonial,
	importStaticTestimonials,
	moveTestimonial,
	testimonialSchema,
	testimonialsTag,
	updateTestimonial,
} from "@/lib/testimonials";
import { revalidatePath, updateTag } from "next/cache";
import { z } from "zod";

/*
 * Home-page testimonials. Every change expires the cached quotes and the
 * home page.
 */

const idSchema = z.uuid();
const missing = actionError("That quote is no longer on the list.");

function refresh() {
	updateTag(testimonialsTag);
	revalidatePath("/");
}

export async function addTestimonialAction(
	input: unknown
): Promise<ActionResult> {
	return guarded("testimonials", async ({ user, db }) => {
		const parsed = testimonialSchema.safeParse(input);
		if (!parsed.success) {
			return invalid(parsed.error);
		}

		await addTestimonial(db, parsed.data, user.email);
		refresh();
		return { ok: true };
	});
}

export async function updateTestimonialAction(
	id: string,
	input: unknown
): Promise<ActionResult> {
	return guarded("testimonials", async ({ user, db }) => {
		if (!idSchema.safeParse(id).success) {
			return missing;
		}

		const parsed = testimonialSchema.safeParse(input);
		if (!parsed.success) {
			return invalid(parsed.error);
		}

		const updated = await updateTestimonial(db, id, parsed.data, user.email);
		if (!updated) {
			return missing;
		}

		refresh();
		return { ok: true };
	});
}

export async function moveTestimonialAction(
	id: string,
	direction: string
): Promise<ActionResult> {
	return guarded("testimonials", async ({ db }) => {
		if (
			!idSchema.safeParse(id).success ||
			(direction !== "up" && direction !== "down")
		) {
			return missing;
		}

		const order = await moveTestimonial(db, id, direction);
		if (!order) {
			return missing;
		}

		refresh();
		return { ok: true };
	});
}

export async function deleteTestimonialAction(
	id: string
): Promise<ActionResult> {
	return guarded("testimonials", async ({ user, db }) => {
		if (!idSchema.safeParse(id).success) {
			return missing;
		}

		if (!(await canDeleteRow(db, user, "testimonial", id))) {
			return notYours;
		}

		if ((await deleteTestimonial(db, id)) === 0) {
			return missing;
		}

		refresh();
		return { ok: true };
	});
}

/**
One-time copy of the quotes in src/content/home.ts into the database.
*/
export async function importTestimonialsAction(): Promise<
	ActionResult<{ count: number }>
> {
	return guarded("testimonials", async ({ db }) => {
		const count = await importStaticTestimonials(db);
		if (count === 0) {
			return actionError("The quotes are already in the dashboard.");
		}

		refresh();
		return { ok: true, count };
	});
}
