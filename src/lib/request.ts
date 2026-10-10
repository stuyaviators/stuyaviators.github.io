import { createHash } from "node:crypto";
import { headers } from "next/headers";

/**
Best-effort client IP from Vercel's forwarding headers.
*/
export async function clientIp(): Promise<string> {
	const list = await headers();
	return (
		list.get("x-forwarded-for")?.split(",", 1)[0]?.trim() ??
		list.get("x-real-ip") ??
		"unknown"
	);
}

/**
Salted hash so raw IPs are never stored.
*/
export function hashKey(...parts: string[]): string {
	const salt =
		process.env.RATE_LIMIT_SALT ?? process.env.AUTH_SECRET ?? "stuyaviators";
	return createHash("sha256")
		.update([salt, ...parts].join("|"))
		.digest("hex");
}
