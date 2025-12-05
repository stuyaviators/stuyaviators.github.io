import type { Metadata } from "next";
import { Lexend } from "next/font/google";

import "@/styles/globals.css";

const lexend = Lexend({
	variable: "--font-lexend",
	subsets: ["latin"],
});

export const metadata: Metadata = {
	title: "Stuyaviators",
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en">
			<body className={`${lexend.variable} antialiased`}>{children}</body>
		</html>
	);
}
