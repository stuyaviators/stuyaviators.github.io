"use server";

import type { ActionResult } from "@/lib/action-guard";
import { actionError, guarded } from "@/lib/action-guard";
import { setSubmissionStatus, submissionStatuses } from "@/lib/inbox";
import { z } from "zod";

/*
 * Inbox triage: mark a submission new, read or archived. Nothing public
 * changes, so there is nothing to revalidate besides the dashboard itself.
 */

const inputSchema = z.object({
	id: z.uuid(),
	status: z.enum(submissionStatuses),
});

export async function markSubmission(
	id: string,
	status: string
): Promise<ActionResult> {
	return guarded("officer", async ({ db }) => {
		const parsed = inputSchema.safeParse({ id, status });
		if (!parsed.success) {
			return actionError("That message is no longer in the inbox.");
		}

		const updated = await setSubmissionStatus(
			db,
			parsed.data.id,
			parsed.data.status
		);
		return updated
			? { ok: true as const }
			: actionError("That message is no longer in the inbox.");
	});
}
