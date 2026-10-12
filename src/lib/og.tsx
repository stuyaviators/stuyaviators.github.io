import { readFile } from "node:fs/promises";
import { ImageResponse } from "next/og";

/*
 * Shared Open Graph card (1200×630): club photo behind a dark scrim, logo,
 * label and title in Inter Tight (Airbus's display face). Drawn with next/og at build time for static
 * pages (and on demand for dynamic ones), so no external service is used.
 */
export const ogSize = { width: 1200, height: 630 };
export const ogContentType = "image/png";

export type OgFact = { label: string; value: string };

const dataUri = (buffer: Uint8Array, type: string) =>
	`data:${type};base64,${Buffer.from(buffer).toString("base64")}`;

async function loadBrand() {
	const [interTight, logo] = await Promise.all([
		readFile(
			new URL(
				"../assets/fonts/inter-tight-latin-600-normal.woff",
				import.meta.url
			)
		),
		readFile(new URL("../assets/brand/logo.png", import.meta.url)),
	]);
	return { interTight, logo };
}

/**
A card's key facts (deadline, amount, eligibility, ...): small label over a
larger value, wrapping onto a second line when there are many.
*/
function Facts({ facts }: { readonly facts: readonly OgFact[] }) {
	return (
		<div style={{ display: "flex", flexWrap: "wrap", gap: "16px 48px" }}>
			{facts.map((fact) => (
				<div
					key={fact.label}
					style={{ display: "flex", flexDirection: "column" }}
				>
					<span
						style={{
							fontSize: 18,
							letterSpacing: 1.5,
							color: "#8CC4F7",
							textTransform: "uppercase",
						}}
					>
						{fact.label}
					</span>
					<span style={{ marginTop: 4, fontSize: 30, color: "#FFFFFF" }}>
						{fact.value}
					</span>
				</div>
			))}
		</div>
	);
}

export async function renderOg({
	title,
	eyebrow,
	photo,
	detail,
	facts,
}: {
	title: string;
	eyebrow: string;
	/**
	Photo bytes, read by the caller with a static path.
	*/
	photo?: Uint8Array;
	detail?: string;
	/**
	Labelled facts shown under the title, in place of detail.
	*/
	facts?: readonly OgFact[];
}) {
	const { interTight, logo } = await loadBrand();
	const background = photo;

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
					{facts && facts.length > 0 ? (
						<div style={{ display: "flex", marginTop: 24 }}>
							<Facts facts={facts} />
						</div>
					) : null}
					{detail && (facts?.length ?? 0) === 0 ? (
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
scholarship): the picture fills the whole card, with the name and key facts on
a dark fade along the bottom.
*/
export async function renderPictureOg({
	picture,
	title,
	eyebrow,
	facts,
}: {
	picture: OgPicture;
	title: string;
	eyebrow: string;
	facts: readonly OgFact[];
}) {
	const { interTight, logo } = await loadBrand();

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
			<img
				src={dataUri(picture.bytes, picture.type)}
				alt=""
				width={ogSize.width}
				height={ogSize.height}
				style={{
					position: "absolute",
					top: 0,
					left: 0,
					width: ogSize.width,
					height: ogSize.height,
					objectFit: "cover",
				}}
			/>
			<div
				style={{
					position: "absolute",
					top: 0,
					left: 0,
					width: ogSize.width,
					height: ogSize.height,
					display: "flex",
					backgroundImage:
						"linear-gradient(180deg, rgba(0,0,0,0) 30%, rgba(0,0,0,0.78) 62%, rgba(0,0,0,0.94) 100%)",
				}}
			/>
			<div
				style={{
					position: "relative",
					display: "flex",
					flexDirection: "column",
					justifyContent: "space-between",
					padding: "36px 56px 44px",
					width: "100%",
				}}
			>
				<div
					style={{
						display: "flex",
						alignItems: "center",
						alignSelf: "flex-start",
						gap: 14,
						padding: "8px 22px 8px 10px",
						borderRadius: 999,
						backgroundColor: "rgba(0,0,0,0.62)",
					}}
				>
					<img src={dataUri(logo, "image/png")} alt="" width={48} height={48} />
					<span style={{ fontSize: 24, letterSpacing: 2, color: "#F5F5F7" }}>
						STUYAVIATORS
					</span>
				</div>
				<div style={{ display: "flex", flexDirection: "column" }}>
					<span
						style={{
							fontSize: 22,
							letterSpacing: 1.5,
							color: "#8CC4F7",
							textTransform: "uppercase",
						}}
					>
						{eyebrow}
					</span>
					<span
						style={{
							marginTop: 10,
							fontSize: title.length > 50 ? 48 : 60,
							lineHeight: 1.05,
							color: "#FFFFFF",
						}}
					>
						{title}
					</span>
					{facts.length > 0 ? (
						<div style={{ display: "flex", marginTop: 22 }}>
							<Facts facts={facts} />
						</div>
					) : null}
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

/**
The card for a meeting, on the site's dark background: name, when, where, and
the start of what it's about.
*/
export async function renderMeetingOg({
	title,
	eyebrow,
	facts,
	about,
}: {
	title: string;
	eyebrow: string;
	facts: readonly OgFact[];
	about?: string;
}) {
	const { interTight, logo } = await loadBrand();

	return new ImageResponse(
		<div
			style={{
				width: "100%",
				height: "100%",
				display: "flex",
				flexDirection: "column",
				justifyContent: "space-between",
				padding: "60px 72px",
				backgroundColor: "#000000",
				fontFamily: "Inter Tight",
			}}
		>
			<div style={{ display: "flex", alignItems: "center", gap: 18 }}>
				<img src={dataUri(logo, "image/png")} alt="" width={76} height={76} />
				<span style={{ fontSize: 28, letterSpacing: 2, color: "#F5F5F7" }}>
					STUYAVIATORS
				</span>
			</div>
			<div style={{ display: "flex", flexDirection: "column" }}>
				<span
					style={{
						fontSize: 24,
						letterSpacing: 1.5,
						color: "#6CB4F5",
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
						color: "#F5F5F7",
					}}
				>
					{title}
				</span>
				<div
					style={{
						display: "flex",
						marginTop: 28,
						padding: "20px 28px",
						borderRadius: 20,
						border: "1px solid #2A2A2F",
						backgroundColor: "#121214",
					}}
				>
					<Facts facts={facts} />
				</div>
				{about ? (
					<span
						style={{
							marginTop: 24,
							fontSize: 28,
							lineHeight: 1.3,
							color: "#A1A1A8",
						}}
					>
						{about}
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
				<span style={{ fontSize: 22, color: "#A1A1A8", letterSpacing: 1.5 }}>
					STUYVESANT HIGH SCHOOL · NEW YORK
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
