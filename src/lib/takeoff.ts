/*
 * The "taking off" exit from the public site into the dashboard: every
 * visible piece of the page slides off the screen toward its nearest edge
 * (top, bottom, left or right), then a veil in the dashboard's colors covers
 * the page until the dashboard arrives (see TakeoffArrival).
 */

export const takeoffFlag = "stuyaviators-takeoff";

const selector = [
	"header",
	"footer",
	"main h1",
	"main h2",
	"main h3",
	"main h4",
	"main p",
	"main li",
	"main a",
	"main button",
	"main img",
	"main video",
	"main input",
	"main textarea",
	"main label",
	"main figure",
	"main svg",
	"[data-takeoff]",
].join(",");

const flightMs = 650;
const maxDelayMs = 320;
const margin = 48;

type Edge = "top" | "bottom" | "left" | "right";

function nearestEdge(rect: DOMRect, width: number, height: number): Edge {
	const centerX = rect.left + rect.width / 2;
	const centerY = rect.top + rect.height / 2;
	const distances: Array<[Edge, number]> = [
		["top", centerY],
		["bottom", height - centerY],
		["left", centerX],
		["right", width - centerX],
	];
	distances.sort((a, b) => a[1] - b[1]);
	return distances[0]?.[0] ?? "top";
}

function offset(edge: Edge, rect: DOMRect, width: number, height: number) {
	switch (edge) {
		case "top": {
			return { x: 0, y: -(rect.bottom + margin) };
		}

		case "bottom": {
			return { x: 0, y: height - rect.top + margin };
		}

		case "left": {
			return { x: -(rect.right + margin), y: 0 };
		}

		case "right": {
			return { x: width - rect.left + margin, y: 0 };
		}
	}
}

function visiblePieces(width: number, height: number): HTMLElement[] {
	const visible = [...document.querySelectorAll<HTMLElement>(selector)].filter(
		(element) => {
			const rect = element.getBoundingClientRect();
			return (
				rect.width > 0 &&
				rect.height > 0 &&
				rect.bottom > 0 &&
				rect.top < height &&
				rect.right > 0 &&
				rect.left < width
			);
		}
	);
	// Move each piece once: skip anything inside a piece that is moving.
	return visible.filter((element) =>
		visible.every((other) => other === element || !other.contains(element))
	);
}

function addVeil() {
	const veil = document.createElement("div");
	veil.className = "takeoff-veil";
	veil.setAttribute("aria-hidden", "true");
	document.body.append(veil);
	veil.animate([{ opacity: 0 }, { opacity: 1 }], {
		duration: 380,
		easing: "ease-out",
		fill: "forwards",
	});
	// Never leave the page covered, whatever happens next.
	setTimeout(() => {
		veil.remove();
	}, 10_000);
}

/**
Slides the visible page off the screen. Resolves when the flight is over (at
once for visitors who prefer reduced motion).
*/
export async function runTakeoff(): Promise<void> {
	if (globalThis.matchMedia("(prefers-reduced-motion: reduce)").matches) {
		return;
	}

	const width = window.innerWidth;
	const height = window.innerHeight;
	const flights = visiblePieces(width, height).map((element) => {
		const rect = element.getBoundingClientRect();
		const edge = nearestEdge(rect, width, height);
		const { x, y } = offset(edge, rect, width, height);
		// Pieces nearest an edge go first, so the page peels away outward-in.
		const closeness = Math.min(
			rect.top,
			height - rect.bottom,
			rect.left,
			width - rect.right
		);
		const delay = Math.min(
			maxDelayMs,
			(Math.max(0, closeness) / Math.max(width, height)) * maxDelayMs * 2
		);
		return element.animate(
			[
				{ transform: "translate(0, 0)" },
				{ transform: `translate(${x}px, ${y}px) scale(0.94)` },
			],
			{
				duration: flightMs,
				delay,
				easing: "cubic-bezier(0.55, 0.05, 0.9, 0.35)",
				fill: "forwards",
			}
		);
	});

	// The dashboard's colors come in as the last pieces leave.
	setTimeout(addVeil, flightMs * 0.55);
	await Promise.all(
		flights.map(async (flight) => flight.finished.catch(() => undefined))
	);
	sessionStorage.setItem(takeoffFlag, "1");
}
