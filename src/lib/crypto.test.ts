import { afterEach, describe, expect, it } from "vitest";
import { decrypt, encrypt } from "./crypto.ts";

const secret = "a-long-test-secret-value";

describe("crypto", () => {
	const original = process.env.AUTH_SECRET;
	afterEach(() => {
		if (original === undefined) {
			delete process.env.AUTH_SECRET;
		} else {
			process.env.AUTH_SECRET = original;
		}
	});

	it("round-trips text, including unicode", () => {
		const text = JSON.stringify({ refreshToken: "tok_123", note: "Peña ✈️" });
		expect(decrypt(encrypt(text, secret), secret)).toBe(text);
		expect(decrypt(encrypt("", secret), secret)).toBe("");
	});

	it("never repeats a ciphertext and never contains the plaintext", () => {
		const a = encrypt("super-secret-token", secret);
		const b = encrypt("super-secret-token", secret);
		expect(a).not.toBe(b);
		expect(a).not.toContain("super-secret-token");
		expect(a.startsWith("v1.")).toBe(true);
	});

	it("rejects tampered values", () => {
		const value = encrypt("hello world", secret);
		const [version, iv, tag, data] = value.split(".", 4);
		const flipped = `${data!.slice(0, -2)}${data!.endsWith("AA") ? "BB" : "AA"}`;
		expect(
			decrypt([version, iv, tag, flipped].join("."), secret)
		).toBeUndefined();
		expect(
			decrypt([version, iv, "AAAA", data].join("."), secret)
		).toBeUndefined();
		expect(decrypt("v2.a.b.c", secret)).toBeUndefined();
		expect(decrypt("garbage", secret)).toBeUndefined();
	});

	it("can't be read with a different secret", () => {
		expect(
			decrypt(encrypt("hello", secret), "another-secret-entirely")
		).toBeUndefined();
	});

	it("uses AUTH_SECRET by default, and refuses without one", () => {
		process.env.AUTH_SECRET = secret;
		expect(decrypt(encrypt("hi"))).toBe("hi");
		delete process.env.AUTH_SECRET;
		expect(() => encrypt("hi")).toThrow("AUTH_SECRET");
	});
});
