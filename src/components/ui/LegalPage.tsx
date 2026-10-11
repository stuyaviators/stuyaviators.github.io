import type { ReactNode } from "react";
import { Container } from "./Section.tsx";

/*
 * Plain, readable layout for the privacy policy and terms of service. No
 * animation: these are reference pages people (and Google's consent-screen
 * review) read start to finish.
 */

export function LegalPage({
	title,
	updated,
	intro,
	children,
}: {
	readonly title: string;
	readonly updated: string;
	readonly intro: ReactNode;
	readonly children: ReactNode;
}) {
	return (
		<Container className="pt-32 pb-20 sm:pt-40">
			<p className="label text-accent-text">StuyAviators · Legal</p>
			<h1 className="mt-3 text-4xl sm:text-5xl">{title}</h1>
			<p className="mt-3 text-sm text-muted">Last updated {updated}</p>
			<div className="prose-club mt-6 text-lg text-muted">{intro}</div>
			<div className="prose-club mt-10 text-text">{children}</div>
		</Container>
	);
}

export function LegalSection({
	id,
	title,
	children,
}: {
	readonly id: string;
	readonly title: string;
	readonly children: ReactNode;
}) {
	return (
		<section aria-labelledby={`${id}-heading`} className="mt-10 first:mt-0">
			<h2 id={`${id}-heading`} className="text-2xl sm:text-3xl">
				{title}
			</h2>
			<div className="prose-club mt-3">{children}</div>
		</section>
	);
}
