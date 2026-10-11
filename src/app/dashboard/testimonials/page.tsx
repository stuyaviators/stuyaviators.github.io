import type { Metadata } from "next";
import TestimonialsManager from "@/components/dashboard/TestimonialsManager";
import { Notice, PageHeader } from "@/components/dashboard/ui";
import { getDb } from "@/db";
import { submissions } from "@/db/schema";
import { requirePageUser } from "@/lib/session";
import { listTestimonials } from "@/lib/testimonials";
import { eq } from "drizzle-orm";
import { z } from "zod";

export const metadata: Metadata = { title: "Testimonials" };

export default async function TestimonialsDashboardPage({
	searchParams,
}: {
	readonly searchParams: Promise<{ from?: string }>;
}) {
	await requirePageUser("testimonials");
	const db = getDb();
	const rows = db ? await listTestimonials(db) : [];

	// "Make a testimonial" in the inbox arrives here with the story filled in.
	const { from } = await searchParams;
	let prefill: { quote: string; author: string } | undefined;
	if (db && z.uuid().safeParse(from).success) {
		const matches = await db
			.select()
			.from(submissions)
			.where(eq(submissions.id, from ?? ""))
			.limit(1);
		const story = matches.at(0);
		if (story?.type === "story") {
			prefill = {
				quote: story.message ?? "",
				author: story.name ?? "",
			};
		}
	}

	return (
		<>
			<PageHeader
				title="Testimonials"
				description="The quotes in “What our members say” on the home page. Short ones read best."
			/>
			{db ? (
				<TestimonialsManager
					quotes={rows.map((row) => ({
						id: row.id,
						quote: row.quote,
						author: row.author,
						createdBy: row.createdBy ?? undefined,
					}))}
					prefill={prefill}
				/>
			) : (
				<Notice tone="bad">
					The database isn’t connected (<code>DATABASE_URL</code>).
				</Notice>
			)}
		</>
	);
}
