import type { Access } from "@/lib/permissions";
import type { User } from "@/lib/users";
import { auth } from "@/auth";
import { getDb } from "@/db";
import { isOpenSignIn, localAdminEmail, localRole } from "@/lib/open-signin";
import { canAccess } from "@/lib/permissions";
import { findUser } from "@/lib/users";
import { redirect } from "next/navigation";
import { cache } from "react";

/*
 * Server-side authorization. A valid Auth.js cookie isn't enough: the email
 * must still be in the users table, with a high enough role. Looked up on
 * every request (deduplicated per render), so removals and role changes
 * apply immediately.
 */

/**
Local testing only (see src/lib/open-signin.ts): no Google, always an admin.
*/
function localAdmin(
	email = localAdminEmail,
	name: string | undefined = "Local developer",
	image?: string
): User {
	return {
		id: "open-signin",
		email: email.toLowerCase(),
		name: name ?? null,
		image: image ?? null,
		role: localRole(),
		addedBy: "DASHBOARD_OPEN_SIGNIN",
		createdAt: new Date(),
		lastSignInAt: new Date(),
	};
}

export const currentUser = cache(async (): Promise<User | undefined> => {
	const session = await auth();
	const email = session?.user?.email;
	if (!email) {
		return isOpenSignIn() ? localAdmin() : undefined;
	}

	const db = getDb();

	const user = db ? await findUser(db, email) : undefined;
	return !user && isOpenSignIn()
		? localAdmin(
				email,
				session?.user?.name ?? undefined,
				session?.user?.image ?? undefined
			)
		: user;
});

export function hasAccess(user: User, access: Access) {
	return canAccess(user.role, access);
}

/**
For pages: redirects anyone who isn't allowed.
*/
export async function requirePageUser(access: Access = "any"): Promise<User> {
	const user = await currentUser();
	if (!user) {
		const session = await auth();
		redirect(session ? "/sign-in?error=AccessDenied" : "/sign-in");
	}

	if (!hasAccess(user, access)) {
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
export async function requireUser(access: Access = "any"): Promise<User> {
	const user = await currentUser();
	if (!user) {
		throw new AuthorizationError("Please sign in again.");
	}

	if (!hasAccess(user, access)) {
		throw new AuthorizationError();
	}

	return user;
}
