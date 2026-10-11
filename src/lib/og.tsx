import { readFile } from "node:fs/promises";
import { ImageResponse } from "next/og";

/*
 * Shared Open Graph card (1200×630): club photo behind a navy scrim, logo,
 * B612 label and Inter Tight title. Drawn with next/og at build time for static
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
	const [interTight, b612, logo] = await Promise.all([
		readFile(
			new URL(
				"../assets/fonts/inter-tight-latin-600-normal.woff",
				import.meta.url
			)
		),
		readFile(
			new URL("../assets/fonts/b612-latin-700-normal.woff", import.meta.url)
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
				backgroundColor: "#0F1B32",
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
						"linear-gradient(90deg, rgba(15,27,50,0.96) 0%, rgba(15,27,50,0.86) 55%, rgba(15,27,50,0.5) 100%)",
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
							fontFamily: "B612",
							fontSize: 28,
							letterSpacing: 3,
							color: "#EEF4FF",
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
							fontFamily: "B612",
							fontSize: 24,
							letterSpacing: 3,
							color: "#8DBDF2",
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
						<span style={{ marginTop: 18, fontSize: 30, color: "#DDEBFF" }}>
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
							backgroundColor: "#DDEBFF",
						}}
					/>
					<span
						style={{
							fontFamily: "B612",
							fontSize: 22,
							color: "#A9BEDD",
							letterSpacing: 2,
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
				{ name: "B612", data: b612, weight: 700, style: "normal" },
			],
		}
	);
}
