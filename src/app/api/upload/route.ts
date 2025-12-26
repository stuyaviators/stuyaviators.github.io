import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(request: Request) {
	try {
		const form = await request.formData();
		const file = form.get("file") as File | null;
		if (!file) return NextResponse.json({ error: "No file" }, { status: 400 });

		const uploadForm = new FormData();
		uploadForm.append("reqtype", "fileupload");
		uploadForm.append("fileToUpload", file, (file as any).name ?? "upload");

		const response = await fetch("https://catbox.moe/user/api.php", {
			method: "POST",
			body: uploadForm,
		});

		const text = await response.text();
		if (!response.ok) throw new Error(text || "Catbox upload failed");

		return NextResponse.json({ url: text.trim() });
	} catch (error: any) {
		console.error("Upload failed:", error);
		return NextResponse.json(
			{ error: error?.message || "Upload failed" },
			{ status: 500 }
		);
	}
}
