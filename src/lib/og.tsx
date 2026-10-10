import { readFile } from "node:fs/promises";
import path from "node:path";
import { ImageResponse } from "next/og";

/*
 * Shared Open Graph card (1200×630): club photo behind a navy scrim, logo,
 * B612 label and Lexend title. Drawn with next/og at build time for static
 * pages (and on demand for dynamic ones), so no external service is used.
 */
export const ogSize = { width: 1200, height: 630 };
export const ogContentType = "image/png";

const root = process.cwd();
const load = async (relative: string) => readFile(path.join(root, relative));

export async function renderOg({
	title,
	eyebrow,
	photo,
	detail,
}: {
	title: string;
	eyebrow: string;
	/** File name in src/assets/photos (without extension). */
	photo?: string;
	detail?: string;
}) {
	const [lexend, b612, logo, background] = await Promise.all([
		load("src/assets/fonts/lexend-latin-600-normal.woff"),
		load("src/assets/fonts/b612-latin-700-normal.woff"),
		load("src/assets/brand/logo.png"),
		photo ? load(`src/assets/photos/${photo}.jpg`) : Promise.resolve(undefined),
	]);
	const dataUri = (buffer: Buffer, type: string) =>
		`data:${type};base64,${buffer.toString("base64")}`;

	return new ImageResponse(
		(
			<div style={{ width: "100%", height: "100%", display: "flex", position: "relative", backgroundColor: "#0F1B32", fontFamily: "Lexend" }}>
				{background ? (
					// eslint-disable-next-line @next/next/no-img-element
					<img src={dataUri(background, "image/jpeg")} alt="" width={1200} height={630} style={{ position: "absolute", top: 0, left: 0, width: 1200, height: 630, objectFit: "cover" }} />
				) : null}
				<div style={{ position: "absolute", top: 0, left: 0, width: 1200, height: 630, display: "flex", backgroundImage: "linear-gradient(90deg, rgba(15,27,50,0.96) 0%, rgba(15,27,50,0.86) 55%, rgba(15,27,50,0.5) 100%)" }} />
				<div style={{ position: "relative", display: "flex", flexDirection: "column", justifyContent: "space-between", padding: "60px 72px", width: "100%" }}>
					<div style={{ display: "flex", alignItems: "center", gap: 18 }}>
						{/* eslint-disable-next-line @next/next/no-img-element */}
						<img src={dataUri(logo, "image/png")} alt="" width={76} height={76} />
						<span style={{ fontFamily: "B612", fontSize: 28, letterSpacing: 3, color: "#EEF4FF" }}>STUYAVIATORS</span>
					</div>
					<div style={{ display: "flex", flexDirection: "column", maxWidth: 900 }}>
						<span style={{ fontFamily: "B612", fontSize: 24, letterSpacing: 3, color: "#8DBDF2", textTransform: "uppercase" }}>{eyebrow}</span>
						<span style={{ marginTop: 14, fontSize: title.length > 40 ? 60 : 76, lineHeight: 1.05, color: "#FFFFFF" }}>{title}</span>
						{detail ? <span style={{ marginTop: 18, fontSize: 30, color: "#DDEBFF" }}>{detail}</span> : null}
					</div>
					<div style={{ display: "flex", alignItems: "center", gap: 16 }}>
						<div style={{ display: "flex", height: 3, width: 120, backgroundColor: "#DDEBFF" }} />
						<span style={{ fontFamily: "B612", fontSize: 22, color: "#A9BEDD", letterSpacing: 2 }}>STUYVESANT HIGH SCHOOL · NEW YORK</span>
					</div>
				</div>
			</div>
		),
		{
			...ogSize,
			fonts: [
				{ name: "Lexend", data: lexend, weight: 600, style: "normal" },
				{ name: "B612", data: b612, weight: 700, style: "normal" },
			],
		}
	);
}
