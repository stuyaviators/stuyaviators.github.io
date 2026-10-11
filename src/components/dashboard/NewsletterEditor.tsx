"use client";

import type { NewsletterData, SocialPlatform } from "@/lib/newsletter/types";
import {
	publishNewsletterAction,
	saveNewsletterAction,
	savePresetAction,
	suggestSlug,
	unpublishNewsletterAction,
} from "@/actions/newsletters";
import BlockList from "@/components/dashboard/BlockList";
import { ImageField, SelectField } from "@/components/dashboard/fields";
import { Spinner } from "@/components/dashboard/Spinner";
import { Badge, Card, Notice } from "@/components/dashboard/ui";
import { TextAreaField, TextField } from "@/components/forms/Field";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/cn";
import copy from "@/lib/copy";
import { socialPlatforms } from "@/lib/newsletter/types";
import {
	Check,
	Copy,
	Download,
	ExternalLink,
	Mail,
	Plus,
	Save,
	Trash2,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

/*
 * The newsletter builder, ported from recode's email builder (webcubed).
 * Drafts autosave to Postgres (shared by every officer; saving refuses to
 * overwrite a newer version someone else saved). The preview is the same
 * React Email render that gets copied into Gmail. Nothing here sends mail.
 */

type SaveState =
	| { kind: "saved" }
	| { kind: "unsaved" }
	| { kind: "saving" }
	| { kind: "error"; message: string }
	| { kind: "conflict"; by?: string };

type Rendered = { html: string; text: string };

const platformLabels: Record<SocialPlatform, string> = {
	instagram: "Instagram",
	discord: "Discord",
	youtube: "YouTube",
	facebook: "Facebook",
	epsilon: "Epsilon",
};

async function renderOnServer(
	data: NewsletterData,
	slug: string | undefined,
	signal?: AbortSignal
): Promise<{ ok: true; rendered: Rendered } | { ok: false; error: string }> {
	try {
		const response = await fetch("/api/newsletter/render", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ data, slug: slug ?? null }),
			signal,
		});
		const body = (await response
			.json()
			.catch(() => ({}))) as Partial<Rendered> & {
			error?: string;
		};
		return !response.ok || typeof body.html !== "string"
			? { ok: false, error: body.error ?? "Couldn’t render the preview." }
			: { ok: true, rendered: { html: body.html, text: body.text ?? "" } };
	} catch (error) {
		return {
			ok: false,
			error:
				error instanceof DOMException && error.name === "AbortError"
					? ""
					: "Couldn’t reach the server.",
		};
	}
}

/**
Just the email's body, without the hidden inbox-preview text (Gmail would show
it), for pasting into a Gmail compose window.
*/
function bodyForGmail(html: string): string {
	const doc = new DOMParser().parseFromString(html, "text/html");
	for (const element of doc.body.querySelectorAll("[data-skip-in-text]")) {
		element.remove();
	}

	return `<div>${doc.body.getHTML()}</div>`;
}

export default function NewsletterEditor({
	id,
	initialTitle,
	initialData,
	initialUpdatedAt,
	initialSlug,
	initialIsPublished,
	siteUrl,
}: {
	readonly id: string;
	readonly initialTitle: string;
	readonly initialData: NewsletterData;
	readonly initialUpdatedAt: string;
	readonly initialSlug: string | undefined;
	readonly initialIsPublished: boolean;
	readonly siteUrl: string;
}) {
	const [title, setTitle] = useState(initialTitle);
	const [data, setData] = useState(initialData);
	const [save, setSave] = useState<SaveState>({ kind: "saved" });
	const [revision, setRevision] = useState(0);
	const [tab, setTab] = useState<"edit" | "preview">("edit");

	const expected = useRef<string | undefined>(initialUpdatedAt);
	const queue = useRef<Promise<unknown>>(Promise.resolve());
	const latestRevision = useRef(0);
	const stopped = useRef(false); // After a conflict, wait for the officer to choose.

	const [slug, setSlug] = useState(initialSlug ?? "");
	const [isPublished, setIsPublished] = useState(initialIsPublished);
	const [publishedSlug, setPublishedSlug] = useState(initialSlug);
	const [publishNote, setPublishNote] = useState<{
		tone: "good" | "bad";
		text: string;
	}>();
	const [isPublishing, setIsPublishing] = useState(false);

	const [preview, setPreview] = useState<Rendered>();
	const [previewError, setPreviewError] = useState<string>();
	const [exportNote, setExportNote] = useState<{
		tone: "good" | "bad";
		text: string;
	}>();

	const [presetName, setPresetName] = useState("");
	const [presetNote, setPresetNote] = useState<{
		tone: "good" | "bad";
		text: string;
	}>();

	function edit(update: () => void) {
		update();
		latestRevision.current += 1;
		setRevision(latestRevision.current);
		if (!stopped.current) {
			setSave({ kind: "unsaved" });
		}
	}

	function patch(values: Partial<NewsletterData>) {
		edit(() => {
			setData((previous) => ({ ...previous, ...values }));
		});
	}

	/**
	Saves what's on screen now. Saves run one after another so each uses the
	version the previous one produced.
	*/
	async function saveDraft(
		shouldOverwrite = false
	): Promise<"saved" | "failed"> {
		const payload = { title, data };
		const savedRevision = latestRevision.current;
		const attempt = async (): Promise<"saved" | "failed"> => {
			setSave({ kind: "saving" });
			let result;
			try {
				result = await saveNewsletterAction(
					id,
					payload,
					shouldOverwrite ? undefined : expected.current
				);
			} catch {
				setSave({
					kind: "error",
					message: "Couldn’t reach the server. Will retry on your next edit.",
				});
				return "failed";
			}

			if (result.ok) {
				expected.current = result.updatedAt;
				stopped.current = false;
				setSave({
					kind: latestRevision.current === savedRevision ? "saved" : "unsaved",
				});
				return "saved";
			}

			if ("conflict" in result && result.conflict) {
				stopped.current = true;
				setSave({ kind: "conflict", by: result.updatedBy });
				return "failed";
			}

			setSave({ kind: "error", message: result.error });
			return "failed";
		};

		const next = queue.current.then(attempt);
		queue.current = next;
		return next;
	}

	// Debounced autosave.
	useEffect(() => {
		if (revision === 0 || stopped.current) {
			return;
		}

		const timer = setTimeout(() => {
			void saveDraft();
		}, 1500);
		return () => {
			clearTimeout(timer);
		};
	}, [revision]);

	// Warn before leaving with unsaved changes.
	useEffect(() => {
		if (save.kind === "saved") {
			return;
		}

		const warn = (event: BeforeUnloadEvent) => {
			event.preventDefault();
		};

		globalThis.addEventListener("beforeunload", warn);
		return () => {
			globalThis.removeEventListener("beforeunload", warn);
		};
	}, [save.kind]);

	// Live preview: same render as the Gmail copy.
	const liveSlug = isPublished ? publishedSlug : undefined;
	useEffect(() => {
		const controller = new AbortController();
		const load = async () => {
			const result = await renderOnServer(data, liveSlug, controller.signal);
			if (result.ok) {
				setPreview(result.rendered);
				setPreviewError(undefined);
			} else if (result.error) {
				setPreviewError(result.error);
			}
		};

		const timer = setTimeout(() => {
			void load();
		}, 500);
		return () => {
			clearTimeout(timer);
			controller.abort();
		};
	}, [data, liveSlug]);

	async function fresh(): Promise<Rendered | undefined> {
		const result = await renderOnServer(data, liveSlug);
		if (!result.ok) {
			setExportNote({ tone: "bad", text: result.error });
			return undefined;
		}

		return result.rendered;
	}

	async function copyForGmail() {
		setExportNote(undefined);
		const rendered = await fresh();
		if (!rendered) {
			return;
		}

		const html = bodyForGmail(rendered.html);
		try {
			if (typeof ClipboardItem === "undefined" || !globalThis.isSecureContext) {
				throw new Error("unsupported");
			}

			await navigator.clipboard.write([
				new ClipboardItem({
					"text/html": new Blob([html], { type: "text/html" }),
					"text/plain": new Blob([rendered.text], { type: "text/plain" }),
				}),
			]);
			setExportNote({
				tone: "good",
				text: "Copied. Open a new Gmail message and paste (Ctrl/Cmd+V) into the body.",
			});
		} catch {
			setExportNote({
				tone: "bad",
				text: "Your browser wouldn’t copy rich text here. Use “Copy HTML” instead, or try Chrome or Safari over https.",
			});
		}
	}

	async function copyHtml() {
		setExportNote(undefined);
		const rendered = await fresh();
		if (!rendered) {
			return;
		}

		setExportNote(
			(await copy(rendered.html)) === "copied"
				? { tone: "good", text: "HTML copied." }
				: { tone: "bad", text: "Couldn’t copy. Try Download instead." }
		);
	}

	async function downloadHtml() {
		setExportNote(undefined);
		const rendered = await fresh();
		if (!rendered) {
			return;
		}

		const url = URL.createObjectURL(
			new Blob([rendered.html], { type: "text/html" })
		);
		const link = document.createElement("a");
		link.href = url;
		link.download = `${liveSlug ?? "newsletter"}.html`;
		document.body.append(link);
		link.click();
		link.remove();
		setTimeout(() => {
			URL.revokeObjectURL(url);
		}, 1000);
	}

	async function suggest() {
		const result = await suggestSlug(id, title);
		if (result.ok) {
			setSlug(result.slug);
		}
	}

	async function publish() {
		setPublishNote(undefined);
		setIsPublishing(true);
		try {
			// The web version is a copy of the saved draft, so save first.
			if ((await saveDraft()) === "failed") {
				setPublishNote({
					tone: "bad",
					text: "Fix the save problem above, then publish.",
				});
				return;
			}

			const result = await publishNewsletterAction(id, slug.trim());
			if (!result.ok) {
				setPublishNote({
					tone: "bad",
					text: result.fieldErrors?.slug ?? result.error,
				});
				return;
			}

			setIsPublished(true);
			setPublishedSlug(result.slug);
			setSlug(result.slug);
			setPublishNote({
				tone: "good",
				text: `Live at /newsletter/${result.slug}.`,
			});
		} finally {
			setIsPublishing(false);
		}
	}

	async function unpublish() {
		setPublishNote(undefined);
		setIsPublishing(true);
		try {
			const result = await unpublishNewsletterAction(id);
			if (!result.ok) {
				setPublishNote({ tone: "bad", text: result.error });
				return;
			}

			setIsPublished(false);
			setPublishNote({ tone: "good", text: "The web version is offline." });
		} finally {
			setIsPublishing(false);
		}
	}

	async function savePreset() {
		setPresetNote(undefined);
		const result = await savePresetAction(presetName, data);
		if (result.ok) {
			setPresetName("");
			setPresetNote({ tone: "good", text: "Preset saved." });
		} else {
			setPresetNote({
				tone: "bad",
				text: result.fieldErrors?.name ?? result.error,
			});
		}
	}

	const statusText =
		save.kind === "saving"
			? "Saving…"
			: save.kind === "unsaved"
				? "Unsaved changes"
				: save.kind === "saved"
					? "All changes saved"
					: save.kind === "error"
						? `Not saved: ${save.message}`
						: "Newer version exists";

	return (
		<div>
			<div className="sticky top-0 z-20 -mx-4 mb-5 flex flex-wrap items-center justify-between gap-3 border-b border-hairline bg-bg/95 px-4 py-3 backdrop-blur-sm sm:-mx-6 sm:px-6">
				<p
					role="status"
					className={cn(
						"flex items-center gap-2 text-sm font-semibold",
						save.kind === "error" || save.kind === "conflict"
							? "text-danger"
							: "text-muted"
					)}
				>
					{/* Keyed so the icon pops each time the state changes. */}
					<span key={save.kind} className="dash-pop inline-flex">
						{save.kind === "saving" ? (
							<Spinner />
						) : save.kind === "saved" ? (
							<Check aria-hidden className="size-4 text-success" />
						) : (
							<Save aria-hidden className="size-4" />
						)}
					</span>
					{statusText}
				</p>
				<div className="flex flex-wrap gap-2">
					<Button
						onClick={() => {
							void copyForGmail();
						}}
					>
						<Mail aria-hidden className="size-4" /> Copy for Gmail
					</Button>
					<Button
						variant="secondary"
						onClick={() => {
							void copyHtml();
						}}
					>
						<Copy aria-hidden className="size-4" /> Copy HTML
					</Button>
					<Button
						variant="secondary"
						onClick={() => {
							void downloadHtml();
						}}
					>
						<Download aria-hidden className="size-4" /> Download
					</Button>
				</div>
			</div>

			{save.kind === "conflict" ? (
				<Notice tone="bad" className="mb-5">
					<p className="font-semibold">
						{save.by ?? "Another officer"} saved a newer version of this
						newsletter.
					</p>
					<p className="mt-1">
						Your edits are still on screen but haven’t been saved.
					</p>
					<div className="mt-3 flex flex-wrap gap-2">
						<Button
							variant="secondary"
							onClick={() => {
								globalThis.location.reload();
							}}
						>
							Load their version
						</Button>
						<Button
							onClick={() => {
								void saveDraft(true);
							}}
						>
							Keep mine
						</Button>
					</div>
				</Notice>
			) : null}
			{exportNote ? (
				<Notice tone={exportNote.tone} className="mb-5">
					{exportNote.text}
				</Notice>
			) : null}

			<div
				className="mb-4 flex gap-2 lg:hidden"
				role="tablist"
				aria-label="Editor or preview"
			>
				{(["edit", "preview"] as const).map((name) => (
					<Button
						key={name}
						variant={tab === name ? "primary" : "secondary"}
						role="tab"
						aria-selected={tab === name}
						onClick={() => {
							setTab(name);
						}}
					>
						{name === "edit" ? "Edit" : "Preview"}
					</Button>
				))}
			</div>

			<div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
				<div
					className={cn(
						"space-y-5",
						tab === "preview" && "hidden lg:block lg:space-y-5"
					)}
				>
					<Card className="space-y-4">
						<TextField
							label="Name"
							hint="For the dashboard list and the default web address. Not shown in the email."
							value={title}
							maxLength={120}
							onChange={(event) => {
								edit(() => {
									setTitle(event.target.value);
								});
							}}
						/>
					</Card>

					<Card className="space-y-4" aria-labelledby="header-heading">
						<h2 id="header-heading" className="text-xl">
							Header
						</h2>
						<TextField
							label="Title"
							value={data.headerTitle}
							maxLength={200}
							onChange={(event) => {
								patch({ headerTitle: event.target.value });
							}}
						/>
						<TextField
							label="Subtitle"
							optional
							value={data.headerSubtitle}
							maxLength={200}
							onChange={(event) => {
								patch({ headerSubtitle: event.target.value });
							}}
						/>
						<ImageField
							label="Logo"
							purpose="newsletter"
							value={data.headerLogoUrl}
							onChange={(headerLogoUrl) => {
								patch({ headerLogoUrl });
							}}
						/>
					</Card>

					<Card className="space-y-4" aria-labelledby="intro-heading">
						<h2 id="intro-heading" className="text-xl">
							Intro
						</h2>
						<TextField
							label="Heading"
							value={data.introHeading}
							maxLength={200}
							onChange={(event) => {
								patch({ introHeading: event.target.value });
							}}
						/>
						<TextAreaField
							label="Text"
							rows={4}
							value={data.introText}
							maxLength={5000}
							hint="Markdown works."
							onChange={(event) => {
								patch({ introText: event.target.value });
							}}
						/>
						<TextField
							label="Inbox preview line"
							optional
							value={data.previewText}
							maxLength={200}
							hint="The grey text inboxes show next to the subject. Only in Copy HTML and Download; Gmail ignores it when you paste."
							onChange={(event) => {
								patch({ previewText: event.target.value });
							}}
						/>
					</Card>

					<Card aria-labelledby="content-heading">
						<h2 id="content-heading" className="mb-4 text-xl">
							Content
						</h2>
						<BlockList
							blocks={data.blocks}
							onChange={(blocks) => {
								patch({ blocks });
							}}
						/>
					</Card>

					<Card className="space-y-4" aria-labelledby="footer-heading">
						<h2 id="footer-heading" className="text-xl">
							Footer
						</h2>
						<TextAreaField
							label="Footer text"
							optional
							rows={2}
							value={data.footerText}
							maxLength={500}
							onChange={(event) => {
								patch({ footerText: event.target.value });
							}}
						/>

						<fieldset>
							<legend className="text-sm font-semibold">Footer links</legend>
							<p className="mt-1 text-sm text-muted">
								The unsubscribe link is always added automatically.
							</p>
							<ul className="mt-2 space-y-2">
								{data.footerLinks.map((link, index) => (
									<li
										key={index}
										className="grid grid-cols-[1fr_auto] gap-2 sm:grid-cols-[10rem_1fr_auto]"
									>
										<TextField
											label="Label"
											value={link.label}
											maxLength={60}
											onChange={(event) => {
												patch({
													footerLinks: data.footerLinks.map((item, position) =>
														position === index
															? { ...item, label: event.target.value }
															: item
													),
												});
											}}
											className="mt-0"
										/>
										<div className="col-span-2 sm:col-span-1">
											<TextField
												label="Link"
												type="url"
												inputMode="url"
												value={link.url}
												placeholder="https://…"
												onChange={(event) => {
													patch({
														footerLinks: data.footerLinks.map(
															(item, position) =>
																position === index
																	? { ...item, url: event.target.value }
																	: item
														),
													});
												}}
											/>
										</div>
										<Button
											variant="ghost"
											aria-label={`Remove footer link ${index + 1}`}
											className="self-end"
											onClick={() => {
												patch({
													footerLinks: data.footerLinks.filter(
														(_, position) => position !== index
													),
												});
											}}
										>
											<Trash2 aria-hidden className="size-4" />
										</Button>
									</li>
								))}
							</ul>
							{data.footerLinks.length < 8 ? (
								<Button
									variant="secondary"
									className="mt-3"
									onClick={() => {
										patch({
											footerLinks: [
												...data.footerLinks,
												{ label: "", url: "" },
											],
										});
									}}
								>
									<Plus aria-hidden className="size-4" /> Add link
								</Button>
							) : null}
						</fieldset>

						<fieldset>
							<legend className="text-sm font-semibold">Social icons</legend>
							<ul className="mt-2 space-y-2">
								{data.socialLinks.map((social, index) => (
									<li
										key={index}
										className="grid grid-cols-[1fr_auto] gap-2 sm:grid-cols-[10rem_1fr_auto]"
									>
										<SelectField
											label="Network"
											value={social.platform}
											onChange={(event) => {
												patch({
													socialLinks: data.socialLinks.map((item, position) =>
														position === index
															? {
																	...item,
																	platform:
																		socialPlatforms.find(
																			(platform) =>
																				platform === event.target.value
																		) ?? item.platform,
																}
															: item
													),
												});
											}}
										>
											{socialPlatforms.map((platform) => (
												<option key={platform} value={platform}>
													{platformLabels[platform]}
												</option>
											))}
										</SelectField>
										<div className="col-span-2 sm:col-span-1">
											<TextField
												label="Link"
												type="url"
												inputMode="url"
												value={social.url}
												placeholder="https://…"
												onChange={(event) => {
													patch({
														socialLinks: data.socialLinks.map(
															(item, position) =>
																position === index
																	? { ...item, url: event.target.value }
																	: item
														),
													});
												}}
											/>
										</div>
										<Button
											variant="ghost"
											aria-label={`Remove social icon ${index + 1}`}
											className="self-end"
											onClick={() => {
												patch({
													socialLinks: data.socialLinks.filter(
														(_, position) => position !== index
													),
												});
											}}
										>
											<Trash2 aria-hidden className="size-4" />
										</Button>
									</li>
								))}
							</ul>
							{data.socialLinks.length < 8 ? (
								<Button
									variant="secondary"
									className="mt-3"
									onClick={() => {
										patch({
											socialLinks: [
												...data.socialLinks,
												{ platform: "instagram", url: "" },
											],
										});
									}}
								>
									<Plus aria-hidden className="size-4" /> Add icon
								</Button>
							) : null}
						</fieldset>
					</Card>

					<Card className="space-y-4" aria-labelledby="publish-heading">
						<div className="flex flex-wrap items-center gap-2">
							<h2 id="publish-heading" className="text-xl">
								Web version
							</h2>
							<Badge tone={isPublished ? "good" : "neutral"}>
								{isPublished ? "Live" : "Not published"}
							</Badge>
						</div>
						<p className="text-sm text-muted">
							A public page for this newsletter. Once published, the email gets
							a “View in browser” link to it. Publishing copies the saved draft;
							edit again and publish again to update it.
						</p>
						<TextField
							label="Web address"
							value={slug}
							maxLength={80}
							placeholder="october-update"
							hint={`${siteUrl}/newsletter/${slug || "…"}`}
							onChange={(event) => {
								setSlug(event.target.value.toLowerCase());
							}}
						/>
						<div className="flex flex-wrap gap-2">
							<Button
								disabled={isPublishing || slug.trim() === ""}
								onClick={() => {
									void publish();
								}}
							>
								{isPublished ? "Update web version" : "Publish web version"}
							</Button>
							<Button
								variant="secondary"
								disabled={isPublishing}
								onClick={() => {
									void suggest();
								}}
							>
								Suggest an address
							</Button>
							{isPublished ? (
								<>
									<Button
										variant="secondary"
										disabled={isPublishing}
										onClick={() => {
											void unpublish();
										}}
									>
										Unpublish
									</Button>
									{publishedSlug ? (
										<Link
											href={`/newsletter/${publishedSlug}`}
											target="_blank"
											className="inline-flex min-h-11 items-center gap-1.5 text-sm font-semibold text-brand underline-offset-4 hover:underline"
										>
											View <ExternalLink aria-hidden className="size-4" />
										</Link>
									) : null}
								</>
							) : null}
						</div>
						{publishNote ? (
							<Notice tone={publishNote.tone}>{publishNote.text}</Notice>
						) : null}
					</Card>

					<Card className="space-y-3" aria-labelledby="preset-heading">
						<h2 id="preset-heading" className="text-xl">
							Save as preset
						</h2>
						<p className="text-sm text-muted">
							Keep this layout as a starting point for future newsletters.
						</p>
						<div className="flex flex-wrap items-end gap-2">
							<div className="min-w-48 flex-1">
								<TextField
									label="Preset name"
									value={presetName}
									maxLength={60}
									placeholder="Monthly update"
									onChange={(event) => {
										setPresetName(event.target.value);
									}}
								/>
							</div>
							<Button
								variant="secondary"
								disabled={presetName.trim() === ""}
								onClick={() => {
									void savePreset();
								}}
							>
								Save preset
							</Button>
						</div>
						{presetNote ? (
							<Notice tone={presetNote.tone}>{presetNote.text}</Notice>
						) : null}
					</Card>
				</div>

				<section
					aria-label="Preview"
					className={cn(
						"lg:sticky lg:top-20 lg:self-start",
						tab === "edit" && "hidden lg:block"
					)}
				>
					<p className="label mb-2 text-muted">Preview (what Gmail receives)</p>
					{previewError ? (
						<Notice tone="warn" className="mb-3">
							Preview paused: {previewError}
						</Notice>
					) : null}
					<iframe
						title="Newsletter preview"
						sandbox="allow-popups"
						srcDoc={preview?.html ?? ""}
						className="h-[70dvh] w-full rounded-2xl border border-hairline bg-white lg:h-[calc(100dvh-9rem)]"
					/>
				</section>
			</div>
		</div>
	);
}
