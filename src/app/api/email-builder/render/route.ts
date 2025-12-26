"use server";

import { type NewsletterFormData } from "@/types/email-builder";

export async function POST(request: Request) {
	try {
		const data = (await request.json()) as NewsletterFormData;

		const html = `
			<!DOCTYPE html>
			<html>
				<head>
					<meta charset="utf-8">
					<title>Newsletter</title>
				</head>
				<body>
					<p>${data.introHeading}</p>
				</body>
			</html>
		`;

		return Response.json({ html });
	} catch (error) {
		console.error("Error rendering newsletter:", error);
		return Response.json(
			{ error: "Failed to render newsletter" },
			{ status: 500 }
		);
	}
}
