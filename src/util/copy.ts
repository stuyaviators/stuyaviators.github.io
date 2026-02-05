export default async function copy(value: string) {
	try {
		if (
			typeof navigator !== "undefined" &&
			globalThis.window !== undefined &&
			globalThis.isSecureContext &&
			navigator.clipboard?.writeText
		) {
			await navigator.clipboard.writeText(value);
			return true;
		}
	} catch {}

	if (typeof navigator !== "undefined" && navigator.share) {
		try {
			await navigator.share({ text: value });
			return true;
		} catch {}
	}

	return false;
}
