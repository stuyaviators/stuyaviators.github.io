/*
 * Ported from recode's src/util/copy.ts (webcubed). Replaced the
 * navigator.share fallback (surprising for a copy button) with the
 * hidden-textarea execCommand fallback for older/insecure contexts.
 */
export default async function copy(value: string): Promise<boolean> {
	try {
		if (globalThis.isSecureContext && navigator.clipboard?.writeText) {
			await navigator.clipboard.writeText(value);
			return true;
		}
	} catch {}

	try {
		const textarea = document.createElement("textarea");
		textarea.value = value;
		textarea.setAttribute("readonly", "");
		textarea.style.position = "fixed";
		textarea.style.opacity = "0";
		document.body.append(textarea);
		textarea.select();
		// eslint-disable-next-line @typescript-eslint/no-deprecated
		const ok = document.execCommand("copy");
		textarea.remove();
		return ok;
	} catch {
		return false;
	}
}
