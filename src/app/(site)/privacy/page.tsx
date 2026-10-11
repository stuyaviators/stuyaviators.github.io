import type { Metadata } from "next";
import { LegalPage, LegalSection } from "@/components/ui/LegalPage";
import { adminContact, site } from "@/content/site";
import Link from "next/link";

export const metadata: Metadata = {
	title: "Privacy",
	description:
		"What information the StuyAviators website collects, why, who sees it, and how to ask us to remove it.",
	alternates: { canonical: "/privacy" },
};

export default function PrivacyPage() {
	return (
		<LegalPage
			title="Privacy Policy"
			updated="October 11, 2026"
			intro={
				<p>
					StuyAviators is a student-run aviation club at Stuyvesant High School,
					and this website is run by the club’s officers. This page explains
					what the website collects, why, who can see it, and how to ask us to
					remove it. We try to collect as little as we can.
				</p>
			}
		>
			<LegalSection id="google" title="Google user data (officer sign-in)">
				<p>
					The StuyAviators website lets club officers sign in to a private
					dashboard (“StuyAviators Dashboard”) with Sign in with Google. Only
					officers use it; ordinary visitors never need a Google account.
				</p>
				<h3>What we access</h3>
				<p>
					Only the basic profile information Google shares when you sign in,
					through the <code>openid</code>, <code>.../auth/userinfo.email</code>{" "}
					and <code>.../auth/userinfo.profile</code> scopes:
				</p>
				<ul>
					<li>your Google Account email address;</li>
					<li>your name; and</li>
					<li>your profile picture.</li>
				</ul>
				<p>
					We do not request access to your Gmail, Google Drive, Calendar,
					Contacts or any other Google service, and we do not read or change
					anything else in your Google Account.
				</p>
				<h3>How we use it</h3>
				<ul>
					<li>
						We compare your verified email address with the list of officers an
						admin has approved. If it isn’t on the list, you are turned away and
						nothing about you is stored.
					</li>
					<li>
						If it is on the list, we show your name and picture in the
						dashboard, record when you last signed in, and use your email to
						show other officers who last edited a card or newsletter.
					</li>
				</ul>
				<p>
					We use this information only to let you sign in and to run the officer
					dashboard. We do not use it for advertising, marketing, profiling or
					analytics, and we do not sell it.
				</p>
				<h3>Where it is stored and who sees it</h3>
				<p>
					The email, name, picture, role and last sign-in time are stored in the
					site’s database (Neon Postgres, hosted in the United States) and in a
					signed, encrypted session cookie in your browser. Officers can see
					each other’s name and email in the dashboard (for example, who last
					edited a card), and only admins can see and manage the full officer
					list. We do not share Google user data with anyone else, except our
					hosting and database providers (Vercel and Neon), which process it on
					our behalf to run the site, or if the law requires it.
				</p>
				<h3>Retention and deletion</h3>
				<ul>
					<li>
						Your record stays until an admin removes you from the officer list,
						when it is deleted. Your session cookie expires after 14 days or
						when you sign out.
					</li>
					<li>
						To have your information deleted, or to stop signing in, email{" "}
						<a href={adminContact.href}>{adminContact.value}</a>. We will remove
						you promptly.
					</li>
					<li>
						You can also remove the site’s access to your Google Account at any
						time at{" "}
						<a
							href="https://myaccount.google.com/permissions"
							target="_blank"
							rel="noopener noreferrer"
						>
							myaccount.google.com/permissions
						</a>
						.
					</li>
				</ul>
				<h3>Limited Use</h3>
				<p>
					StuyAviators’ use and transfer to any other app of information
					received from Google APIs will adhere to the{" "}
					<a
						href="https://developers.google.com/terms/api-services-user-data-policy"
						target="_blank"
						rel="noopener noreferrer"
					>
						Google API Services User Data Policy
					</a>
					, including the Limited Use requirements. We do not use it to serve
					ads.
				</p>
			</LegalSection>

			<LegalSection id="collect" title="What we collect">
				<h3>When you use a form on the site</h3>
				<p>
					The mailing-list sign-up, the contact form, “Share Your Story”, the
					photo submission form and the meeting-idea form collect what you type:
					your name, your Stuy email address (for some forms), and your message,
					story, class year or photo details. Only send what you’re comfortable
					sharing with the club’s officers.
				</p>
				<p>
					Submitting any form also signs you up for the mailing list when your
					name and a valid <code>@stuy.edu</code> address are provided. The
					sign-up is stored in a Google Sheet in the club’s Google account.
					Every newsletter has an unsubscribe link.
				</p>
				<p>
					When something is submitted, officers get a short alert in a private
					Discord channel with the type of submission, the sender’s name and the
					first part of the message. Email addresses are not included in the
					alert.
				</p>

				<h3>When an officer signs in</h3>
				<p>
					Club officers sign in with Google. What we receive from Google, and
					what we do with it, is described in full under{" "}
					<a href="#google">Google user data</a> below.
				</p>

				<h3>Collected automatically</h3>
				<ul>
					<li>
						<strong>Hosting logs.</strong> Our host, Vercel, processes requests
						to the site and may log technical details such as your IP address
						and browser type for security and reliability.
					</li>
					<li>
						<strong>Analytics.</strong> We use Vercel Web Analytics and Speed
						Insights to see which pages are visited and how fast they load.
						These do not use cookies and do not build a profile of you.
					</li>
					<li>
						<strong>Abuse protection.</strong> To stop spam, forms are
						rate-limited using a scrambled (salted and hashed) version of your
						IP address. We do not store the address itself for this.
					</li>
					<li>
						<strong>Your browser.</strong> The site remembers your light or dark
						theme choice in your browser’s local storage. We do not use
						advertising or cross-site tracking cookies.
					</li>
				</ul>
			</LegalSection>

			<LegalSection id="use" title="How we use it">
				<ul>
					<li>To reply to messages and run club meetings and events.</li>
					<li>To send the club newsletter and meeting updates.</li>
					<li>
						To review stories and photos you send, and, if an officer decides to
						share one, to publish it on the site or the club’s channels.
					</li>
					<li>To keep the website secure and working.</li>
				</ul>
				<p>We do not sell your information or use it for advertising.</p>
			</LegalSection>

			<LegalSection id="share" title="Who else is involved">
				<p>
					We use a few services to run the site. They process information on our
					behalf under their own privacy policies:
				</p>
				<ul>
					<li>
						<strong>Vercel</strong>: hosting, analytics and storage for images
						officers upload.
					</li>
					<li>
						<strong>Neon</strong>: the database that holds form submissions, the
						officer list, listings and newsletter drafts.
					</li>
					<li>
						<strong>Google</strong>: officer sign-in, the mailing-list Google
						Forms and Sheets, and the map on the Connect page. The map loads
						from Google when you view that page, and Google may collect
						information as described in its privacy policy.
					</li>
					<li>
						<strong>Discord</strong>: private officer alerts about new
						submissions.
					</li>
					<li>
						<strong>Behold</strong> and <strong>Instagram</strong>: our server
						fetches the club’s public Instagram posts through Behold, and your
						browser loads the post images from Behold’s image servers.
					</li>
					<li>
						<strong>YouTube</strong> (privacy-enhanced mode): some pages may
						play a club video from YouTube.
					</li>
					<li>
						<strong>Epsilon</strong> (the Student Union’s club directory): the
						site reads the club’s public meeting schedule from it.
					</li>
				</ul>
				<p>
					Officers can see form submissions in the dashboard. We may also share
					information if the law requires it or to protect someone’s safety.
				</p>
			</LegalSection>

			<LegalSection id="security" title="How we protect it">
				<ul>
					<li>The site is served only over encrypted HTTPS connections.</li>
					<li>
						The dashboard is limited to officers on the approved list. Access is
						checked again on every request, so removing someone takes effect
						immediately.
					</li>
					<li>
						Passwords are never involved: sign-in is handled by Google. Session
						cookies are signed, and sensitive tokens we store (such as the
						club’s Epsilon connection) are encrypted.
					</li>
					<li>
						Forms are protected against spam and abuse, and the database
						credentials are kept only in the site’s private server settings.
					</li>
				</ul>
				<p>
					No system is perfectly secure. If we learn of a problem that affects
					your information, we will tell the people affected.
				</p>
			</LegalSection>

			<LegalSection id="keep" title="How long we keep it">
				<p>
					Form submissions stay in the dashboard until an officer deletes them.
					Mailing-list addresses stay on the list until you unsubscribe. Officer
					records stay until an admin removes the person. You can ask us to
					delete your information at any time.
				</p>
			</LegalSection>

			<LegalSection id="choices" title="Your choices">
				<ul>
					<li>
						<strong>Unsubscribe</strong> using the link at the bottom of any
						newsletter, or by emailing us.
					</li>
					<li>
						<strong>Ask to see, correct or delete</strong> what we hold about
						you by emailing <a href={adminContact.href}>{adminContact.value}</a>
						.
					</li>
					<li>
						<strong>Ask us to take down</strong> a story or photo of you that we
						published, and we will.
					</li>
				</ul>
			</LegalSection>

			<LegalSection id="young" title="Students and young people">
				<p>
					The club is for high school students. We don’t knowingly collect
					personal information from children under 13. If you think a child
					under 13 has sent us information, email us and we will delete it.
				</p>
			</LegalSection>

			<LegalSection id="changes" title="Changes">
				<p>
					If we change how the site handles information, we will update this
					page and the date at the top.
				</p>
			</LegalSection>

			<LegalSection id="contact" title="Contact">
				<p>
					Questions about this policy: email{" "}
					<a href={adminContact.href}>{adminContact.value}</a>, or write to{" "}
					{site.name}, {site.address.school}, {site.address.line}. See also our{" "}
					<Link href="/terms">Terms of Service</Link>.
				</p>
			</LegalSection>
		</LegalPage>
	);
}
