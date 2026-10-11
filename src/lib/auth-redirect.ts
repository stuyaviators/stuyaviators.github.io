/**
Where to go after signing in: only same-site dashboard paths, so the sign-in
link can't be turned into an open redirect. The proxy passes a full URL as
callbackUrl; only its path is kept.
*/
export function safeCallback(value: unknown): string {
	if (typeof value !== "string" || value === "") {
		return "/dashboard";
	}

	try {
		const url = new URL(value, "https://placeholder.invalid");
		const path = url.pathname + url.search;
		return /^\/dashboard(?:[/?]|$)/u.test(path) ? path : "/dashboard";
	} catch {
		return "/dashboard";
	}
}
