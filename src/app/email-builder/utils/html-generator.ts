import type { NewsletterFormData } from "@/types/email-builder";

// Note: HTML generation requires a server-side API route
// This utility will call an API endpoint to generate the final HTML
export const generateNewsletterHtml = async (
	data: NewsletterFormData
): Promise<string> => {
	try {
		const response = await fetch("/api/email-builder/render", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(data),
		});

		if (!response.ok) {
			throw new Error("Failed to generate HTML");
		}

		const result = (await response.json()) as { html: string };
		return result.html;
	} catch (error) {
		console.error("Failed to generate HTML:", error);
		throw new Error("Failed to generate newsletter HTML");
	}
};

export const copyToClipboard = async (text: string): Promise<boolean> => {
	try {
		if (
			typeof navigator !== "undefined" &&
			typeof globalThis !== "undefined" &&
			globalThis.window?.isSecureContext &&
			navigator.clipboard?.writeText
		) {
			await navigator.clipboard.writeText(text);
			return true;
		}
	} catch (error) {
		console.error("Failed to copy to clipboard:", error);
	}

	return false;
};

export const downloadAsHtml = (
	html: string,
	filename = "newsletter.html"
): void => {
	try {
		const element = document.createElement("a");
		const file = new Blob([html], { type: "text/html" });
		element.href = URL.createObjectURL(file);
		element.download = filename;
		document.body.append(element);
		element.click();
		element.remove();
		URL.revokeObjectURL(element.href);
	} catch (error) {
		console.error("Failed to download HTML:", error);
	}
};
