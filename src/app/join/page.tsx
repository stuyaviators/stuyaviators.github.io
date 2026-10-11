import type { Metadata } from "next";
import { EpsilonWordmark, SocialIcon } from "@/components/icons";
import { Stagger } from "@/components/TransitionProvider";
import { buttonClasses } from "@/components/ui/Button";
import { PageHero } from "@/components/ui/PageHero";
import { Section } from "@/components/ui/Section";
import { photos } from "@/content/photos";
import { site, socials } from "@/content/site";
import { ArrowUpRight, Mail } from "lucide-react";
import Link from "next/link";

export const metadata: Metadata = {
	title: "Join",
	description:
		"How to join StuyAviators: sign up on Epsilon, join the Discord, get on the mailing list and come to a meeting.",
	alternates: { canonical: "/join" },
};

const discord = socials.find((s) => s.key === "discord")!;

export default function JoinPage() {
	return (
		<>
			<PageHero
				eyebrow="Join · Pre-flight checklist"
				title="Join StuyAviators"
				intro="StuyAviators is a low-commitment club open to every Stuyvesant student, whatever your experience. Here’s how to get on board."
				image={photos.heroJoystick.src}
				imageAlt={photos.heroJoystick.alt}
			/>
			<Section id="steps" label="Checklist" title="Four steps">
				<ol className="grid gap-5 md:grid-cols-2">
					<Stagger as="li">
						<div className="h-full rounded-3xl bg-surface ring-2 ring-brand p-6">
							<p className="label text-accent-text">Step 01 · Required</p>
							<h3 className="mt-2 text-2xl">Join the club on Epsilon</h3>
							<p className="mt-2 text-muted">
								Epsilon is the Student Union’s club directory. Joining there
								makes you an official member.
							</p>
							<a
								href={site.epsilonUrl}
								target="_blank"
								rel="noopener noreferrer"
								className={buttonClasses("accent", "mt-5")}
							>
								Join on{" "}
								<EpsilonWordmark className="h-4 w-auto" aria-label="Epsilon" />{" "}
								<ArrowUpRight aria-hidden className="btn-arrow size-4" />
							</a>
						</div>
					</Stagger>
					<Stagger as="li">
						<div className="h-full rounded-3xl bg-surface p-6">
							<p className="label text-accent-text">Step 02</p>
							<h3 className="mt-2 text-2xl">Join the Discord</h3>
							<p className="mt-2 text-muted">
								Meeting details are posted in the #meetings channel.
							</p>
							<a
								href={discord.href}
								target="_blank"
								rel="noopener noreferrer"
								className={buttonClasses("secondary", "mt-5")}
							>
								<SocialIcon name="discord" className="size-4" />{" "}
								{discord.action}
							</a>
						</div>
					</Stagger>
					<Stagger as="li">
						<div className="h-full rounded-3xl bg-surface p-6">
							<p className="label text-accent-text">Step 03</p>
							<h3 className="mt-2 text-2xl">Get on the mailing list</h3>
							<p className="mt-2 text-muted">
								Meeting updates, events and opportunities in your inbox.
							</p>
							<a href="#mailing-list" className={buttonClasses("secondary", "mt-5")}>
								<Mail aria-hidden className="size-4" /> Sign up
							</a>
						</div>
					</Stagger>
					<Stagger as="li">
						<div className="h-full rounded-3xl bg-surface p-6">
							<p className="label text-accent-text">Step 04</p>
							<h3 className="mt-2 text-2xl">Come to a meeting</h3>
							<p className="mt-2 text-muted">
								General members aren’t required to attend regularly. Come
								whenever your schedule allows.
							</p>
							<div className="mt-5 flex flex-wrap gap-3">
								<Link href="/meetings" className={buttonClasses("secondary")}>
									See meetings
								</Link>
								<Link
									href="/flight-crew#positions"
									className={buttonClasses("ghost")}
								>
									Want to lead? See Flight Crew positions
								</Link>
							</div>
						</div>
					</Stagger>
				</ol>
			</Section>
		</>
	);
}
