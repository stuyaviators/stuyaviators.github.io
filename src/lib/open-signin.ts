/*
 * Local testing switch: DASHBOARD_OPEN_SIGNIN=true lets any verified Google
 * account into the dashboard as an admin, without being on the allowlist.
 * It only works under `next dev`; production builds (every Vercel preview and
 * production deployment) ignore it, so a deployed site can't be left open.
 */
export function isOpenSignIn(): boolean {
	return (
		process.env.NODE_ENV === "development" &&
		process.env.DASHBOARD_OPEN_SIGNIN === "true"
	);
}
