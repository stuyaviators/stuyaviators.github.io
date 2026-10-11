import {
	createCipheriv,
	createDecipheriv,
	hkdfSync,
	randomBytes,
} from "node:crypto";

/*
 * Encrypts secrets (the Epsilon refresh token) before they're stored in the
 * database. AES-256-GCM with a key derived from AUTH_SECRET, so a leaked
 * database dump alone doesn't reveal them. Rotating AUTH_SECRET makes stored
 * values unreadable; the dashboard then asks for them again.
 */

const version = "v1";

function key(secret = process.env.AUTH_SECRET): Uint8Array {
	if (!secret) {
		throw new Error("AUTH_SECRET is not set");
	}

	return new Uint8Array(
		hkdfSync("sha256", secret, "stuyaviators", "settings-encryption", 32)
	);
}

export function encrypt(plaintext: string, secret?: string): string {
	const iv = randomBytes(12);
	const cipher = createCipheriv("aes-256-gcm", key(secret), iv);
	const data = Buffer.concat([
		cipher.update(plaintext, "utf8"),
		cipher.final(),
	]);
	return [version, iv, cipher.getAuthTag(), data]
		.map((part) =>
			typeof part === "string" ? part : part.toString("base64url")
		)
		.join(".");
}

/**
Returns undefined when the value was tampered with or the secret changed.
*/
export function decrypt(value: string, secret?: string): string | undefined {
	const [prefix, iv, tag, data] = value.split(".", 4);
	if (prefix !== version || !iv || !tag || data === undefined) {
		return undefined;
	}

	try {
		const decipher = createDecipheriv(
			"aes-256-gcm",
			key(secret),
			Buffer.from(iv, "base64url")
		);
		decipher.setAuthTag(Buffer.from(tag, "base64url"));
		return Buffer.concat([
			decipher.update(Buffer.from(data, "base64url")),
			decipher.final(),
		]).toString("utf8");
	} catch {
		return undefined;
	}
}
