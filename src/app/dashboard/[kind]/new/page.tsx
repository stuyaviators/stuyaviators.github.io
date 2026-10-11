import type { Metadata } from "next";
import ListingForm from "@/components/dashboard/ListingForm";
import { PageHeader } from "@/components/dashboard/ui";
import { kindFromSlug } from "@/lib/dashboard-kinds";
import { requirePageUser } from "@/lib/session";
import { notFound } from "next/navigation";

export const metadata: Metadata = { title: "New card" };

export default async function NewListingPage({
	params,
}: {
	readonly params: Promise<{ kind: string }>;
}) {
	await requirePageUser("listings");
	const { kind } = await params;
	const config = kindFromSlug(kind);
	if (!config) {
		notFound();
	}

	return (
		<>
			<PageHeader title={`New ${config.singular}`} />
			<ListingForm
				kind={config.kind}
				slug={config.slug}
				noun={config.singular}
			/>
		</>
	);
}
