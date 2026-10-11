import type { ReactNode } from "react";
import AnnouncementSlot from "@/components/AnnouncementSlot";
import Footer from "@/components/Footer";
import MailingListModal from "@/components/forms/MailingListModal";
import Header from "@/components/Header";
import ScrollToTop from "@/components/ScrollToTop";
import SkyBackground from "@/components/SkyBackground";
import TransitionProvider from "@/components/TransitionProvider";
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
			<AnnouncementSlot />
			<TransitionProvider>
				<main
					id="main"
					className="relative z-10 flex-1 bg-bg pb-16 sm:pb-20 lg:rounded-b-[2.5rem] lg:shadow-[0_40px_80px_-40px_rgb(0_0_0/0.35)] [&>:last-child]:pb-0"
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
