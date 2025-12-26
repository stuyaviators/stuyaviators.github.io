import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(request: Request) {
	try {
		const form = await request.formData();
		const file = form.get("file") as File | undefined;
		if (!file) return NextResponse.json({ error: "No file" }, { status: 400 });

		const uploadForm = new FormData();
		uploadForm.append("reqtype", "fileupload");
		const fileName =
			typeof (file as { name?: unknown }).name === "string"
				? (file as { name: string }).name
				: "upload";
		uploadForm.append("fileToUpload", file, fileName);

		const response = await fetch("https://catbox.moe/user/api.php", {
			method: "POST",
			body: uploadForm,
		});

		const text = await response.text();
		if (!response.ok) throw new Error(text || "Catbox upload failed");

		return NextResponse.json({ url: text.trim() });
	} catch (error: unknown) {
		console.error("Upload failed:", error);
		const errorMessage =
			typeof error === "object" && error !== null && "message" in error
				? (error as { message?: string }).message
				: undefined;
		return NextResponse.json(
			{ error: errorMessage ?? "Upload failed" },
			{ status: 500 }
		);
	}
}
