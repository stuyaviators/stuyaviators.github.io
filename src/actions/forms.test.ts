import type { Database } from "@/db";
import { submissions } from "@/db/schema";
import { honeypotField, initialFormState } from "@/lib/form-state";
import { createTestDb } from "@/test/pglite";
import { beforeEach, describe, expect, it, vi } from "vitest";

// --- Mocks: no real network, no Next.js request context. --------------------
let testDb: Database | undefined;
vi.mock("@/db", () => ({ getDb: () => testDb }));
vi.mock("next/headers", () => ({
	headers: async () => new Headers({ "x-forwarded-for": "203.0.113.7" }),
}));
const deferred: Array<() => Promise<void>> = [];
vi.mock("next/server", () => ({
	after(task: () => Promise<void>) {
		deferred.push(task);
	},
}));

const fetchMock = vi.fn<typeof fetch>();
vi.stubGlobal("fetch", fetchMock);

const { signUpForMailingList, submitForm, unsubscribe } =
	await import("./forms.ts");

const formAction =
	"https://docs.google.com/forms/d/e/1FAIpQLScbjyhaEiBhMZPDi8TNQJZemMCSR9xfpChoRN0RP_sDhfS-ag/formResponse";

function form(values: Record<string, string>) {
	const data = new FormData();
	for (const [key, value] of Object.entries(values)) {
		data.set(key, value);
	}

	return data;
}

async function flushAfter() {
	while (deferred.length > 0) {
		// eslint-disable-next-line no-await-in-loop
		await deferred.shift()?.();
	}
}

function googleCalls() {
	return fetchMock.mock.calls.filter(([url]) => url === formAction);
}

beforeEach(async () => {
	testDb = await createTestDb();
	fetchMock.mockReset();
	fetchMock.mockResolvedValue(new Response("ok", { status: 200 }));
	deferred.length = 0;
	delete process.env.DISCORD_WEBHOOK_URL;
	delete process.env.GOOGLE_FORM_UNSUBSCRIBE_ACTION;
	delete process.env.GOOGLE_FORM_UNSUBSCRIBE_EMAIL_ENTRY;
});

describe("signUpForMailingList", () => {
	it("posts exactly the two entries, normalized, to formResponse", async () => {
		const state = await signUpForMailingList(
			initialFormState,
			form({
				fullName: "  peter   stuyvesant ",
				email: "PStuyvesant60@Stuy.edu",
			})
		);
		expect(state).toEqual({ status: "success", joinedMailingList: true });
		const calls = googleCalls();
		expect(calls).toHaveLength(1);
		const [, init] = calls[0];
		expect(init?.method).toBe("POST");
		expect(new Headers(init?.headers).get("content-type")).toBe(
			"application/x-www-form-urlencoded"
		);
		const body = new URLSearchParams(init?.body as string);
		expect(body.keys().toArray()).toEqual([
			"entry.1248809368",
			"entry.1701037871",
		]);
		expect(body.get("entry.1248809368")).toBe("Peter Stuyvesant");
		expect(body.get("entry.1701037871")).toBe("pstuyvesant60@stuy.edu");
	});

	it("re-validates on the server: a request that skips the client is rejected", async () => {
		const state = await signUpForMailingList(
			initialFormState,
			form({ fullName: "Peter Stuyvesant", email: "jsmith61@stuy.edu" })
		);
		expect(state.status).toBe("error");
		expect(state.lastNameMismatch).toBe(true);
		expect(state.fallbackUrl).toBe("https://forms.gle/vzSfXNKrsejNe1rd6");
		expect(fetchMock).not.toHaveBeenCalled();
	});

	it("silently drops honeypot submissions", async () => {
		const state = await signUpForMailingList(
			initialFormState,
			form({
				fullName: "Peter Stuyvesant",
				email: "pstuyvesant60@stuy.edu",
				[honeypotField]: "https://spam.example",
			})
		);
		expect(state.status).toBe("success");
		expect(fetchMock).not.toHaveBeenCalled();
	});

	it("rate-limits repeated submissions from one IP", async () => {
		const states = [];
		for (let i = 0; i < 6; i++) {
			states.push(
				// eslint-disable-next-line no-await-in-loop
				await signUpForMailingList(
					initialFormState,
					form({
						fullName: "Peter Stuyvesant",
						email: "pstuyvesant60@stuy.edu",
					})
				)
			);
		}

		expect(states.slice(0, 5).every((s) => s.status === "success")).toBe(true);
		expect(states[5]?.status).toBe("error");
		expect(states[5]?.message).toMatch(/too many/iu);
		expect(googleCalls()).toHaveLength(5);
	});

	it("shows the fallback link (not a false success) when Google fails", async () => {
		fetchMock.mockResolvedValue(new Response("nope", { status: 404 }));
		const state = await signUpForMailingList(
			initialFormState,
			form({ fullName: "Peter Stuyvesant", email: "pstuyvesant60@stuy.edu" })
		);
		expect(state.status).toBe("error");
		expect(state.fallbackUrl).toBe("https://forms.gle/vzSfXNKrsejNe1rd6");
	});

	it("shows the fallback link when the endpoint is unreachable", async () => {
		fetchMock.mockRejectedValue(new TypeError("fetch failed"));
		const state = await signUpForMailingList(
			initialFormState,
			form({ fullName: "Peter Stuyvesant", email: "pstuyvesant60@stuy.edu" })
		);
		expect(state.status).toBe("error");
		expect(state.fallbackUrl).toBeDefined();
	});

	it("records the sign-up and alerts Discord without mentions", async () => {
		process.env.DISCORD_WEBHOOK_URL = "https://discord.test/webhook";
		await signUpForMailingList(
			initialFormState,
			form({ fullName: "Peter Stuyvesant", email: "pstuyvesant60@stuy.edu" })
		);
		await flushAfter();
		const rows = await testDb!.select().from(submissions);
		expect(rows).toHaveLength(1);
		expect(rows[0]).toMatchObject({
			type: "mailing_list",
			mailingList: "submitted",
		});
		const discord = fetchMock.mock.calls.find(
			([url]) => url === "https://discord.test/webhook"
		);
		const payload = JSON.parse(discord?.[1]?.body as string) as {
			allowed_mentions: { parse: unknown[] };
		};
		expect(payload.allowed_mentions).toEqual({ parse: [] });
		expect(JSON.stringify(payload)).not.toContain("pstuyvesant60@stuy.edu");
	});
});

describe("submitForm", () => {
	it("saves a contact message and auto-joins the mailing list with a Stuy email", async () => {
		const state = await submitForm(
			"contact",
			initialFormState,
			form({
				name: "Peter Stuyvesant",
				email: "pstuyvesant60@stuy.edu",
				message: "Hello!",
			})
		);
		expect(state).toEqual({ status: "success", joinedMailingList: true });
		const rows = await testDb!.select().from(submissions);
		expect(rows[0]).toMatchObject({
			type: "contact",
			name: "Peter Stuyvesant",
			message: "Hello!",
			status: "new",
			mailingList: "submitted",
		});
		expect(googleCalls()).toHaveLength(1);
	});

	it("skips the mailing list for non-Stuy emails but still saves", async () => {
		const state = await submitForm(
			"contact",
			initialFormState,
			form({ name: "A Parent", email: "parent@example.com", message: "Hi" })
		);
		expect(state).toEqual({ status: "success", joinedMailingList: false });
		const rows = await testDb!.select().from(submissions);
		expect(rows[0]?.mailingList).toBe("skipped");
		expect(googleCalls()).toHaveLength(0);
	});

	it("returns field errors for invalid input and saves nothing", async () => {
		const state = await submitForm(
			"photo",
			initialFormState,
			form({
				name: "",
				email: "x",
				link: ["javascript", "alert(1)"].join(":"),
				message: "",
			})
		);
		expect(state.status).toBe("error");
		expect(Object.keys(state.fieldErrors ?? {}).toSorted()).toEqual([
			"email",
			"link",
			"message",
			"name",
		]);
		expect(await testDb!.select().from(submissions)).toHaveLength(0);
	});

	it("rejects unknown form types", async () => {
		const state = await submitForm(
			"bogus" as "contact",
			initialFormState,
			form({ name: "x" })
		);
		expect(state.status).toBe("error");
	});
});

describe("unsubscribe", () => {
	it("falls back to mailto while GOOGLE_FORM_UNSUBSCRIBE_* is unset", async () => {
		const state = await unsubscribe(
			initialFormState,
			form({ email: "pstuyvesant60@stuy.edu" })
		);
		expect(state.fallbackUrl).toBe(
			"mailto:stuyaviators@gmail.com?subject=Unsubscribe"
		);
		expect(fetchMock).not.toHaveBeenCalled();
	});

	it("posts to the unsubscribe form once configured", async () => {
		process.env.GOOGLE_FORM_UNSUBSCRIBE_ACTION =
			"https://forms.test/formResponse";
		process.env.GOOGLE_FORM_UNSUBSCRIBE_EMAIL_ENTRY = "entry.42";
		const state = await unsubscribe(
			initialFormState,
			form({ email: "JSmith61@stuy.edu" })
		);
		expect(state.status).toBe("success");
		const body = new URLSearchParams(
			fetchMock.mock.calls[0]?.[1]?.body as string
		);
		expect(body.get("entry.42")).toBe("jsmith61@stuy.edu");
	});
});
