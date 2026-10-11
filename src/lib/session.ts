import type { Role, User } from "@/lib/users";
import { auth } from "@/auth";
import { getDb } from "@/db";
import { isOpenSignIn } from "@/lib/open-signin";
import { findUser } from "@/lib/users";
import { redirect } from "next/navigation";
import { cache } from "react";

/*
 * Server-side authorization. A valid Auth.js cookie isn't enough: the email
 * must still be in the users table, with a high enough role. Looked up on
 * every request (deduplicated per render), so removals and role changes
 * apply immediately.
 */

const rank: Record<Role, number> = { officer: 1, admin: 2 };

export const currentUser = cache(async (): Promise<User | undefined> => {
	const session = await auth();
	const email = session?.user?.email;
	if (!email) {
		return undefined;
	}

	const db = getDb();

	const user = db ? await findUser(db, email) : undefined;
	if (!user && isOpenSignIn()) {
		// Local testing only: anyone signed in acts as an admin.
		return {
			id: "open-signin",
			email: email.toLowerCase(),
			name: session?.user?.name ?? null,
			image: session?.user?.image ?? null,
			role: "admin",
			addedBy: "DASHBOARD_OPEN_SIGNIN",
			createdAt: new Date(),
			lastSignInAt: new Date(),
		};
	}

	return user;
});

export function hasRole(user: User, role: Role) {
	return rank[user.role] >= rank[role];
}

/**
For pages: redirects anyone who isn't allowed.
*/
export async function requirePageUser(role: Role = "officer"): Promise<User> {
	const user = await currentUser();
	if (!user) {
		const session = await auth();
		redirect(session ? "/sign-in?error=AccessDenied" : "/sign-in");
	}

	if (!hasRole(user, role)) {
		redirect("/dashboard?denied=1");
	}

	return user;
}

export class AuthorizationError extends Error {
	constructor(message = "You don’t have permission to do that.") {
		super(message);
		this.name = "AuthorizationError";
	}
}

/**
For Server Actions and Route Handlers: throws unless allowed.
*/
export async function requireUser(role: Role = "officer"): Promise<User> {
	const user = await currentUser();
	if (!user) {
		throw new AuthorizationError("Please sign in again.");
	}

	if (!hasRole(user, role)) {
		throw new AuthorizationError();
	}

	return user;
}
