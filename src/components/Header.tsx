"use client";

import "@/styles/globals.css";

import type { Flavor } from "@/lib/theme";
import { useTheme } from "@/hooks/use-theme";
import { flavors } from "@/lib/theme";
import { Check, Menu } from "lucide-react";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

const pages: Array<{ href: string; label: string }> = [
	{ href: "/connect", label: "Connect" },
];

export default function Header() {
	const { flavor, setFlavor, mounted } = useTheme();
	const [menuOpen, setMenuOpen] = useState(false);
	const [navOpen, setNavOpen] = useState(false);
	const [headerHeight, setHeaderHeight] = useState(104);
	const [hidden, setHidden] = useState(false);
	const pathname = usePathname();
	const headerRef = useRef<HTMLHeadingElement>(null);

	// Header behavior config
	const headerScrollConfig = {
		enabled:
			(process.env.NEXT_PUBLIC_HEADER_HIDE_ON_SCROLL ?? "true") === "true",
		hideDownThreshold: 36, // Px of downward scroll before hiding
		showUpThreshold: 12, // Px of upward scroll before showing
		debounceMs: 200,
		minTop: 8, // Don't hide when near the top
	};

	useEffect(() => {
		// Get height to set to dropdown
		const measureHeader = () => {
			if (headerRef.current) {
				setHeaderHeight(headerRef.current.getBoundingClientRect().height);
			}
		};

		// Ensure update on change
		requestAnimationFrame(() => {
			setTimeout(measureHeader, 0);
		});
		window.addEventListener("resize", measureHeader);
		return () => {
			window.removeEventListener("resize", measureHeader);
		};
	}, []);

	useEffect(() => {
		if (!headerRef.current) return;
		setHeaderHeight(headerRef.current.getBoundingClientRect().height);
	}, [menuOpen, navOpen]);

	// Reset hidden state on route change
	useEffect(() => {
		setHidden(false);
		setNavOpen(false);
	}, [pathname]);

	useEffect(() => {
		if (!headerScrollConfig.enabled) return;
		let lastY = window.scrollY || 0;
		let accumDown = 0;
		let accumUp = 0;
		let timeout: ReturnType<typeof setTimeout> | undefined;

		const prefersReducedMotion = globalThis.matchMedia(
			"(prefers-reduced-motion: reduce)"
		).matches;

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

			lastY = y;
		};

		const debounced = () => {
			if (prefersReducedMotion) {
				onScroll();
				return;
			}

			globalThis.clearTimeout(timeout);
			timeout = globalThis.setTimeout(onScroll, headerScrollConfig.debounceMs);
		};

		window.addEventListener("scroll", debounced, { passive: true });
		return () => {
			window.removeEventListener(
				"scroll",
				debounced as unknown as EventListener
			);
			if (timeout) globalThis.clearTimeout(timeout);
		};
	}, [mounted]);

	const handleFlavorChange = (nextFlavor: Flavor) => {
		setFlavor(nextFlavor);
		setMenuOpen(false);
	};

	const currentFlavor = flavors.find((entry) => entry.value === flavor);

	const wordmarkStart = currentFlavor ? currentFlavor.swatch[1] : "#ffffff";
	const wordmarkEnd = currentFlavor ? currentFlavor.swatch[2] : "#ffffff";

	return (
		<>
			<header
				ref={headerRef}
				className={`fixed top-3 left-0 right-0 z-40 mx-4 sm:mx-auto max-w-4xl rounded-lg border border-ctp-overlay1/60 bg-linear-to-br from-ctp-surface0/75 via-ctp-base/65 to-ctp-surface0/55 px-4 sm:px-6 py-2 sm:py-3 backdrop-blur-2xl shadow-[0px_18px_38px_rgba(0,0,0,0.35),0px_0px_24px_rgba(148,163,184,0.16)] ring-1 ring-ctp-overlay1/35 transition duration-200 ${hidden ? "-translate-y-[150%] opacity-0" : "translate-y-0 opacity-100"}`}
			>
				{/* Logo */}
				<div className="flex flex-wrap items-center justify-between gap-3 sm:gap-8">
					<div className="shrink-0">
						<a
							href="/"
							className="inline-flex items-center gap-3 text-ctp-text hover:text-ctp-lavender transition-colors duration-200"
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
					{/* Navigation */}
					<nav className="flex-1 hidden sm:block" aria-label="Primary">
						<div
							id="primary-navigation"
							className="flex items-center justify-center gap-2"
						>
							{pages.map((page) => {
								const isActive = pathname === page.href;
								return (
									<a
										key={page.href}
										href={page.href}
										className={`rounded-md px-3 py-2 text-sm font-semibold transition focus-visible:outline-2 focus-visible:outline-ctp-lavender/60 cursor-pointer ${isActive ? "text-ctp-lavender bg-ctp-surface1/70 backdrop-blur-md border border-ctp-overlay1/40 shadow-[0px_8px_16px_rgba(0,0,0,0.2)] ring-1 ring-ctp-lavender/20" : "text-ctp-text hover:bg-ctp-surface1/60 hover:text-ctp-lavender hover:ring-1 hover:ring-ctp-lavender/30 hover:shadow-[0px_8px_16px_rgba(202,166,247,0.1)]"}`}
									>
										{page.label}
									</a>
								);
							})}
						</div>
					</nav>
					{/* Actions */}
					<div className="shrink-0 flex items-center gap-2 sm:gap-3">
						{/* Mobile nav toggle */}
						<button
							type="button"
							className="inline-flex sm:hidden h-10 w-10 items-center justify-center rounded-lg border border-ctp-overlay1/60 bg-ctp-surface1/60 text-ctp-subtext1 shadow-[0px_6px_12px_rgba(0,0,0,0.18)] transition duration-150 hover:-translate-y-px hover:border-ctp-lavender/60 hover:bg-ctp-surface1/90 hover:text-ctp-text hover:shadow-[0px_10px_18px_rgba(0,0,0,0.22)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ctp-lavender/60"
							onClick={() => {
								setNavOpen((v) => !v);
							}}
							aria-label="Toggle navigation"
							aria-expanded={navOpen}
							aria-controls="mobile-primary-navigation"
						>
							<Menu className="h-4 w-4" aria-hidden />
						</button>
						<a
							href="https://epsilon.stuysu.org/stuyaviators"
							target="_blank"
							rel="noopener noreferrer"
							className="hidden sm:inline-flex group relative flex-col items-center justify-center gap-0.5 rounded-lg bg-linear-to-br from-ctp-overlay1/15 via-ctp-surface0/45 to-ctp-overlay0/15 px-5 py-3 text-sm font-semibold text-ctp-subtext0 backdrop-blur-xl border border-ctp-overlay1/60 shadow-[inset_0px_1px_3px_rgba(255,255,255,0.3),inset_0px_-3px_8px_rgba(0,0,0,0.12),0px_10px_18px_rgba(0,0,0,0.22)] transition-all hover:scale-[1.02] hover:-translate-y-px hover:ring-2 hover:ring-ctp-lavender/35 hover:shadow-[inset_0px_1px_3px_rgba(255,255,255,0.3),inset_0px_-3px_8px_rgba(0,0,0,0.12),0px_14px_24px_rgba(202,166,247,0.15)] focus-visible:outline-2 focus-visible:outline-ctp-lavender/60 cursor-pointer"
						>
							<div className="absolute inset-0 rounded-lg ring-2 ring-ctp-overlay1/12 opacity-90 transition group-hover:opacity-100 group-hover:ring-ctp-overlay1/30" />
							<span className="relative z-10 leading-none text-xs">
								Join us on
							</span>
							<svg
								aria-label="Epsilon"
								className="relative z-10 h-5 w-20"
								viewBox="0 0 888 299"
								xmlns="http://www.w3.org/2000/svg"
							>
								<defs>
									<linearGradient
										id={`wordmarkGradient-${flavor}`}
										x1="0"
										y1="0"
										x2="888"
										y2="0"
										gradientUnits="userSpaceOnUse"
									>
										<stop offset="0%" stopColor={wordmarkStart} />
										<stop offset="100%" stopColor={wordmarkEnd} />
									</linearGradient>
								</defs>
								<path
									d="M224.701 258V99.9652H254.911V114.817H255.603C263.213 104.374 274.282 96.7164 290.424 96.7164C321.786 96.7164 341.849 122.475 341.849 159.605C341.849 198.128 321.095 222.494 290.655 222.494C274.051 222.494 263.213 215.765 256.525 205.554H256.064V258H224.701ZM283.967 196.271C299.879 196.271 310.025 183.044 310.025 160.534C310.025 138.024 302.185 122.243 282.814 122.243C263.213 122.243 255.372 139.184 255.372 160.534C255.372 182.115 265.288 196.271 283.967 196.271Z"
									fill={`url(#wordmarkGradient-${flavor})`}
								/>
								<path
									d="M399.798 222.494C365.437 222.494 346.297 205.786 344.452 180.491H373.509C375.584 194.183 385.269 200.216 399.336 200.216C413.173 200.216 421.013 194.879 421.013 186.525C421.013 175.154 406.024 173.993 389.882 170.744C368.666 166.567 347.911 160.766 347.911 134.775C347.911 109.016 369.127 96.7164 396.108 96.7164C427.24 96.7164 444.535 112.265 446.841 136.167H418.477C417.093 123.404 409.022 118.762 395.647 118.762C383.425 118.762 375.353 123.404 375.353 131.99C375.353 142.201 391.035 143.129 407.869 146.61C427.701 150.787 449.608 156.356 449.608 184.204C449.608 208.106 429.315 222.494 399.798 222.494Z"
									fill={`url(#wordmarkGradient-${flavor})`}
								/>
								<path
									d="M459.144 219.013V99.9652H490.507V219.013H459.144ZM459.144 81.4002V53.0886H490.507V81.4002H459.144Z"
									fill={`url(#wordmarkGradient-${flavor})`}
								/>
								<path
									d="M506.564 219.013V53.0886H537.927V219.013H506.564Z"
									fill={`url(#wordmarkGradient-${flavor})`}
								/>
								<path
									d="M610 222.494C573.333 222.494 548.198 195.111 548.198 159.605C548.198 124.1 573.333 96.7164 610 96.7164C646.666 96.7164 671.802 124.1 671.802 159.605C671.802 195.111 646.666 222.494 610 222.494ZM610 198.36C629.14 198.36 639.978 182.812 639.978 159.605C639.978 136.399 629.14 120.619 610 120.619C590.629 120.619 580.021 136.399 580.021 159.605C580.021 182.812 590.629 198.36 610 198.36Z"
									fill={`url(#wordmarkGradient-${flavor})`}
								/>
								<path
									d="M712.439 99.9652V116.21H713.131C721.202 103.446 732.04 96.7164 748.183 96.7164C772.627 96.7164 789 115.281 789 141.272V219.013H757.638V145.914C757.638 133.15 750.258 124.1 737.114 124.1C723.277 124.1 713.131 135.239 713.131 151.483V219.013H681.768V99.9652H712.439Z"
									fill={`url(#wordmarkGradient-${flavor})`}
								/>
								<path
									d="M163.404 80.2399C157.254 80.2399 151.489 81.1682 146.108 83.0247C140.881 84.7265 136.269 87.3565 132.272 90.9148C128.429 94.3184 125.354 98.5729 123.048 103.678C120.742 108.784 119.358 114.585 118.897 121.083H190.154V149.859H118.666C119.127 156.511 120.434 162.467 122.587 167.728C124.739 172.988 127.66 177.474 131.35 181.187C135.193 184.746 139.805 187.453 145.186 189.309C150.567 191.166 156.793 192.094 163.865 192.094C171.244 192.094 178.624 191.321 186.003 189.774C193.536 188.226 201.684 186.061 210.447 183.276V212.748C202.607 215.687 194.92 217.853 187.387 219.245C179.854 220.638 171.321 221.334 161.789 221.334C143.495 221.334 128.429 217.853 116.591 210.891C104.907 203.775 96.2207 193.873 90.5324 181.187C84.8441 168.346 82 153.417 82 136.399C82 123.868 83.768 112.419 87.3039 102.054C90.9936 91.5336 96.3744 82.4832 103.446 74.9025C110.518 67.3217 119.204 61.4428 129.505 57.2657C139.805 53.0886 151.643 51 165.018 51C174.857 51 183.928 52.083 192.229 54.2489C200.531 56.2601 208.679 59.0448 216.674 62.6031L204.221 91.1469C197.456 88.2074 190.923 85.6547 184.619 83.4888C178.47 81.3229 171.398 80.2399 163.404 80.2399Z"
									fill={`url(#wordmarkGradient-${flavor})`}
								/>
							</svg>
						</a>
						<div className="relative">
							<button
								type="button"
								disabled={!mounted}
								onClick={() => {
									setMenuOpen((open) => !open);
								}}
								title="Switch Catppuccin flavour"
								className="flex h-10 w-10 sm:h-auto sm:w-auto sm:gap-2 justify-center items-center rounded-lg border border-ctp-overlay1/60 bg-linear-to-br from-ctp-surface0/80 via-ctp-surface0/60 to-ctp-base/45 px-0 sm:px-5 py-2 sm:py-3 text-xs font-semibold text-ctp-subtext0 shadow-[0px_14px_30px_rgba(0,0,0,0.32)] backdrop-blur-2xl transition hover:-translate-y-px hover:shadow-[0px_18px_36px_rgba(0,0,0,0.38)] hover:ring-2 hover:ring-ctp-lavender/35 focus-visible:outline-2 focus-visible:outline-ctp-lavender/60 disabled:opacity-70 cursor-pointer"
								aria-expanded={menuOpen}
								aria-controls="theme-menu"
							>
								<span className="text-base" aria-hidden>
									{currentFlavor?.icon ?? "🌿"}
								</span>
								<span className="text-ctp-overlay1 hidden sm:inline">▾</span>
							</button>
							{menuOpen ? (
								<div
									id="theme-menu"
									role="menu"
									className="absolute right-0 mt-2 sm:mt-3 w-max sm:w-72 z-50 rounded-lg sm:rounded-2xl border border-ctp-overlay1/70 bg-ctp-surface0/92 p-2 sm:p-3 shadow-[0px_20px_42px_rgba(0,0,0,0.4)] backdrop-blur-2xl"
								>
									<div className="flex flex-col gap-2">
										{flavors.map((entry) => {
											const isActive = entry.value === flavor;
											return (
												<button
													key={entry.value}
													type="button"
													disabled={!mounted}
													onClick={() => {
														handleFlavorChange(entry.value);
													}}
													className={`w-full rounded-lg sm:rounded-xl border px-2 sm:px-3 py-2 sm:py-3 text-left transition cursor-pointer ${
														isActive
															? "border-ctp-lavender/60 bg-ctp-surface1 shadow-[0px_10px_20px_rgba(0,0,0,0.24)]"
															: "border-ctp-overlay1/70 hover:bg-ctp-surface1/70 hover:-translate-y-px hover:shadow-[0px_10px_18px_rgba(0,0,0,0.2)]"
													}`}
												>
													<div className="flex items-center justify-between gap-2">
														<div className="flex items-center gap-2 sm:gap-3">
															<span className="text-lg" aria-hidden>
																{entry.icon}
															</span>
															<div className="block">
																<p className="text-sm font-semibold text-ctp-text">
																	{entry.label}
																</p>
																<p className="text-[11px] text-ctp-subtext1">
																	{entry.note}
																</p>
															</div>
														</div>
														{isActive ? (
															<Check
																className="h-4 w-4 text-ctp-lavender"
																aria-hidden
															/>
														) : null}
													</div>
													<div className="mt-2 sm:mt-3 flex flex-col gap-1 sm:gap-2">
														<div className="flex gap-1">
															{entry.backgrounds.map((color, index) => (
																<span
																	key={`bg-${entry.value}-${index}`}
																	className="h-2.5 sm:h-3 flex-1 rounded-md border border-ctp-overlay1/70"
																	style={{ backgroundColor: color }}
																/>
															))}
														</div>
														<div className="flex gap-1">
															{entry.swatch.map((color, index) => (
																<span
																	key={`sw-${entry.value}-${index}`}
																	className="h-2.5 sm:h-3 flex-1 rounded-md border border-ctp-overlay1/70"
																	style={{ backgroundColor: color }}
																/>
															))}
														</div>
													</div>
												</button>
											);
										})}
									</div>
								</div>
							) : null}
						</div>
					</div>
				</div>
			</header>

			{/* Mobile menu panel */}
			{navOpen ? (
				<div
					className="fixed z-40 sm:hidden px-4 inset-x-0"
					style={{ top: headerHeight + 16 }}
				>
					<div
						id="mobile-primary-navigation"
						role="menu"
						className="rounded-xl border border-ctp-overlay1/70 bg-ctp-surface0/92 p-3 shadow-[0px_20px_42px_rgba(0,0,0,0.4)] backdrop-blur-2xl"
					>
						<div className="flex flex-col gap-2">
							{pages.map((page) => {
								const isActive = pathname === page.href;
								return (
									<a
										key={page.href}
										href={page.href}
										className={`rounded-md px-3 py-2 text-sm font-semibold transition focus-visible:outline-2 focus-visible:outline-ctp-lavender/60 cursor-pointer ${isActive ? "text-ctp-lavender bg-ctp-surface1/70 backdrop-blur-md border border-ctp-overlay1/40 shadow-[0px_8px_16px_rgba(0,0,0,0.2)] ring-1 ring-ctp-lavender/20" : "text-ctp-text hover:bg-ctp-surface1/60 hover:text-ctp-lavender hover:ring-1 hover:ring-ctp-lavender/30 hover:shadow-[0px_8px_16px_rgba(202,166,247,0.1)]"}`}
									>
										{page.label}
									</a>
								);
							})}
						</div>
					</div>
				</div>
			) : null}

			{/* Keep spacer constant to avoid layout shift causing bounce */}
			<div aria-hidden style={{ height: headerHeight + 32 }} />
		</>
	);
}
