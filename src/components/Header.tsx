"use client";

import "@/styles/globals.css";

const pages: Array<{ href: string; label: string }> = [
	{ href: "/", label: "Home" },
];
export default function Header() {
	return (
		<header className="flex w-full border-b px-8 py-4 backdrop-blur-md bg-ctp-mantle border-b-ctp-crust">
			<nav className="flex-1 mx-auto flex max-w-3xl items-center justify-between">
				<div className="flex space-x-4">
					{pages.map((page) => (
						<a
							key={page.href}
							href={page.href}
							className="text-lg font-medium text-ctp-text hover:text-ctp-mauve"
						>
							{page.label}
						</a>
					))}
				</div>
			</nav>
			<div>
				<button>Join us on <div></div></button>
			</div>
		</header>
	);
}
