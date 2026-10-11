/*
 * Next.js 16 Proxy (formerly Middleware). Visitors without a dashboard session
 * are sent to /sign-in before /dashboard renders. This is only the first gate:
 * the dashboard layout, every Server Action and the upload route check the
 * allowlist and role again on the server.
 */

import { auth } from "@/auth";
import { isOpenSignIn } from "@/lib/open-signin";
import { NextResponse } from "next/server";

// Local development with DASHBOARD_OPEN_SIGNIN=true skips Google entirely.
export const proxy = isOpenSignIn() ? () => NextResponse.next() : auth;

export const config = {
	matcher: ["/dashboard/:path*"],
};
