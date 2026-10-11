"use server";

import type { ActionResult } from "@/lib/action-guard";
import { actionError, guarded } from "@/lib/action-guard";
import {
	getEpsilonAccessToken,
	removeEpsilonToken,
	saveEpsilonToken,
} from "@/lib/epsilon-token";
import { fetchEpsilonMeetings, meetingsTag } from "@/lib/meetings";
import { revalidatePath, updateTag } from "next/cache";

/*
 * Site settings (admins only). The Epsilon token is checked against Epsilon
 * before it's stored, and stored encrypted (src/lib/epsilon-token.ts).
 */

function refreshMeetings() {
	updateTag(meetingsTag);
	revalidatePath("/meetings");
	revalidatePath("/");
}

export async function saveEpsilonTokenAction(
	input: string
): Promise<ActionResult> {
	return guarded("settings", async ({ user, db }) => {
		if (typeof input !== "string" || input.length > 20_000) {
			return actionError("Paste the refresh token.", {
				token: "Paste the refresh token.",
			});
		}

		const result = await saveEpsilonToken(db, input, user.email);
		if (!result.ok) {
			return actionError(result.error, { token: result.error });
		}

		refreshMeetings();
		return { ok: true };
	});
}

export async function removeEpsilonTokenAction(): Promise<ActionResult> {
	return guarded("settings", async ({ db }) => {
		await removeEpsilonToken(db);
		refreshMeetings();
		return { ok: true };
	});
}

/**
Asks Epsilon for the meetings with the stored token, so an admin can tell
whether it works. Doesn't change anything.
*/
export async function testEpsilonAction(): Promise<
	ActionResult<{ count: number; next: string | undefined }>
> {
	return guarded("settings", async ({ db }) => {
		const token = await getEpsilonAccessToken(db);
		if (!token) {
			return actionError(
				"No working token is stored. Paste a refresh token first."
			);
		}

		try {
			const meetings = await fetchEpsilonMeetings(token);
			const upcoming = meetings
				.filter(
					(meeting) => new Date(meeting.end ?? meeting.start) >= new Date()
				)
				.toSorted((a, b) => a.start.localeCompare(b.start))[0];
			return { ok: true, count: meetings.length, next: upcoming?.title };
		} catch (error) {
			return actionError(
				error instanceof Error
					? `Epsilon didn’t return meetings: ${error.message}`
					: "Epsilon didn’t return meetings."
			);
		}
	});
}
