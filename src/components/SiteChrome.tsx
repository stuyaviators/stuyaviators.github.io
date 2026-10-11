import type { ReactNode } from "react";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import ScrollToTop from "@/components/ScrollToTop";
import SkyBackground from "@/components/SkyBackground";
import TransitionProvider from "@/components/TransitionProvider";
import MailingListModal from "@/components/forms/MailingListModal";
import { signupFormConfig } from "@/lib/google-forms";

/**
Header, footer and mailing-list modal around every public page (and the 404).
*/
export default function SiteChrome({
	children,
}: {
	readonly children: ReactNode;
}) {
	return (
		<>
			<Header />
			<TransitionProvider>
				<main
					id="main"
					className="relative z-10 flex-1 bg-bg lg:rounded-b-[2.5rem] lg:shadow-[0_40px_80px_-40px_rgb(0_0_0/0.35)]"
				>
					<SkyBackground />
					{children}
				</main>
			</TransitionProvider>
			<Footer />
			<ScrollToTop />
			<MailingListModal fallbackUrl={signupFormConfig().fallbackUrl} />
		</>
	);
}
