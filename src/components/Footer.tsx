import bannerBlue from "@/assets/brand/banner-blue.png";
import bannerWhite from "@/assets/brand/banner-white.png";
import { SocialIcon } from "@/components/icons";
import { adminContact, isHashLink, nav, site, socials } from "@/content/site";
import { Mail } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { buttonClasses } from "./ui/Button.tsx";
import { Container } from "./ui/Section.tsx";

const tagline = "Stuyvesant High School’s Official Aviation Club";

export default function Footer() {
	const year = new Date().getFullYear();
	return (
		<footer className="z-0 -mt-10 border-t border-hairline bg-surface pt-10 text-sm lg:sticky lg:bottom-0">
			<Container className="py-14">
				<div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-[1.6fr_repeat(4,1fr)] lg:gap-8">
					<div className="sm:col-span-2 lg:col-span-1">
						<Link
							href="/"
							aria-label="StuyAviators home"
							className="inline-block"
						>
							<Image
								src={bannerBlue}
								alt=""
								className="only-light h-auto w-48"
								sizes="192px"
							/>
							<Image
								src={bannerWhite}
								alt=""
								className="only-dark h-auto w-48"
								sizes="192px"
							/>
						</Link>
						<p className="mt-4 text-base font-medium text-text">{tagline}</p>
						<p className="mt-3 text-muted">
							<span className="block">{adminContact.label}</span>
							<a
								href={adminContact.href}
								className="break-all text-text underline-offset-2 hover:text-brand hover:underline"
							>
								{adminContact.value}
							</a>
						</p>
						<p className="mt-3 text-muted">
							{site.address.school}
							<br />
							{site.address.line}
						</p>
						<a href="#mailing-list" className={buttonClasses("accent", "mt-6")}>
							<Mail aria-hidden className="size-4" />
							Join the Mailing List
						</a>
						<ul className="mt-6 flex flex-wrap gap-2" aria-label="Social media">
							{socials.map((social) => (
								<li key={social.key}>
									<a
										href={social.href}
										target="_blank"
										rel="noopener noreferrer"
										aria-label={social.label}
										title={social.label}
										className="inline-flex size-10 items-center justify-center rounded-full border border-hairline text-muted transition-colors hover:border-brand hover:text-brand"
									>
										<SocialIcon name={social.key} className="size-[1.125rem]" />
									</a>
								</li>
							))}
						</ul>
					</div>

					{nav.map((group) => (
						<nav key={group.label} aria-label={group.label}>
							<h2 className="font-semibold text-text">{group.label}</h2>
							<ul className="mt-3 space-y-2.5">
								{group.links.map((link) => (
									<li key={link.href}>
										{isHashLink(link.href) ? (
											<a
												href={link.href}
												className="text-muted transition-colors hover:text-text"
											>
												{link.label}
											</a>
										) : (
											<Link
												href={link.href}
												prefetch={
													link.href === "/dashboard" ? false : undefined
												}
												className="text-muted transition-colors hover:text-text"
											>
												{link.label}
											</Link>
										)}
									</li>
								))}
							</ul>
						</nav>
					))}
				</div>

				<div className="mt-12 flex flex-col gap-3 border-t border-hairline pt-6 text-muted sm:flex-row sm:items-center sm:justify-between">
					<p>
						© {year} StuyAviators · {tagline}
					</p>
					<p className="flex flex-wrap gap-x-5 gap-y-2">
						<Link href="/brand" className="hover:text-text">
							Brand Guidelines
						</Link>
						<Link href="/privacy" className="hover:text-text">
							Privacy
						</Link>
						<Link href="/terms" className="hover:text-text">
							Terms
						</Link>
						<Link
							href="/dashboard"
							className="hover:text-text"
							prefetch={false}
						>
							Officer Login
						</Link>
					</p>
				</div>
			</Container>
		</footer>
	);
}
