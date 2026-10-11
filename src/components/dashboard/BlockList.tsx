"use client";

import type { Block, BlockType } from "@/lib/newsletter/types";
import Confirm from "@/components/dashboard/Confirm";
import { ImageField } from "@/components/dashboard/fields";
import { TextAreaField, TextField } from "@/components/forms/Field";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/cn";
import { newBlock } from "@/lib/newsletter/defaults";
import {
	ArrowDown,
	ArrowUp,
	GripVertical,
	Heading,
	ImagePlus,
	Minus,
	Plus,
	Trash2,
	Type,
} from "lucide-react";
import { useState } from "react";

/*
 * The newsletter's content blocks, ported from recode's email builder
 * (ArticlesSection / ArticleForm by webcubed). Reorder with the up/down
 * buttons (they work on phones and with a keyboard) or by dragging the grip.
 */

const labels: Record<BlockType, string> = {
	article: "Article",
	separator: "Section heading",
	subheading: "Subheading",
	image: "Image",
};

const maxBlocks = 60;

function hasContent(block: Block) {
	switch (block.type) {
		case "article": {
			return Boolean(
				block.title || block.body || block.imageUrl || block.buttonUrl
			);
		}

		case "image": {
			return Boolean(block.imageUrl || block.caption);
		}

		case "separator":
		case "subheading": {
			return Boolean(block.title);
		}
	}
}

function BlockFields({
	block,
	onChange,
}: {
	readonly block: Block;
	readonly onChange: (block: Block) => void;
}) {
	switch (block.type) {
		case "article": {
			return (
				<div className="space-y-4">
					<TextField
						label="Title"
						value={block.title}
						maxLength={200}
						onChange={(event) => {
							onChange({ ...block, title: event.target.value });
						}}
					/>
					<TextAreaField
						label="Text"
						rows={5}
						value={block.body}
						maxLength={5000}
						hint="Markdown works: **bold**, *italic*, lists, [links](https://…)."
						onChange={(event) => {
							onChange({ ...block, body: event.target.value });
						}}
					/>
					<ImageField
						purpose="newsletter"
						value={block.imageUrl}
						onChange={(imageUrl) => {
							onChange({ ...block, imageUrl });
						}}
					/>
					<div className="grid gap-4 sm:grid-cols-2">
						<TextField
							label="Button text"
							optional
							value={block.buttonText}
							maxLength={60}
							placeholder="Read more"
							onChange={(event) => {
								onChange({ ...block, buttonText: event.target.value });
							}}
						/>
						<TextField
							label="Button link"
							optional
							type="url"
							inputMode="url"
							value={block.buttonUrl}
							placeholder="https://…"
							onChange={(event) => {
								onChange({ ...block, buttonUrl: event.target.value });
							}}
						/>
					</div>
				</div>
			);
		}

		case "image": {
			return (
				<div className="space-y-4">
					<ImageField
						label="Image"
						purpose="newsletter"
						value={block.imageUrl}
						onChange={(imageUrl) => {
							onChange({ ...block, imageUrl });
						}}
					/>
					<TextAreaField
						label="Caption"
						optional
						rows={2}
						value={block.caption}
						maxLength={5000}
						hint="Also used as the image’s alt text."
						onChange={(event) => {
							onChange({ ...block, caption: event.target.value });
						}}
					/>
				</div>
			);
		}

		case "separator":
		case "subheading": {
			return (
				<TextField
					label={block.type === "separator" ? "Heading" : "Text"}
					value={block.title}
					maxLength={200}
					hint={
						block.type === "separator"
							? "Leave empty for a plain divider line."
							: undefined
					}
					onChange={(event) => {
						onChange({ ...block, title: event.target.value });
					}}
				/>
			);
		}
	}
}

export default function BlockList({
	blocks,
	onChange,
}: {
	readonly blocks: Block[];
	readonly onChange: (blocks: Block[]) => void;
}) {
	const [dragIndex, setDragIndex] = useState<number>();
	const [overIndex, setOverIndex] = useState<number>();
	const [pendingRemoval, setPendingRemoval] = useState<number>();

	function move(from: number, to: number) {
		if (from === to || to < 0 || to >= blocks.length) {
			return;
		}

		const next = [...blocks];
		next.splice(to, 0, ...next.splice(from, 1));
		onChange(next);
	}

	function add(type: BlockType) {
		if (blocks.length >= maxBlocks) {
			return;
		}

		onChange([...blocks, newBlock(type, crypto.randomUUID())]);
	}

	function remove(index: number) {
		onChange(blocks.filter((_, position) => position !== index));
	}

	function endDrag() {
		setDragIndex(undefined);
		setOverIndex(undefined);
	}

	const counts: Partial<Record<BlockType, number>> = {};

	return (
		<div>
			<div
				className="flex flex-wrap gap-2"
				role="group"
				aria-label="Add a block"
			>
				<Button
					variant="secondary"
					onClick={() => {
						add("article");
					}}
				>
					<Plus aria-hidden className="size-4" /> Article
				</Button>
				<Button
					variant="secondary"
					onClick={() => {
						add("separator");
					}}
				>
					<Heading aria-hidden className="size-4" /> Section heading
				</Button>
				<Button
					variant="secondary"
					onClick={() => {
						add("subheading");
					}}
				>
					<Type aria-hidden className="size-4" /> Subheading
				</Button>
				<Button
					variant="secondary"
					onClick={() => {
						add("image");
					}}
				>
					<ImagePlus aria-hidden className="size-4" /> Image
				</Button>
			</div>

			{blocks.length === 0 ? (
				<p className="mt-4 rounded-xl border border-dashed border-field p-6 text-center text-sm text-muted">
					No content yet. Add an article or a heading above.
				</p>
			) : (
				<ol className="mt-4 space-y-3">
					{blocks.map((block, index) => {
						counts[block.type] = (counts[block.type] ?? 0) + 1;
						return (
							<li
								key={block.id}
								onDragOver={(event) => {
									if (dragIndex === undefined) {
										return;
									}

									event.preventDefault();
									setOverIndex(index);
								}}
								onDrop={(event) => {
									event.preventDefault();
									if (dragIndex !== undefined) {
										move(dragIndex, index);
									}

									endDrag();
								}}
								className={cn(
									"rounded-2xl border bg-bg p-4",
									dragIndex === index && "opacity-50",
									overIndex === index &&
										dragIndex !== undefined &&
										dragIndex !== index
										? "border-brand"
										: "border-hairline"
								)}
							>
								<div className="mb-3 flex items-center justify-between gap-2">
									<div className="flex items-center gap-2">
										<span
											aria-hidden
											draggable
											title="Drag to reorder"
											className="cursor-grab touch-none rounded-md p-1 text-muted active:cursor-grabbing"
											onDragStart={(event) => {
												setDragIndex(index);
												event.dataTransfer.effectAllowed = "move";
												event.dataTransfer.setData("text/plain", block.id);
												const item = event.currentTarget.closest("li");
												if (item) {
													event.dataTransfer.setDragImage(item, 16, 16);
												}
											}}
											onDragEnd={endDrag}
										>
											<GripVertical className="size-5" />
										</span>
										<h3 className="text-base font-semibold">
											{labels[block.type]} {counts[block.type]}
										</h3>
									</div>
									<div className="flex items-center">
										<Button
											variant="ghost"
											aria-label={`Move ${labels[block.type]} ${counts[block.type]} up`}
											disabled={index === 0}
											onClick={() => {
												move(index, index - 1);
											}}
										>
											<ArrowUp aria-hidden className="size-4" />
										</Button>
										<Button
											variant="ghost"
											aria-label={`Move ${labels[block.type]} ${counts[block.type]} down`}
											disabled={index === blocks.length - 1}
											onClick={() => {
												move(index, index + 1);
											}}
										>
											<ArrowDown aria-hidden className="size-4" />
										</Button>
										<Button
											variant="ghost"
											aria-label={`Remove ${labels[block.type]} ${counts[block.type]}`}
											onClick={() => {
												if (hasContent(block)) {
													setPendingRemoval(index);
												} else {
													remove(index);
												}
											}}
										>
											<Trash2 aria-hidden className="size-4" />
										</Button>
									</div>
								</div>
								<BlockFields
									block={block}
									onChange={(next) => {
										onChange(
											blocks.map((item, position) =>
												position === index ? next : item
											)
										);
									}}
								/>
							</li>
						);
					})}
				</ol>
			)}
			{blocks.length >= maxBlocks ? (
				<p className="mt-3 flex items-center gap-1.5 text-sm text-muted">
					<Minus aria-hidden className="size-4" /> That’s the most blocks one
					newsletter can hold.
				</p>
			) : null}

			<Confirm
				isOpen={pendingRemoval !== undefined}
				title="Remove this block?"
				description="Its text and image link will be removed from the newsletter."
				confirmLabel="Remove"
				onCancel={() => {
					setPendingRemoval(undefined);
				}}
				onConfirm={() => {
					if (pendingRemoval !== undefined) {
						remove(pendingRemoval);
					}

					setPendingRemoval(undefined);
				}}
			/>
		</div>
	);
}
