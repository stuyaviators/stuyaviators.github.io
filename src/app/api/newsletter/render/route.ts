import { renderNewsletter } from "@/lib/newsletter/render";
import { newsletterSchema } from "@/lib/newsletter/types";
import { slugSchema } from "@/lib/newsletters";
import { AuthorizationError, requireUser } from "@/lib/session";
import { NextResponse } from "next/server";
import { z } from "zod";

/*
 * Renders the newsletter builder's content to email HTML with React Email
 * (replaces recode's stub render route). Officers only.
 */

const body = z.object({
	data: newsletterSchema,
	slug: slugSchema.nullish(),
});

export async function POST(request: Request) {
	try {
		await requireUser("newsletters");
	} catch (error) {
		if (error instanceof AuthorizationError) {
			return NextResponse.json({ error: error.message }, { status: 401 });
		}

		throw error;
	}

	const parsed = body.safeParse(await request.json().catch(() => undefined));
	if (!parsed.success) {
		return NextResponse.json(
			{ error: parsed.error.issues[0]?.message ?? "Invalid newsletter" },
			{ status: 400 }
		);
	}

	const result = await renderNewsletter(
		parsed.data.data,
		parsed.data.slug ?? undefined
	);
	return NextResponse.json(result, {
		headers: { "Cache-Control": "no-store" },
	});
}
