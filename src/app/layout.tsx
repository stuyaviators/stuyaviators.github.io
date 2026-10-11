import type { Metadata, Viewport } from "next";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import LinkInterceptor from "@/components/LinkInterceptor";
import ScrollToTop from "@/components/ScrollToTop";
import SkyBackground from "@/components/SkyBackground";
import { themeScript } from "@/components/ThemeToggle";
import TransitionProvider from "@/components/TransitionProvider";
import { site } from "@/content/site";
import MailingListModal from "@/components/forms/MailingListModal";
import { signupFormConfig } from "@/lib/google-forms";
import { Inter, Inter_Tight } from "next/font/google";

import "@/styles/globals.css";

// Airbus's brand typography (brand.airbus.com → Typography): Inter Tight for
// display and graphic design (including the navbar wordmark), Inter for web
// text, labels and data.
const inter = Inter({
	variable: "--font-inter",
	subsets: ["latin"],
	display: "swap",
});
const interTight = Inter_Tight({
	variable: "--font-inter-tight",
	subsets: ["latin"],
	display: "swap",
});

export const viewport: Viewport = {
	width: "device-width",
	initialScale: 1,
	themeColor: [
		{ media: "(prefers-color-scheme: light)", color: "#ffffff" },
		{ media: "(prefers-color-scheme: dark)", color: "#000000" },
	],
};

export const metadata: Metadata = {
	metadataBase: new URL(site.url),
	title: {
		default: "StuyAviators · Stuyvesant High School’s Aviation Club",
		template: "%s · StuyAviators",
	},
	description: site.tagline,
	openGraph: {
		siteName: "StuyAviators",
		type: "website",
		locale: "en_US",
	},
};

export default function RootLayout({
	children,
}: Readonly<{ children: React.ReactNode }>) {
	return (
		<html
			lang="en"
			data-scroll-behavior="smooth"
			suppressHydrationWarning
			className={`${inter.variable} ${interTight.variable}`}
		>
			<head>
				<script dangerouslySetInnerHTML={{ __html: themeScript }} />
			</head>
			<body className="flex min-h-dvh flex-col antialiased">
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
				<LinkInterceptor />
				<MailingListModal fallbackUrl={signupFormConfig().fallbackUrl} />
			</body>
		</html>
	);
}
