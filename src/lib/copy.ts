/*
 * Ported from recode's src/util/copy.ts (webcubed). Replaced the
 * navigator.share fallback (surprising for a copy button) with the
 * hidden-textarea execCommand fallback for older/insecure contexts.
 */
export type CopyResult = "copied" | "failed";

export default async function copy(value: string): Promise<CopyResult> {
	try {
		if (globalThis.isSecureContext && "clipboard" in navigator) {
			await navigator.clipboard.writeText(value);
			return "copied";
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
		const isOk = document.execCommand("copy");
		textarea.remove();
		return isOk ? "copied" : "failed";
	} catch {
		return "failed";
	}
}
