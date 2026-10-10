/*
 * Server-side submission to Google Forms' (unofficial) formResponse endpoint.
 * The browser never talks to Google. If Google changes the endpoint, visitors
 * see the fallback link to the real form instead of a false success.
 * Setup: docs/google-forms-setup.md.
 */

export type GoogleFormConfig = {
	action: string;
	fallbackUrl: string;
	entries: Record<string, string>;
};

// Defaults match the existing "mailing list" form; env vars override them so a
// new form can be swapped in without code changes.
export function signupFormConfig(): GoogleFormConfig {
	return {
		action:
			process.env.GOOGLE_FORM_SIGNUP_ACTION ??
			"https://docs.google.com/forms/d/e/1FAIpQLScbjyhaEiBhMZPDi8TNQJZemMCSR9xfpChoRN0RP_sDhfS-ag/formResponse",
		fallbackUrl:
			process.env.GOOGLE_FORM_SIGNUP_FALLBACK_URL ??
			"https://forms.gle/vzSfXNKrsejNe1rd6",
		entries: {
			fullName: process.env.GOOGLE_FORM_SIGNUP_NAME_ENTRY ?? "entry.1248809368",
			email: process.env.GOOGLE_FORM_SIGNUP_EMAIL_ENTRY ?? "entry.1701037871",
		},
	};
}

export const unsubscribeMailto =
	"mailto:stuyaviators@gmail.com?subject=Unsubscribe";

/** Undefined until GOOGLE_FORM_UNSUBSCRIBE_* are set; callers fall back to mailto. */
export function unsubscribeFormConfig(): GoogleFormConfig | undefined {
	const action = process.env.GOOGLE_FORM_UNSUBSCRIBE_ACTION;
	const email = process.env.GOOGLE_FORM_UNSUBSCRIBE_EMAIL_ENTRY;
	if (!action || !email) return undefined;
	return {
		action,
		fallbackUrl:
			process.env.GOOGLE_FORM_UNSUBSCRIBE_FALLBACK_URL ?? unsubscribeMailto,
		entries: { email },
	};
}

/** The URL shown in "unsubscribe" links site-wide. */
export function unsubscribeHref(): string {
	return unsubscribeFormConfig()
		? "/newsletter/unsubscribe"
		: unsubscribeMailto;
}

export async function submitGoogleForm(
	config: GoogleFormConfig,
	values: Record<string, string>,
	fetcher: typeof fetch = fetch
): Promise<boolean> {
	const body = new URLSearchParams();
	for (const [field, entry] of Object.entries(config.entries)) {
		const value = values[field];
		if (value !== undefined) body.set(entry, value);
	}

	try {
		const response = await fetcher(config.action, {
			method: "POST",
			headers: { "Content-Type": "application/x-www-form-urlencoded" },
			body: body.toString(),
			signal: AbortSignal.timeout(8000),
			cache: "no-store",
		});
		return response.ok;
	} catch {
		return false;
	}
}
