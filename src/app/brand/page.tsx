import type { Metadata } from "next";
import CopyButton from "@/components/CopyButton";
import { Stagger } from "@/components/TransitionProvider";
import { buttonClasses } from "@/components/ui/Button";
import { PageHero } from "@/components/ui/PageHero";
import { Section } from "@/components/ui/Section";
import {
	brandRules,
	logoVariants,
	palette,
	typefaces,
	typeRules,
	wordmark,
} from "@/content/brand";
import logo from "@/assets/brand/logo.png";
import TypeTester from "@/components/TypeTester";
import { ArrowUpRight, Check, Download, X } from "lucide-react";
import Image from "next/image";

export const metadata: Metadata = {
	title: "Brand Guidelines",
	description:
		"StuyAviators logos, color palette and typography, with downloads for flyers, slides and social media.",
	alternates: { canonical: "/brand" },
};

const base = "/brand/downloads";

const typeScale = [
	{
		name: "Wordmark",
		spec: "Inter Tight 600 caps",
		sample: "STUYAVIATORS",
		className: "font-display text-3xl font-semibold tracking-[0.08em] uppercase",
	},
	{
		name: "Display",
		spec: "Inter Tight 600",
		sample: "StuyAviators",
		className: "font-display text-5xl font-semibold sm:text-7xl",
	},
	{
		name: "Heading",
		spec: "Inter Tight 600",
		sample: "Eight ways to fly with us",
		className: "font-display text-3xl font-semibold sm:text-5xl",
	},
	{
		name: "Subhead",
		spec: "Inter Tight 600",
		sample: "Flight Simulator Demonstrations",
		className: "font-display text-2xl font-semibold",
	},
	{
		name: "Body",
		spec: "Inter 400",
		sample:
			"Drop in whenever your schedule allows. No experience needed.",
		className: "text-lg",
	},
	{
		name: "Label",
		spec: "Inter 600 caps",
		sample: "Next departures",
		className: "label text-accent-text",
	},
	{
		name: "Data",
		spec: "Inter tabular",
		sample: "15:30 · WED 16 OCT · RM 313",
		className: "font-mono text-lg",
	},
];

export default function BrandPage() {
	return (
		<>
			<PageHero
				eyebrow="Brand guidelines"
				title="StuyAviators brand"
				intro="Logos, wordmark, colors and type for flyers, slides, shirts and social posts. Please follow these guidelines whenever you use the StuyAviators name or logo."
			>
				<a
					href={`${base}/stuyaviators-brand-kit.zip`}
					download
					className={buttonClasses("accent")}
				>
					<Download aria-hidden className="size-4" /> Download brand kit (.zip)
				</a>
			</PageHero>

			<Section
				id="logos"
				title="Logos"
				intro="Use the vector SVG whenever you can; it stays sharp at any size. PNGs have transparent backgrounds."
			>
				<div className="grid gap-6 md:grid-cols-2">
					{logoVariants.map((variant) => (
						<Stagger key={variant.id}>
							<article className="h-full overflow-hidden rounded-3xl bg-surface">
								<div
									className="flex items-center justify-center border-b border-hairline p-8"
									style={{ backgroundColor: variant.preview }}
								>
									<img
										src={`${base}/stuyaviators-logo-${variant.id}-${variant.widths[0]}.png`}
										alt={`StuyAviators ${variant.name.toLowerCase()} logo`}
										width={variant.aspect === "banner" ? 320 : 180}
										height={variant.aspect === "banner" ? 161 : 180}
										loading="lazy"
										className="h-auto max-w-full"
									/>
								</div>
								<div className="p-5">
									<h3 className="text-lg">{variant.name}</h3>
									<p className="mt-1 text-sm text-muted">{variant.use}</p>
									<ul
										className="mt-4 flex flex-wrap gap-2"
										aria-label={`Download ${variant.name} logo`}
									>
										<li>
											<a
												href={`${base}/stuyaviators-logo-${variant.id}.svg`}
												download
												className={buttonClasses(
													"secondary",
													"min-h-9 px-3 py-1.5"
												)}
											>
												<Download aria-hidden className="size-3.5" /> SVG
											</a>
										</li>
										{variant.widths.map((width) => (
											<li key={width}>
												<a
													href={`${base}/stuyaviators-logo-${variant.id}-${width}.png`}
													download
													className={buttonClasses(
														"ghost",
														"min-h-9 px-3 py-1.5"
													)}
												>
													PNG {width}px
												</a>
											</li>
										))}
									</ul>
								</div>
							</article>
						</Stagger>
					))}
				</div>
			</Section>

			<Section
				pin
				id="colors"
				label="Color palette"
				title="Colors"
				intro="Stuy Blue on clean white and near-black is the core palette, with Ice and Night Navy from the logo artwork as secondary colors. Text on each swatch meets WCAG AA contrast."
			>
				<ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
					{palette.map((color) => (
						<Stagger as="li" key={color.id}>
							<div className="overflow-hidden rounded-3xl bg-surface">
								<div
									className="flex h-32 items-end border-b border-hairline p-4"
									style={{ backgroundColor: color.hex, color: color.onColor }}
								>
									<span className="text-lg font-semibold">{color.name}</span>
								</div>
								<div className="space-y-2 p-4 text-sm">
									<div className="flex items-center justify-between gap-2">
										<span className="font-mono">{color.hex}</span>
										<CopyButton
											value={color.hex}
											label={`${color.name} hex code`}
										/>
									</div>
									<p className="font-mono text-muted">
										rgb({color.rgb.join(", ")})
									</p>
									<p className="text-muted">{color.use}</p>
								</div>
							</div>
						</Stagger>
					))}
				</ul>
				<p className="mt-6 text-sm text-muted">
					Palette files:{" "}
					<a
						href={`${base}/stuyaviators-palette.css`}
						download
						className="text-brand underline"
					>
						CSS
					</a>
					{" · "}
					<a
						href={`${base}/stuyaviators-palette.json`}
						download
						className="text-brand underline"
					>
						JSON
					</a>
				</p>
			</Section>

			<Section
				id="type"
				label="Typography"
				title="Type"
				intro="Our type follows Airbus’s brand typography: Inter Tight for the wordmark, display and graphic design, Inter for everything you read on screen. Both are free on Google Fonts."
			>
				<div className="mb-6 grid gap-8 rounded-3xl bg-surface p-6 sm:p-10 lg:grid-cols-[1.2fr_1fr] lg:items-center">
					<div>
						<p className="label text-accent-text">Wordmark</p>
						<div className="mt-6 flex items-center gap-4">
							<Image src={logo} alt="" width={64} height={64} className="size-16" />
							<span className="font-display text-3xl font-semibold tracking-[0.08em] uppercase sm:text-5xl">
								{wordmark.text}
							</span>
						</div>
						<p className="mt-4 font-mono text-sm text-muted">{wordmark.spec}</p>
					</div>
					<ul className="space-y-3">
						{wordmark.rules.map((rule) => (
							<li key={rule} className="flex gap-3">
								<Check aria-hidden className="mt-1 size-4 shrink-0 text-success" />
								{rule}
							</li>
						))}
					</ul>
				</div>
				<div className="grid gap-6 md:grid-cols-2">
					{typefaces.map((face) => (
						<Stagger key={face.id}>
							<article className="flex h-full flex-col rounded-3xl bg-surface p-6 sm:p-8">
								<p className="label text-accent-text">{face.role}</p>
								<p
									aria-hidden
									className="mt-4 text-8xl leading-none"
									style={{
										fontFamily: face.variable,
										fontWeight: face.weights.at(-1)?.value,
									}}
								>
									Aa
								</p>
								<h3 className="mt-6 text-2xl">{face.name}</h3>
								<p className="mt-2 flex-1 text-muted">{face.use}</p>
								<ul className="mt-5 space-y-1.5 border-t border-hairline pt-5">
									{face.weights.map((weight) => (
										<li
											key={weight.value}
											className="flex items-baseline justify-between gap-3"
										>
											<span
												className="text-lg"
												style={{
													fontFamily: face.variable,
													fontWeight: weight.value,
												}}
											>
												{weight.name}
											</span>
											<span className="font-mono text-sm text-muted">
												{weight.value}
											</span>
										</li>
									))}
								</ul>
								<p
									aria-hidden
									className="mt-5 text-sm leading-relaxed break-all text-muted"
									style={{ fontFamily: face.variable }}
								>
									ABCDEFGHIJKLMNOPQRSTUVWXYZ abcdefghijklmnopqrstuvwxyz
									0123456789 &amp;@#?!→
								</p>
								<a
									href={face.href}
									target="_blank"
									rel="noopener noreferrer"
									className={buttonClasses("secondary", "mt-6 self-start")}
								>
									Get {face.name}{" "}
									<ArrowUpRight aria-hidden className="btn-arrow size-4" />
								</a>
							</article>
						</Stagger>
					))}
				</div>

				<h3 className="mt-16 text-2xl">Try it</h3>
				<div className="mt-5">
					<TypeTester typefaces={typefaces} />
				</div>

				<h3 className="mt-16 text-2xl">Type scale</h3>
				<ol className="mt-5 divide-y divide-hairline rounded-3xl bg-surface px-6 sm:px-8">
					{typeScale.map((item) => (
						<li
							key={item.name}
							className="grid gap-2 py-5 sm:grid-cols-[10rem_1fr] sm:items-baseline"
						>
							<span className="font-mono text-sm text-muted">
								{item.name} · {item.spec}
							</span>
							<span className={item.className}>{item.sample}</span>
						</li>
					))}
				</ol>

				<h3 className="mt-16 text-2xl">Typesetting</h3>
				<ul className="mt-5 grid gap-3 sm:grid-cols-2">
					{typeRules.map((rule) => (
						<li key={rule} className="flex gap-3 rounded-2xl bg-surface p-5">
							<Check aria-hidden className="mt-1 size-4 shrink-0 text-success" />
							{rule}
						</li>
					))}
				</ul>
			</Section>

			<Section pin id="usage" label="Usage" title="Do’s and don’ts">
				<div className="grid gap-6 md:grid-cols-2">
					<ul className="space-y-3 rounded-3xl bg-surface p-6">
						{brandRules.do.map((rule) => (
							<li key={rule} className="flex gap-3">
								<Check
									aria-hidden
									className="mt-1 size-4 shrink-0 text-success"
								/>
								<span>
									<span className="sr-only">Do: </span>
									{rule}
								</span>
							</li>
						))}
					</ul>
					<ul className="space-y-3 rounded-3xl bg-surface p-6">
						{brandRules.dont.map((rule) => (
							<li key={rule} className="flex gap-3">
								<X aria-hidden className="mt-1 size-4 shrink-0 text-danger" />
								<span>
									<span className="sr-only">Don’t: </span>
									{rule}
								</span>
							</li>
						))}
					</ul>
				</div>
				<p className="mt-6 text-sm text-muted">
					Questions or permission requests:{" "}
					<a
						href="mailto:aviators-exec@stuy.edu"
						className="text-brand underline"
					>
						aviators-exec@stuy.edu
					</a>
				</p>
			</Section>
		</>
	);
}
