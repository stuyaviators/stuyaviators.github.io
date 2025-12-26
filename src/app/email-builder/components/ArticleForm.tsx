"use client";

import { FormField } from "@/components/FormField";
import { GlassButton } from "@/components/GlassButton";
import { type Article } from "@/types/email-builder";
import { ChevronDown, ChevronUp, Trash2 } from "lucide-react";
import { useState } from "react";

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

	return (
		<div className="relative rounded-lg border border-ctp-overlay1/40 bg-linear-to-br from-ctp-surface0/60 via-ctp-base/50 to-ctp-surface0/40 p-6 backdrop-blur-lg">
			<div className="absolute -bottom-3 -right-3 h-40 w-40 rounded-lg bg-linear-to-tl from-ctp-crust/80 via-ctp-crust/40 to-transparent opacity-0 blur-xl transition-opacity duration-300 group-hover:opacity-100" />

			<div className="relative z-10 space-y-4">
				<div className="flex items-start justify-between gap-4">
					<div className="flex items-center gap-2">
						<button
							onClick={() => setIsCollapsed(!isCollapsed)}
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
							onClick={() => onRemove(articleIndex)}
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
							<FormField
								label={
									article.type === "separator"
										? "Separator Title"
										: "Subheading Title"
								}
								value={article.title ?? ""}
								onChange={(value) => {
									handleFieldChange("title", value);
								}}
								placeholder={
									article.type === "separator"
										? "Section heading"
										: "Subheading text"
								}
							/>
						)}

						{article.type === "image" && (
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
						)}

						{article.type === "article" && (
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
						)}
					</>
				)}
			</div>
		</div>
	);
};
