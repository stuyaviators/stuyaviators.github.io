"use server";

import type { ActionResult } from "@/lib/action-guard";
import type { Suggestion } from "@/lib/autofill";
import { actionError, guarded } from "@/lib/action-guard";
import { AutofillError, fetchPage, parsePage } from "@/lib/autofill";
import { hitRateLimit } from "@/lib/rate-limit";
import { z } from "zod";

/*
 * "Autofill" on the opportunity and scholarship form: reads the pasted link
 * and returns guesses for the empty fields. Officers only, and limited so
 * nobody can use the server as a page-fetching service.
 */

const input = z.object({
	kind: z.enum(["opportunity", "scholarship"]),
	url: z.url({ protocol: /^https?$/u, error: "Add a link first" }),
});

export async function autofillListing(
	kind: string,
	url: string
): Promise<ActionResult<{ fields: Suggestion }>> {
	return guarded("officer", async ({ user, db }) => {
		const parsed = input.safeParse({ kind, url: url.trim() });
		if (!parsed.success) {
			return actionError("Paste a full link first, starting with https://", {
				url: "Paste a full link, starting with https://",
			});
		}

		const limit = await hitRateLimit(db, `autofill:${user.email}`, 30, 600);
		if (!limit.allowed) {
			return actionError(
				"Too many autofills in a row. Try again in a few minutes."
			);
		}

		try {
			const page = await fetchPage(parsed.data.url);
			return {
				ok: true,
				fields: parsePage(page.html, page.url, parsed.data.kind),
			};
		} catch (error) {
			if (error instanceof AutofillError) {
				return actionError(error.message);
			}

			throw error;
		}
	});
}
