"use client";

import type { UploadedImage } from "@/lib/client-upload";
import type { UploadPurpose } from "@/lib/uploads";
import type { ComponentProps, ReactNode } from "react";
import { inputClass } from "@/components/forms/Field";
import { Button } from "@/components/ui/Button";
import { uploadImageSized } from "@/lib/client-upload";
import { cn } from "@/lib/cn";
import { ImagePlus, Trash2 } from "lucide-react";
import { useId, useRef, useState } from "react";

export function SelectField({
	label,
	hint,
	error,
	className,
	children,
	...props
}: {
	readonly label: string;
	readonly hint?: ReactNode;
	readonly error?: string;
} & ComponentProps<"select">) {
	const id = useId();
	return (
		<div>
			<label htmlFor={id} className="text-sm font-semibold">
				{label}
			</label>
			<select
				id={id}
				aria-invalid={error ? true : undefined}
				aria-describedby={
					error ? `${id}-error` : hint === undefined ? undefined : `${id}-hint`
				}
				className={cn(inputClass, className)}
				{...props}
			>
				{children}
			</select>
			{hint === undefined ? null : (
				<p id={`${id}-hint`} className="mt-1.5 text-sm text-muted">
					{hint}
				</p>
			)}
			{error ? (
				<p
					id={`${id}-error`}
					className="mt-1.5 text-sm font-medium text-danger"
				>
					{error}
				</p>
			) : null}
		</div>
	);
}

export function CheckboxField({
	label,
	hint,
	...props
}: {
	readonly label: string;
	readonly hint?: ReactNode;
} & Omit<ComponentProps<"input">, "type">) {
	const id = useId();
	return (
		<div className="flex items-start gap-3">
			<input
				id={id}
				type="checkbox"
				className="mt-1 size-5 shrink-0 accent-[var(--brand)]"
				aria-describedby={hint === undefined ? undefined : `${id}-hint`}
				{...props}
			/>
			<label htmlFor={id} className="text-sm">
				<span className="font-semibold">{label}</span>
				{hint === undefined ? null : (
					<span id={`${id}-hint`} className="block text-muted">
						{hint}
					</span>
				)}
			</label>
		</div>
	);
}

/**
A link field with an Upload button (Vercel Blob, officers only) and a preview.
*/
export function ImageField({
	label = "Image",
	purpose,
	value,
	onChange,
	error,
	hint,
	onUploaded,
}: {
	readonly label?: string;
	readonly purpose: UploadPurpose;
	readonly value: string;
	readonly onChange: (url: string) => void;
	/**
	Called after an upload with the size, right after `onChange`.
	*/
	readonly onUploaded?: (image: UploadedImage) => void;
	readonly error?: string;
	readonly hint?: ReactNode;
}) {
	const id = useId();
	const input = useRef<HTMLInputElement>(null);
	const [isUploading, setIsUploading] = useState(false);
	const [message, setMessage] = useState<{
		tone: "good" | "bad";
		text: string;
	}>();

	async function upload(file: File) {
		setIsUploading(true);
		setMessage(undefined);
		try {
			const image = await uploadImageSized(file, purpose);
			onChange(image.url);
			onUploaded?.(image);
			setMessage({ tone: "good", text: "Image uploaded." });
		} catch (error_) {
			setMessage({
				tone: "bad",
				text:
					error_ instanceof Error
						? error_.message
						: "Upload failed. Try again.",
			});
		} finally {
			setIsUploading(false);
			if (input.current) {
				input.current.value = "";
			}
		}
	}

	return (
		<div>
			<label htmlFor={id} className="text-sm font-semibold">
				{label}
				<span className="ml-1.5 font-normal text-muted">(optional)</span>
			</label>
			<div className="mt-1.5 flex flex-wrap items-center gap-2">
				<input
					id={id}
					type="url"
					inputMode="url"
					value={value}
					placeholder="https://… or upload"
					aria-invalid={error ? true : undefined}
					aria-describedby={`${id}-status`}
					onChange={(event) => {
						onChange(event.target.value);
					}}
					className={cn(inputClass, "mt-0 min-w-0 flex-1 basis-56")}
				/>
				<input
					ref={input}
					type="file"
					accept="image/*"
					className="sr-only"
					tabIndex={-1}
					aria-label={`${label} file`}
					onChange={(event) => {
						const file = event.target.files?.[0];
						if (file) {
							void upload(file);
						}
					}}
				/>
				<Button
					variant="secondary"
					disabled={isUploading}
					onClick={() => input.current?.click()}
				>
					<ImagePlus aria-hidden className="size-4" />
					{isUploading ? "Uploading…" : "Upload"}
				</Button>
				{value ? (
					<Button
						variant="ghost"
						aria-label={`Remove ${label.toLowerCase()}`}
						onClick={() => {
							onChange("");
							setMessage(undefined);
						}}
					>
						<Trash2 aria-hidden className="size-4" />
					</Button>
				) : null}
			</div>
			<div id={`${id}-status`} aria-live="polite">
				{error ? (
					<p className="mt-1.5 text-sm font-medium text-danger">{error}</p>
				) : null}
				{message ? (
					<p
						className={cn(
							"mt-1.5 text-sm",
							message.tone === "bad"
								? "font-medium text-danger"
								: "text-success"
						)}
					>
						{message.text}
					</p>
				) : null}
			</div>
			{hint === undefined ? null : (
				<p className="mt-1.5 text-sm text-muted">{hint}</p>
			)}
			{value !== "" && /^https?:\/\//iu.test(value) ? (
				<img
					src={value}
					alt=""
					className="mt-3 max-h-40 rounded-lg border border-hairline object-cover"
				/>
			) : null}
		</div>
	);
}
