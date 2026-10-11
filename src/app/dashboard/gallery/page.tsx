import type { Metadata } from "next";
import GalleryManager from "@/components/dashboard/GalleryManager";
import { Notice, PageHeader } from "@/components/dashboard/ui";
import { photos } from "@/content/photos";
import { getDb } from "@/db";
import { submissions } from "@/db/schema";
import { isPhotoKey, listGalleryRows } from "@/lib/gallery";
import { requirePageUser } from "@/lib/session";
import { eq } from "drizzle-orm";
import { z } from "zod";

export const metadata: Metadata = { title: "Gallery" };

export default async function GalleryDashboardPage({
	searchParams,
}: {
	readonly searchParams: Promise<{ from?: string }>;
}) {
	await requirePageUser();
	const db = getDb();
	const rows = db ? await listGalleryRows(db) : [];

	// "Add to the gallery" in the inbox arrives here with the submission shown.
	const { from } = await searchParams;
	let reference: { name: string; link: string; message: string } | undefined;
	if (db && z.uuid().safeParse(from).success) {
		const matches = await db
			.select()
			.from(submissions)
			.where(eq(submissions.id, from ?? ""))
			.limit(1);
		const photo = matches.at(0);
		if (photo?.type === "photo") {
			reference = {
				name: photo.name ?? "Someone",
				link: photo.data.link ?? "",
				message: photo.message ?? "",
			};
		}
	}

	const items = rows.map((row) => {
		const key = row.photoKey ?? undefined;
		const bundled = isPhotoKey(key) ? photos[key].src.src : undefined;
		return {
			id: row.id,
			alt: row.alt,
			src: row.imageUrl ?? bundled,
		};
	});

	return (
		<>
			<PageHeader
				title="Gallery"
				description="The photos on the Community Highlights page, in the order they appear. New photos go first."
			/>
			{db ? (
				<GalleryManager items={items} reference={reference} />
			) : (
				<Notice tone="bad">
					The database isn’t connected (<code>DATABASE_URL</code>).
				</Notice>
			)}
		</>
	);
}
