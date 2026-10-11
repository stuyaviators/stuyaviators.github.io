import type { Database } from "@/db";
import { settings } from "@/db/schema";
import { decrypt, encrypt } from "@/lib/crypto";
import { and, eq } from "drizzle-orm";
import { z } from "zod";

/*
 * Long-lived Epsilon access for the meetings board.
 *
 * Epsilon (Supabase) access tokens last about an hour, but the session's
 * refresh token lasts until it's used or revoked. An admin pastes a refresh
 * token into the dashboard; it's stored encrypted, and whenever the access
 * token is about to expire we trade the refresh token for a new pair.
 * Supabase rotates refresh tokens on every use, so the new one is saved
 * straight away (a conditional update, so two refreshes at once can't
 * clobber each other).
 */

export const epsilonSettingKey = "epsilon";

export function epsilonConfig() {
	return {
		base: process.env.EPSILON_API_URL ?? "https://base.stuysu.org",
		// Epsilon's public "anon" key, shipped in its own web app.
		apiKey:
			process.env.EPSILON_API_KEY ??
			"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiYW5vbiIsImlzcyI6InN1cGFiYXNlIiwiaWF0IjoxNzg3OTY4Mzk2LCJleHAiOjE5NDU2NDgzOTZ9.Ajo4QUjgnsVUYKjTW7rdDYOUpLI3X-A7SWQFVtFrhmg",
		slug: process.env.EPSILON_ORG_URL ?? "stuyaviators",
	};
}

const storedSchema = z.object({
	refreshToken: z.string().min(1),
	accessToken: z.string().optional(),
	expiresAt: z.number().optional(), // Unix seconds
	email: z.string().optional(),
	refreshedAt: z.number().optional(), // Unix ms
	error: z.string().optional(),
});

export type StoredEpsilonToken = z.infer<typeof storedSchema>;

const refreshResponse = z.object({
	access_token: z.string().min(1),
	refresh_token: z.string().min(1),
	expires_at: z.number().optional(),
	expires_in: z.number().optional(),
	user: z.object({ email: z.string().optional() }).optional(),
});

/**
Accepts either the bare refresh token or the whole JSON value Epsilon keeps in
localStorage (sb-…-auth-token), and returns just the refresh token.
*/
export function parseRefreshTokenInput(input: string): string | undefined {
	const value = input.trim();
	if (value.startsWith("{")) {
		try {
			const parsed: unknown = JSON.parse(value);
			const result = z
				.object({ refresh_token: z.string().min(1) })
				.safeParse(parsed);
			return result.success ? result.data.refresh_token : undefined;
		} catch {
			return undefined;
		}
	}

	return /^[\w\-.]{8,512}$/u.test(value) ? value : undefined;
}

type Row = { raw: string; token: StoredEpsilonToken | undefined };

async function readRow(db: Database): Promise<Row | undefined> {
	const [row] = await db
		.select({ value: settings.value })
		.from(settings)
		.where(eq(settings.key, epsilonSettingKey))
		.limit(1);
	if (!row) {
		return undefined;
	}

	const plaintext = decrypt(row.value);
	if (plaintext === undefined) {
		return { raw: row.value, token: undefined };
	}

	try {
		const parsed = storedSchema.safeParse(JSON.parse(plaintext));
		return { raw: row.value, token: parsed.success ? parsed.data : undefined };
	} catch {
		return { raw: row.value, token: undefined };
	}
}

async function writeToken(
	db: Database,
	token: StoredEpsilonToken,
	updatedBy: string,
	previousRaw?: string
): Promise<boolean> {
	const value = encrypt(JSON.stringify(token));
	if (previousRaw === undefined) {
		await db
			.insert(settings)
			.values({ key: epsilonSettingKey, value, updatedBy })
			.onConflictDoUpdate({
				target: settings.key,
				set: { value, updatedBy, updatedAt: new Date() },
			});
		return true;
	}

	const updated = await db
		.update(settings)
		.set({ value, updatedBy, updatedAt: new Date() })
		.where(
			and(eq(settings.key, epsilonSettingKey), eq(settings.value, previousRaw))
		)
		.returning({ key: settings.key });
	return updated.length > 0;
}

export type RefreshResult =
	| { ok: true; token: StoredEpsilonToken }
	| { ok: false; error: string };

/**
Trades a refresh token for a fresh access token (and a new refresh token).
*/
export async function refreshEpsilonSession(
	refreshToken: string,
	fetcher: typeof fetch = fetch
): Promise<RefreshResult> {
	const { base, apiKey } = epsilonConfig();
	try {
		const response = await fetcher(
			new URL("/auth/v1/token?grant_type=refresh_token", base),
			{
				method: "POST",
				headers: { apikey: apiKey, "Content-Type": "application/json" },
				body: JSON.stringify({ refresh_token: refreshToken }),
				cache: "no-store",
				signal: AbortSignal.timeout(8000),
			}
		);
		if (!response.ok) {
			return {
				ok: false,
				error:
					response.status === 400 || response.status === 401
						? "Epsilon rejected the token. It may have been used, revoked or signed out. Paste a new one."
						: `Epsilon responded ${response.status}. Try again later.`,
			};
		}

		const data = refreshResponse.parse(await response.json());
		const now = Math.floor(Date.now() / 1000);
		return {
			ok: true,
			token: {
				refreshToken: data.refresh_token,
				accessToken: data.access_token,
				expiresAt: data.expires_at ?? now + (data.expires_in ?? 3600),
				email: data.user?.email,
				refreshedAt: Date.now(),
			},
		};
	} catch {
		return { ok: false, error: "Couldn’t reach Epsilon. Try again later." };
	}
}

/**
Validates a pasted token against Epsilon, then stores it.
*/
export async function saveEpsilonToken(
	db: Database,
	input: string,
	updatedBy: string,
	fetcher: typeof fetch = fetch
): Promise<RefreshResult> {
	const refreshToken = parseRefreshTokenInput(input);
	if (!refreshToken) {
		return {
			ok: false,
			error:
				"That doesn’t look like a refresh token. Paste the refresh_token value (or the whole auth JSON).",
		};
	}

	const result = await refreshEpsilonSession(refreshToken, fetcher);
	if (result.ok) {
		await writeToken(db, result.token, updatedBy);
	}

	return result;
}

export async function removeEpsilonToken(db: Database) {
	await db.delete(settings).where(eq(settings.key, epsilonSettingKey));
}

const refreshMarginSeconds = 120;

/**
A valid Epsilon access token, refreshing it when needed. Undefined when no
token is stored or it no longer works (the board then uses the fallback).
*/
export async function getEpsilonAccessToken(
	db: Database,
	fetcher: typeof fetch = fetch
): Promise<string | undefined> {
	const row = await readRow(db);
	const stored = row?.token;
	if (!row || !stored) {
		return undefined;
	}

	const now = Math.floor(Date.now() / 1000);
	if (stored.accessToken && (stored.expiresAt ?? 0) - refreshMarginSeconds > now) {
		return stored.accessToken;
	}

	if (stored.error) {
		return undefined; // Already failed; wait for an admin to paste a new one.
	}

	const result = await refreshEpsilonSession(stored.refreshToken, fetcher);
	if (!result.ok) {
		await writeToken(db, { ...stored, error: result.error }, "system", row.raw);
		return undefined;
	}

	const saved = await writeToken(db, result.token, "system", row.raw);
	if (!saved) {
		// Another request refreshed first; its token is the current one.
		const latest = await readRow(db);
		return latest?.token?.accessToken;
	}

	return result.token.accessToken;
}

export type EpsilonStatus =
	| { state: "missing"; envFallback: boolean }
	| { state: "unreadable"; envFallback: boolean }
	| {
			state: "connected" | "error";
			envFallback: boolean;
			email?: string;
			expiresAt?: number;
			refreshedAt?: number;
			updatedAt: Date;
			updatedBy?: string;
			error?: string;
	  };

/**
What the dashboard shows. Never includes the tokens themselves.
*/
export async function getEpsilonStatus(db: Database): Promise<EpsilonStatus> {
	const envFallback = Boolean(process.env.EPSILON_ACCESS_TOKEN);
	const [row] = await db
		.select()
		.from(settings)
		.where(eq(settings.key, epsilonSettingKey))
		.limit(1);
	if (!row) {
		return { state: "missing", envFallback };
	}

	const parsed = await readRow(db);
	const token = parsed?.token;
	if (!token) {
		return { state: "unreadable", envFallback };
	}

	return {
		state: token.error ? "error" : "connected",
		envFallback,
		email: token.email,
		expiresAt: token.expiresAt,
		refreshedAt: token.refreshedAt,
		updatedAt: row.updatedAt,
		updatedBy: row.updatedBy ?? undefined,
		error: token.error,
	};
}
