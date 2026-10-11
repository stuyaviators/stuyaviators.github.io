import { readFile } from "node:fs/promises";
import { ImageResponse } from "next/og";

/*
 * Shared Open Graph card (1200×630): club photo behind a dark scrim, logo,
 * label and title in Inter Tight (Airbus's display face). Drawn with next/og at build time for static
 * pages (and on demand for dynamic ones), so no external service is used.
 */
export const ogSize = { width: 1200, height: 630 };
export const ogContentType = "image/png";

export async function renderOg({
	title,
	eyebrow,
	photo,
	detail,
}: {
	title: string;
	eyebrow: string;
	/**
	Photo bytes, read by the caller with a static path.
	*/
	photo?: Uint8Array;
	detail?: string;
}) {
	const [interTight, logo] = await Promise.all([
		readFile(
			new URL(
				"../assets/fonts/inter-tight-latin-600-normal.woff",
				import.meta.url
			)
		),
		readFile(new URL("../assets/brand/logo.png", import.meta.url)),
	]);
	const background = photo;
	const dataUri = (buffer: Uint8Array, type: string) =>
		`data:${type};base64,${Buffer.from(buffer).toString("base64")}`;

	return new ImageResponse(
		<div
			style={{
				width: "100%",
				height: "100%",
				display: "flex",
				position: "relative",
				backgroundColor: "#0A0A0C",
				fontFamily: "Inter Tight",
			}}
		>
			{background ? (
				<img
					src={dataUri(background, "image/jpeg")}
					alt=""
					width={1200}
					height={630}
					style={{
						position: "absolute",
						top: 0,
						left: 0,
						width: 1200,
						height: 630,
						objectFit: "cover",
					}}
				/>
			) : null}
			<div
				style={{
					position: "absolute",
					top: 0,
					left: 0,
					width: 1200,
					height: 630,
					display: "flex",
					backgroundImage:
						"linear-gradient(90deg, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.72) 55%, rgba(0,0,0,0.3) 100%)",
				}}
			/>
			<div
				style={{
					position: "relative",
					display: "flex",
					flexDirection: "column",
					justifyContent: "space-between",
					padding: "60px 72px",
					width: "100%",
				}}
			>
				<div style={{ display: "flex", alignItems: "center", gap: 18 }}>
					<img src={dataUri(logo, "image/png")} alt="" width={76} height={76} />
					<span
						style={{
							fontSize: 28,
							letterSpacing: 2,
							color: "#F5F5F7",
						}}
					>
						STUYAVIATORS
					</span>
				</div>
				<div
					style={{ display: "flex", flexDirection: "column", maxWidth: 900 }}
				>
					<span
						style={{
							fontSize: 24,
							letterSpacing: 1.5,
							color: "#8CC4F7",
							textTransform: "uppercase",
						}}
					>
						{eyebrow}
					</span>
					<span
						style={{
							marginTop: 14,
							fontSize: title.length > 40 ? 60 : 76,
							lineHeight: 1.05,
							color: "#FFFFFF",
						}}
					>
						{title}
					</span>
					{detail ? (
						<span style={{ marginTop: 18, fontSize: 30, color: "#D2D2D7" }}>
							{detail}
						</span>
					) : null}
				</div>
				<div style={{ display: "flex", alignItems: "center", gap: 16 }}>
					<div
						style={{
							display: "flex",
							height: 3,
							width: 120,
							backgroundColor: "#0B64A9",
						}}
					/>
					<span
						style={{
							fontSize: 22,
							color: "#D2D2D7",
							letterSpacing: 1.5,
						}}
					>
						STUYVESANT HIGH SCHOOL · NEW YORK
					</span>
				</div>
			</div>
		</div>,
		{
			...ogSize,
			fonts: [
				{ name: "Inter Tight", data: interTight, weight: 600, style: "normal" },
			],
		}
	);
}

export type OgPicture = { bytes: Uint8Array; type: "image/jpeg" | "image/png" };

/**
The card for something that has its own picture (an opportunity, a
scholarship): the whole picture on a light backdrop, uncropped so logos and
posters stay readable, with a slim StuyAviators bar underneath.
*/
export async function renderPictureOg({
	picture,
	label,
}: {
	picture: OgPicture;
	label: string;
}) {
	const [interTight, logo] = await Promise.all([
		readFile(
			new URL(
				"../assets/fonts/inter-tight-latin-600-normal.woff",
				import.meta.url
			)
		),
		readFile(new URL("../assets/brand/logo.png", import.meta.url)),
	]);
	const dataUri = (buffer: Uint8Array, type: string) =>
		`data:${type};base64,${Buffer.from(buffer).toString("base64")}`;
	const barHeight = 84;

	return new ImageResponse(
		<div
			style={{
				width: "100%",
				height: "100%",
				display: "flex",
				flexDirection: "column",
				backgroundColor: "#F2F4F7",
				fontFamily: "Inter Tight",
			}}
		>
			<div
				style={{
					display: "flex",
					width: 1200,
					height: ogSize.height - barHeight,
				}}
			>
				<img
					src={dataUri(picture.bytes, picture.type)}
					alt=""
					width={1200}
					height={ogSize.height - barHeight}
					style={{
						width: 1200,
						height: ogSize.height - barHeight,
						objectFit: "contain",
					}}
				/>
			</div>
			<div
				style={{
					display: "flex",
					alignItems: "center",
					justifyContent: "space-between",
					height: barHeight,
					padding: "0 40px",
					backgroundColor: "#0A0A0C",
				}}
			>
				<div style={{ display: "flex", alignItems: "center", gap: 14 }}>
					<img src={dataUri(logo, "image/png")} alt="" width={48} height={48} />
					<span style={{ fontSize: 24, letterSpacing: 2, color: "#F5F5F7" }}>
						STUYAVIATORS
					</span>
				</div>
				<span
					style={{
						fontSize: 22,
						letterSpacing: 1.5,
						color: "#8CC4F7",
						textTransform: "uppercase",
					}}
				>
					{label}
				</span>
			</div>
		</div>,
		{
			...ogSize,
			fonts: [
				{ name: "Inter Tight", data: interTight, weight: 600, style: "normal" },
			],
		}
	);
}
