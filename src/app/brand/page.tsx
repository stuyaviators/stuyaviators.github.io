import { Check, Download, X } from "lucide-react";
import type { Metadata } from "next";
import CopyButton from "@/components/CopyButton";
import { Stagger } from "@/components/TransitionProvider";
import { buttonClasses } from "@/components/ui/Button";
import { PageHero } from "@/components/ui/PageHero";
import { Section } from "@/components/ui/Section";
import { brandRules, logoVariants, palette } from "@/content/brand";

export const metadata: Metadata = {
	title: "Brand Guidelines",
	description:
		"StuyAviators logos, color palette and typography, with downloads for flyers, slides and social media.",
	alternates: { canonical: "/brand" },
};

const base = "/brand/downloads";

export default function BrandPage() {
	return (
		<>
			<PageHero
				eyebrow="Brand guidelines"
				title="StuyAviators brand"
				intro="Logos, colors and type for flyers, slides, shirts and social posts. Please follow these guidelines whenever you use the StuyAviators name or logo."
			>
				<a href={`${base}/stuyaviators-brand-kit.zip`} download className={buttonClasses("accent")}>
					<Download aria-hidden className="size-4" /> Download brand kit (.zip)
				</a>
			</PageHero>

			<Section id="logos" index={1} label="Logos" title="Logos" intro="Use the vector SVG whenever you can; it stays sharp at any size. PNGs have transparent backgrounds.">
				<div className="grid gap-6 md:grid-cols-2">
					{logoVariants.map((variant) => (
						<Stagger key={variant.id}>
							<article className="h-full overflow-hidden rounded-lg border border-hairline bg-surface">
								<div
									className="flex items-center justify-center border-b border-hairline p-8"
									style={{ backgroundColor: variant.preview }}
								>
									{/* eslint-disable-next-line @next/next/no-img-element */}
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
									<ul className="mt-4 flex flex-wrap gap-2" aria-label={`Download ${variant.name} logo`}>
										<li>
											<a href={`${base}/stuyaviators-logo-${variant.id}.svg`} download className={buttonClasses("secondary", "min-h-9 px-3 py-1.5")}>
												<Download aria-hidden className="size-3.5" /> SVG
											</a>
										</li>
										{variant.widths.map((width) => (
											<li key={width}>
												<a href={`${base}/stuyaviators-logo-${variant.id}-${width}.png`} download className={buttonClasses("ghost", "min-h-9 px-3 py-1.5")}>
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

			<Section id="colors" index={2} label="Color palette" title="Colors" intro="Night Navy, Stuy Blue and Ice are the core palette. Text combinations shown on each swatch meet WCAG AA contrast.">
				<ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
					{palette.map((color) => (
						<Stagger as="li" key={color.id}>
							<div className="overflow-hidden rounded-lg border border-hairline bg-surface">
								<div className="flex h-32 items-end p-4" style={{ backgroundColor: color.hex, color: color.onColor }}>
									<span className="text-lg font-semibold">{color.name}</span>
								</div>
								<div className="space-y-2 p-4 text-sm">
									<div className="flex items-center justify-between gap-2">
										<span className="font-mono">{color.hex}</span>
										<CopyButton value={color.hex} label={`${color.name} hex code`} />
									</div>
									<p className="font-mono text-muted">rgb({color.rgb.join(", ")})</p>
									<p className="text-muted">{color.use}</p>
								</div>
							</div>
						</Stagger>
					))}
				</ul>
				<p className="mt-6 text-sm text-muted">
					Palette files:{" "}
					<a href={`${base}/stuyaviators-palette.css`} download className="text-brand underline">CSS</a>{" · "}
					<a href={`${base}/stuyaviators-palette.json`} download className="text-brand underline">JSON</a>
				</p>
			</Section>

			<Section id="type" index={3} label="Typography" title="Type">
				<div className="grid gap-6 md:grid-cols-2">
					<div className="rounded-lg border border-hairline bg-surface p-6">
						<p className="label text-muted">Headings & body</p>
						<p className="mt-3 text-4xl font-semibold">Lexend</p>
						<p className="mt-2 text-muted">Clean and highly readable. Free on Google Fonts.</p>
					</div>
					<div className="rounded-lg border border-hairline bg-surface p-6">
						<p className="label text-muted">Labels & data</p>
						<p className="mt-3 font-label text-4xl font-bold tracking-wide uppercase">B612</p>
						<p className="mt-2 text-muted">Designed for Airbus cockpit displays. Use in caps for labels; B612 Mono for numbers.</p>
					</div>
				</div>
			</Section>

			<Section id="usage" index={4} label="Usage" title="Do’s and don’ts">
				<div className="grid gap-6 md:grid-cols-2">
					<ul className="space-y-3 rounded-lg border border-hairline bg-surface p-6">
						{brandRules.do.map((rule) => (
							<li key={rule} className="flex gap-3"><Check aria-hidden className="mt-1 size-4 shrink-0 text-success" /><span><span className="sr-only">Do: </span>{rule}</span></li>
						))}
					</ul>
					<ul className="space-y-3 rounded-lg border border-hairline bg-surface p-6">
						{brandRules.dont.map((rule) => (
							<li key={rule} className="flex gap-3"><X aria-hidden className="mt-1 size-4 shrink-0 text-danger" /><span><span className="sr-only">Don’t: </span>{rule}</span></li>
						))}
					</ul>
				</div>
				<p className="mt-6 text-sm text-muted">
					Questions or permission requests: <a href="mailto:aviators-exec@stuy.edu" className="text-brand underline">aviators-exec@stuy.edu</a>
				</p>
			</Section>
		</>
	);
}
