import Image from "next/image";
import Link from "next/link";
import bannerWhite from "@/assets/brand/banner-white.png";
import MailingListForm from "@/components/forms/MailingListForm";
import { SocialIcon } from "@/components/icons";
import { contacts, isNavGroup, nav, site, socials } from "@/content/site";
import { signupFormConfig } from "@/lib/google-forms";
import { Container } from "./ui/Section";

export default function Footer() {
	const year = new Date().getFullYear();
	return (
		<footer className="mt-auto bg-navy text-[#eef4ff] [--brand:#8dbdf2] [--field:#5f7ca8] [--hairline:#243b63] [--muted:#a9bedd] [--surface:#172a4d] [--text:#eef4ff] [--accent:#ddebff] [--accent-ink:#0f1b32] [--danger:#ff8a80] [--success:#6fd39b]">
			<Container className="py-14">
				<div className="grid gap-12 lg:grid-cols-[1.1fr_1fr]">
					<div>
						<Image
							src={bannerWhite}
							alt="StuyAviators"
							className="h-auto w-56"
							sizes="224px"
						/>
						<p className="mt-5 max-w-md text-[#a9bedd]">{site.tagline}</p>
						<ul className="mt-6 flex flex-wrap gap-2" aria-label="Social media">
							{socials.map((social) => (
								<li key={social.key}>
									<a
										href={social.href}
										target="_blank"
										rel="noopener noreferrer"
										aria-label={social.label}
										title={social.label}
										className="inline-flex size-11 items-center justify-center rounded-md border border-[#243b63] hover:border-[#8dbdf2] hover:text-[#8dbdf2]"
									>
										<SocialIcon name={social.key} className="size-5" />
									</a>
								</li>
							))}
						</ul>
					</div>
					<div>
						<h2 className="label text-[#a9bedd]">Mailing list</h2>
						<p className="mt-2 text-lg font-semibold">
							Meeting updates, events and opportunities in your inbox.
						</p>
						<MailingListForm
							compact
							className="mt-4"
							fallbackUrl={signupFormConfig().fallbackUrl}
						/>
					</div>
				</div>

				<div className="mt-14 grid gap-10 border-t border-[#243b63] pt-10 sm:grid-cols-2 lg:grid-cols-4">
					{nav.filter(isNavGroup).map((group) => (
						<nav key={group.label} aria-label={group.label}>
							<h2 className="label text-[#a9bedd]">{group.label}</h2>
							<ul className="mt-3 space-y-2">
								{group.links.map((link) => (
									<li key={link.href}>
										<Link href={link.href} className="hover:text-[#8dbdf2]">
											{link.label}
										</Link>
									</li>
								))}
							</ul>
						</nav>
					))}
					<div>
						<h2 className="label text-[#a9bedd]">Contact</h2>
						<ul className="mt-3 space-y-2 text-sm">
							{contacts.map((contact) => (
								<li key={contact.value}>
									<a href={contact.href} className="break-all hover:text-[#8dbdf2]">
										{contact.value}
									</a>
								</li>
							))}
							<li className="pt-1 text-[#a9bedd]">
								{site.address.school}
								<br />
								{site.address.line}
							</li>
						</ul>
					</div>
				</div>

				<div className="mt-10 flex flex-col gap-3 border-t border-[#243b63] pt-6 text-sm text-[#a9bedd] sm:flex-row sm:items-center sm:justify-between">
					<p>
						© {year} StuyAviators · Stuyvesant High School’s student-run aviation
						club
					</p>
					<p className="flex gap-4">
						<Link href="/brand" className="hover:text-[#eef4ff]">
							Brand guidelines
						</Link>
						<Link href="/connect" className="hover:text-[#eef4ff]">
							Contact
						</Link>
						<Link href="/dashboard" className="hover:text-[#eef4ff]" prefetch={false}>
							Officer login
						</Link>
					</p>
				</div>
			</Container>
		</footer>
	);
}
