"use client";

import type { NavGroup } from "@/content/site";
import type { KeyboardEvent as ReactKeyboardEvent } from "react";
import logo from "@/assets/brand/logo.png";
import { isNavGroup, nav } from "@/content/site";
import { cn } from "@/lib/cn";
import { ChevronDown, Menu, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useId, useRef, useState } from "react";
import ThemeToggle from "./ThemeToggle";
import { buttonClasses } from "./ui/Button";

/*
 * Hide-on-scroll and mobile-menu logic ported from recode's Header.tsx
 * (webcubed), with the same thresholds and NEXT_PUBLIC_HEADER_HIDE_ON_SCROLL
 * toggle. UI rebuilt: disclosure dropdowns (not role="menu"), Escape/outside
 * click to close, next/link, and instant show/hide under reduced motion.
 */
const headerScrollConfig = {
	enabled: (process.env.NEXT_PUBLIC_HEADER_HIDE_ON_SCROLL ?? "true") === "true",
	hideDownThreshold: 36, // Px of downward scroll before hiding
	showUpThreshold: 12, // Px of upward scroll before showing
	debounceMs: 200,
	minTop: 8, // Don't hide when near the top
};

function isActive(pathname: string, href: string) {
	return href === "/" ? pathname === "/" : pathname.startsWith(href);
}

function NavDropdown({
	group,
	pathname,
	open,
	onToggle,
	onClose,
}: {
	readonly group: NavGroup;
	readonly pathname: string;
	readonly open: boolean;
	readonly onToggle: () => void;
	readonly onClose: (returnFocus: boolean) => void;
}) {
	const panelId = useId();
	const buttonRef = useRef<HTMLButtonElement>(null);
	const panelRef = useRef<HTMLUListElement>(null);
	const groupActive = group.links.some((link) => isActive(pathname, link.href));

	const focusLink = (index: number) => {
		const links = panelRef.current?.querySelectorAll<HTMLAnchorElement>("a");
		if (!links?.length) return;
		const next = (index + links.length) % links.length;
		links[next]?.focus();
	};

	const onButtonKeyDown = (event: ReactKeyboardEvent<HTMLButtonElement>) => {
		if (event.key === "ArrowDown") {
			event.preventDefault();
			if (!open) onToggle();
			requestAnimationFrame(() => {
				focusLink(0);
			});
		}
	};

	const onPanelKeyDown = (event: ReactKeyboardEvent<HTMLUListElement>) => {
		const links = [
			...(panelRef.current?.querySelectorAll<HTMLAnchorElement>("a") ?? []),
		];
		const current = links.indexOf(document.activeElement as HTMLAnchorElement);
		switch (event.key) {
			case "ArrowDown": {
				event.preventDefault();
				focusLink(current + 1);
				break;
			}

			case "ArrowUp": {
				event.preventDefault();
				focusLink(current - 1);
				break;
			}

			case "Home": {
				event.preventDefault();
				focusLink(0);
				break;
			}

			case "End": {
				event.preventDefault();
				focusLink(links.length - 1);
				break;
			}

			case "Escape": {
				event.preventDefault();
				onClose(false);
				buttonRef.current?.focus();
				break;
			}

			default: {
				break;
			}
		}
	};

	return (
		<li
			className="relative"
			onBlur={(event) => {
				if (open && !event.currentTarget.contains(event.relatedTarget)) {
					onClose(false);
				}
			}}
		>
			<button
				ref={buttonRef}
				type="button"
				aria-expanded={open}
				aria-controls={panelId}
				onClick={onToggle}
				onKeyDown={onButtonKeyDown}
				className={cn(
					"flex min-h-11 items-center gap-1 rounded-md px-3 text-sm font-medium transition-colors hover:text-brand motion-reduce:transition-none",
					groupActive ? "text-brand" : "text-text"
				)}
			>
				{group.label}
				<ChevronDown
					aria-hidden
					className={cn(
						"size-4 transition-transform motion-reduce:transition-none",
						open && "rotate-180"
					)}
				/>
			</button>
			<ul
				ref={panelRef}
				id={panelId}
				hidden={!open}
				onKeyDown={onPanelKeyDown}
				className="absolute top-full left-0 z-50 mt-2 w-72 rounded-lg border border-hairline bg-surface p-2 shadow-card"
			>
				{group.links.map((link) => (
					<li key={link.href}>
						<Link
							href={link.href}
							aria-current={isActive(pathname, link.href) ? "page" : undefined}
							className="block rounded-md px-3 py-2.5 hover:bg-surface-2 aria-[current=page]:bg-surface-2"
							onClick={() => {
								onClose(false);
							}}
						>
							<span className="block text-sm font-semibold">{link.label}</span>
							{link.description ? (
								<span className="block text-sm text-muted">
									{link.description}
								</span>
							) : null}
						</Link>
					</li>
				))}
			</ul>
		</li>
	);
}

export default function Header() {
	const pathname = usePathname();
	const [navOpen, setNavOpen] = useState(false);
	const [openGroup, setOpenGroup] = useState<string | undefined>(undefined);
	const [hidden, setHidden] = useState(false);
	const headerRef = useRef<HTMLElement>(null);
	const toggleRef = useRef<HTMLButtonElement>(null);
	const mobileId = useId();

	// Reset state on route change (as in recode).
	useEffect(() => {
		setHidden(false);
		setNavOpen(false);
		setOpenGroup(undefined);
	}, [pathname]);

	// Hide on scroll down, show on scroll up.
	useEffect(() => {
		if (!headerScrollConfig.enabled) return;
		let lastY = window.scrollY || 0;
		let accumDown = 0;
		let accumUp = 0;
		let timeout: ReturnType<typeof setTimeout> | undefined;
		const reducedMotion = globalThis.matchMedia(
			"(prefers-reduced-motion: reduce)"
		);

		const onScroll = () => {
			const y = window.scrollY || 0;
			const delta = y - lastY;
			if (delta > 0) {
				accumDown += delta;
				accumUp = 0;
				if (
					y > headerScrollConfig.minTop &&
					accumDown > headerScrollConfig.hideDownThreshold
				) {
					setHidden(true);
				}
			} else if (delta < 0) {
				accumUp += -delta;
				accumDown = 0;
				if (accumUp > headerScrollConfig.showUpThreshold) {
					setHidden(false);
				}
			}

			if (y <= headerScrollConfig.minTop) setHidden(false);
			lastY = y;
		};

		const debounced = () => {
			if (reducedMotion.matches) {
				onScroll();
				return;
			}

			globalThis.clearTimeout(timeout);
			timeout = globalThis.setTimeout(onScroll, headerScrollConfig.debounceMs);
		};

		window.addEventListener("scroll", debounced, { passive: true });
		return () => {
			window.removeEventListener("scroll", debounced);
			if (timeout) globalThis.clearTimeout(timeout);
		};
	}, []);

	const closeMobile = useCallback((returnFocus: boolean) => {
		setNavOpen(false);
		if (returnFocus) toggleRef.current?.focus();
	}, []);

	// Escape closes the mobile sheet; lock page scroll while it's open.
	useEffect(() => {
		if (!navOpen) return;
		const onKey = (event: KeyboardEvent) => {
			if (event.key === "Escape") closeMobile(true);
		};

		document.addEventListener("keydown", onKey);
		const { overflow } = document.body.style;
		document.body.style.overflow = "hidden";
		return () => {
			document.removeEventListener("keydown", onKey);
			document.body.style.overflow = overflow;
		};
	}, [navOpen, closeMobile]);

	// Outside click closes desktop dropdowns.
	useEffect(() => {
		if (!openGroup) return;
		const onPointer = (event: PointerEvent) => {
			if (!headerRef.current?.contains(event.target as Node)) {
				setOpenGroup(undefined);
			}
		};

		document.addEventListener("pointerdown", onPointer);
		return () => {
			document.removeEventListener("pointerdown", onPointer);
		};
	}, [openGroup]);

	const visible = !hidden || navOpen || openGroup !== undefined;

	return (
		<>
			<a
				href="#main"
				className="sr-only z-[60] rounded-md bg-accent px-4 py-2 font-semibold text-accent-ink focus:not-sr-only focus:fixed focus:top-3 focus:left-3"
			>
				Skip to content
			</a>
			<header
				ref={headerRef}
				className={cn(
					"fixed inset-x-0 top-3 z-40 mx-3 transition-[translate,opacity] duration-200 motion-reduce:transition-none sm:mx-auto sm:max-w-6xl sm:px-6 lg:px-8",
					visible
						? "translate-y-0 opacity-100"
						: "pointer-events-none -translate-y-[150%] opacity-0"
				)}
			>
				<div className="flex items-center justify-between gap-3 rounded-lg border border-hairline bg-surface px-3 py-2 shadow-card sm:px-4">
					<Link
						href="/"
						className="flex shrink-0 items-center gap-2.5 rounded-md"
						aria-label="StuyAviators home"
					>
						<Image
							src={logo}
							alt=""
							width={40}
							height={40}
							priority
							className="size-10 select-none"
						/>
						<span className="font-label text-sm font-bold tracking-[0.06em] uppercase">
							StuyAviators
						</span>
					</Link>

					<nav aria-label="Primary" className="hidden lg:block">
						<ul className="flex items-center gap-1">
							{nav.map((item) =>
								isNavGroup(item) ? (
									<NavDropdown
										key={item.label}
										group={item}
										pathname={pathname}
										open={openGroup === item.label}
										onToggle={() => {
											setOpenGroup((current) =>
												current === item.label ? undefined : item.label
											);
										}}
										onClose={() => {
											setOpenGroup(undefined);
										}}
									/>
								) : (
									<li key={item.href}>
										<Link
											href={item.href}
											aria-current={
												isActive(pathname, item.href) ? "page" : undefined
											}
											className="flex min-h-11 items-center rounded-md px-3 text-sm font-medium hover:text-brand aria-[current=page]:text-brand"
										>
											{item.label}
										</Link>
									</li>
								)
							)}
						</ul>
					</nav>

					<div className="flex items-center gap-2">
						<ThemeToggle />
						<Link
							href="/join"
							className={buttonClasses(
								"accent",
								"hidden min-h-10 sm:inline-flex"
							)}
						>
							Join Now
						</Link>
						<button
							ref={toggleRef}
							type="button"
							className="inline-flex size-11 items-center justify-center rounded-md border border-hairline text-text lg:hidden"
							aria-expanded={navOpen}
							aria-controls={mobileId}
							aria-label={navOpen ? "Close menu" : "Open menu"}
							onClick={() => {
								setNavOpen((value) => !value);
							}}
						>
							{navOpen ? (
								<X aria-hidden className="size-5" />
							) : (
								<Menu aria-hidden className="size-5" />
							)}
						</button>
					</div>
				</div>

				{/* Mobile menu panel */}
				<nav
					id={mobileId}
					aria-label="Mobile"
					hidden={!navOpen}
					className="mt-2 max-h-[calc(100dvh-6rem)] overflow-y-auto rounded-lg border border-hairline bg-surface p-4 shadow-card lg:hidden"
				>
					<ul className="grid gap-5 sm:grid-cols-2">
						{nav.map((item) =>
							isNavGroup(item) ? (
								<li key={item.label}>
									<p className="label mb-1.5 text-muted">{item.label}</p>
									<ul>
										{item.links.map((link) => (
											<li key={link.href}>
												<Link
													href={link.href}
													aria-current={
														isActive(pathname, link.href) ? "page" : undefined
													}
													className="flex min-h-11 items-center rounded-md px-2 font-medium hover:bg-surface-2 aria-[current=page]:text-brand"
												>
													{link.label}
												</Link>
											</li>
										))}
									</ul>
								</li>
							) : (
								<li key={item.href}>
									<p className="label mb-1.5 text-muted">{item.label}</p>
									<Link
										href={item.href}
										aria-current={
											isActive(pathname, item.href) ? "page" : undefined
										}
										className="flex min-h-11 items-center rounded-md px-2 font-medium hover:bg-surface-2 aria-[current=page]:text-brand"
									>
										Socials & contact
									</Link>
								</li>
							)
						)}
					</ul>
					<Link href="/join" className={buttonClasses("accent", "mt-5 w-full")}>
						Join Now
					</Link>
				</nav>
			</header>
			{/* Spacer so content starts below the fixed header. */}
			<div aria-hidden className="h-[5.5rem]" />
		</>
	);
}
