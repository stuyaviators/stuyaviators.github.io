import type { Metadata } from "next";
import { Md, Paragraphs } from "@/components/Md";
import { Stagger } from "@/components/TransitionProvider";
import { FlightStrip } from "@/components/ui/FlightStrip";
import { PageHero } from "@/components/ui/PageHero";
import { Container } from "@/components/ui/Section";
import { charter, expectations } from "@/content/charter";
import { pageIntros } from "@/content/pages";
import { photos } from "@/content/photos";

export const metadata: Metadata = {
	title: "Charter & Rules",
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

export default function CharterPage() {
	return (
		<>
			<PageHero
				eyebrow="About"
				title="Charter & Rules"
				intro={pageIntros.charter.intro}
				image={photos.heroSimClassroom.src}
				imageAlt={photos.heroSimClassroom.alt}
			/>
			<Container className="grid gap-12 lg:grid-cols-[16rem_1fr]">
				<nav
					aria-label="On this page"
					className="pt-14 lg:sticky lg:top-28 lg:self-start"
				>
					<p className="label text-muted">On this page</p>
					<ol className="mt-3 space-y-1 border-l border-hairline text-sm">
						{toc.map((item) => (
							<li key={item.id}>
								<a
									href={`#${item.id}`}
									className="-ml-px block border-l-2 border-transparent py-1 pl-3 text-muted hover:border-brand hover:text-text"
								>
									{item.title}
								</a>
							</li>
						))}
					</ol>
				</nav>
				<div className="min-w-0">
					<Stagger className="scene-section scene">
						<FlightStrip label={charter.foundation.title} />
						<p className="mt-5 max-w-3xl text-xl">
							{charter.foundation.paragraphs[0]}
						</p>
					</Stagger>
					{charter.sections.map((section, index) => (
						<section
							key={section.id}
							id={section.id}
							aria-labelledby={`${section.id}-h`}
							className="scene-section scene scroll-mt-28 py-10"
						>
							<FlightStrip index={index + 1} label="Charter" />
							<h2 id={`${section.id}-h`} className="mt-4 text-3xl">
								{section.title}
							</h2>
							<Paragraphs
								items={section.paragraphs}
								className="prose-club mt-4"
							/>
						</section>
					))}

					<section
						id={expectations.codeOfConduct.id}
						aria-labelledby="coc-h"
						className="scene-section scene scroll-mt-28 py-10"
					>
						<FlightStrip index={7} label="Rules & expectations" />
						<h2 id="coc-h" className="mt-4 text-3xl">
							{expectations.codeOfConduct.title}
						</h2>
						<p className="prose-club mt-4">
							{expectations.codeOfConduct.intro}
						</p>
						<NumberedRules items={expectations.codeOfConduct.items} />
					</section>
					<section
						id={expectations.attendance.id}
						aria-labelledby="att-h"
						className="scene-section scene scroll-mt-28 py-10"
					>
						<FlightStrip index={8} label="Rules & expectations" />
						<h2 id="att-h" className="mt-4 text-3xl">
							{expectations.attendance.title}
						</h2>
						<Paragraphs
							items={expectations.attendance.paragraphs}
							className="prose-club mt-4"
						/>
					</section>
					<section
						id={expectations.etiquette.id}
						aria-labelledby="eti-h"
						className="scene-section scene scroll-mt-28 py-10"
					>
						<FlightStrip index={9} label="Rules & expectations" />
						<h2 id="eti-h" className="mt-4 text-3xl">
							{expectations.etiquette.title}
						</h2>
						<p className="prose-club mt-4">
							{expectations.etiquette.intro}
						</p>
						<NumberedRules items={expectations.etiquette.items} />
					</section>
					<section
						id={expectations.cancellations.id}
						aria-labelledby="can-h"
						className="scene-section scene scroll-mt-28 py-10"
					>
						<FlightStrip index={10} label="Rules & expectations" />
						<h2 id="can-h" className="mt-4 text-3xl">
							{expectations.cancellations.title}
						</h2>
						<Paragraphs
							items={expectations.cancellations.paragraphs}
							className="prose-club mt-4"
						/>
					</section>
				</div>
			</Container>
		</>
	);
}
