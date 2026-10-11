import { describe, expect, it } from "vitest";
import {
	formatName,
	isLastNameMatch,
	messages,
	signupSchema,
	validateSignup,
} from "./mailing-list.ts";

type Row = {
	name: string;
	email: string;
	ok: boolean;
	why: string;
	submits?: { fullName?: string; email?: string };
	error?: string;
};

// The required cases from the brief, plus the normalized values we submit.
const rows: Row[] = [
	{
		name: "Peter Stuyvesant",
		email: "pstuyvesant60@stuy.edu",
		ok: true,
		why: "standard case",
		submits: { fullName: "Peter Stuyvesant", email: "pstuyvesant60@stuy.edu" },
	},
	{
		name: "peter stuyvesant",
		email: "PStuyvesant60@Stuy.edu",
		ok: true,
		why: "normalization",
		submits: { fullName: "Peter Stuyvesant", email: "pstuyvesant60@stuy.edu" },
	},
	{
		name: "PETER STUYVESANT",
		email: "pstuyvesant60@stuy.edu",
		ok: true,
		why: "all-caps name fixed",
		submits: { fullName: "Peter Stuyvesant" },
	},
	{
		name: "Bob Stuyvesant",
		email: "pstuyvesant60@stuy.edu",
		ok: true,
		why: "first name isn't checked (preferred name)",
	},
	{
		name: "Peter Stuyvesant",
		email: "astuyvesant60@stuy.edu",
		ok: true,
		why: "first initial isn't checked",
	},
	{
		name: "mary-peter o'brien",
		email: "mobrien30@stuy.edu",
		ok: true,
		why: "apostrophe in last name",
		submits: { fullName: "Mary-Peter O'Brien" },
	},
	{
		name: "josé peña",
		email: "jpena40@stuy.edu",
		ok: true,
		why: "accents",
		submits: { fullName: "José Peña" },
	},
	{
		name: "Maria De La Cruz",
		email: "mdelacruz12@stuy.edu",
		ok: true,
		why: "multi-part last name, full",
	},
	{
		name: "Maria De La Cruz",
		email: "mcruz12@stuy.edu",
		ok: true,
		why: "multi-part last name, loose",
	},
	{
		name: "Ana Smith-Jones",
		email: "asmith55@stuy.edu",
		ok: true,
		why: "hyphenated last name, loose",
	},
	{
		name: "Ana Smith-Jones",
		email: "asmithjones55@stuy.edu",
		ok: true,
		why: "hyphenated last name, full",
	},
	{
		name: "Peter Ming Stuyvesant",
		email: "pstuyvesant60@stuy.edu",
		ok: true,
		why: "middle name handled by the loose match",
	},
	{
		name: "Peter Stuyvesant",
		email: "pstuyvesant@stuy.edu",
		ok: false,
		why: "digits required",
		error: messages.emailDigits,
	},
	{
		name: "Peter Stuyvesant",
		email: "pstuyvesant60x@stuy.edu",
		ok: false,
		why: "characters after the digits",
		error: messages.emailDigits,
	},
	{
		name: "Peter Stuyvesant",
		email: "pstuyvesant60@gmail.com",
		ok: false,
		why: "not @stuy.edu",
		error: messages.emailDomain,
	},
	{
		name: "Peter Stuyvesant",
		email: "jsmith61@stuy.edu",
		ok: false,
		why: "last name mismatch (single part is strict)",
		error: messages.emailLastName,
	},
	{
		name: "Peter Stuyvesant",
		email: "stuyvesant60@stuy.edu",
		ok: false,
		why: "missing first initial",
		error: messages.emailLastName,
	},
	{
		name: "Maria De La Cruz",
		email: "mdelgado12@stuy.edu",
		ok: false,
		why: 'only short particles ("de") would match',
		error: messages.emailLastName,
	},
	{
		name: "Peter",
		email: "pstuyvesant60@stuy.edu",
		ok: false,
		why: "needs first and last name",
	},
	{ name: "", email: "", ok: false, why: "both required" },
];

describe("validateSignup", () => {
	for (const row of rows) {
		it(`${row.ok ? "accepts" : "rejects"} ${JSON.stringify(row.name)} / ${JSON.stringify(row.email)}: ${row.why}`, () => {
			const result = validateSignup({ fullName: row.name, email: row.email });
			expect(result.success).toBe(row.ok);
			if (result.success) {
				if (row.submits?.fullName) {
					expect(result.data.fullName).toBe(row.submits.fullName);
				}

				if (row.submits?.email) {
					expect(result.data.email).toBe(row.submits.email);
				}
			} else if (row.error) {
				expect(result.errors.email).toBe(row.error);
			}
		});
	}

	it("reports both fields when both are empty", () => {
		const result = validateSignup({ fullName: "", email: "" });
		expect(result).toEqual({
			success: false,
			errors: {
				fullName: messages.nameRequired,
				email: messages.emailDomain,
			},
		});
	});

	it("flags the last-name mismatch so the UI can show the escape hatch", () => {
		const result = validateSignup({
			fullName: "Peter Stuyvesant",
			email: "jsmith61@stuy.edu",
		});
		expect(result.success).toBe(false);
		if (!result.success) {
			expect(result.errors.lastNameMismatch).toBe(true);
		}
	});

	it("rejects a one-word name with the first-and-last message", () => {
		const result = validateSignup({
			fullName: "Peter",
			email: "pstuyvesant60@stuy.edu",
		});
		expect(result.success).toBe(false);
		if (!result.success) {
			expect(result.errors.fullName).toBe(messages.nameRequired);
		}
	});

	it("rejects disallowed characters in names", () => {
		const result = validateSignup({
			fullName: "Peter Stuyvesant2",
			email: "pstuyvesant60@stuy.edu",
		});
		expect(result.success).toBe(false);
		if (!result.success) {
			expect(result.errors.fullName).toBe(messages.nameCharacters);
		}
	});

	it("trims and collapses whitespace", () => {
		const result = validateSignup({
			fullName: "  peter    stuyvesant ",
			email: "  pstuyvesant60@stuy.edu ",
		});
		expect(result).toEqual({
			success: true,
			data: { fullName: "Peter Stuyvesant", email: "pstuyvesant60@stuy.edu" },
		});
	});

	it("matches all-short multi-part names by concatenation", () => {
		expect(isLastNameMatch("Tran Le Ng", "tleng5@stuy.edu")).toBe(true);
	});
});

describe("formatName", () => {
	it.each([
		["peter stuyvesant", "Peter Stuyvesant"],
		["mary-peter o'brien", "Mary-Peter O'Brien"],
		["josé peña", "José Peña"],
		["PETER", "Peter"],
		["ronald McDonald", "Ronald McDonald"],
		["O'BRIEN", "O'Brien"],
	])("%s → %s", (input, expected) => {
		expect(formatName(input)).toBe(expected);
	});
});

describe("schemas", () => {
	it("signupSchema returns normalized values", () => {
		expect(
			signupSchema.parse({
				fullName: "peter stuyvesant",
				email: "PStuyvesant60@Stuy.edu",
			})
		).toEqual({
			fullName: "Peter Stuyvesant",
			email: "pstuyvesant60@stuy.edu",
		});
	});

	it("signupSchema rejects invalid input with field paths", () => {
		const result = signupSchema.safeParse({ fullName: "Peter", email: "x" });
		expect(result.success).toBe(false);
		const paths = result.error?.issues.map((issue) => issue.path[0]);
		expect(paths).toEqual(["fullName", "email"]);
	});
});
