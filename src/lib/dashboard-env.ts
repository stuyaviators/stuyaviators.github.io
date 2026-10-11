/*
 * What the dashboard needs to be fully working, for the Overview checklist
 * and the sign-in page. Reports only whether each variable is set, never its
 * value.
 */

export type EnvCheck = {
	name: string;
	purpose: string;
	isSet: boolean;
	isRequired: boolean;
};

const checks: Array<Omit<EnvCheck, "isSet">> = [
	{
		name: "DATABASE_URL",
		purpose: "Neon Postgres (all dashboard content)",
		isRequired: true,
	},
	{
		name: "AUTH_SECRET",
		purpose: "Signs sign-in cookies; encrypts the Epsilon token",
		isRequired: true,
	},
	{
		name: "AUTH_GOOGLE_ID",
		purpose: "Google sign-in (docs/google-oauth-setup.md)",
		isRequired: true,
	},
	{
		name: "AUTH_GOOGLE_SECRET",
		purpose: "Google sign-in (docs/google-oauth-setup.md)",
		isRequired: true,
	},
	{
		name: "ADMIN_EMAILS",
		purpose: "First admin(s); only used while there are none",
		isRequired: false,
	},
	{
		name: "BLOB_READ_WRITE_TOKEN",
		purpose: "Image uploads (Vercel Blob)",
		isRequired: true,
	},
	{
		name: "SIGNUP_SHEET_URL",
		purpose: "Link to the mailing-list sign-up Sheet",
		isRequired: false,
	},
	{
		name: "UNSUBSCRIBE_SHEET_URL",
		purpose: "Link to the unsubscribe Sheet",
		isRequired: false,
	},
	{
		name: "DISCORD_WEBHOOK_URL",
		purpose: "New-submission alerts in Discord",
		isRequired: false,
	},
];

function isSet(name: string) {
	const value =
		process.env[name] ??
		(name === "DATABASE_URL"
			? process.env.stuyaviators_DATABASE_URL
			: undefined);
	return value !== undefined && value.trim() !== "";
}

export function envChecklist(): EnvCheck[] {
	return checks.map((check) => ({ ...check, isSet: isSet(check.name) }));
}

export function isGoogleConfigured() {
	return (
		isSet("AUTH_GOOGLE_ID") &&
		isSet("AUTH_GOOGLE_SECRET") &&
		isSet("AUTH_SECRET")
	);
}

/**
A sheet link from the environment, only if it's an https URL.
*/
export function sheetUrl(name: "SIGNUP_SHEET_URL" | "UNSUBSCRIBE_SHEET_URL") {
	const value = process.env[name]?.trim();
	return value && /^https:\/\//iu.test(value) ? value : undefined;
}
