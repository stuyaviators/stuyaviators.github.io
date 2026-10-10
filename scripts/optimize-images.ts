/**
 * Re-encodes the legacy Mobirise images into right-sized, descriptively named
 * files. Run with `pnpm images`. Originals stay untouched in legacy/assets/images.
 *
 * - Photos: longest edge ≤ 1920 px, progressive JPEG (mozjpeg) → src/assets/photos
 * - Headshots: 800×800 attention crop → src/assets/crew
 * Logos come from the official Figma SVGs instead: see scripts/brand-assets.ts.
 */

import { mkdir } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const source = path.resolve("legacy/assets/images");

const photos: Record<string, string> = {
	"20241018-161455.jpeg": "meeting-challenge",
	"20241019-111042.jpg": "event-airline-booth",
	"20241019-112057.jpg": "meeting-atc",
	"20241019-94955.jpg": "event-aviation-hs-panel",
	"494818665-729514952971067-7536190640402735232-n.jpg": "gallery-cap-cessna",
	"494823383-24220791744193157-3271240099628374187-n.jpg": "gallery-e2-hawkeye",
	"504334048-8137581963032019-6539964283957418142-n.jpg":
		"gallery-bomber-flyby",
	"504336398-1079732424037521-7943750798277191562-n.jpg":
		"gallery-coast-guard-dolphin",
	"504463674-9956540994464388-7790141839083400994-n.jpeg":
		"gallery-strut-coastline",
	"504532227-29890914470551821-68221955676414783-n.jpg":
		"gallery-glass-cockpit",
	"505114239-1014907823742214-5198376822080830138-n.jpeg":
		"spotlight-coast-inlet",
	"505776236-1053485142946256-8452180448317189739-n.jpg":
		"gallery-helicopter-hangar",
	"505829763-1738645423670903-2811652975767958488-n.jpg": "gallery-jets-smoke",
	"7129ba57-a757-416a-a7d8-3dabc1a12795-1-105-c.jpeg":
		"gallery-helicopter-marsh",
	"clouds-2295189.jpg": "bg-high-altitude",
	"ff992932-c439-455b-871e-b2ce2e66bb55.jpeg": "meeting-student-course",
	"fullsizerender-4.png": "gallery-apron-mountains",
	"image-2025-08-28t165750.313-2.png": "spotlight-flight-suit-cessna",
	"image-3.png": "home-grass-runway",
	"image0-2.jpeg": "spotlight-airliner-cockpit",
	"image0.jpeg": "story-yunus-gubrud",
	"img-2792.jpeg": "spotlight-conference",
	"img-3212.jpeg": "hero-cessna-backseat",
	"img-3429.jpg": "gallery-wing-clouds-1",
	"img-3437.jpg": "gallery-wing-clouds-2",
	"img-3447.jpg": "gallery-wing-forest",
	"img-3450.jpg": "gallery-wing-town",
	"img-3478.jpeg": "story-jerry-qiu",
	"img-3744.jpg": "gallery-runway-approach",
	"img-3747.jpg": "gallery-front-seat",
	"img-3806.jpeg": "spotlight-helicopter",
	"img-3867.jpg": "gallery-cockpit-windscreen",
	"img-3870.jpeg": "spotlight-headsets",
	"img-4028.jpg": "hero-cessna-sunset",
	"img-4029.png": "hero-classroom-meeting",
	"img-4057.jpeg": "gallery-helmet-room",
	"img-4081.jpeg": "spotlight-military-helicopter",
	"img-4177-1464x1098.jpeg": "hero-presentation",
	"img-4296.jpg": "meeting-presentation",
	"img-4359.jpg": "gallery-cessna-hangar",
	"img-4933.jpg": "gallery-harbor-sunset-1",
	"img-4935.jpg": "gallery-harbor-sunset-2",
	"img-6080.jpeg": "hero-sim-classroom",
	"img-6082.jpeg": "hero-joystick",
	"img-6085.jpg": "hero-sim-ryanair",
	"img-6093-2000x1500.jpeg": "hero-landing-challenge",
	"img-6141.jpg": "gallery-united-terminal",
	"img-6191.jpg": "gallery-cargo-rain",
	"img-6196.jpg": "gallery-jal-runway",
	"img-6205.jpeg": "meeting-trip-747",
	"img-6328.jpg": "hero-sim-display",
	"img-6371.jpg": "gallery-c17",
	"img-6441.jpeg": "hero-sim-setup",
	"img-6464.jpeg": "meeting-fsd",
	"img-6477-original.png": "spotlight-rocket-build",
	"img-6526202-1696x1272.jpeg": "story-first-guest-speaker",
	"img-6538.jpg": "meeting-guest-speaker",
	"img-6581.jpg": "meeting-pci",
	"img-6584-2000x2667.jpeg": "hero-worksheets",
	"img-6897-original.jpeg": "story-matthew-monge",
	"img-7925.jpg": "gallery-night-cabin",
	"img-9103.jpeg": "gallery-farmland",
	"img-9408.jpg": "gallery-american-gate",
	"img-9426.jpg": "gallery-aer-lingus",
	"img-9462.jpg": "gallery-control-tower",
	"img-9463.jpg": "gallery-emirates-virgin",
	"img-965.jpeg": "gallery-wing-sunset-1",
	"img-969.jpeg": "gallery-wing-sunset-2",
};

const crew: Record<string, string> = {
	"20240616-152704-matthew-karp.jpeg": "matthew-karp",
	"20241007-234842-allyson-win.jpg": "allyson-win",
	"bucaramanga-cliff-steven-wu-1.jpeg": "steven-wu",
	"dillon-pic.jpeg": "james-dillon",
	"estherl-headshot.jpeg": "esther-lee",
	"evanye-headshot.jpeg": "evan-ye",
	"florence-niuniu-wu.webp": "florence-wu",
	"img-1184-chloe-tam-2.jpeg": "chloe-tam",
	"img-20241004-153246-466-alexander-smelyansky-1.jpeg": "alexander-smelyansky",
	"img-2296-andrew-zhang-1.jpeg": "andrew-zhang",
	"jerry-qiu-1.jpeg": "jerry-qiu",
	"unnamed-8-matthew-lin.jpg": "matthew-lin",
	"william-v.jpeg": "william-vongphanith",
	"yunus-stuy-aviators-picture-yunus-gubrud.jpeg": "yunus-gubrud",
};

async function run() {
	const photoDir = path.resolve("src/assets/photos");
	const crewDir = path.resolve("src/assets/crew");
	await Promise.all(
		[photoDir, crewDir].map(async (dir) => mkdir(dir, { recursive: true }))
	);

	for (const [file, name] of Object.entries(photos)) {
		// eslint-disable-next-line no-await-in-loop
		await sharp(path.join(source, file))
			.rotate()
			.resize({
				width: 1920,
				height: 1920,
				fit: "inside",
				withoutEnlargement: true,
			})
			.jpeg({ quality: 78, mozjpeg: true, progressive: true })
			.toFile(path.join(photoDir, `${name}.jpg`));
	}

	for (const [file, name] of Object.entries(crew)) {
		// eslint-disable-next-line no-await-in-loop
		await sharp(path.join(source, file))
			.rotate()
			.resize(800, 800, { fit: "cover", position: sharp.strategy.attention })
			.jpeg({ quality: 80, mozjpeg: true, progressive: true })
			.toFile(path.join(crewDir, `${name}.jpg`));
	}

	console.log(
		`Wrote ${Object.keys(photos).length} photos, ${Object.keys(crew).length} headshots.`
	);
}

await run();
