import type { Metadata, Viewport } from "next";
import { B612, Lexend } from "next/font/google";

import "@/styles/globals.css";

import Header from "@/components/Header";

const lexend = Lexend({
	variable: "--font-lexend",
	subsets: ["latin"],
});
const b612 = B612({
	variable: "--font-b612",
	subsets: ["latin"],
	weight: ["400", "700"],
});

export const viewport: Viewport = {
	width: "device-width",
	initialScale: 1,
};

export const metadata: Metadata = {
	title: "StuyAviators",
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html
			lang="en"
			className="dark"
			data-catppuccin="mocha"
			suppressHydrationWarning
		>
			<body className={`${lexend.variable} ${b612.variable} antialiased`}>
				<Header />
				{children}
			</body>
		</html>
	);
}
