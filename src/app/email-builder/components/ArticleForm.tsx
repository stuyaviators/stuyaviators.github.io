"use client";

import { FormField } from "@/components/FormField";
import { GlassButton } from "@/components/GlassButton";
import { type Article } from "@/types/email-builder";
import { ChevronDown, ChevronUp, Trash2, Upload } from "lucide-react";
import { useEffect, useRef, useState } from "react";

type ArticleFormProps = {
	article: Article;
	articleIndex: number;
	typeSpecificIndex: number;
	onUpdate: (index: number, updatedArticle: Article) => void;
	onRemove: (index: number) => void;
	onMoveUp?: () => void;
	onMoveDown?: () => void;
	canMoveUp?: boolean;
	canMoveDown?: boolean;
};

const SeparatorOrSubheadingFields: React.FC<{
	article: Article;
	handleFieldChange: (field: keyof Article, value: string) => void;
}> = ({ article, handleFieldChange }) => (
	<FormField
		label={
			article.type === "separator" ? "Separator Title" : "Subheading Title"
		}
		value={article.title ?? ""}
		onChange={(value) => {
			handleFieldChange("title", value);
		}}
		placeholder={
			article.type === "separator" ? "Section heading" : "Subheading text"
		}
	/>
);

const ImageFields: React.FC<{
	article: Article;
	handleFieldChange: (field: keyof Article, value: string) => void;
	fileInputRef: React.RefObject<HTMLInputElement>;
	isUploading: boolean;
	handleUploadClick: () => void;
	handleFileChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
	status?:
		| {
				type: "error" | "success" | "info";
				message: string;
		  }
		| undefined;
}> = ({
	article,
	handleFieldChange,
	fileInputRef,
	isUploading,
	handleUploadClick,
	handleFileChange,
	status,
}) => (
	<>
		<FormField
			label="Image URL"
			value={article.imageUrl ?? ""}
			onChange={(value) => {
				handleFieldChange("imageUrl", value);
			}}
			placeholder="https://example.com/image.jpg"
			type="url"
		/>
		<input
			ref={fileInputRef}
			type="file"
			accept="image/*"
			className="hidden"
			onChange={handleFileChange}
		/>
		<GlassButton
			variant="secondary"
			className="mt-2"
			onClick={handleUploadClick}
			disabled={isUploading}
		>
			{isUploading ? (
				<span>Uploading...</span>
			) : (
				<>
					<Upload className="h-4 w-4 mr-2" aria-hidden />
					Upload
				</>
			)}
		</GlassButton>
		{/* Status text */}
		<span
			className={`ml-4 text-sm ${
				status
					? status.type === "error"
						? "text-ctp-red"
						: status.type === "success"
							? "text-ctp-green"
							: "text-ctp-blue"
					: ""
			}`}
		>
			{status?.message}
		</span>
		<FormField
			label="Description (optional)"
			value={article.description ?? ""}
			onChange={(value) => {
				handleFieldChange("description", value);
			}}
			placeholder="Image description/caption"
			type="textarea"
		/>
	</>
);

const ArticleFields: React.FC<{
	article: Article;
	handleFieldChange: (field: keyof Article, value: string) => void;
}> = ({ article, handleFieldChange }) => (
	<>
		<FormField
			label="Title"
			value={article.title ?? ""}
			onChange={(value) => {
				handleFieldChange("title", value);
			}}
			placeholder="Article title"
		/>
		<FormField
			label="Description"
			value={article.description ?? ""}
			onChange={(value) => {
				handleFieldChange("description", value);
			}}
			placeholder="Article description"
			type="textarea"
		/>
		<FormField
			label="Image URL"
			value={article.imageUrl ?? ""}
			onChange={(value) => {
				handleFieldChange("imageUrl", value);
			}}
			placeholder="https://example.com/image.jpg"
			type="url"
		/>
		<FormField
			label="Button Text"
			value={article.buttonText ?? ""}
			onChange={(value) => {
				handleFieldChange("buttonText", value);
			}}
			placeholder="e.g., Read More"
		/>
		<FormField
			label="Button URL"
			value={article.buttonUrl ?? ""}
			onChange={(value) => {
				handleFieldChange("buttonUrl", value);
			}}
			placeholder="https://example.com"
			type="url"
		/>
	</>
);

export const ArticleForm: React.FC<ArticleFormProps> = ({
	article,
	articleIndex,
	typeSpecificIndex,
	onUpdate,
	onRemove,
	onMoveUp,
	onMoveDown,
	canMoveUp,
	canMoveDown,
}) => {
	const handleFieldChange = (field: keyof Article, value: string) => {
		onUpdate(articleIndex, { ...article, [field]: value });
	};

	const [isCollapsed, setIsCollapsed] = useState(false);

	// Client-side upload state & ref
	const fileInputRef = useRef<HTMLInputElement>(
		null as unknown as HTMLInputElement
	);
	const [isUploading, setIsUploading] = useState(false);

	// Status state + auto-clear
	const [status, setStatus] = useState<
		| {
				type: "error" | "success" | "info";
				message: string;
		  }
		| undefined
	>(undefined);
	const statusTimeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(
		undefined
	);

	const showStatus = (
		type: "error" | "success" | "info",
		message: string,
		duration = 5000
	) => {
		if (statusTimeoutRef.current)
			globalThis.clearTimeout(statusTimeoutRef.current);
		setStatus({ type, message });
		statusTimeoutRef.current = globalThis.setTimeout(() => {
			setStatus(undefined);
		}, duration);
	};

	useEffect(() => {
		return () => {
			if (statusTimeoutRef.current)
				globalThis.clearTimeout(statusTimeoutRef.current);
		};
	}, []);

	const handleUploadClick = () => {
		setStatus(undefined);
		fileInputRef.current?.click();
	};

	const handleFileChange = async (
		event: React.ChangeEvent<HTMLInputElement>
	) => {
		const file = event.target.files?.[0];
		if (!file) return;
		setIsUploading(true);
		showStatus("info", "Uploading...");
		try {
			const form = new FormData();
			form.append("file", file, file.name);
			const response = await fetch("/api/upload", {
				method: "POST",
				body: form,
			});
			if (!response.ok) {
				const errorText = await response.text();
				throw new Error(errorText || "Upload failed");
			}

			const extractUrlFromResponse = async (
				uploadResponse: Response
			): Promise<string> => {
				const ct = uploadResponse.headers.get("content-type") ?? "";
				if (ct.includes("application/json")) {
					const data: unknown = await uploadResponse.json();
					if (typeof data === "string") return data;
					if (data && typeof data === "object") {
						const dataObject = data as Record<string, unknown>;
						const candidate =
							dataObject.url ?? dataObject.path ?? dataObject.fileUrl;
						if (typeof candidate === "string") return candidate;
					}

					return "";
				}

				const text = await uploadResponse.text();
				try {
					const parsed: unknown = JSON.parse(text);
					if (parsed && typeof parsed === "object") {
						const parsedObject = parsed as Record<string, unknown>;
						const candidate =
							parsedObject.url ?? parsedObject.path ?? parsedObject.fileUrl;
						if (typeof candidate === "string") return candidate;
					}

					return text;
				} catch {
					return text;
				}
			};

			const url = await extractUrlFromResponse(response);
			if (!url) throw new Error("Upload response did not include a URL");
			handleFieldChange("imageUrl", url);
			showStatus("success", "Image uploaded.");
		} catch (error: unknown) {
			// Avoid using console in linted code; extract message when available
			const maybeError = error as { message?: string } | undefined;
			showStatus(
				"error",
				maybeError?.message
					? `Image upload failed: ${maybeError.message}`
					: "Image upload failed."
			);
		} finally {
			setIsUploading(false);
			if (fileInputRef.current) fileInputRef.current.value = "";
		}
	};

	return (
		<div className="relative rounded-lg border border-ctp-overlay1/40 bg-linear-to-br from-ctp-surface0/60 via-ctp-base/50 to-ctp-surface0/40 p-6 backdrop-blur-lg">
			<div className="absolute -bottom-3 -right-3 h-40 w-40 rounded-lg bg-linear-to-tl from-ctp-crust/80 via-ctp-crust/40 to-transparent opacity-0 blur-xl transition-opacity duration-300 group-hover:opacity-100" />

			<div className="relative z-10 space-y-4">
				<div className="flex items-start justify-between gap-4">
					<div className="flex items-center gap-2">
						<button
							onClick={() => {
								setIsCollapsed(!isCollapsed);
							}}
							className="text-ctp-subtext1 hover:text-ctp-text transition hover:scale-105"
							title={isCollapsed ? "Expand" : "Collapse"}
							aria-label={isCollapsed ? "Expand article" : "Collapse article"}
						>
							<ChevronDown
								className={`h-5 w-5 transition-transform ${isCollapsed ? "-rotate-90" : "rotate-0"}`}
							/>
						</button>
						<h3 className="text-lg font-semibold text-ctp-text">
							{article.type === "separator"
								? "Separator"
								: article.type === "subheading"
									? "Subheading"
									: article.type === "image"
										? "Image"
										: "Article"}{" "}
							{typeSpecificIndex + 1}
						</h3>
					</div>
					<div className="flex items-center gap-2">
						<div className="flex gap-2">
							<GlassButton
								onClick={onMoveUp}
								disabled={!canMoveUp}
								variant="secondary"
								icon={<ChevronUp className="h-4 w-4" />}
								className="h-7 w-7 p-0"
								title="Move up"
							/>
							<GlassButton
								onClick={onMoveDown}
								disabled={!canMoveDown}
								variant="secondary"
								icon={<ChevronDown className="h-4 w-4" />}
								className="h-7 w-7 p-0"
								title="Move down"
							/>
						</div>
						<GlassButton
							onClick={() => {
								onRemove(articleIndex);
							}}
							variant="danger"
							icon={<Trash2 className="h-4 w-4" />}
							className="h-8 w-8 p-0"
							title="Remove article"
						/>
					</div>
				</div>

				{!isCollapsed && (
					<>
						{(article.type === "separator" ||
							article.type === "subheading") && (
							<SeparatorOrSubheadingFields
								article={article}
								handleFieldChange={handleFieldChange}
							/>
						)}

						{article.type === "image" && (
							<ImageFields
								article={article}
								handleFieldChange={handleFieldChange}
								fileInputRef={fileInputRef}
								isUploading={isUploading}
								handleUploadClick={handleUploadClick}
								handleFileChange={handleFileChange}
								// Pass status so child can render it
								status={status}
							/>
						)}

						{article.type === "article" && (
							<ArticleFields
								article={article}
								handleFieldChange={handleFieldChange}
							/>
						)}
					</>
				)}
			</div>
		</div>
	);
};
