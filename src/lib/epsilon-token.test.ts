import type { Database } from "@/db";
import { settings } from "@/db/schema";
import { createTestDb } from "@/test/pglite";
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
	getEpsilonAccessToken,
	getEpsilonStatus,
	parseRefreshTokenInput,
	removeEpsilonToken,
	saveEpsilonToken,
} from "./epsilon-token.ts";

let db: Database;
beforeEach(async () => {
	process.env.AUTH_SECRET = "test-secret-for-epsilon";
	delete process.env.EPSILON_ACCESS_TOKEN;
	db = await createTestDb();
});

const now = () => Math.floor(Date.now() / 1000);

function session(
	access: string,
	refresh: string,
	expiresAt = now() + 3600
): Response {
	return Response.json({
		access_token: access,
		refresh_token: refresh,
		expires_at: expiresAt,
		user: { email: "pstuyvesant60@stuy.edu" },
	});
}

function fetcher(...responses: Response[]) {
	const queue = [...responses];
	return vi.fn<typeof fetch>(
		async () => queue.shift() ?? new Response("", { status: 500 })
	);
}

function refreshTokenSent(mock: ReturnType<typeof fetcher>, call: number) {
	const body = JSON.parse(mock.mock.calls[call]?.[1]?.body as string) as {
		refresh_token: string;
	};
	return body.refresh_token;
}

describe("parseRefreshTokenInput", () => {
	it("accepts a bare token or the whole auth JSON", () => {
		expect(parseRefreshTokenInput("  abcDEF123456_-.  ")).toBe(
			"abcDEF123456_-."
		);
		expect(
			parseRefreshTokenInput(
				JSON.stringify({ access_token: "x", refresh_token: "refresh-me-123" })
			)
		).toBe("refresh-me-123");
	});

	it("rejects junk", () => {
		expect(parseRefreshTokenInput("")).toBeUndefined();
		expect(parseRefreshTokenInput("short")).toBeUndefined();
		expect(parseRefreshTokenInput("has spaces in it here")).toBeUndefined();
		expect(parseRefreshTokenInput("{not json")).toBeUndefined();
		expect(parseRefreshTokenInput('{"access_token":"x"}')).toBeUndefined();
	});
});

describe("saving a token", () => {
	it("checks it with Epsilon first and stores it encrypted", async () => {
		const mock = fetcher(session("access-1", "refresh-ROTATED-1"));
		const result = await saveEpsilonToken(
			db,
			"refresh-original-123",
			"admin@gmail.com",
			mock
		);
		expect(result.ok).toBe(true);
		expect(refreshTokenSent(mock, 0)).toBe("refresh-original-123");

		const [row] = await db.select().from(settings);
		expect(row?.value.startsWith("v1.")).toBe(true);
		expect(row?.value).not.toContain("refresh-ROTATED-1");
		expect(row?.updatedBy).toBe("admin@gmail.com");

		const status = await getEpsilonStatus(db);
		expect(status).toMatchObject({
			state: "connected",
			email: "pstuyvesant60@stuy.edu",
		});
		expect(JSON.stringify(status)).not.toContain("refresh-ROTATED-1");
		expect(JSON.stringify(status)).not.toContain("access-1");
	});

	it("stores nothing when Epsilon rejects the token", async () => {
		const mock = fetcher(new Response("{}", { status: 400 }));
		const result = await saveEpsilonToken(
			db,
			"refresh-bad-token-1",
			"admin",
			mock
		);
		expect(result).toMatchObject({ ok: false });
		expect(await db.select().from(settings)).toHaveLength(0);
		expect(await getEpsilonStatus(db)).toMatchObject({ state: "missing" });
	});

	it("rejects text that isn't a token without calling Epsilon", async () => {
		const mock = fetcher();
		const result = await saveEpsilonToken(db, "nope", "admin", mock);
		expect(result.ok).toBe(false);
		expect(mock).not.toHaveBeenCalled();
	});
});

describe("getEpsilonAccessToken", () => {
	it("returns undefined when nothing is stored", async () => {
		expect(await getEpsilonAccessToken(db, fetcher())).toBeUndefined();
	});

	it("reuses a still-valid access token without calling Epsilon", async () => {
		await saveEpsilonToken(
			db,
			"refresh-original-123",
			"a",
			fetcher(session("access-1", "refresh-2"))
		);
		const mock = fetcher();
		expect(await getEpsilonAccessToken(db, mock)).toBe("access-1");
		expect(mock).not.toHaveBeenCalled();
	});

	it("refreshes an expiring token and saves the rotated refresh token", async () => {
		await saveEpsilonToken(
			db,
			"refresh-original-123",
			"a",
			fetcher(session("access-old", "refresh-2", now() + 30)) // inside the 2 minute margin
		);
		const mock = fetcher(session("access-new", "refresh-3"));
		expect(await getEpsilonAccessToken(db, mock)).toBe("access-new");
		expect(refreshTokenSent(mock, 0)).toBe("refresh-2");

		// The next refresh must use the rotated token, not the original.
		await db.update(settings).set({ updatedAt: new Date() }); // no-op touch
		const status = await getEpsilonStatus(db);
		expect(status).toMatchObject({ state: "connected" });
	});

	it("uses the newest refresh token on the following refresh", async () => {
		await saveEpsilonToken(
			db,
			"refresh-original-123",
			"a",
			fetcher(session("a1", "refresh-2", now() - 10))
		);
		const first = fetcher(session("a2", "refresh-3", now() - 10));
		await getEpsilonAccessToken(db, first);
		expect(refreshTokenSent(first, 0)).toBe("refresh-2");
		const second = fetcher(session("a3", "refresh-4"));
		expect(await getEpsilonAccessToken(db, second)).toBe("a3");
		expect(refreshTokenSent(second, 0)).toBe("refresh-3");
	});

	it("records a failure and stops retrying until a new token is pasted", async () => {
		await saveEpsilonToken(
			db,
			"refresh-original-123",
			"a",
			fetcher(session("a1", "refresh-2", now() - 10))
		);
		const failing = fetcher(new Response("{}", { status: 401 }));
		expect(await getEpsilonAccessToken(db, failing)).toBeUndefined();
		expect(await getEpsilonStatus(db)).toMatchObject({ state: "error" });

		const again = fetcher(session("never", "used"));
		expect(await getEpsilonAccessToken(db, again)).toBeUndefined();
		expect(again).not.toHaveBeenCalled();

		await saveEpsilonToken(
			db,
			"refresh-fresh-paste-1",
			"a",
			fetcher(session("a9", "r9"))
		);
		expect(await getEpsilonAccessToken(db, fetcher())).toBe("a9");
	});

	it("when two requests refresh at once, both end up with the saved token", async () => {
		await saveEpsilonToken(
			db,
			"refresh-original-123",
			"a",
			fetcher(session("a1", "refresh-2", now() - 10))
		);
		const mock = fetcher(
			session("winner", "refresh-3"),
			session("loser", "refresh-3b")
		);
		const [a, b] = await Promise.all([
			getEpsilonAccessToken(db, mock),
			getEpsilonAccessToken(db, mock),
		]);
		expect(a).toBe(b);
		expect(a).toBe("winner");
	});

	it("reports an unreadable value when AUTH_SECRET changed", async () => {
		await saveEpsilonToken(
			db,
			"refresh-original-123",
			"a",
			fetcher(session("a1", "r2"))
		);
		process.env.AUTH_SECRET = "a-different-secret-now";
		expect(await getEpsilonAccessToken(db, fetcher())).toBeUndefined();
		expect(await getEpsilonStatus(db)).toMatchObject({ state: "unreadable" });
	});
});

it("removeEpsilonToken clears the stored token", async () => {
	await saveEpsilonToken(
		db,
		"refresh-original-123",
		"a",
		fetcher(session("a1", "r2"))
	);
	await removeEpsilonToken(db);
	expect(await getEpsilonStatus(db)).toMatchObject({ state: "missing" });
});
