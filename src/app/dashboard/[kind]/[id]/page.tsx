import type { Metadata } from "next";
import ListingForm from "@/components/dashboard/ListingForm";
import { Notice, PageHeader } from "@/components/dashboard/ui";
import { getDb } from "@/db";
import { kindFromSlug } from "@/lib/dashboard-kinds";
import { getListing } from "@/lib/listings-admin";
import { hasAccess, requirePageUser } from "@/lib/session";
import Link from "next/link";
import { notFound } from "next/navigation";
import { z } from "zod";

export const metadata: Metadata = { title: "Edit card" };

export default async function EditListingPage({
	params,
}: {
	readonly params: Promise<{ kind: string; id: string }>;
}) {
	const user = await requirePageUser("listings");
	const { kind, id } = await params;
	const config = kindFromSlug(kind);
	const db = getDb();
	if (!config || !z.uuid().safeParse(id).success) {
		notFound();
	}

	const listing = db ? await getListing(db, id) : undefined;
	if (listing?.kind !== config.kind) {
		notFound();
	}

	// Deleted cards are only known to people who can see the trash.
	if (listing.deletedAt && !hasAccess(user, "trash")) {
		notFound();
	}

	return (
		<>
			<PageHeader title={`Edit ${config.singular}`} />
			{listing.deletedAt ? (
				<Notice tone="warn" className="mb-5">
					This card is in the trash. Restore it from{" "}
					<Link href="/dashboard/trash" className="text-link">
						Trash
					</Link>{" "}
					to show it again.
				</Notice>
			) : null}
			<ListingForm
				kind={config.kind}
				slug={config.slug}
				noun={config.singular}
				listing={listing}
			/>
		</>
	);
}
