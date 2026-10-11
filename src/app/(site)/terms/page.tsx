import type { Metadata } from "next";
import { LegalPage, LegalSection } from "@/components/ui/LegalPage";
import { adminContact, site } from "@/content/site";
import Link from "next/link";

export const metadata: Metadata = {
	title: "Terms",
	description:
		"The rules for using the StuyAviators website, including what you can submit and what we promise.",
	alternates: { canonical: "/terms" },
};

export default function TermsPage() {
	return (
		<LegalPage
			title="Terms of Service"
			updated="October 11, 2026"
			intro={
				<p>
					These terms cover your use of the StuyAviators website at{" "}
					{site.url.replace("https://", "")}. By using the site you agree to
					them. If you don’t agree, please don’t use the site.
				</p>
			}
		>
			<LegalSection id="about" title="About the site">
				<p>
					{site.name} is a student-run aviation club at {site.address.school}.
					The site shares information about the club, its meetings,
					opportunities, scholarships and careers, and lets members and visitors
					contact us.
				</p>
			</LegalSection>

			<LegalSection id="use" title="Using the site">
				<p>Please use the site in good faith. You agree not to:</p>
				<ul>
					<li>send spam, harassment, hate, or anything unlawful or unsafe;</li>
					<li>
						pretend to be someone else or give false information in a form;
					</li>
					<li>
						try to break into the dashboard or other parts of the site you
						haven’t been given access to, or probe the site for weaknesses;
					</li>
					<li>
						overload the site, scrape it at scale, or interfere with how it
						works.
					</li>
				</ul>
				<p>
					We may block access or remove submissions that break these rules. Club
					officers must also follow the{" "}
					<Link href="/charter">Club Charter &amp; Rules</Link>.
				</p>
			</LegalSection>

			<LegalSection id="submissions" title="What you send us">
				<p>
					Stories, photos, messages and meeting ideas you send are yours. By
					sending them you confirm you have the right to share them (and that
					anyone identifiable in a photo is okay with it), and you allow the
					club’s officers to review them and, if they choose, publish them on
					the site or the club’s channels. Tell us if you want something taken
					down and we will remove it. How we handle your information is
					explained in the <Link href="/privacy">Privacy Policy</Link>.
				</p>
			</LegalSection>

			<LegalSection id="accounts" title="Officer accounts">
				<p>
					The dashboard is only for club officers whom an admin has added.
					Signing in uses your Google account. Don’t share your access, and tell
					an admin if you think someone else has it. Admins can remove access at
					any time, and it takes effect right away.
				</p>
			</LegalSection>

			<LegalSection id="content" title="Our content">
				<p>
					The club’s name, logo and original text and photos belong to{" "}
					{site.name} and the people who made them. You’re welcome to link to
					the site and share pages. For logos, colors and how to use them, see
					the <Link href="/brand">Brand Guidelines</Link>; ask us before using
					anything else beyond personal or school use.
				</p>
			</LegalSection>

			<LegalSection id="links" title="Other websites and information">
				<p>
					The site links to other websites, such as Epsilon, Discord, Instagram,
					and scholarship and program providers. We don’t control them and
					aren’t responsible for what they say or do. Dates, deadlines, amounts
					and requirements for opportunities and scholarships can change, so
					always check with the provider before you apply. The careers pages are
					general guidance, not professional, legal or flight training advice.
				</p>
			</LegalSection>

			<LegalSection id="warranty" title="No guarantees">
				<p>
					The site is provided “as is”, run by volunteer students. We do our
					best to keep it accurate and available, but we don’t promise it will
					be error-free or always online. To the extent the law allows, the club
					and its officers aren’t liable for losses that come from using the
					site or relying on what it says.
				</p>
			</LegalSection>

			<LegalSection id="changes" title="Changes">
				<p>
					We may update these terms. The date at the top shows the latest
					version, and using the site after a change means you accept it.
				</p>
			</LegalSection>

			<LegalSection id="contact" title="Contact">
				<p>
					Questions about these terms: email{" "}
					<a href={adminContact.href}>{adminContact.value}</a>.
				</p>
			</LegalSection>
		</LegalPage>
	);
}
