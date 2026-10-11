import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Md, Paragraphs } from "@/components/Md";
import { FlightStrip } from "@/components/ui/FlightStrip";
import { ButtonLink } from "@/components/ui/Button";
import { PageHero } from "@/components/ui/PageHero";
import CharterToc from "@/components/CharterToc";
import { Container } from "@/components/ui/Section";
import { charter, expectations } from "@/content/charter";
import { pageIntros } from "@/content/pages";
import { photos } from "@/content/photos";

export const metadata: Metadata = {
	title: "Club Charter & Rules",
	description: pageIntros.charter.intro,
	alternates: { canonical: "/charter" },
};

const toc = [
	...charter.sections.map((section) => ({
		id: section.id,
		title: section.title,
	})),
	{
		id: expectations.codeOfConduct.id,
		title: expectations.codeOfConduct.title,
	},
	{ id: expectations.attendance.id, title: expectations.attendance.title },
	{ id: expectations.etiquette.id, title: expectations.etiquette.title },
	{
		id: expectations.cancellations.id,
		title: expectations.cancellations.title,
	},
];

function NumberedRules({
	items,
}: {
	readonly items: ReadonlyArray<{ title: string; body: string }>;
}) {
	return (
		<ol className="mt-6 space-y-5">
			{items.map((item, index) => (
				<li key={item.title} className="grid grid-cols-[2.5rem_1fr] gap-2">
					<span className="font-mono text-sm text-accent-text">
						{String(index + 1).padStart(2, "0")}
					</span>
					<div>
						<p className="font-semibold">{item.title}.</p>
						<p className="mt-1 text-muted">
							<Md>{item.body}</Md>
						</p>
					</div>
				</li>
			))}
		</ol>
	);
}

/**
One part of the charter: its heading locks in place (beside the text on
wide screens, at the top on phones) while you scroll through the body.
*/
function CharterPart({
	id,
	number,
	eyebrow,
	title,
	children,
}: {
	readonly id: string;
	readonly number: number;
	readonly eyebrow: string;
	readonly title: string;
	readonly children: ReactNode;
}) {
	return (
		<section
			id={id}
			aria-labelledby={`${id}-h`}
			className="scroll-mt-24 border-t border-hairline py-14 lg:grid lg:grid-cols-[minmax(0,15rem)_1fr] lg:gap-10 lg:py-20"
		>
			<div className="below-header sticky z-10 -mx-4 bg-bg/85 px-4 py-3 backdrop-blur-xl backdrop-saturate-150 sm:-mx-6 sm:px-6 lg:mx-0 lg:self-start lg:bg-transparent lg:p-0 lg:backdrop-blur-none">
				<FlightStrip index={number} label={eyebrow} />
				<h2 id={`${id}-h`} className="mt-2 text-2xl sm:text-3xl">
					{title}
				</h2>
			</div>
			<div className="mt-6 min-w-0 text-lg lg:mt-0">{children}</div>
		</section>
	);
}

export default function CharterPage() {
	return (
		<>
			<PageHero
				eyebrow="About · Charter & rules"
				title="Club Charter"
				intro={pageIntros.charter.intro}
				image={photos.heroSimClassroom.src}
				imageAlt={photos.heroSimClassroom.alt}
			>
				<ButtonLink href="#purpose" variant="accent">
					Read the charter
				</ButtonLink>
				<ButtonLink href="#code-of-conduct" variant="secondary">
					Code of conduct
				</ButtonLink>
			</PageHero>
			<Container className="grid gap-12 pb-24 lg:grid-cols-[13rem_1fr]">
				<CharterToc items={toc} />
				<div className="min-w-0">
					<div className="py-16">
						<FlightStrip label={charter.foundation.title} />
						<p className="mt-5 max-w-3xl font-display text-3xl leading-snug font-semibold sm:text-4xl">
							{charter.foundation.paragraphs[0]}
						</p>
					</div>
					{charter.sections.map((section, index) => (
						<CharterPart
							key={section.id}
							id={section.id}
							number={index + 1}
							eyebrow="Charter"
							title={section.title}
						>
							<Paragraphs items={section.paragraphs} className="prose-club" />
						</CharterPart>
					))}
					<CharterPart
						id={expectations.codeOfConduct.id}
						number={7}
						eyebrow="Rules & expectations"
						title={expectations.codeOfConduct.title}
					>
						<p className="prose-club">{expectations.codeOfConduct.intro}</p>
						<NumberedRules items={expectations.codeOfConduct.items} />
					</CharterPart>
					<CharterPart
						id={expectations.attendance.id}
						number={8}
						eyebrow="Rules & expectations"
						title={expectations.attendance.title}
					>
						<Paragraphs
							items={expectations.attendance.paragraphs}
							className="prose-club"
						/>
					</CharterPart>
					<CharterPart
						id={expectations.etiquette.id}
						number={9}
						eyebrow="Rules & expectations"
						title={expectations.etiquette.title}
					>
						<p className="prose-club">{expectations.etiquette.intro}</p>
						<NumberedRules items={expectations.etiquette.items} />
					</CharterPart>
					<CharterPart
						id={expectations.cancellations.id}
						number={10}
						eyebrow="Rules & expectations"
						title={expectations.cancellations.title}
					>
						<Paragraphs
							items={expectations.cancellations.paragraphs}
							className="prose-club"
						/>
					</CharterPart>
				</div>
			</Container>
		</>
	);
}
