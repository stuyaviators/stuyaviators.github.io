import type { RoleName } from "@/lib/permissions";
import { roles } from "@/lib/permissions";

/*
 * Local testing switch: DASHBOARD_OPEN_SIGNIN=true in .env.local skips Google
 * sign-in altogether and opens the dashboard as a local admin. It only works
 * under `next dev`; production builds (every Vercel preview and production
 * deployment) ignore it, so a deployed site can't be left open.
 */

export const localAdminEmail = "local-dev@localhost";

/**
The role local mode acts as: an admin, unless DASHBOARD_DEV_ROLE names another
role (to try out what that role sees).
*/
export function localRole(): RoleName {
	const wanted = process.env.DASHBOARD_DEV_ROLE;
	return roles.find((role) => role === wanted) ?? "admin";
}

export function isOpenSignIn(): boolean {
	return (
		process.env.NODE_ENV === "development" &&
		process.env.DASHBOARD_OPEN_SIGNIN === "true"
	);
}
