import type { Metadata, Viewport } from "next";
import { B612, B612_Mono, Lexend } from "next/font/google";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import { themeScript } from "@/components/ThemeToggle";
import TransitionProvider from "@/components/TransitionProvider";
import { site } from "@/content/site";
import "@/styles/globals.css";

// Fonts ported from recode's layout: Lexend for text, B612 (designed for
// Airbus cockpit displays) for labels, plus B612 Mono for data.
const lexend = Lexend({
	variable: "--font-lexend",
	subsets: ["latin"],
	display: "swap",
});
const b612 = B612({
	variable: "--font-b612",
	subsets: ["latin"],
	weight: ["400", "700"],
	display: "swap",
});
const b612Mono = B612_Mono({
	variable: "--font-b612-mono",
	subsets: ["latin"],
	weight: ["400", "700"],
	display: "swap",
});

export const viewport: Viewport = {
	width: "device-width",
	initialScale: 1,
	themeColor: [
		{ media: "(prefers-color-scheme: light)", color: "#f6f9ff" },
		{ media: "(prefers-color-scheme: dark)", color: "#0f1b32" },
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
			suppressHydrationWarning
			className={`${lexend.variable} ${b612.variable} ${b612Mono.variable}`}
		>
			<head>
				{/* eslint-disable-next-line react/no-danger */}
				<script dangerouslySetInnerHTML={{ __html: themeScript }} />
			</head>
			<body className="flex min-h-dvh flex-col antialiased">
				<Header />
				<TransitionProvider>
					<main id="main" className="flex-1">
						{children}
					</main>
				</TransitionProvider>
				<Footer />
			</body>
		</html>
	);
}
