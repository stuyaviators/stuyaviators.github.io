"use client";

import { GlassButton } from "@/components/GlassButton";
import { type NewsletterFormData } from "@/types/email-builder";
import { Copy, Download } from "lucide-react";
import { useState } from "react";
import { downloadAsHtml } from "../utils/html-generator";
import { PreviewRenderer } from "./PreviewRenderer";

type PreviewPanelProps = {
	data: NewsletterFormData;
	onReorderArticles?: (fromIndex: number, toIndex: number) => void;
};

export const PreviewPanel: React.FC<PreviewPanelProps> = ({
	data,
	onReorderArticles,
}) => {
	const [copyMessage, setCopyMessage] = useState<string | undefined>(undefined);

	const handleCopyHtml = async () => {
		try {
			const html = generateHtml(data);
			if (
				typeof navigator !== "undefined" &&
				globalThis.window !== undefined &&
				globalThis.isSecureContext &&
				navigator.clipboard?.writeText
			) {
				await navigator.clipboard.writeText(html);
				setCopyMessage("Copied to clipboard!");
				setTimeout(() => {
					setCopyMessage(undefined);
				}, 2000);
			}
		} catch (error) {
			console.error("Failed to copy:", error);
			setCopyMessage("Failed to copy");
			setTimeout(() => {
				setCopyMessage(undefined);
			}, 2000);
		}
	};

	const handleCopyRendered = async () => {
		try {
			const previewElement = document.querySelector(
				".preview-renderer-content"
			);
			if (!previewElement) {
				setCopyMessage("Preview not found");
				setTimeout(() => setCopyMessage(undefined), 2000);
				return;
			}

			// Try modern Clipboard API first
			if (navigator.clipboard?.write) {
				try {
					const htmlContent = previewElement.outerHTML;
					const blob = new Blob([htmlContent], { type: "text/html" });
					const clipboardItem = new ClipboardItem({ "text/html": blob });
					await navigator.clipboard.write([clipboardItem]);
					setCopyMessage("Copied formatted content!");
					setTimeout(() => setCopyMessage(undefined), 2000);
					return;
				} catch (apiError) {
					console.log("Clipboard API failed, trying fallback:", apiError);
				}
			}

			// Fallback: execCommand method
			const tempDiv = document.createElement("div");
			tempDiv.contentEditable = "true";
			tempDiv.style.position = "fixed";
			tempDiv.style.left = "-9999px";
			tempDiv.innerHTML = previewElement.outerHTML;
			document.body.appendChild(tempDiv);

			const range = document.createRange();
			range.selectNodeContents(tempDiv);
			const selection = window.getSelection();
			if (selection) {
				selection.removeAllRanges();
				selection.addRange(range);
				const success = document.execCommand("copy");
				selection.removeAllRanges();
				document.body.removeChild(tempDiv);

				if (success) {
					setCopyMessage("Copied formatted content!");
					setTimeout(() => setCopyMessage(undefined), 2000);
				} else {
					setCopyMessage("Failed to copy");
					setTimeout(() => setCopyMessage(undefined), 2000);
				}
			} else {
				document.body.removeChild(tempDiv);
				setCopyMessage("Failed to copy");
				setTimeout(() => setCopyMessage(undefined), 2000);
			}
		} catch (error) {
			console.error("Failed to copy:", error);
			setCopyMessage("Failed to copy");
			setTimeout(() => setCopyMessage(undefined), 2000);
		}
	};

	const handleDownloadHtml = () => {
		const html = generateHtml(data);
		downloadAsHtml(html, "newsletter.html");
	};

	return (
		<div className="flex h-full flex-col rounded-lg border border-ctp-overlay1/40 bg-linear-to-br from-ctp-surface0/60 via-ctp-base/50 to-ctp-surface0/40 backdrop-blur-lg">
			{/* Header */}
			<div className="border-b border-ctp-overlay1/40 p-4 sm:p-6">
				<div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
					<h2 className="text-xl font-bold text-ctp-text">Preview</h2>
					<div className="flex flex-wrap gap-2">
						<GlassButton
							onClick={handleCopyRendered}
							variant="primary"
							title="Copy formatted content for Gmail"
						>
							<Copy className="h-4 w-4" aria-hidden />
							<span className="hidden sm:inline ml-2">Copy Rendered</span>
						</GlassButton>
						<GlassButton
							onClick={handleCopyHtml}
							variant="secondary"
							title="Copy raw HTML to clipboard"
						>
							<Copy className="h-4 w-4" aria-hidden />
							<span className="hidden sm:inline ml-2">Copy Raw HTML</span>
						</GlassButton>
						<GlassButton
							onClick={handleDownloadHtml}
							variant="secondary"
							title="Download as HTML file"
						>
							<Download className="h-4 w-4" aria-hidden />
							<span className="hidden sm:inline ml-2">Download</span>
						</GlassButton>
					</div>
				</div>

				{copyMessage && (
					<p
						className={`mt-2 text-sm ${
							copyMessage.includes("Failed") ? "text-ctp-red" : "text-ctp-green"
						}`}
					>
						{copyMessage}
					</p>
				)}
			</div>

			{/* Preview Content */}
			<div className="flex-1 overflow-auto p-4 sm:p-6">
				<div className="rounded-lg bg-white p-4 sm:p-6 shadow-lg">
					<PreviewRenderer data={data} onReorderArticles={onReorderArticles} />
				</div>
			</div>
		</div>
	);
};

function generateHtml(data: NewsletterFormData): string {
	return `<!DOCTYPE html>
<html>
<head>
	<meta charset="utf-8">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	<title>Newsletter</title>
	<style>
		body {
			font-family: 'Lexend', sans-serif;
			background-color: #11111b;
			color: #cdd6f4;
			margin: 0;
			padding: 8px;
		}
		.container {
			max-width: 600px;
			margin: 20px auto;
			padding: 16px;
			border-radius: 16px;
			background: linear-gradient(135deg, rgba(49, 50, 68, 0.75) 0%, rgba(30, 30, 46, 0.65) 50%, rgba(49, 50, 68, 0.55) 100%);
			backdrop-filter: blur(20px);
			border: 1px solid rgba(127, 132, 156, 0.6);
			box-shadow: 0px 18px 38px rgba(0, 0, 0, 0.35), 0px 0px 24px rgba(127, 132, 156, 0.16);
		}
		h1, h2, h3 { margin: 0 0 12px 0; }
		p { margin: 0 0 16px 0; line-height: 1.6; }
		a { color: #cdd6f4; text-decoration: none; }
		.article {
			margin-bottom: 20px;
			padding: 12px 16px;
			border-radius: 12px;
			background: linear-gradient(135deg, rgba(49, 50, 68, 0.75) 0%, rgba(30, 30, 46, 0.65) 50%, rgba(49, 50, 68, 0.55) 100%);
			border: 1px solid rgba(127, 132, 156, 0.35);
		}
		.button {
			display: inline-block;
			padding: 6px 10px;
			border-radius: 8px;
			background: linear-gradient(135deg, rgba(127, 132, 156, 0.20) 0%, rgba(127, 132, 156, 0.14) 100%);
			border: 1px solid rgba(127, 132, 156, 0.45);
			color: #cdd6f4;
			text-decoration: none;
			font-size: 12px;
			font-weight: 600;
		}
		.footer {
			margin-top: 20px;
			padding-top: 20px;
			border-top: 1px solid #313244;
			font-size: 12px;
			text-align: center;
			color: #a6adc8;
		}
	</style>
</head>
<body>
	<div class="container">
		<h1>${escapeHtml(data.headerTitle)}</h1>
		<h2>${escapeHtml(data.introHeading)}</h2>
		<p>${escapeHtml(data.introText)}</p>
		
		${data.articles
			.map(
				(article) => `
			<div class="article">
				${article.imageUrl ? `<img src="${escapeHtml(article.imageUrl)}" style="width: 100%; border-radius: 8px; margin-bottom: 12px;" alt="${escapeHtml(article.title)}">` : ""}
				<h3>${escapeHtml(article.title)}</h3>
				<p>${escapeHtml(article.description)}</p>
				${article.buttonUrl ? `<a href="${escapeHtml(article.buttonUrl)}" class="button">${escapeHtml(article.buttonText)}</a>` : ""}
			</div>
		`
			)
			.join("")}
		
		<div class="footer">
			<p>${escapeHtml(data.footerText)}</p>
			${data.footerLinks.map((link) => `<a href="${escapeHtml(link.url)}">${escapeHtml(link.label)}</a>`).join(" | ")}
		</div>
	</div>
</body>
</html>`;
}

function escapeHtml(text: string | undefined): string {
	const safeText = text ?? "";
	const map: Record<string, string> = {
		"&": "&amp;",
		"<": "&lt;",
		">": "&gt;",
		'"': "&quot;",
		"'": "&#039;",
	};
	return safeText.replaceAll(/[&<>"']/g, (character) => map[character]);
}
