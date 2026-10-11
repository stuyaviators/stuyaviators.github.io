import { getDb } from "@/db";
import { isOpenSignIn } from "@/lib/open-signin";
import { authorizeSignIn } from "@/lib/users";
import NextAuth from "next-auth";
import Google from "next-auth/providers/google";

/*
 * Google sign-in for the officer dashboard (Auth.js v5). Google only proves
 * who someone is; `authorizeSignIn` then checks the email against the users
 * table, so only allowlisted officers get a session. Sessions are signed JWT
 * cookies (no session table). Every page, Server Action and Route Handler
 * still re-checks the allowlist and role on the server (src/lib/session.ts),
 * so removing someone takes effect on their next click.
 *
 * Setup: docs/google-oauth-setup.md. Env: AUTH_SECRET, AUTH_GOOGLE_ID,
 * AUTH_GOOGLE_SECRET, ADMIN_EMAILS.
 */
export const { handlers, auth, signIn, signOut } = NextAuth({
	// Only the openid, email and profile scopes (Google's default).
	providers: [Google],
	session: { strategy: "jwt", maxAge: 60 * 60 * 24 * 14 },
	pages: { signIn: "/sign-in", error: "/sign-in" },
	trustHost: true,
	callbacks: {
		async signIn({ account, profile }) {
			if (
				account?.provider !== "google" ||
				profile?.email_verified !== true ||
				typeof profile.email !== "string"
			) {
				return false;
			}

			if (isOpenSignIn()) {
				return true; // Local testing only; see src/lib/open-signin.ts.
			}

			const db = getDb();
			if (!db) {
				return false;
			}

			const user = await authorizeSignIn(db, {
				email: profile.email,
				name: typeof profile.name === "string" ? profile.name : undefined,
				image:
					typeof profile.picture === "string" ? profile.picture : undefined,
			});
			// False → /sign-in?error=AccessDenied, the friendly "not authorized" page.
			return user !== undefined;
		},
		// Used by src/proxy.ts: a quick signed-cookie check before /dashboard.
		authorized({ auth: session }) {
			return Boolean(session?.user?.email);
		},
	},
});
