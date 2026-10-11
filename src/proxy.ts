/*
 * Next.js 16 Proxy (formerly Middleware). Visitors without a dashboard session
 * are sent to /sign-in before /dashboard renders. This is only the first gate:
 * the dashboard layout, every Server Action and the upload route check the
 * allowlist and role again on the server.
 */
export { auth as proxy } from "@/auth";

export const config = {
	matcher: ["/dashboard/:path*"],
};
