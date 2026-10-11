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
import {
	AddedBy,
	blockedDeleteHint,
	useViewer,
} from "@/components/dashboard/Viewer";
import { TextAreaField } from "@/components/forms/Field";
import { Button } from "@/components/ui/Button";
import { uploadImageSized } from "@/lib/client-upload";
import { cn } from "@/lib/cn";
import {
	ArrowDown,
	ArrowUp,
	CheckCircle2,
	CircleAlert,
	Images,
	Pencil,
	Plus,
	Trash2,
	Upload,
} from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useRef, useState, useTransition } from "react";

type Item = {
	id: string;
	alt: string;
	src: string | undefined;
	isAi: boolean;
	createdBy: string | undefined;
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
	const { canDeleteItem } = useViewer();

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
				<div className="mt-6 border-t border-hairline pt-5">
					<BulkPhotoUpload
						onDone={() => {
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
										<p className="mt-1 flex flex-wrap items-center gap-2">
											{item.isAi ? <Badge>AI-Generated Caption</Badge> : null}
											<AddedBy email={item.createdBy} />
										</p>
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
										title={
											canDeleteItem(item.createdBy)
												? undefined
												: blockedDeleteHint
										}
										disabled={isPending || !canDeleteItem(item.createdBy)}
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

const maxBulk = 5;

type BulkRow = {
	name: string;
	status: "waiting" | "uploading" | "describing" | "done" | "failed";
	message?: string;
};

const bulkLabels: Record<BulkRow["status"], string> = {
	waiting: "Waiting",
	uploading: "Uploading…",
	describing: "Writing the description…",
	done: "Added",
	failed: "Failed",
};

/**
Upload several photos at once (up to five). Each is added to the gallery with
an AI-written description, labeled as such; edit any of them afterwards.
*/
function BulkPhotoUpload({ onDone }: { readonly onDone: () => void }) {
	const { toast } = useToast();
	const input = useRef<HTMLInputElement>(null);
	const [rows, setRows] = useState<BulkRow[]>([]);
	const [isBusy, setIsBusy] = useState(false);
	const [note, setNote] = useState<string>();

	function update(index: number, patch: Partial<BulkRow>) {
		setRows((current) =>
			current.map((row, position) =>
				position === index ? { ...row, ...patch } : row
			)
		);
	}

	async function didAdd(file: File, index: number): Promise<boolean> {
		try {
			update(index, { status: "uploading" });
			const image = await uploadImageSized(file, "highlight");
			update(index, { status: "describing" });
			const result = await addGalleryPhotoAction({
				alt: "",
				imageUrl: image.url,
				width: image.width,
				height: image.height,
			});
			if (!result.ok) {
				update(index, {
					status: "failed",
					message: result.fieldErrors?.alt ?? result.error,
				});
				return false;
			}

			update(index, { status: "done" });
			return true;
		} catch (error) {
			update(index, {
				status: "failed",
				message:
					error instanceof Error ? error.message : "Couldn’t add this photo.",
			});
			return false;
		}
	}

	async function start(chosen: File[]) {
		const files = chosen.slice(0, maxBulk);
		setNote(
			chosen.length > maxBulk
				? `Only the first ${maxBulk} photos were used.`
				: undefined
		);
		setRows(files.map((file) => ({ name: file.name, status: "waiting" })));
		setIsBusy(true);
		let added = 0;
		// New photos go to the front, so add the last one first: the photos end
		// up in the order they were chosen.
		for (let index = files.length - 1; index >= 0; index--) {
			const file = files[index];
			// eslint-disable-next-line no-await-in-loop -- one at a time, in order.
			if (file !== undefined && (await didAdd(file, index))) {
				added++;
			}
		}

		setIsBusy(false);
		if (added > 0) {
			toast(
				added === 1
					? "1 photo added to the gallery"
					: `${added} photos added to the gallery`
			);
			onDone();
		}

		if (added < files.length) {
			toast(
				`${files.length - added} photo${files.length - added === 1 ? "" : "s"} couldn’t be added`,
				"bad"
			);
		}
	}

	return (
		<div>
			<h3 className="text-lg">Add several photos at once</h3>
			<p className="mt-1 text-sm text-muted">
				Choose up to {maxBulk} photos. Each is added with a description written
				by AI and labeled AI-Generated Caption; edit any of them afterwards.
			</p>
			<input
				ref={input}
				type="file"
				accept="image/*"
				multiple
				className="sr-only"
				tabIndex={-1}
				aria-label={`Choose up to ${maxBulk} photos`}
				onChange={(event) => {
					const chosen = [...(event.target.files ?? [])];
					event.target.value = "";
					if (chosen.length > 0) {
						void start(chosen);
					}
				}}
			/>
			<Button
				className="mt-3"
				variant="secondary"
				disabled={isBusy}
				onClick={() => input.current?.click()}
			>
				{isBusy ? <Spinner /> : <Upload aria-hidden className="size-4" />}
				{isBusy ? "Adding photos…" : `Choose up to ${maxBulk} photos`}
			</Button>
			{note ? <p className="mt-2 text-sm text-muted">{note}</p> : null}
			{rows.length > 0 ? (
				<ul aria-live="polite" className="mt-4 space-y-2">
					{rows.map((row, index) => (
						<li
							key={`${row.name}-${index}`}
							className="flex items-start gap-3 rounded-xl border border-hairline bg-surface-2/60 px-3 py-2 text-sm"
						>
							{row.status === "done" ? (
								<CheckCircle2
									aria-hidden
									className="mt-0.5 size-4 shrink-0 text-success"
								/>
							) : row.status === "failed" ? (
								<CircleAlert
									aria-hidden
									className="mt-0.5 size-4 shrink-0 text-danger"
								/>
							) : row.status === "waiting" ? (
								<span aria-hidden className="mt-0.5 size-4 shrink-0" />
							) : (
								<Spinner />
							)}
							<span className="min-w-0 flex-1 break-words">
								<span className="font-medium">{row.name}</span>
								<span className="text-muted">
									{" "}
									· {row.message ?? bulkLabels[row.status]}
								</span>
							</span>
						</li>
					))}
				</ul>
			) : null}
		</div>
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
