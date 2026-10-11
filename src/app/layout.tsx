import type { Metadata, Viewport } from "next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Analytics } from "@vercel/analytics/next";
import LinkInterceptor from "@/components/LinkInterceptor";
import MediaGuard from "@/components/MediaGuard";
import { themeScript } from "@/components/ThemeToggle";
import { site } from "@/content/site";
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
	// Google Search Console ownership check (needed for Google sign-in
	// branding verification). A public token, not a secret.
	verification: { google: "YvwwfPnMjiptOfKjx1R_dzlCK_JmlHwcR7xIqUMzb-I" },
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
				{/* Public pages add the header and footer in (site)/layout.tsx;
				    the dashboard has its own chrome. */}
				{children}
				<LinkInterceptor />
				<MediaGuard />
        <Analytics />
				<SpeedInsights />
			</body>
		</html>
	);
}
