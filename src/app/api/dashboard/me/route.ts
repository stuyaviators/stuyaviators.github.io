import { currentUser } from "@/lib/session";
import { NextResponse } from "next/server";

/*
 * Whether the visitor is signed in to the dashboard, so the public site can
 * offer a shortcut to it. Says nothing about anyone else, and never an error
 * for visitors who aren't signed in.
 */
export async function GET() {
	const user = await currentUser();
	return NextResponse.json(
		user
			? { isSignedIn: true, name: user.name ?? user.email }
			: { isSignedIn: false },
		{ headers: { "cache-control": "no-store" } }
	);
}
