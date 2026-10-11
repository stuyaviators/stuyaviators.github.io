import type { Metadata } from "next";
import NewsletterEditor from "@/components/dashboard/NewsletterEditor";
import { Notice, PageHeader } from "@/components/dashboard/ui";
import { buttonClasses } from "@/components/ui/Button";
import { site } from "@/content/site";
import { getDb } from "@/db";
import { defaultNewsletter } from "@/lib/newsletter/defaults";
import { newsletterSchema } from "@/lib/newsletter/types";
import { getNewsletter } from "@/lib/newsletters";
import { hasAccess, requirePageUser } from "@/lib/session";
import Link from "next/link";
import { notFound } from "next/navigation";
import { z } from "zod";

export const metadata: Metadata = { title: "Edit newsletter" };

export default async function EditNewsletterPage({
	params,
}: {
	readonly params: Promise<{ id: string }>;
}) {
	const user = await requirePageUser("newsletters");
	const { id } = await params;
	const db = getDb();
	if (!db || !z.uuid().safeParse(id).success) {
		notFound();
	}

	const newsletter = await getNewsletter(db, id);
	if (!newsletter) {
		notFound();
	}

	if (newsletter.deletedAt) {
		// Deleted newsletters are only known to people who can see the trash.
		if (!hasAccess(user, "trash")) {
			notFound();
		}

		return (
			<>
				<PageHeader title={newsletter.title} />
				<Notice tone="warn">
					This newsletter is in the trash. Restore it from Trash to edit it.
				</Notice>
				<Link
					href="/dashboard/trash"
					className={`${buttonClasses("secondary")} mt-4`}
				>
					Open trash
				</Link>
			</>
		);
	}

	const parsed = newsletterSchema.safeParse(newsletter.data);
	return (
		<>
			<PageHeader
				title="Edit newsletter"
				actions={
					<Link
						href="/dashboard/newsletter"
						className={buttonClasses("secondary")}
					>
						All newsletters
					</Link>
				}
			/>
			{parsed.success ? null : (
				<Notice tone="warn" className="mb-5">
					Some saved content wasn’t valid, so this is a fresh template. Saving
					replaces it.
				</Notice>
			)}
			{/* key: a different newsletter always starts with fresh editor state. */}
			<NewsletterEditor
				key={newsletter.id}
				id={newsletter.id}
				initialTitle={newsletter.title}
				initialData={parsed.success ? parsed.data : defaultNewsletter()}
				initialUpdatedAt={newsletter.updatedAt.toISOString()}
				initialSlug={newsletter.slug ?? undefined}
				initialIsPublished={newsletter.status === "published"}
				siteUrl={site.url}
			/>
		</>
	);
}
