import type { Metadata } from "next";
import UnsubscribeForm from "@/components/forms/UnsubscribeForm";
import { buttonClasses } from "@/components/ui/Button";
import { Container } from "@/components/ui/Section";
import { unsubscribeFormConfig, unsubscribeMailto } from "@/lib/google-forms";

export const metadata: Metadata = {
	title: "Unsubscribe",
	description: "Stop receiving the StuyAviators newsletter.",
	robots: { index: false },
};

export const dynamic = "force-dynamic";

export default function UnsubscribePage() {
	const configured = Boolean(unsubscribeFormConfig());
	return (
		<Container className="py-16 sm:py-24">
			<p className="label text-accent-text">Mailing list</p>
			<h1 className="mt-3 text-4xl">Unsubscribe</h1>
			{configured ? (
				<>
					<p className="mt-4 max-w-xl text-lg text-muted">Enter the Stuy email you signed up with and we’ll take you off the list.</p>
					<div className="mt-8">
						<UnsubscribeForm />
					</div>
				</>
			) : (
				<>
					<p className="mt-4 max-w-xl text-lg text-muted">
						Send us an email with the subject “Unsubscribe” from the address you signed up with, and we’ll remove you from the list.
					</p>
					<a href={unsubscribeMailto} className={buttonClasses("accent", "mt-8")}>
						Email stuyaviators@gmail.com
					</a>
				</>
			)}
		</Container>
	);
}
