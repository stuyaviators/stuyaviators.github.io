"use client";

import {
	addGalleryPhotoAction,
	deleteGalleryPhotoAction,
	importGalleryAction,
	moveGalleryPhotoAction,
	updateGalleryAltAction,
} from "@/actions/gallery";
import Confirm from "@/components/dashboard/Confirm";
import { ImageField } from "@/components/dashboard/fields";
import { Spinner } from "@/components/dashboard/Spinner";
import { useToast } from "@/components/dashboard/Toast";
import { Badge, Card, Notice } from "@/components/dashboard/ui";
import { useAction } from "@/components/dashboard/use-action";
import { TextAreaField } from "@/components/forms/Field";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/cn";
import { ArrowDown, ArrowUp, Images, Pencil, Plus, Trash2 } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

type Item = {
	id: string;
	alt: string;
	src: string | undefined;
	isAi: boolean;
	// Uploaded photos can have AI write a new description.
	canWrite: boolean;
};
type Reference = { name: string; link: string; message: string };

export default function GalleryManager({
	items,
	reference,
}: {
	readonly items: readonly Item[];
	readonly reference?: Reference;
}) {
	const router = useRouter();
	const { run, isPending, error, leavingId, markLeaving } = useAction();
	const [editingId, setEditingId] = useState<string>();
	const [removing, setRemoving] = useState<Item>();

	if (items.length === 0) {
		return (
			<Card>
				<h2 className="text-xl">Start from the current photos</h2>
				<p className="mt-2 max-w-xl text-muted">
					The Gallery page shows a built-in set of photos today. Copy them here
					once, then add, reorder, caption or remove photos from this screen.
					The page looks the same afterwards.
				</p>
				{error ? (
					<Notice tone="bad" className="mt-3">
						{error}
					</Notice>
				) : null}
				<Button
					className="mt-4"
					disabled={isPending}
					onClick={() => {
						run(
							async () => importGalleryAction(),
							undefined,
							"Photos copied here. Edit them from this screen now."
						);
					}}
				>
					{isPending ? <Spinner /> : <Images aria-hidden className="size-4" />}{" "}
					Copy the current photos here
				</Button>
			</Card>
		);
	}

	return (
		<>
			<Card className="mb-8" aria-labelledby="add-photo">
				<h2 id="add-photo" className="text-xl">
					Add a photo
				</h2>
				{reference ? <ReferenceNote reference={reference} /> : null}
				<div className="mt-4">
					<AddPhotoForm
						onDone={() => {
							router.replace("/dashboard/gallery");
							router.refresh();
						}}
					/>
				</div>
			</Card>

			{error ? (
				<Notice tone="bad" className="mb-4">
					{error}
				</Notice>
			) : null}

			<ul className="dash-stagger space-y-3">
				{items.map((item, index) => (
					<li
						key={item.id}
						className={cn(
							"rounded-2xl border border-hairline bg-surface p-4",
							leavingId === item.id && "dash-leave"
						)}
					>
						<div className="flex flex-wrap items-start gap-3">
							<span className="relative block h-16 w-24 shrink-0 overflow-hidden rounded-lg bg-surface-2">
								{item.src ? (
									<Image
										src={item.src}
										alt=""
										fill
										sizes="96px"
										className="object-cover"
									/>
								) : null}
							</span>
							<div className="min-w-0 flex-1 basis-40">
								{editingId === item.id ? (
									<AltForm
										initial={item.alt}
										canWrite={item.canWrite}
										onDone={() => {
											setEditingId(undefined);
											router.refresh();
										}}
										onCancel={() => {
											setEditingId(undefined);
										}}
										id={item.id}
									/>
								) : (
									<>
										<p className="text-sm">{item.alt}</p>
										{item.isAi ? (
											<p className="mt-1">
												<Badge>AI-Generated Caption</Badge>
											</p>
										) : null}
									</>
								)}
							</div>
							{editingId === item.id ? null : (
								<div className="ml-auto flex items-center">
									<Button
										variant="ghost"
										aria-label="Move up"
										disabled={isPending || index === 0}
										onClick={() => {
											run(
												async () => moveGalleryPhotoAction(item.id, "up"),
												undefined,
												"Moved up"
											);
										}}
									>
										<ArrowUp aria-hidden className="size-4" />
									</Button>
									<Button
										variant="ghost"
										aria-label="Move down"
										disabled={isPending || index === items.length - 1}
										onClick={() => {
											run(
												async () => moveGalleryPhotoAction(item.id, "down"),
												undefined,
												"Moved down"
											);
										}}
									>
										<ArrowDown aria-hidden className="size-4" />
									</Button>
									<Button
										variant="ghost"
										aria-label="Edit the description"
										disabled={isPending}
										onClick={() => {
											setEditingId(item.id);
										}}
									>
										<Pencil aria-hidden className="size-4" />
									</Button>
									<Button
										variant="ghost"
										aria-label="Remove this photo"
										disabled={isPending}
										onClick={() => {
											setRemoving(item);
										}}
									>
										<Trash2 aria-hidden className="size-4" />
									</Button>
								</div>
							)}
						</div>
					</li>
				))}
			</ul>

			<Confirm
				isOpen={removing !== undefined}
				title="Remove this photo from the gallery?"
				description="It will no longer show on the Gallery page. If you remove every photo, the built-in ones show again."
				confirmLabel="Remove"
				onCancel={() => {
					setRemoving(undefined);
				}}
				onConfirm={() => {
					const target = removing;
					setRemoving(undefined);
					if (!target) {
						return;
					}

					markLeaving(target.id);
					run(
						async () => deleteGalleryPhotoAction(target.id),
						undefined,
						"Photo removed"
					);
				}}
			/>
		</>
	);
}

function ReferenceNote({ reference }: { readonly reference: Reference }) {
	const isLink = /^https?:\/\//iu.test(reference.link);
	return (
		<Notice tone="warn" className="mt-3">
			<p>
				<strong>{reference.name}</strong> sent photos
				{reference.message ? `: “${reference.message}”` : "."}
			</p>
			{isLink ? (
				<p className="mt-1">
					Open{" "}
					<a
						href={reference.link}
						target="_blank"
						rel="noopener noreferrer"
						className="break-all underline"
					>
						{reference.link}
					</a>
					, download the ones you want, then upload them below. Check that
					they’re happy to be featured.
				</p>
			) : (
				<p className="mt-1">
					Their link wasn’t a web address. Reply to them from the inbox.
				</p>
			)}
		</Notice>
	);
}

function AddPhotoForm({ onDone }: { readonly onDone: () => void }) {
	const [isPending, startTransition] = useTransition();
	const { toast } = useToast();
	const [imageUrl, setImageUrl] = useState("");
	const [size, setSize] = useState({ width: 0, height: 0 });
	const [alt, setAlt] = useState("");
	const [errors, setErrors] = useState<Record<string, string>>({});
	const [message, setMessage] = useState<string>();
	function submit(event: React.SubmitEvent<HTMLFormElement>) {
		event.preventDefault();
		setErrors({});
		setMessage(undefined);
		startTransition(async () => {
			try {
				const result = await addGalleryPhotoAction({
					alt,
					imageUrl,
					...size,
				});
				if (result.ok) {
					toast("Photo added to the gallery");
					setImageUrl("");
					setSize({ width: 0, height: 0 });
					setAlt("");
					onDone();
				} else {
					setErrors(result.fieldErrors ?? {});
					setMessage(result.error);
				}
			} catch {
				setMessage("Couldn’t reach the server. Check your connection.");
			}
		});
	}

	return (
		<form onSubmit={submit} noValidate className="grid gap-4">
			<ImageField
				label="Photo"
				isRequired
				purpose="highlight"
				value={imageUrl}
				error={errors.imageUrl ?? errors.width ?? errors.height}
				onChange={(url) => {
					setImageUrl(url);
					setSize({ width: 0, height: 0 });
				}}
				onUploaded={(image) => {
					setSize({ width: image.width, height: image.height });
				}}
			/>
			<TextAreaField
				label="Description"
				optional
				rows={2}
				value={alt}
				maxLength={300}
				error={errors.alt}
				hint="What's in the photo, for people who can't see it. Leave it blank and AI writes one when you add the photo; visitors then see it labeled AI-Generated Caption. If you write or change it yourself, the label goes away."
				onChange={(event) => {
					setAlt(event.target.value);
				}}
			/>
			{message ? <Notice tone="bad">{message}</Notice> : null}
			<div>
				<Button type="submit" disabled={isPending}>
					{isPending ? <Spinner /> : <Plus aria-hidden className="size-4" />}{" "}
					Add to the gallery
				</Button>
			</div>
		</form>
	);
}

function AltForm({
	id,
	initial,
	canWrite,
	onDone,
	onCancel,
}: {
	readonly id: string;
	readonly initial: string;
	readonly canWrite: boolean;
	readonly onDone: () => void;
	readonly onCancel: () => void;
}) {
	const [isPending, startTransition] = useTransition();
	const { toast } = useToast();
	const [alt, setAlt] = useState(initial);
	const [error, setError] = useState<string>();

	function submit(event: React.SubmitEvent<HTMLFormElement>) {
		event.preventDefault();
		setError(undefined);
		startTransition(async () => {
			try {
				const result = await updateGalleryAltAction(id, alt);
				if (result.ok) {
					toast("Description saved");
					onDone();
				} else {
					setError(result.fieldErrors?.alt ?? result.error);
				}
			} catch {
				setError("Couldn’t reach the server. Check your connection.");
			}
		});
	}

	return (
		<form onSubmit={submit} noValidate className="grid gap-3">
			<TextAreaField
				label="Description"
				optional={canWrite}
				rows={2}
				value={alt}
				maxLength={300}
				error={error}
				hint={
					canWrite
						? "Clear it and save to have AI write a new one. Any change you make removes the AI-Generated Caption label."
						: "Any change you make removes the AI-Generated Caption label."
				}
				onChange={(event) => {
					setAlt(event.target.value);
				}}
			/>
			<div className="flex gap-2">
				<Button type="submit" disabled={isPending}>
					{isPending ? <Spinner /> : null} Save
				</Button>
				<Button variant="secondary" disabled={isPending} onClick={onCancel}>
					Cancel
				</Button>
			</div>
		</form>
	);
}
