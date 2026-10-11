import { isBlobUrl } from "@/lib/blob-url";
import { z } from "zod";

/*
 * Suggests a description for a newly uploaded gallery photo using Google's
 * Gemini API (free tier, GEMINI_API_KEY). The officer always sees and can
 * edit the text before it is saved, and the public viewer labels captions as
 * AI-generated. Only photos already uploaded to our own Blob store are sent.
 */

const defaultModel = "gemini-3.5-flash-lite";
const maxImageBytes = 8_000_000;
const imageTypes = new Set(["image/jpeg", "image/png", "image/webp"]);

export const captionPrompt = [
	"Write one plain sentence, 25 words at most, describing this photo for a person who cannot see it.",
	"Say only what is clearly visible: the aircraft, place, activity or setting.",
	"Do not name or identify any person, do not guess ages or roles, and do not start with “A photo of” or “An image of”.",
	"Reply with the sentence only.",
].join(" ");

export class CaptionError extends Error {}

const partSchema = z.object({ text: z.string().optional() });
const contentSchema = z.object({ parts: z.array(partSchema) });
const candidateSchema = z.object({ content: contentSchema.optional() });
const responseSchema = z.object({
	candidates: z.array(candidateSchema).optional(),
});

/**
The model's reply as one line, without surrounding quotes, within 300 characters.
*/
export function cleanCaption(raw: string): string {
	const quotes = new Set(['"', "'", "“", "”"]);
	let text = raw.replaceAll(/\s+/gu, " ").trim();
	while (text.length > 0 && quotes.has(text.charAt(0))) {
		text = text.slice(1);
	}

	while (text.length > 0 && quotes.has(text.at(-1) ?? "")) {
		text = text.slice(0, -1);
	}

	text = text.trim();
	return text.length > 300 ? `${text.slice(0, 299).trimEnd()}…` : text;
}

export function readCaption(body: unknown): string | undefined {
	const parsed = responseSchema.safeParse(body);
	if (!parsed.success) {
		return undefined;
	}

	const parts = parsed.data.candidates?.at(0)?.content?.parts ?? [];
	const caption = cleanCaption(parts.map((part) => part.text ?? "").join(" "));
	return caption === "" ? undefined : caption;
}

async function loadImage(url: string) {
	if (!isBlobUrl(url)) {
		throw new CaptionError("Upload the photo first.");
	}

	const response = await fetch(url, { signal: AbortSignal.timeout(10_000) });
	const type = response.headers.get("content-type")?.split(";", 1)[0]?.trim();
	if (type === undefined || !imageTypes.has(type) || !response.ok) {
		throw new CaptionError("Couldn’t read the uploaded photo.");
	}

	const bytes = Buffer.from(await response.arrayBuffer());
	if (bytes.byteLength > maxImageBytes) {
		throw new CaptionError(
			"That photo is too large to describe automatically."
		);
	}

	return { type, data: bytes.toString("base64") };
}

export async function captionPhoto(imageUrl: string): Promise<string> {
	const key = process.env.GEMINI_API_KEY?.trim();
	if (key === undefined || key === "") {
		throw new CaptionError(
			"Automatic captions aren’t set up yet (GEMINI_API_KEY is missing)."
		);
	}

	const model = (process.env.GEMINI_MODEL?.trim() ?? "") || defaultModel;
	const image = await loadImage(imageUrl);
	const response = await fetch(
		`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`,
		{
			method: "POST",
			signal: AbortSignal.timeout(20_000),
			headers: { "content-type": "application/json", "x-goog-api-key": key },
			body: JSON.stringify({
				contents: [
					{
						parts: [
							{ text: captionPrompt },
							{ inline_data: { mime_type: image.type, data: image.data } },
						],
					},
				],
				generationConfig: { maxOutputTokens: 200, temperature: 0.2 },
			}),
		}
	).catch(() => {
		throw new CaptionError(
			"Couldn’t reach the caption service. Type one instead."
		);
	});

	if (response.status === 429) {
		throw new CaptionError(
			"The free caption limit was reached for now. Type one instead."
		);
	}

	if (!response.ok) {
		console.error("Caption request failed", response.status);
		throw new CaptionError("The caption service said no. Type one instead.");
	}

	const caption = readCaption(await response.json());
	if (caption === undefined) {
		throw new CaptionError("No caption came back. Type one instead.");
	}

	return caption;
}
