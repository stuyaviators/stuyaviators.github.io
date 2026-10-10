import { z } from "zod";

/*
 * Mailing-list validation shared by the sign-up form (client) and the Server
 * Action (server). Rules, in plain English, are in docs/google-forms-setup.md.
 *
 * Stuy emails look like first initial + last name + digits, e.g.
 * pstuyvesant60@stuy.edu. Only the LAST name is checked against the email; the first
 * name isn't, because preferred names can differ from the school record.
 */

export const messages = {
	nameRequired: "Please enter your first and last name.",
	nameCharacters:
		"Names can only use letters, spaces, hyphens, apostrophes, and periods.",
	emailDomain: "Use your @stuy.edu email.",
	emailDigits: "Your Stuy email should end in numbers, e.g. pstuyvesant60@stuy.edu.",
	emailLastName:
		"Your Stuy email should include your last name, e.g. pstuyvesant60@stuy.edu.",
} as const;

const allowedNameCharacters = /^[\p{L}\p{M}\s'’.-]+$/u;
const stuyLocalPart = /^[a-z]+\d+$/;
const emailShape = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Trim and collapse runs of whitespace. */
export function cleanName(raw: string): string {
	return raw.trim().replaceAll(/\s+/g, " ");
}

export function cleanEmail(raw: string): string {
	return raw.trim().toLowerCase();
}

/** Lowercase, strip accents, and drop everything but a–z. */
export function normalizeNamePart(part: string): string {
	return part
		.normalize("NFD")
		.replaceAll(/\p{M}/gu, "")
		.toLowerCase()
		.replaceAll(/[^a-z]/g, "");
}

/** Everything after the first word, split on spaces and hyphens. */
export function lastNameParts(fullName: string): string[] {
	const words = cleanName(fullName).split(" ");
	return words
		.slice(1)
		.flatMap((word) => word.split("-"))
		.map((part) => normalizeNamePart(part))
		.filter(Boolean);
}

/** Letters before the digits, minus the (unchecked) first initial. */
export function emailLastName(email: string): string {
	const local = cleanEmail(email).split("@")[0] ?? "";
	const letters = /^[a-z]+/.exec(local)?.[0] ?? "";
	return letters.slice(1);
}

export function lastNameMatchesEmail(fullName: string, email: string): boolean {
	const parts = lastNameParts(fullName);
	const fromEmail = emailLastName(email);
	if (parts.length === 0 || !fromEmail) return false;
	if (parts.length === 1) return fromEmail === parts[0];
	// Loose match for multi-part names (middle names, "De La Cruz", "Smith-Jones").
	// Short particles like "de" or "la" can't match on their own.
	return (
		parts.some((part) => part.length >= 3 && fromEmail.includes(part)) ||
		fromEmail === parts.join("")
	);
}

/**
 * Capitalize each name part (split on spaces, hyphens and apostrophes), keeping
 * the rest as typed ("McDonald" stays) unless the part was typed in all caps.
 */
export function formatName(raw: string): string {
	return cleanName(raw)
		.split(/([\s'’-]+)/u)
		.map((token) => {
			if (!token || /^[\s'’-]+$/u.test(token)) return token;
			const [first = "", ...rest] = [...token];
			const tail = rest.join("");
			const allCaps =
				token === token.toUpperCase() && token !== token.toLowerCase();
			return first.toUpperCase() + (allCaps ? tail.toLowerCase() : tail);
		})
		.join("");
}

export function validateFullName(raw: string): string | undefined {
	const name = cleanName(raw);
	if (!name) return messages.nameRequired;
	if (!allowedNameCharacters.test(name)) return messages.nameCharacters;
	if (name.split(" ").length < 2 || lastNameParts(name).length === 0) {
		return messages.nameRequired;
	}

	return undefined;
}

/** Domain + digits checks only (used alone by the unsubscribe form). */
export function validateStuyEmail(raw: string): string | undefined {
	const email = cleanEmail(raw);
	if (!emailShape.test(email) || !email.endsWith("@stuy.edu")) {
		return messages.emailDomain;
	}

	const local = email.slice(0, -"@stuy.edu".length);
	if (!stuyLocalPart.test(local)) return messages.emailDigits;
	return undefined;
}

export type SignupErrors = {
	fullName?: string;
	email?: string;
	/** True when the only problem is the last-name match (show escape hatch). */
	lastNameMismatch?: boolean;
};

export type SignupResult =
	| { success: true; data: { fullName: string; email: string } }
	| { success: false; errors: SignupErrors };

export function validateSignup(input: {
	fullName: string;
	email: string;
}): SignupResult {
	const errors: SignupErrors = {};
	const nameError = validateFullName(input.fullName);
	const emailError = validateStuyEmail(input.email);
	if (nameError) errors.fullName = nameError;
	if (emailError) errors.email = emailError;
	if (
		!nameError &&
		!emailError &&
		!lastNameMatchesEmail(input.fullName, input.email)
	) {
		errors.email = messages.emailLastName;
		errors.lastNameMismatch = true;
	}

	if (errors.fullName ?? errors.email) return { success: false, errors };
	return {
		success: true,
		data: {
			fullName: formatName(input.fullName),
			email: cleanEmail(input.email),
		},
	};
}

/** Zod schema wrapping the same rules, for Server Actions. */
export const signupSchema = z
	.object({
		fullName: z.string().max(120),
		email: z.string().max(254),
	})
	.superRefine((value, context) => {
		const result = validateSignup(value);
		if (result.success) return;
		if (result.errors.fullName) {
			context.addIssue({
				code: "custom",
				path: ["fullName"],
				message: result.errors.fullName,
			});
		}

		if (result.errors.email) {
			context.addIssue({
				code: "custom",
				path: ["email"],
				message: result.errors.email,
			});
		}
	})
	.transform((value) => ({
		fullName: formatName(value.fullName),
		email: cleanEmail(value.email),
	}));

export const unsubscribeSchema = z
	.object({ email: z.string().max(254) })
	.superRefine((value, context) => {
		const error = validateStuyEmail(value.email);
		if (error) {
			context.addIssue({ code: "custom", path: ["email"], message: error });
		}
	})
	.transform((value) => ({ email: cleanEmail(value.email) }));
