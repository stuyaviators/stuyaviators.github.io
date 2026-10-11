"use client";

import type { NavGroup } from "@/content/site";
import type { KeyboardEvent as ReactKeyboardEvent } from "react";
import logo from "@/assets/brand/logo.png";
import { isHashLink, nav } from "@/content/site";
import { cn } from "@/lib/cn";
import { ChevronDown } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useId, useRef, useState } from "react";
import ThemeToggle from "./ThemeToggle.tsx";
import { buttonClasses } from "./ui/Button.tsx";

/*
 * Hide-on-scroll and mobile-menu logic ported from recode's Header.tsx
 * (webcubed), with the same thresholds and NEXT_PUBLIC_HEADER_HIDE_ON_SCROLL
 * toggle. UI rebuilt Apple-style: a frosted bar that tightens once you
 * scroll, a sliding hover highlight, dropdowns that fade/slide in with
 * staggered items, and a mobile sheet with a morphing menu icon. Disclosure
 * pattern (not role="menu"), Escape/outside click to close, instant
 * show/hide under reduced motion.
 */
const headerScrollConfig = {
	enabled: (process.env.NEXT_PUBLIC_HEADER_HIDE_ON_SCROLL ?? "true") === "true",
	hideDownThreshold: 36, // Px of downward scroll before hiding
	showUpThreshold: 12, // Px of upward scroll before showing
	debounceMs: 200,
	minTop: 8, // Don't hide when near the top
};

const ease = [0.16, 1, 0.3, 1] as const;

function isActive(pathname: string, href: string) {
	return href === "/" ? pathname === "/" : pathname.startsWith(href);
}

function MenuIcon({ isOpen }: { readonly isOpen: boolean }) {
	// Two bars morph into an X.
	return (
		<span aria-hidden className="relative block size-5">
			<span
				className={cn(
					"absolute top-[7px] left-0.5 h-0.5 w-4 rounded-full bg-current transition-transform duration-300 motion-reduce:transition-none",
					isOpen && "translate-y-[3px] rotate-45"
				)}
			/>
			<span
				className={cn(
					"absolute top-[13px] left-0.5 h-0.5 w-4 rounded-full bg-current transition-transform duration-300 motion-reduce:transition-none",
					isOpen && "-translate-y-[3px] -rotate-45"
				)}
			/>
		</span>
	);
}

/**
Page links use next/link; "#…" links open the mailing-list modal.
*/
function NavItemLink({
	href,
	pathname,
	className,
	onClick,
	children,
}: {
	readonly href: string;
	readonly pathname: string;
	readonly className: string;
	readonly onClick?: () => void;
	readonly children: React.ReactNode;
}) {
	if (isHashLink(href)) {
		return (
			<a href={href} className={className} onClick={onClick}>
				{children}
			</a>
		);
	}

	return (
		<Link
			href={href}
			prefetch={href === "/dashboard" ? false : undefined}
			aria-current={isActive(pathname, href) ? "page" : undefined}
			className={className}
			onClick={onClick}
		>
			{children}
		</Link>
	);
}

function NavDropdown({
	group,
	pathname,
	isOpen,
	onToggle,
	onClose,
	onHover,
	isHovered,
}: {
	readonly group: NavGroup;
	readonly pathname: string;
	readonly isOpen: boolean;
	readonly onToggle: () => void;
	readonly onClose: () => void;
	readonly onHover: () => void;
	readonly isHovered: boolean;
}) {
	const panelId = useId();
	const buttonRef = useRef<HTMLButtonElement>(null);
	const panelRef = useRef<HTMLUListElement>(null);
	const isGroupActive = group.links.some((link) =>
		isActive(pathname, link.href)
	);

	const focusLink = (index: number) => {
		const links = panelRef.current?.querySelectorAll<HTMLAnchorElement>("a");
		if (!links || links.length === 0) {
			return;
		}

		const next = (index + links.length) % links.length;
		links[next]?.focus();
	};

	const onButtonKeyDown = (event: ReactKeyboardEvent<HTMLButtonElement>) => {
		if (event.key !== "ArrowDown") {
			return;
		}

		event.preventDefault();
		if (!isOpen) {
			onToggle();
		}

		requestAnimationFrame(() => {
			focusLink(0);
		});
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
				onClose();
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
			onMouseEnter={onHover}
			onBlur={(event) => {
				if (isOpen && !event.currentTarget.contains(event.relatedTarget)) {
					onClose();
				}
			}}
		>
			<button
				ref={buttonRef}
				type="button"
				aria-expanded={isOpen}
				aria-controls={panelId}
				onClick={onToggle}
				onKeyDown={onButtonKeyDown}
				className={cn(
					"relative flex min-h-10 items-center gap-1 rounded-full px-3.5 text-sm font-medium transition-colors duration-200 hover:text-brand",
					isGroupActive || isOpen ? "text-brand" : "text-text"
				)}
			>
				{isHovered ? (
					<motion.span
						layoutId="nav-hover"
						className="absolute inset-0 -z-10 rounded-full bg-surface-2"
						transition={{ type: "spring", stiffness: 420, damping: 34 }}
					/>
				) : null}
				{group.label}
				<ChevronDown
					aria-hidden
					className={cn(
						"size-4 transition-transform duration-300 motion-reduce:transition-none",
						isOpen && "rotate-180"
					)}
				/>
			</button>
			<AnimatePresence>
				{isOpen ? (
					<motion.ul
						ref={panelRef}
						id={panelId}
						initial={{ opacity: 0, y: -8, scale: 0.98 }}
						animate={{ opacity: 1, y: 0, scale: 1 }}
						exit={{ opacity: 0, y: -6, scale: 0.98 }}
						transition={{ duration: 0.25, ease }}
						onKeyDown={onPanelKeyDown}
						className="absolute top-full left-1/2 z-50 mt-3 w-72 origin-top -translate-x-1/2 rounded-2xl border border-hairline bg-surface/95 p-2 shadow-card backdrop-blur-xl"
					>
						{group.links.map((link, index) => (
							<motion.li
								key={link.href}
								initial={{ opacity: 0, y: 6 }}
								animate={{ opacity: 1, y: 0 }}
								transition={{ delay: 0.04 * index, duration: 0.3, ease }}
							>
								<NavItemLink
									href={link.href}
									pathname={pathname}
									className="group block rounded-xl px-3.5 py-3 transition-colors hover:bg-surface-2 aria-[current=page]:bg-surface-2"
									onClick={onClose}
								>
									<span className="flex items-center justify-between text-sm font-semibold">
										{link.label}
										<span
											aria-hidden
											className="btn-arrow text-muted opacity-0 transition-opacity group-hover:opacity-100"
										>
											→
										</span>
									</span>
									{link.description ? (
										<span className="block text-sm text-muted">
											{link.description}
										</span>
									) : null}
								</NavItemLink>
							</motion.li>
						))}
					</motion.ul>
				) : null}
			</AnimatePresence>
		</li>
	);
}

export default function Header() {
	const pathname = usePathname();
	const isReducedMotion = useReducedMotion();
	const [isNavOpen, setIsNavOpen] = useState(false);
	const [openGroup, setOpenGroup] = useState<string | undefined>(undefined);
	const [hoveredItem, setHoveredItem] = useState<string | undefined>(undefined);
	const [isHidden, setIsHidden] = useState(false);
	const [isScrolled, setIsScrolled] = useState(false);
	const headerRef = useRef<HTMLElement>(null);
	const toggleRef = useRef<HTMLButtonElement>(null);
	const mobileId = useId();

	// Reset state on route change (as in recode).
	useEffect(() => {
		setIsHidden(false);
		setIsNavOpen(false);
		setOpenGroup(undefined);
	}, [pathname]);

	// Hide on scroll down, show on scroll up; tighten the bar once scrolled.
	useEffect(() => {
		let lastY = window.scrollY;
		let accumDown = 0;
		let accumUp = 0;
		let timeout: ReturnType<typeof setTimeout> | undefined;
		const reducedMotion = globalThis.matchMedia(
			"(prefers-reduced-motion: reduce)"
		);

		const onScroll = () => {
			const y = window.scrollY;
			const delta = y - lastY;
			if (delta > 0) {
				accumDown += delta;
				accumUp = 0;
				if (
					y > headerScrollConfig.minTop &&
					accumDown > headerScrollConfig.hideDownThreshold
				) {
					setIsHidden(true);
				}
			} else if (delta < 0) {
				accumUp += -delta;
				accumDown = 0;
				if (accumUp > headerScrollConfig.showUpThreshold) {
					setIsHidden(false);
				}
			}

			if (y <= headerScrollConfig.minTop) {
				setIsHidden(false);
			}

			lastY = y;
		};

		const onAnyScroll = () => {
			setIsScrolled(window.scrollY > headerScrollConfig.minTop);
			if (!headerScrollConfig.enabled) {
				return;
			}

			if (reducedMotion.matches) {
				onScroll();
				return;
			}

			clearTimeout(timeout);
			timeout = setTimeout(onScroll, headerScrollConfig.debounceMs);
		};

		onAnyScroll();
		window.addEventListener("scroll", onAnyScroll, { passive: true });
		return () => {
			window.removeEventListener("scroll", onAnyScroll);
			if (timeout) {
				clearTimeout(timeout);
			}
		};
	}, []);

	const closeMobile = useCallback((shouldReturnFocus: boolean) => {
		setIsNavOpen(false);
		if (shouldReturnFocus) {
			toggleRef.current?.focus();
		}
	}, []);

	// Escape closes the mobile sheet; lock page scroll while it's open.
	useEffect(() => {
		if (!isNavOpen) {
			return;
		}

		const onKey = (event: KeyboardEvent) => {
			if (event.key === "Escape") {
				closeMobile(true);
			}
		};

		document.addEventListener("keydown", onKey);
		const { overflow } = document.body.style;
		document.body.style.overflow = "hidden";
		return () => {
			document.removeEventListener("keydown", onKey);
			document.body.style.overflow = overflow;
		};
	}, [isNavOpen, closeMobile]);

	// Outside click closes desktop dropdowns.
	useEffect(() => {
		if (!openGroup) {
			return;
		}

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

	const isVisible = !isHidden || isNavOpen || openGroup !== undefined;

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
					"fixed inset-x-0 top-3 z-40 mx-3 transition-[translate,opacity] duration-300 motion-reduce:transition-none sm:mx-auto sm:max-w-6xl sm:px-6 lg:px-8",
					isVisible
						? "translate-y-0 opacity-100"
						: "pointer-events-none -translate-y-[150%] opacity-0"
				)}
			>
				<div
					data-open={isNavOpen || openGroup !== undefined ? "" : undefined}
					className={cn(
						"header-bar flex items-center justify-between gap-3 rounded-2xl border px-3 backdrop-blur-xl backdrop-saturate-150 transition-[padding,background-color,box-shadow,border-color,color] duration-300 motion-reduce:transition-none sm:px-4 lg:grid lg:grid-cols-[1fr_auto_1fr]",
						isScrolled || isNavOpen
							? "border-hairline bg-bg/80 py-1.5 shadow-card"
							: "border-transparent bg-bg/70 py-2.5"
					)}
				>
					<Link
						href="/"
						className="group flex shrink-0 items-center gap-2.5 justify-self-start rounded-md"
						aria-label="StuyAviators home"
					>
						<Image
							src={logo}
							alt=""
							width={40}
							height={40}
							priority
							className={cn(
								"select-none transition-[width,height,transform] duration-300 group-hover:rotate-[-8deg] motion-reduce:transition-none",
								isScrolled ? "size-9" : "size-10"
							)}
						/>
						<span className="font-wordmark text-lg leading-none tracking-[0.13em] text-brand uppercase">
							StuyAviators
						</span>
					</Link>

					<nav aria-label="Primary" className="hidden lg:block">
						<ul
							className="isolate flex items-center gap-1"
							onMouseLeave={() => {
								setHoveredItem(undefined);
							}}
						>
							{nav.map((group) => (
								<NavDropdown
									key={group.label}
									group={group}
									pathname={pathname}
									isOpen={openGroup === group.label}
									isHovered={!isReducedMotion && hoveredItem === group.label}
									onHover={() => {
										setHoveredItem(group.label);
									}}
									onToggle={() => {
										setOpenGroup((current) =>
											current === group.label ? undefined : group.label
										);
									}}
									onClose={() => {
										setOpenGroup(undefined);
									}}
								/>
							))}
						</ul>
					</nav>

					<div className="flex items-center gap-2 justify-self-end">
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
							className="inline-flex size-11 items-center justify-center rounded-full border border-hairline text-text transition-colors hover:bg-surface-2 lg:hidden"
							aria-expanded={isNavOpen}
							aria-controls={mobileId}
							aria-label={isNavOpen ? "Close menu" : "Open menu"}
							onClick={() => {
								setIsNavOpen((value) => !value);
							}}
						>
							<MenuIcon isOpen={isNavOpen} />
						</button>
					</div>
				</div>

				{/* Mobile menu panel */}
				<AnimatePresence>
					{isNavOpen ? (
						<motion.nav
							id={mobileId}
							aria-label="Mobile"
							initial={{ opacity: 0, y: -12, scale: 0.98 }}
							animate={{ opacity: 1, y: 0, scale: 1 }}
							exit={{ opacity: 0, y: -8, scale: 0.98 }}
							transition={{ duration: 0.3, ease }}
							className="mt-2 max-h-[calc(100dvh-6rem)] origin-top overflow-y-auto rounded-2xl border border-hairline bg-surface/95 p-4 shadow-card backdrop-blur-xl lg:hidden"
						>
							<ul className="grid gap-5 sm:grid-cols-2">
								{nav.map((group, groupIndex) => (
									<motion.li
										key={group.label}
										initial={{ opacity: 0, y: 10 }}
										animate={{ opacity: 1, y: 0 }}
										transition={{
											delay: 0.05 * groupIndex,
											duration: 0.35,
											ease,
										}}
									>
										<p className="label mb-1.5 text-muted">{group.label}</p>
										<ul>
											{group.links.map((link) => (
												<li key={link.href}>
													<NavItemLink
														href={link.href}
														pathname={pathname}
														className="flex min-h-11 items-center rounded-2xl px-2 font-medium transition-colors hover:bg-surface-2 aria-[current=page]:text-brand"
														onClick={() => {
															setIsNavOpen(false);
														}}
													>
														{link.label}
													</NavItemLink>
												</li>
											))}
										</ul>
									</motion.li>
								))}
							</ul>
							<Link
								href="/join"
								className={buttonClasses("accent", "mt-5 w-full")}
							>
								Join Now
							</Link>
						</motion.nav>
					) : null}
				</AnimatePresence>
			</header>
			{/* Spacer so content starts below the fixed header. */}
			<div aria-hidden className="h-[5.5rem]" />
		</>
	);
}
