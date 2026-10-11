import { getDb } from "@/db";
import { countNewSubmissions } from "@/lib/inbox";
import { AuthorizationError, requireUser } from "@/lib/session";
import { NextResponse } from "next/server";

/*
 * How many messages in the inbox are still unread, for the dashboard's tab
 * badge. Signed-in officers only.
 */
export async function GET() {
	try {
		await requireUser("officer");
	} catch (error) {
		if (error instanceof AuthorizationError) {
			return NextResponse.json({ error: error.message }, { status: 401 });
		}

		throw error;
	}

	const db = getDb();
	const count = db ? await countNewSubmissions(db) : 0;
	return NextResponse.json(
		{ count },
		{ headers: { "cache-control": "no-store" } }
	);
}
