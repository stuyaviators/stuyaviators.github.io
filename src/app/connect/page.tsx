import type { Metadata } from "next";
import CopyButton from "@/components/CopyButton";
import SubmissionForm from "@/components/forms/SubmissionForm";
import GoogleMap from "@/components/GoogleMap";
import { SocialIcon } from "@/components/icons";
import InstagramGrid from "@/components/InstagramGrid";
import { Stagger } from "@/components/TransitionProvider";
import { ButtonLink, buttonClasses } from "@/components/ui/Button";
import { PageHero } from "@/components/ui/PageHero";
import { Section } from "@/components/ui/Section";
import { connectCopy } from "@/content/connect";
import { pageIntros } from "@/content/pages";
import { photos } from "@/content/photos";
import { contacts, mapsLinks, site, socials } from "@/content/site";
import { getInstagramFeed } from "@/lib/behold";
import { ArrowUpRight, Mail, MapPin } from "lucide-react";
import Image from "next/image";

export const revalidate = 3600;

export const metadata: Metadata = {
	title: "Connect",
	description: pageIntros.contact.intro,
	alternates: { canonical: "/connect" },
};

export default async function ConnectPage() {
	const feed = await getInstagramFeed();
	return (
		<>
			<PageHero
				eyebrow="Connect · Socials & contact"
				title="Connect"
				intro={pageIntros.socials.intro}
				image={photos.heroSimRyanair.src}
				imageAlt={photos.heroSimRyanair.alt}
			>
				<a href="#mailing-list" className={buttonClasses("accent")}>
					<Mail aria-hidden className="size-4" /> Join the Mailing List
				</a>
				<ButtonLink href="#contact" variant="secondary">
					Contact us
				</ButtonLink>
			</PageHero>

			<Section
				id="socials"
				label="Stay in the loop"
				title="Find us online"
			>
				<ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
					{socials.map((social) => (
						<Stagger as="li" key={social.key}>
							<a
								href={social.href}
								target="_blank"
								rel="noopener noreferrer"
								className="group flex h-full items-center justify-between gap-3 rounded-3xl bg-surface p-4 transition-[transform,background-color] duration-300 hover:-translate-y-1 hover:bg-surface-2 motion-reduce:transition-none motion-reduce:hover:translate-y-0"
							>
								<span className="flex items-center gap-3">
									<span className="flex size-10 items-center justify-center rounded-md bg-surface-2 text-brand">
										<SocialIcon name={social.key} className="size-5" />
									</span>
									<span>
										<span className="block font-semibold">{social.label}</span>
										<span className="block text-sm text-muted">
											{social.action}
										</span>
									</span>
								</span>
								<ArrowUpRight
									aria-hidden
									className="size-4 text-muted group-hover:text-brand"
								/>
							</a>
						</Stagger>
					))}
				</ul>
			</Section>

			<Section
				id="contact"
				label="Contact information"
				title="Contact us"
				intro={pageIntros.contact.intro}
			>
				<div className="grid gap-10 lg:grid-cols-2">
					<div>
						<ul className="space-y-3">
							{contacts.map((contact) => (
								<li
									key={contact.value}
									className="flex items-center gap-3 rounded-3xl bg-surface p-3 pl-4"
								>
									<Mail aria-hidden className="size-5 shrink-0 text-brand" />
									<a href={contact.href} className="min-w-0 flex-1">
										<span className="label block text-muted">
											{contact.label}
										</span>
										<span className="block truncate font-semibold">
											{contact.value}
										</span>
										{contact.note ? (
											<span className="block text-sm text-muted">
												{contact.note}
											</span>
										) : null}
									</a>
									<CopyButton
										value={contact.value}
										label={`${contact.label} email`}
									/>
								</li>
							))}
							<li className="flex items-center gap-3 rounded-3xl bg-surface p-3 pl-4">
								<MapPin aria-hidden className="size-5 shrink-0 text-brand" />
								<a
									href={mapsLinks.open}
									target="_blank"
									rel="noopener noreferrer"
									className="min-w-0 flex-1"
								>
									<span className="label block text-muted">Address</span>
									<span className="block font-semibold">
										{site.address.line}
									</span>
								</a>
								<CopyButton value={site.address.line} label="address" />
							</li>
						</ul>
						<p className="mt-4 text-sm text-muted">
							{connectCopy.contactNote}
						</p>
					</div>
					<GoogleMap
						embedUrl={mapsLinks.embed}
						openUrl={mapsLinks.open}
						directionsUrl={mapsLinks.directions}
						title="Map showing Stuyvesant High School at 345 Chambers St, New York"
						label="Stuyvesant High School"
					/>
				</div>
			</Section>

			<Section
				id="message"
				label="Send a message"
				title="Write to us"
			>
				<div className="max-w-2xl">
					<SubmissionForm
						type="contact"
						submitLabel="Send message"
						successMessage="Message sent. We usually reply within 3–5 business days."
						fields={[
							{ name: "name", label: "Full name", autoComplete: "name" },
							{
								name: "email",
								label: "Email",
								type: "email",
								autoComplete: "email",
							},
							{ name: "message", label: "Message", type: "textarea" },
						]}
					/>
				</div>
			</Section>

			{feed ? (
				<Section
					id="instagram"
					label="Instagram"
					title="From the flight deck"
				>
					<div className="mb-8 flex flex-wrap items-center justify-between gap-6 rounded-3xl bg-surface p-5">
						<div className="flex items-center gap-4">
							{feed.profilePictureUrl ? (
								<Image
									src={feed.profilePictureUrl}
									alt=""
									width={64}
									height={64}
									unoptimized
									className="size-16 rounded-full border border-hairline"
								/>
							) : null}
							<div>
								<p className="text-lg font-semibold">@{feed.username}</p>
								<p className="max-w-md text-sm text-muted">{feed.biography}</p>
							</div>
						</div>
						<div className="flex items-center gap-6">
							{typeof feed.followersCount === "number" ? (
								<div>
									<p className="label text-muted">Followers</p>
									<p className="font-display text-3xl font-semibold text-brand">
										{feed.followersCount.toLocaleString("en-US")}
									</p>
								</div>
							) : null}
							<ButtonLink
								href={`https://www.instagram.com/${feed.username}`}
								variant="accent"
							>
								Follow @{feed.username}
							</ButtonLink>
						</div>
					</div>
					<InstagramGrid posts={feed.posts} variant="grid" />
				</Section>
			) : null}
		</>
	);
}
