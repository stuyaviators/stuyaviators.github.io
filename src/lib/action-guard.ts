import type { Database } from "@/db";
import type { Access } from "@/lib/permissions";
import type { User } from "@/lib/users";
import type { z } from "zod";
import { getDb } from "@/db";
import { AuthorizationError, requireUser } from "@/lib/session";

/*
 * Every dashboard Server Action runs through `guarded`: it re-checks the
 * session and role on the server (never trusting the proxy or the UI), needs
 * a database, and turns failures into a message the dashboard can show.
 */

export type ActionError = {
	ok: false;
	error: string;
	fieldErrors?: Record<string, string>;
};

export type ActionResult<
	T extends Record<string, unknown> = Record<never, never>,
> = ({ ok: true } & T) | ActionError;

export type ActionContext = { user: User; db: Database };

export function actionError(
	error: string,
	fieldErrors?: Record<string, string>
): ActionError {
	return fieldErrors ? { ok: false, error, fieldErrors } : { ok: false, error };
}

/**
First message per field, keyed by the top-level field name.
*/
export function zodFieldErrors(error: z.ZodError): Record<string, string> {
	const errors: Record<string, string> = {};
	for (const issue of error.issues) {
		const key = String(issue.path[0] ?? "form");
		errors[key] ??= issue.message;
	}

	return errors;
}

export function invalid(error: z.ZodError): ActionError {
	return actionError("Check the highlighted fields.", zodFieldErrors(error));
}

export async function guarded<R extends { ok: boolean }>(
	access: Access,
	run: (context: ActionContext) => Promise<R>
): Promise<R | ActionError> {
	let user: User;
	try {
		user = await requireUser(access);
	} catch (error) {
		if (error instanceof AuthorizationError) {
			return actionError(error.message);
		}

		throw error;
	}

	const db = getDb();
	if (!db) {
		return actionError("The database isn’t set up (DATABASE_URL is missing).");
	}

	try {
		return await run({ user, db });
	} catch (error) {
		console.error("Dashboard action failed", error);
		return actionError("Something went wrong. Try again.");
	}
}
