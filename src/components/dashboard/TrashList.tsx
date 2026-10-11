"use client";

import type { TrashItem } from "@/lib/trash";
import {
	deleteTrashItemAction,
	emptyTrashAction,
	restoreTrashItemAction,
} from "@/actions/trash";
import Confirm from "@/components/dashboard/Confirm";
import { useToast } from "@/components/dashboard/Toast";
import { Badge, Card, formatWhen, Notice } from "@/components/dashboard/ui";
import { useAction } from "@/components/dashboard/use-action";
import { useViewer } from "@/components/dashboard/Viewer";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/cn";
import { trashKindLabels } from "@/lib/trash";
import { RotateCcw, Trash2 } from "lucide-react";
import Image from "next/image";
import { useState } from "react";

type Pending = { kind: "one"; item: TrashItem } | { kind: "all" };

/**
Everything in the trash, with who deleted it and how long it has left.
*/
export default function TrashList({
	items,
}: {
	readonly items: readonly TrashItem[];
}) {
	const { run, isPending, error, leavingId, markLeaving } = useAction();
	const { personName } = useViewer();
	const { toast } = useToast();
	const [pending, setPending] = useState<Pending>();

	if (items.length === 0) {
		return (
			<Card>
				<p className="font-semibold">The trash is empty.</p>
				<p className="mt-1 text-sm text-muted">
					Deleted cards, newsletters, photos, quotes and crew entries show up
					here.
				</p>
			</Card>
		);
	}

	return (
		<>
			{error ? (
				<Notice tone="bad" className="mb-4">
					{error}
				</Notice>
			) : null}
			<div className="mb-4 flex justify-end">
				<Button
					variant="secondary"
					className="text-danger"
					disabled={isPending}
					onClick={() => {
						setPending({ kind: "all" });
					}}
				>
					<Trash2 aria-hidden className="size-4" /> Empty the trash
				</Button>
			</div>
			<ul className="dash-stagger space-y-3">
				{items.map((item) => (
					<li
						key={`${item.kind}-${item.id}`}
						className={cn(
							"flex flex-wrap items-center gap-3 rounded-2xl border border-hairline bg-surface p-4",
							leavingId === item.id && "dash-leave"
						)}
					>
						{item.imageUrl ? (
							<span className="relative block h-14 w-20 shrink-0 overflow-hidden rounded-lg bg-surface-2">
								<Image
									src={item.imageUrl}
									alt=""
									fill
									sizes="80px"
									className="object-cover"
								/>
							</span>
						) : null}
						<div className="min-w-0 flex-1 basis-56">
							<p className="flex flex-wrap items-center gap-2">
								<Badge>{trashKindLabels[item.kind]}</Badge>
								<Badge tone={item.daysLeft <= 3 ? "bad" : "neutral"}>
									{item.daysLeft === 1
										? "1 day left"
										: `${item.daysLeft} days left`}
								</Badge>
							</p>
							<p className="mt-1 break-words font-semibold">{item.title}</p>
							<p className="text-sm text-muted">{item.detail}</p>
							<p className="text-sm text-muted">
								Deleted {formatWhen(item.deletedAt)}
								{item.deletedBy
									? ` by ${personName(item.deletedBy) ?? item.deletedBy}`
									: ""}
								{item.addedBy
									? ` · added by ${personName(item.addedBy) ?? item.addedBy}`
									: ""}
							</p>
						</div>
						<div className="ml-auto flex items-center gap-1">
							<Button
								variant="secondary"
								disabled={isPending}
								onClick={() => {
									markLeaving(item.id);
									run(
										async () => restoreTrashItemAction(item.kind, item.id),
										undefined,
										`Restored “${item.title}”`
									);
								}}
							>
								<RotateCcw aria-hidden className="size-4" /> Restore
							</Button>
							<Button
								variant="ghost"
								className="text-danger"
								aria-label={`Delete ${item.title} for good`}
								disabled={isPending}
								onClick={() => {
									setPending({ kind: "one", item });
								}}
							>
								<Trash2 aria-hidden className="size-4" /> Delete for good
							</Button>
						</div>
					</li>
				))}
			</ul>

			<Confirm
				isOpen={pending !== undefined}
				title={
					pending?.kind === "all" ? "Empty the trash?" : "Delete for good?"
				}
				description={
					pending?.kind === "all"
						? `Everything in the trash (${items.length}) will be gone for good. This can’t be undone.`
						: `“${pending?.item.title ?? ""}” will be gone for good. This can’t be undone.`
				}
				confirmLabel={pending?.kind === "all" ? "Empty the trash" : "Delete"}
				onCancel={() => {
					setPending(undefined);
				}}
				onConfirm={() => {
					const target = pending;
					setPending(undefined);
					if (!target) {
						return;
					}

					if (target.kind === "all") {
						run(
							async () => emptyTrashAction(),
							(result) => {
								toast(
									result.removed === 1
										? "Deleted 1 item for good"
										: `Deleted ${result.removed} items for good`
								);
							}
						);
						return;
					}

					markLeaving(target.item.id);
					run(
						async () => deleteTrashItemAction(target.item.kind, target.item.id),
						undefined,
						`Deleted “${target.item.title}” for good`
					);
				}}
			/>
		</>
	);
}
