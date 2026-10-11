import type { Metadata } from "next";
import { buttonClasses } from "@/components/ui/Button";
import { Container } from "@/components/ui/Section";
import { unsubscribeMailto } from "@/lib/google-forms";

export const metadata: Metadata = {
	title: "Unsubscribe",
	description: "Stop receiving the StuyAviators newsletter.",
	robots: { index: false },
};

/**
Older newsletters link here. There is no form: unsubscribing is an email.
*/
export default function UnsubscribePage() {
	return (
		<Container className="py-16 sm:py-24">
			<p className="label text-accent-text">Mailing list</p>
			<h1 className="mt-3 text-4xl">Unsubscribe</h1>
			<p className="mt-4 max-w-xl text-lg text-muted">
				Send us an email with the subject “Unsubscribe” from the address you
				signed up with, and we’ll remove you from the list.
			</p>
			<a href={unsubscribeMailto} className={buttonClasses("accent", "mt-8")}>
				Email stuyaviators@gmail.com
			</a>
		</Container>
	);
}
