import type { CSSProperties } from "react";

/*
 * Ambient sky behind every page (fixed, decorative, no JS):
 * - planes fly dotted flight paths that draw in, then fade out, on a slow
 *   loop (both themes; faint in light mode);
 * - in dark mode, twinkling stars and slow-drifting glowing orbs.
 * Hidden or frozen under prefers-reduced-motion (globals.css).
 */

// Deterministic pseudo-random numbers so server and client render the same
// star field.
function random(seed: number) {
	let t = seed;
	return () => {
		t += 1;
		const x = Math.sin(t) * 10_000;
		return x - Math.floor(x);
	};
}

const next = random(2022);
const stars = Array.from({ length: 80 }, (_, index) => ({
	id: index,
	x: Math.round(next() * 1440),
	y: Math.round(next() * 900),
	r: 0.5 + next() * 1.3,
	duration: 2.5 + next() * 4,
	delay: -next() * 6,
}));

const flights = [
	{ d: "M -120 720 C 300 600, 760 660, 1560 170", dur: 20, begin: 0 },
	{ d: "M 1560 110 C 1120 250, 620 150, -120 430", dur: 24, begin: 7 },
	{ d: "M -120 300 C 480 380, 920 840, 1560 770", dur: 28, begin: 14 },
];

// Small airliner pointing along +x (animateMotion rotates it to the path).
const planeGlyph =
	"M14 0 L-6 -2 L-12 -12 L-16 -12 L-12 -2 L-18 -1.5 L-21 -6 L-24 -6 L-22 0 L-24 6 L-21 6 L-18 1.5 L-12 2 L-16 12 L-12 12 L-6 2 Z";

export default function SkyBackground() {
	return (
		<div
			aria-hidden
			className="sky pointer-events-none fixed inset-0 -z-10 overflow-hidden"
		>
			<div className="only-dark">
				<span className="orb left-[-10%] top-[5%] size-[42rem] bg-[radial-gradient(circle,rgb(20_121_204/0.28),transparent_65%)] [--d:38s] [--dx:12vw] [--dy:8vh]" />
				<span className="orb right-[-15%] top-[35%] size-[38rem] bg-[radial-gradient(circle,rgb(99_102_241/0.18),transparent_65%)] [--d:46s] [--dx:-10vw] [--dy:-6vh]" />
				<span className="orb bottom-[-20%] left-[30%] size-[34rem] bg-[radial-gradient(circle,rgb(108_180_245/0.16),transparent_65%)] [--d:52s] [--dx:6vw] [--dy:-10vh]" />
				<svg
					className="absolute inset-0 size-full"
					viewBox="0 0 1440 900"
					preserveAspectRatio="xMidYMid slice"
				>
					{stars.map((star) => (
						<circle
							key={star.id}
							className="star"
							cx={star.x}
							cy={star.y}
							r={star.r}
							fill="#ffffff"
							style={
								{
									"--d": `${star.duration}s`,
									"--delay": `${star.delay}s`,
								} as CSSProperties
							}
						/>
					))}
				</svg>
			</div>

			<svg
				className="sky-flights absolute inset-0 size-full text-brand"
				viewBox="0 0 1440 900"
				preserveAspectRatio="xMidYMid slice"
			>
				{flights.map((flight, index) => {
					const timing = {
						dur: `${flight.dur}s`,
						begin: `${flight.begin}s`,
						repeatCount: "indefinite",
					};
					return (
						<g key={flight.d} opacity="0">
							<animate
								attributeName="opacity"
								values="0;1;1;0;0"
								keyTimes="0;0.04;0.55;0.8;1"
								{...timing}
							/>
							<mask id={`sky-trail-${index}`} maskUnits="userSpaceOnUse">
								<path
									d={flight.d}
									pathLength={1}
									fill="none"
									stroke="#ffffff"
									strokeWidth={10}
									strokeDasharray="1 1"
									strokeDashoffset={1}
								>
									<animate
										attributeName="stroke-dashoffset"
										values="1;0;0"
										keyTimes="0;0.55;1"
										{...timing}
									/>
								</path>
							</mask>
							<path
								d={flight.d}
								mask={`url(#sky-trail-${index})`}
								fill="none"
								stroke="currentColor"
								strokeWidth={1.6}
								strokeDasharray="2 10"
								strokeLinecap="round"
							/>
							<path d={planeGlyph} fill="currentColor" transform="scale(0.9)">
								<animateMotion
									path={flight.d}
									rotate="auto"
									keyPoints="0;1;1"
									keyTimes="0;0.55;1"
									calcMode="linear"
									{...timing}
								/>
							</path>
						</g>
					);
				})}
			</svg>
		</div>
	);
}
