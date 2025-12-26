"use client";

import { GlassButton } from "@/components/GlassButton";
import { type Article, type NewsletterFormData } from "@/types/email-builder";
import { ChevronDown, Image as ImageIcon } from "lucide-react";
import { useRef, useState } from "react";
import { ArticleForm } from "./ArticleForm";

type ArticlesSectionProps = {
	data: NewsletterFormData;
	onUpdate: (updates: Partial<NewsletterFormData>) => void;
};

export const ArticlesSection: React.FC<ArticlesSectionProps> = ({
	data,
	onUpdate,
}) => {
	const [isCollapsed, setIsCollapsed] = useState(false);
	const articleRefs = useRef<Record<string, HTMLDivElement | undefined>>({});

	const reorder = (from: number, to: number) => {
		if (from === to) return;
		if (to < 0 || to >= data.articles.length) return;
		const newArticles = [...data.articles];
		const [moved] = newArticles.splice(from, 1);
		newArticles.splice(to, 0, moved);
		onUpdate({ articles: newArticles });

		// Scroll to the moved item after reorder
		setTimeout(() => {
			const movedId = moved.id;
			const element = articleRefs.current[movedId];
			if (element) {
				element.scrollIntoView({ behavior: "smooth", block: "center" });
			}
		}, 0);
	};

	const handleAddArticle = () => {
		const id = Date.now().toString();
		const newArticle: Article = {
			id,
			type: "article",
			title: "",
			description: "",
			imageUrl: "",
			buttonText: "",
			buttonUrl: "",
		};
		const newArticles = [...data.articles, newArticle];
		onUpdate({ articles: newArticles });
		setIsCollapsed(false);
		// Scroll to the newly added item after render
		const scrollToNew = (attempt = 0) => {
			const element = articleRefs.current[id];
			if (element) {
				element.scrollIntoView({ behavior: "smooth", block: "center" });
			} else if (attempt < 10) {
				setTimeout(() => {
					scrollToNew(attempt + 1);
				}, 50);
			}
		};

		setTimeout(() => {
			scrollToNew();
		}, 0);
	};

	const handleAddSeparator = () => {
		const id = Date.now().toString();
		const newSeparator: Article = {
			id,
			type: "separator",
			title: "",
		};
		const newArticles = [...data.articles, newSeparator];
		onUpdate({ articles: newArticles });
		setIsCollapsed(false);
		const scrollToNew = (attempt = 0) => {
			const element = articleRefs.current[id];
			if (element) {
				element.scrollIntoView({ behavior: "smooth", block: "center" });
			} else if (attempt < 10) {
				setTimeout(() => {
					scrollToNew(attempt + 1);
				}, 50);
			}
		};

		setTimeout(() => {
			scrollToNew();
		}, 0);
	};

	const handleAddSubheading = () => {
		const id = Date.now().toString();
		const newSubheading: Article = {
			id,
			type: "subheading",
			title: "",
		};
		const newArticles = [...data.articles, newSubheading];
		onUpdate({ articles: newArticles });
		setIsCollapsed(false);
		const scrollToNew = (attempt = 0) => {
			const element = articleRefs.current[id];
			if (element) {
				element.scrollIntoView({ behavior: "smooth", block: "center" });
			} else if (attempt < 10) {
				setTimeout(() => {
					scrollToNew(attempt + 1);
				}, 50);
			}
		};

		setTimeout(() => {
			scrollToNew();
		}, 0);
	};

	const handleAddImage = () => {
		const id = Date.now().toString();
		const newImage: Article = {
			id,
			type: "image",
			imageUrl: "",
			description: "",
		};
		const newArticles = [...data.articles, newImage];
		onUpdate({ articles: newArticles });
		setIsCollapsed(false);
		const scrollToNew = (attempt = 0) => {
			const element = articleRefs.current[id];
			if (element) {
				element.scrollIntoView({ behavior: "smooth", block: "center" });
			} else if (attempt < 10) {
				setTimeout(() => {
					scrollToNew(attempt + 1);
				}, 50);
			}
		};

		setTimeout(() => {
			scrollToNew();
		}, 0);
	};

	const handleUpdateArticle = (index: number, updatedArticle: Article) => {
		const newArticles = [...data.articles];
		newArticles[index] = updatedArticle;
		onUpdate({ articles: newArticles });
	};

	const handleRemoveArticle = (index: number) => {
		const newArticles = data.articles.filter((_, i) => i !== index);
		onUpdate({ articles: newArticles });
	};

	const handleMoveUp = (index: number) => {
		if (index > 0) {
			reorder(index, index - 1);
		}
	};

	const handleMoveDown = (index: number) => {
		if (index < data.articles.length - 1) {
			reorder(index, index + 1);
		}
	};

	return (
		<div className="space-y-6">
			<div className="sticky top-0 z-20 flex items-center justify-between gap-3 -mx-4 px-4 rounded-lg border border-ctp-overlay1/40 bg-linear-to-br from-ctp-surface0/60 via-ctp-base/50 to-ctp-surface0/40 py-3 min-h-16">
				<div className="flex items-center gap-2">
					<button
						onClick={() => {
							setIsCollapsed(!isCollapsed);
						}}
						className="text-ctp-subtext1 hover:text-ctp-text transition hover:scale-105"
						title={isCollapsed ? "Expand" : "Collapse"}
						aria-label={isCollapsed ? "Expand Content" : "Collapse Content"}
					>
						<ChevronDown
							className={`h-5 w-5 transition-transform ${isCollapsed ? "-rotate-90" : "rotate-0"}`}
						/>
					</button>
					<h2 className="text-2xl font-bold text-ctp-text">Content</h2>
				</div>
				<div className="flex items-center gap-2 ml-auto flex-nowrap">
					<GlassButton onClick={handleAddArticle} variant="secondary">
						+ Article
					</GlassButton>
					<GlassButton onClick={handleAddSeparator} variant="secondary">
						+ Separator
					</GlassButton>
					<GlassButton onClick={handleAddSubheading} variant="secondary">
						+ Subheading
					</GlassButton>
					<GlassButton
						onClick={handleAddImage}
						variant="secondary"
						icon={<ImageIcon className="h-4 w-4" />}
						title="Add image"
					/>
				</div>
			</div>

			{!isCollapsed && (
				<div className="space-y-4">
					{data.articles.map((article, index) => {
						// Calculate type-specific index
						const typeSpecificIndex = data.articles
							.slice(0, index)
							.filter((a) => a.type === article.type).length;

						return (
							<div
								key={article.id}
								ref={(element) => {
									if (element) {
										articleRefs.current[article.id] = element;
									}
								}}
								className="relative group"
							>
								<ArticleForm
									article={article}
									articleIndex={index}
									typeSpecificIndex={typeSpecificIndex}
									onUpdate={handleUpdateArticle}
									onRemove={handleRemoveArticle}
									onMoveUp={() => {
										handleMoveUp(index);
									}}
									onMoveDown={() => {
										handleMoveDown(index);
									}}
									canMoveUp={index > 0}
									canMoveDown={index < data.articles.length - 1}
								/>
							</div>
						);
					})}
				</div>
			)}
		</div>
	);
};
