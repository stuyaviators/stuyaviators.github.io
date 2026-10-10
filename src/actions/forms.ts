"use server";

import type { FormState } from "@/lib/form-state";
import type { SubmissionType } from "@/lib/submission-schemas";
import { getDb } from "@/db";
import { submissions } from "@/db/schema";
import { notifyDiscord } from "@/lib/discord";
import { honeypotField } from "@/lib/form-state";
import {
	signupFormConfig,
	submitGoogleForm,
	unsubscribeFormConfig,
	unsubscribeMailto,
} from "@/lib/google-forms";
import { unsubscribeSchema, validateSignup } from "@/lib/mailing-list";
import { hitRateLimit } from "@/lib/rate-limit";
import { clientIp, hashKey } from "@/lib/request";
import { submissionSchemas, submissionTypes } from "@/lib/submission-schemas";
import { after } from "next/server";

const rateLimit = { limit: 5, windowSeconds: 600 };

function text(formData: FormData, key: string): string {
	const value = formData.get(key);
	return typeof value === "string" ? value : "";
}

function isBot(formData: FormData) {
	return text(formData, honeypotField) !== "";
}

/** Returns false when this IP has hit the limit for `route`. */
async function allowed(route: string): Promise<boolean> {
	const db = getDb();
	if (!db) return true; // Local dev without a database.
	try {
		const result = await hitRateLimit(
			db,
			hashKey(await clientIp(), route),
			rateLimit.limit,
			rateLimit.windowSeconds
		);
		return result.allowed;
	} catch (error) {
		console.error("Rate limit check failed", error);
		return true;
	}
}

const tooMany: FormState = {
	status: "error",
	message: "Too many submissions from your connection. Please try again later.",
};

/** Mailing-list sign-up (footer, Connect page, home). */
export async function signUpForMailingList(
	_previous: FormState,
	formData: FormData
): Promise<FormState> {
	const config = signupFormConfig();
	// Never reveal the honeypot: look successful, do nothing.
	if (isBot(formData)) return { status: "success" };

	// 1. Same validation as the client.
	const result = validateSignup({
		fullName: text(formData, "fullName"),
		email: text(formData, "email"),
	});
	if (!result.success) {
		return {
			status: "error",
			fieldErrors: {
				...(result.errors.fullName ? { fullName: result.errors.fullName } : {}),
				...(result.errors.email ? { email: result.errors.email } : {}),
			},
			lastNameMismatch: result.errors.lastNameMismatch,
			fallbackUrl: result.errors.lastNameMismatch
				? config.fallbackUrl
				: undefined,
		};
	}

	// 2. Rate limit.
	if (!(await allowed("mailing-list"))) return tooMany;

	// 3–4. Normalized values, posted server-side; only 2xx counts.
	const ok = await submitGoogleForm(config, result.data);
	if (!ok) {
		return {
			status: "error",
			message: "We couldn’t add you right now.",
			fallbackUrl: config.fallbackUrl,
		};
	}

	const db = getDb();
	after(async () => {
		try {
			await db?.insert(submissions).values({
				type: "mailing_list",
				name: result.data.fullName,
				email: result.data.email,
				mailingList: "submitted",
			});
		} catch (error) {
			console.error("Could not record mailing-list sign-up", error);
		}

		await notifyDiscord({ type: "mailing_list", name: result.data.fullName });
	});

	return { status: "success", joinedMailingList: true };
}

/** Contact, story, photo and meeting-idea forms → dashboard inbox. */
export async function submitForm(
	type: SubmissionType,
	_previous: FormState,
	formData: FormData
): Promise<FormState> {
	if (!submissionTypes.includes(type)) {
		return { status: "error", message: "Unknown form." };
	}

	if (isBot(formData)) return { status: "success" };

	const schema = submissionSchemas[type];
	const parsed = schema.safeParse(Object.fromEntries(formData));
	if (!parsed.success) {
		const fieldErrors: Record<string, string> = {};
		for (const issue of parsed.error.issues) {
			const key = String(issue.path[0]);
			fieldErrors[key] ??= issue.message;
		}

		return { status: "error", fieldErrors };
	}

	if (!(await allowed(`form:${type}`))) return tooMany;

	const db = getDb();
	if (!db) {
		return {
			status: "error",
			message:
				"Submissions are temporarily unavailable. Please email aviators-exec@stuy.edu.",
		};
	}

	const { name, email, message, ...rest } = parsed.data as {
		name: string;
		email: string;
		message: string;
	} & Record<string, string>;

	// Automatic mailing-list sign-up when the name + Stuy email pass the checks.
	let mailingList: "submitted" | "failed" | "skipped" = "skipped";
	const signup = validateSignup({ fullName: name, email });
	if (signup.success) {
		mailingList = (await submitGoogleForm(signupFormConfig(), signup.data))
			? "submitted"
			: "failed";
	}

	try {
		await db.insert(submissions).values({
			type,
			name: name || null,
			email: email || null,
			message,
			data: rest,
			mailingList,
		});
	} catch (error) {
		console.error("Could not save submission", error);
		return {
			status: "error",
			message:
				"Something went wrong saving your message. Please email aviators-exec@stuy.edu.",
		};
	}

	after(async () => notifyDiscord({ type, name, message }));
	return { status: "success", joinedMailingList: mailingList === "submitted" };
}

/** Unsubscribe → second Google Form when configured, otherwise mailto. */
export async function unsubscribe(
	_previous: FormState,
	formData: FormData
): Promise<FormState> {
	const config = unsubscribeFormConfig();
	if (!config) {
		return {
			status: "error",
			message: "Email us to unsubscribe.",
			fallbackUrl: unsubscribeMailto,
		};
	}

	if (isBot(formData)) return { status: "success" };
	const parsed = unsubscribeSchema.safeParse({
		email: text(formData, "email"),
	});
	if (!parsed.success) {
		return {
			status: "error",
			fieldErrors: {
				email: parsed.error.issues[0]?.message ?? "Invalid email.",
			},
		};
	}

	if (!(await allowed("unsubscribe"))) return tooMany;
	const ok = await submitGoogleForm(config, parsed.data);
	return ok
		? { status: "success" }
		: {
				status: "error",
				message: "We couldn’t process that right now.",
				fallbackUrl: config.fallbackUrl,
			};
}
