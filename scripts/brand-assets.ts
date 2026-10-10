/**
 * Builds the brand kit and site logo files from the official vector logos
 * exported from the StuyAviators Figma file (scripts/source/*.svg, optimized
 * with svgo). Run with `pnpm brand`.
 *
 * Outputs:
 * - public/brand/downloads: SVG + PNG per variant, palette files, and a zip
 * - src/assets/brand: logos used by next/image in the site
 * - src/app/icon.png, src/app/apple-icon.png: favicon + touch icon
 * - public/brand/logo-256.png: absolute-URL logo for emails
 */

import { copyFile, mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { deflateRawSync } from "node:zlib";
import sharp from "sharp";
import { logoVariants, palette } from "../src/content/brand.ts";

const sourceDir = path.resolve("scripts/source");
const downloads = path.resolve("public/brand/downloads");
const siteBrand = path.resolve("src/assets/brand");

async function rasterize(svg: string, width: number) {
	// Density high enough that librsvg renders crisply at the target width.
	return sharp(svg, { density: Math.max(72, (72 * width) / 1000) })
		.resize({ width })
		.png({ compressionLevel: 9 })
		.toBuffer();
}

// Minimal deflate ZIP writer so the kit needs no extra dependency.
function crc32(buf: Uint8Array) {
	let crc = ~0;
	for (const byte of buf) {
		crc ^= byte;
		for (let k = 0; k < 8; k++)
			crc = (crc >>> 1) ^ (0xed_b8_83_20 & -(crc & 1));
	}

	return ~crc >>> 0;
}

function zip(files: Array<{ name: string; data: Buffer }>) {
	const chunks: Buffer[] = [];
	const central: Buffer[] = [];
	let offset = 0;
	for (const file of files) {
		const name = Buffer.from(file.name);
		const compressed = deflateRawSync(file.data);
		const crc = crc32(file.data);
		const local = Buffer.alloc(30);
		local.writeUInt32LE(0x04_03_4b_50, 0);
		local.writeUInt16LE(20, 4);
		local.writeUInt16LE(8, 8);
		local.writeUInt32LE(crc, 14);
		local.writeUInt32LE(compressed.length, 18);
		local.writeUInt32LE(file.data.length, 22);
		local.writeUInt16LE(name.length, 26);
		chunks.push(local, name, compressed);
		const entry = Buffer.alloc(46);
		entry.writeUInt32LE(0x02_01_4b_50, 0);
		entry.writeUInt16LE(20, 4);
		entry.writeUInt16LE(20, 6);
		entry.writeUInt16LE(8, 10);
		entry.writeUInt32LE(crc, 16);
		entry.writeUInt32LE(compressed.length, 20);
		entry.writeUInt32LE(file.data.length, 24);
		entry.writeUInt16LE(name.length, 28);
		entry.writeUInt32LE(offset, 42);
		central.push(entry, name);
		offset += local.length + name.length + compressed.length;
	}

	const centralBuf = Buffer.concat(central);
	const end = Buffer.alloc(22);
	end.writeUInt32LE(0x06_05_4b_50, 0);
	end.writeUInt16LE(files.length, 8);
	end.writeUInt16LE(files.length, 10);
	end.writeUInt32LE(centralBuf.length, 12);
	end.writeUInt32LE(offset, 16);
	return Buffer.concat([...chunks, centralBuf, end]);
}

async function run() {
	await Promise.all(
		[downloads, siteBrand].map(async (dir) => mkdir(dir, { recursive: true }))
	);
	const kit: Array<{ name: string; data: Buffer }> = [];

	for (const variant of logoVariants) {
		const svgPath = path.join(sourceDir, `logo-${variant.id}.svg`);
		const svg = await readFile(svgPath);
		const base = `stuyaviators-logo-${variant.id}`;
		await copyFile(svgPath, path.join(downloads, `${base}.svg`));
		kit.push({ name: `logos/${base}.svg`, data: svg });
		for (const width of variant.widths) {
			// eslint-disable-next-line no-await-in-loop
			const png = await rasterize(svgPath, width);
			const name = `${base}-${width}.png`;
			// eslint-disable-next-line no-await-in-loop
			await writeFile(path.join(downloads, name), png);
			kit.push({ name: `logos/${name}`, data: png });
		}
	}

	// Site assets.
	const circle = path.join(sourceDir, "logo-circle.svg");
	const square = path.join(sourceDir, "logo-square.svg");
	await writeFile(
		path.join(siteBrand, "logo.png"),
		await rasterize(circle, 192)
	);
	await writeFile(
		path.join(siteBrand, "banner-blue.png"),
		await rasterize(path.join(sourceDir, "logo-banner-blue.svg"), 1200)
	);
	await writeFile(
		path.join(siteBrand, "banner-white.png"),
		await rasterize(path.join(sourceDir, "logo-banner-white.svg"), 1200)
	);
	await writeFile(
		path.resolve("src/app/icon.png"),
		await rasterize(circle, 96)
	);
	await writeFile(
		path.resolve("src/app/apple-icon.png"),
		await rasterize(square, 180)
	);
	await writeFile(
		path.resolve("public/brand/logo-256.png"),
		await rasterize(circle, 256)
	);

	const css = `:root {\n${palette.map((c) => `\t--sa-${c.id}: ${c.hex};`).join("\n")}\n}\n`;
	const json = `${JSON.stringify(
		palette.map(({ id, name, hex, rgb, use }) => ({ id, name, hex, rgb, use })),
		null,
		2
	)}\n`;
	const text = `${palette.map((c) => `${c.name}\t${c.hex}\trgb(${c.rgb.join(", ")})\t${c.use}`).join("\n")}\n`;
	await writeFile(path.join(downloads, "stuyaviators-palette.css"), css);
	await writeFile(path.join(downloads, "stuyaviators-palette.json"), json);
	kit.push(
		{ name: "palette/stuyaviators-palette.css", data: Buffer.from(css) },
		{ name: "palette/stuyaviators-palette.json", data: Buffer.from(json) },
		{ name: "palette/stuyaviators-palette.txt", data: Buffer.from(text) },
		{
			name: "README.txt",
			data: Buffer.from(
				"StuyAviators brand kit\n\nGuidelines: https://stuyaviators.vercel.app/brand\nQuestions or permission requests: aviators-exec@stuy.edu\n"
			),
		}
	);
	await writeFile(path.join(downloads, "stuyaviators-brand-kit.zip"), zip(kit));
	console.log(`Wrote ${kit.length} files to the brand kit.`);
}

await run();
