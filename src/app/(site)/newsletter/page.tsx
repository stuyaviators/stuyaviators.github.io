import type { Metadata } from "next";
import { Container } from "@/components/ui/Section";
import { getNewsletterArchive } from "@/lib/newsletters-public";
import Link from "next/link";

export const revalidate = 3600;

export const metadata: Metadata = {
	title: "Newsletter",
	description:
		"Past StuyAviators newsletters: deadlines, opportunities and club news.",
	alternates: { canonical: "/newsletter" },
};

const dateFormat = new Intl.DateTimeFormat("en-US", {
	dateStyle: "long",
	timeZone: "America/New_York",
});

/**
Every published newsletter, newest first.
*/
export default async function NewsletterArchivePage() {
	const issues = await getNewsletterArchive();
	return (
		<Container className="pt-28 pb-16 sm:pt-32 sm:pb-24">
			<p className="label text-accent-text">Mailing list</p>
			<h1 className="mt-3 text-4xl sm:text-5xl">Newsletter</h1>
			<p className="mt-4 max-w-xl text-lg text-muted">
				Deadlines, opportunities and club news, in your inbox. Missed an issue?
				Read it here.
			</p>
			{issues.length === 0 ? (
				<p className="mt-10 text-muted">No issues yet. Check back soon.</p>
			) : (
				<ul className="mt-10 grid max-w-3xl gap-4">
					{issues.map((issue) => (
						<li key={issue.slug}>
							<Link
								href={`/newsletter/${issue.slug}`}
								className="block rounded-2xl border border-hairline bg-surface p-5 transition-colors hover:border-brand sm:p-6"
							>
								{issue.publishedAt ? (
									<time
										dateTime={issue.publishedAt}
										className="label text-muted"
									>
										{dateFormat.format(new Date(issue.publishedAt))}
									</time>
								) : null}
								<h2 className="mt-1 text-2xl">{issue.title}</h2>
								{issue.excerpt ? (
									<p className="mt-2 text-muted">{issue.excerpt}</p>
								) : null}
							</Link>
						</li>
					))}
				</ul>
			)}
		</Container>
	);
}
