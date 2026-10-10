import { z } from "zod";

const name = z
	.string()
	.trim()
	.min(1, "Please enter your name.")
	.max(120, "That name is too long.");
const email = z
	.string()
	.trim()
	.toLowerCase()
	.max(254)
	.pipe(z.email("Please enter a valid email address."));
const optionalEmail = z
	.string()
	.trim()
	.toLowerCase()
	.max(254)
	.refine(
		(value) => value === "" || z.email().safeParse(value).success,
		"Please enter a valid email address."
	);
const httpUrl = z
	.string()
	.trim()
	.max(2000)
	.refine(
		(value) => /^https?:\/\/\S+$/iv.test(value),
		"Use a link that starts with http:// or https://."
	);
const longText = (label: string, max = 4000) =>
	z
		.string()
		.trim()
		.min(1, `Please add ${label}.`)
		.max(max, `Please keep it under ${max} characters.`);

export const submissionSchemas = {
	contact: z.object({
		name,
		email,
		message: longText("a message"),
	}),
	story: z.object({
		name,
		email,
		classOf: z.string().trim().max(20).default(""),
		message: longText("your story", 6000),
	}),
	photo: z.object({
		name,
		email,
		link: httpUrl,
		message: longText("a short description", 2000),
	}),
	meeting_idea: z.object({
		name: z.string().trim().max(120).default(""),
		email: optionalEmail.default(""),
		message: longText("your suggestion", 2000),
	}),
} as const;

export type SubmissionType = keyof typeof submissionSchemas;
export const submissionTypes = Object.keys(
	submissionSchemas
) as SubmissionType[];
