"use client";

import type { Listing } from "@/lib/listings";
import {
	deleteListingForever,
	moveListingAction,
	publishListing,
	restoreListing,
	trashListing,
} from "@/actions/listings";
import Confirm from "@/components/dashboard/Confirm";
import { Badge, Notice } from "@/components/dashboard/ui";
import { useAction } from "@/components/dashboard/use-action";
import {
	AddedBy,
	blockedDeleteHint,
	useViewer,
} from "@/components/dashboard/Viewer";
import { formatDate } from "@/components/listings/ListingCard";
import { Button, buttonClasses } from "@/components/ui/Button";
import { cn } from "@/lib/cn";
import { daysUntil, isClosingSoon, isExpired } from "@/lib/listing-dates";
import { listingPath } from "@/lib/listing-path";
import {
	ArrowDown,
	ArrowUp,
	ExternalLink,
	Eye,
	EyeOff,
	Pencil,
	RotateCcw,
	Trash2,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";

type Pending = { id: string; title: string; mode: "trash" | "forever" };

export default function ListingRows({
	listings,
	slug,
	view,
}: {
	readonly listings: Listing[];
	readonly slug: string;
	readonly view: "active" | "trash";
}) {
	const { run, isPending, error, leavingId, markLeaving } = useAction();
	const [pending, setPending] = useState<Pending>();
	const isTrash = view === "trash";
	const { canDeleteItem } = useViewer();

	return (
		<>
			{error ? (
				<Notice tone="bad" className="mb-4">
					{error}
				</Notice>
			) : null}
			<ul className="dash-stagger space-y-3">
				{listings.map((listing, index) => {
					const isPast = isExpired(listing);
					const isClosing = isClosingSoon(listing);
					return (
						<li
							key={listing.id}
							className={cn(
								"rounded-2xl border border-hairline bg-surface p-4 sm:p-5",
								leavingId === listing.id && "dash-leave"
							)}
						>
							<div className="flex flex-wrap items-start justify-between gap-3">
								<div className="min-w-0 flex-1 basis-56">
									<div className="flex flex-wrap items-center gap-2">
										<Badge
											tone={listing.status === "published" ? "good" : "neutral"}
										>
											{listing.status === "published" ? "Published" : "Draft"}
										</Badge>
										{listing.featured ? (
											<Badge tone="brand">Featured</Badge>
										) : null}
										{isPast ? <Badge tone="warn">Past</Badge> : null}
										{isClosing ? (
											<Badge tone="bad">
												Closes in {daysUntil(listing.deadline ?? "")} d
											</Badge>
										) : null}
										<AddedBy email={listing.createdBy ?? undefined} />
									</div>
									<h2 className="mt-2 text-lg font-semibold leading-snug">
										{listing.title}
									</h2>
									<p className="text-sm text-muted">
										{listing.organization}
										{listing.deadline
											? ` · Deadline ${formatDate(listing.deadline)}`
											: ""}
									</p>
								</div>
								<div className="flex flex-wrap items-center gap-1.5">
									{isTrash ? (
										<>
											<Button
												variant="secondary"
												disabled={isPending}
												onClick={() => {
													markLeaving(listing.id);
													run(
														async () => restoreListing(listing.id),
														undefined,
														`Restored “${listing.title}”`
													);
												}}
											>
												<RotateCcw aria-hidden className="size-4" /> Restore
											</Button>
											<Button
												variant="ghost"
												className="text-danger"
												title={
													canDeleteItem(listing.createdBy ?? undefined)
														? undefined
														: blockedDeleteHint
												}
												disabled={
													isPending ||
													!canDeleteItem(listing.createdBy ?? undefined)
												}
												onClick={() => {
													setPending({
														id: listing.id,
														title: listing.title,
														mode: "forever",
													});
												}}
											>
												<Trash2 aria-hidden className="size-4" /> Delete forever
											</Button>
										</>
									) : (
										<>
											{listing.status === "published" &&
											listingPath(listing) !== undefined ? (
												<Link
													href={listingPath(listing) ?? "/"}
													target="_blank"
													className={buttonClasses("ghost")}
												>
													<ExternalLink aria-hidden className="size-4" /> View
													page
												</Link>
											) : null}
											<Button
												variant="ghost"
												aria-label={`Move ${listing.title} up`}
												disabled={isPending || index === 0}
												onClick={() => {
													run(
														async () => moveListingAction(listing.id, "up"),
														undefined,
														"Moved up"
													);
												}}
											>
												<ArrowUp aria-hidden className="size-4" />
											</Button>
											<Button
												variant="ghost"
												aria-label={`Move ${listing.title} down`}
												disabled={isPending || index === listings.length - 1}
												onClick={() => {
													run(
														async () => moveListingAction(listing.id, "down"),
														undefined,
														"Moved down"
													);
												}}
											>
												<ArrowDown aria-hidden className="size-4" />
											</Button>
											<Button
												variant="secondary"
												disabled={isPending}
												onClick={() => {
													run(
														async () =>
															publishListing(
																listing.id,
																listing.status !== "published"
															),
														undefined,
														listing.status === "published"
															? `Unpublished “${listing.title}”`
															: `Published “${listing.title}”`
													);
												}}
											>
												{listing.status === "published" ? (
													<>
														<EyeOff aria-hidden className="size-4" /> Unpublish
													</>
												) : (
													<>
														<Eye aria-hidden className="size-4" /> Publish
													</>
												)}
											</Button>
											<Link
												href={`/dashboard/${slug}/${listing.id}`}
												className={buttonClasses("secondary")}
											>
												<Pencil aria-hidden className="size-4" /> Edit
											</Link>
											<Button
												variant="ghost"
												aria-label={`Move ${listing.title} to trash`}
												title={
													canDeleteItem(listing.createdBy ?? undefined)
														? undefined
														: blockedDeleteHint
												}
												disabled={
													isPending ||
													!canDeleteItem(listing.createdBy ?? undefined)
												}
												onClick={() => {
													setPending({
														id: listing.id,
														title: listing.title,
														mode: "trash",
													});
												}}
											>
												<Trash2 aria-hidden className="size-4" />
											</Button>
										</>
									)}
								</div>
							</div>
						</li>
					);
				})}
			</ul>

			<Confirm
				isOpen={pending !== undefined}
				title={
					pending?.mode === "forever" ? "Delete forever?" : "Move to trash?"
				}
				description={
					pending?.mode === "forever"
						? `“${pending.title}” will be gone for good. This can’t be undone.`
						: `“${pending?.title ?? ""}” will disappear from the public page. You can restore it from the trash.`
				}
				confirmLabel={
					pending?.mode === "forever" ? "Delete forever" : "Move to trash"
				}
				onCancel={() => {
					setPending(undefined);
				}}
				onConfirm={() => {
					if (!pending) {
						return;
					}

					const { id, mode, title } = pending;
					setPending(undefined);
					markLeaving(id);
					run(
						async () =>
							mode === "forever" ? deleteListingForever(id) : trashListing(id),
						undefined,
						mode === "forever"
							? `Deleted “${title}” forever`
							: `Moved “${title}” to the trash`
					);
				}}
			/>
		</>
	);
}
