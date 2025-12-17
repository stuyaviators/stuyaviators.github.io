"use client";

import "@/styles/globals.css";

const pages: Array<{ href: string; label: string }> = [
	{ href: "/", label: "Home" },
];
export default function Header() {
	return (
		<header className="dark fixed top-4 left-4 right-4 z-50 mx-auto max-w-4xl rounded-xl border border-border backdrop-blur-lg bg-card/60 px-6 py-3 shadow-2xl shadow-black/20">
			<div className="flex items-center justify-between gap-8">
				{/* Logo */}
				<div className="shrink-0">
					<a
						href="/"
						className="inline-flex items-center gap-3 text-foreground hover:text-primary transition-colors duration-200"
					>
						<img
							src="/logo.png"
							alt="Stuy Aviators logo"
							className="h-10 w-10 select-none rounded-full"
							loading="lazy"
							decoding="async"
						/>
						<span className="font-semibold text-base hidden sm:inline">
							StuyAviators
						</span>
					</a>
				</div>

				<nav className="flex-1">
					<div className="flex space-x-6 justify-center">
						{pages.map((page) => (
							<a
								key={page.href}
								href={page.href}
								className="text-sm font-medium text-foreground hover:text-primary transition-colors duration-200"
							>
								{page.label}
							</a>
						))}
					</div>
				</nav>

				<div className="shrink-0">
					<a
						href="https://epsilon.stuysu.org/stuyaviators"
						target="_blank"
						rel="noopener noreferrer"
						className="inline-flex items-center gap-2 whitespace-nowrap rounded-lg border border-border bg-secondary/80 px-4 py-2 text-sm font-medium text-secondary-foreground hover:bg-secondary cursor-pointer transition-all duration-200 shadow-lg"
					>
						<span>Join us on</span>
						<img
							src="https://epsilon.stuysu.org/wordmark.svg"
							alt="Epsilon wordmark"
							className="h-5 w-auto shrink-0 select-none"
							loading="lazy"
							decoding="async"
						/>
					</a>
				</div>
			</div>
		</header>
	);
}
