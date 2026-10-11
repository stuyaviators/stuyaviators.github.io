import type { Block, NewsletterData, SocialPlatform } from "@/lib/newsletter/types";
import { emailMarkdown } from "@/lib/newsletter/email-markdown";
import {
	Body,
	Button,
	Column,
	Container,
	Head,
	Hr,
	Html,
	Img,
	Link,
	Preview,
	Row,
	Section,
	Text,
} from "react-email";

/*
 * The newsletter email (React Email). Email-safe: table layout from React
 * Email's components, inline styles, a 600px column, system fonts and
 * absolute image URLs, so it survives Gmail's sanitizer when pasted into
 * compose. Recode's dark Catppuccin glass look is replaced with the club's
 * light palette (glass blur and gradients don't render in Gmail anyway).
 */

const font =
	"-apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif";
const colors = {
	page: "#f5f5f7",
	card: "#ffffff",
	text: "#111113",
	body: "#2b2b30",
	muted: "#6b6b73",
	line: "#e3e6ea",
	brand: "#0b64a9",
};

const socialIcon: Record<SocialPlatform, { file: string; label: string; width: number }> = {
	instagram: { file: "instagram.png", label: "Instagram", width: 22 },
	discord: { file: "discord.png", label: "Discord", width: 22 },
	youtube: { file: "youtube.png", label: "YouTube", width: 22 },
	facebook: { file: "facebook.png", label: "Facebook", width: 22 },
	epsilon: { file: "epsilon-wordmark.png", label: "Epsilon", width: 64 },
};

export type NewsletterEmailProps = {
	readonly data: NewsletterData;
	readonly siteUrl: string;
	/**
	The published web version, shown as "View in browser".
	*/
	readonly webUrl?: string;
	readonly unsubscribeUrl: string;
};

function Markdown({ source, style }: { readonly source: string; readonly style?: React.CSSProperties }) {
	return (
		<div
			style={{ fontFamily: font, ...style }}
			dangerouslySetInnerHTML={{ __html: emailMarkdown(source) }}
		/>
	);
}

function BlockView({ block }: { readonly block: Block }) {
	switch (block.type) {
		case "separator": {
			return block.title ? (
				<Section style={{ padding: "28px 32px 4px" }}>
					<Text
						style={{
							margin: 0,
							fontFamily: font,
							fontSize: "22px",
							lineHeight: "1.3",
							fontWeight: 700,
							color: colors.text,
						}}
					>
						{block.title}
					</Text>
					<Hr style={{ borderColor: colors.brand, borderTopWidth: "2px", width: "48px", margin: "12px 0 0" }} />
				</Section>
			) : (
				<Section style={{ padding: "16px 32px" }}>
					<Hr style={{ borderColor: colors.line, margin: 0 }} />
				</Section>
			);
		}

		case "subheading": {
			return (
				<Section style={{ padding: "20px 32px 0" }}>
					<Text
						style={{
							margin: 0,
							fontFamily: font,
							fontSize: "12px",
							fontWeight: 700,
							letterSpacing: "0.08em",
							textTransform: "uppercase",
							color: colors.brand,
						}}
					>
						{block.title}
					</Text>
				</Section>
			);
		}

		case "image": {
			return block.imageUrl ? (
				<Section style={{ padding: "16px 32px 0" }}>
					<Img
						src={block.imageUrl}
						alt={block.caption || "Newsletter image"}
						width="536"
						style={{ width: "100%", maxWidth: "536px", height: "auto", borderRadius: "10px" }}
					/>
					{block.caption ? (
						<Markdown
							source={block.caption}
							style={{ marginTop: "8px", fontSize: "13px", color: colors.muted }}
						/>
					) : null}
				</Section>
			) : null;
		}

		default: {
			return (
				<Section style={{ padding: "20px 32px 0" }}>
					{block.imageUrl ? (
						<Img
							src={block.imageUrl}
							alt={block.title || "Article image"}
							width="536"
							style={{
								width: "100%",
								maxWidth: "536px",
								height: "auto",
								borderRadius: "10px",
								marginBottom: "14px",
							}}
						/>
					) : null}
					{block.title ? (
						<Text
							style={{
								margin: "0 0 8px",
								fontFamily: font,
								fontSize: "18px",
								lineHeight: "1.35",
								fontWeight: 700,
								color: colors.text,
							}}
						>
							{block.title}
						</Text>
					) : null}
					{block.body ? <Markdown source={block.body} /> : null}
					{block.buttonUrl && block.buttonText ? (
						<Button
							href={block.buttonUrl}
							style={{
								backgroundColor: colors.brand,
								color: "#ffffff",
								fontFamily: font,
								fontSize: "14px",
								fontWeight: 600,
								borderRadius: "999px",
								padding: "10px 20px",
								textDecoration: "none",
							}}
						>
							{block.buttonText}
						</Button>
					) : null}
				</Section>
			);
		}
	}
}

/**
The email's content, also rendered inside the site for the web version.
*/
export function NewsletterContent({
	data,
	siteUrl,
	webUrl,
	unsubscribeUrl,
}: NewsletterEmailProps) {
	const socials = data.socialLinks.filter((social) => social.url);
	const links = data.footerLinks.filter((link) => link.label && link.url);
	return (
		<Container
			style={{
				width: "100%",
				maxWidth: "600px",
				margin: "0 auto",
				backgroundColor: colors.card,
				borderRadius: "16px",
				overflow: "hidden",
				border: `1px solid ${colors.line}`,
			}}
		>
			{webUrl ? (
				<Section style={{ padding: "12px 32px 0", textAlign: "right" }}>
					<Link href={webUrl} style={{ fontFamily: font, fontSize: "12px", color: colors.muted }}>
						View in browser
					</Link>
				</Section>
			) : null}
			<Section style={{ padding: webUrl ? "8px 32px 0" : "28px 32px 0" }}>
				<Row>
					{data.headerLogoUrl ? (
						<Column style={{ width: "52px", verticalAlign: "middle" }}>
							<Img
								src={data.headerLogoUrl}
								alt=""
								width="40"
								height="40"
								style={{ borderRadius: "8px" }}
							/>
						</Column>
					) : null}
					<Column style={{ verticalAlign: "middle" }}>
						<Text
							style={{
								margin: 0,
								fontFamily: font,
								fontSize: "16px",
								fontWeight: 700,
								letterSpacing: "0.08em",
								textTransform: "uppercase",
								color: colors.text,
							}}
						>
							{data.headerTitle}
						</Text>
						{data.headerSubtitle ? (
							<Text style={{ margin: "2px 0 0", fontFamily: font, fontSize: "12px", color: colors.muted }}>
								{data.headerSubtitle}
							</Text>
						) : null}
					</Column>
				</Row>
			</Section>
			<Section style={{ padding: "24px 32px 0" }}>
				{data.introHeading ? (
					<Text
						style={{
							margin: "0 0 12px",
							fontFamily: font,
							fontSize: "26px",
							lineHeight: "1.25",
							fontWeight: 700,
							color: colors.text,
						}}
					>
						{data.introHeading}
					</Text>
				) : null}
				{data.introText ? <Markdown source={data.introText} /> : null}
			</Section>
			{data.blocks.map((block) => (
				<BlockView key={block.id} block={block} />
			))}
			<Section style={{ padding: "32px 32px 0" }}>
				<Hr style={{ borderColor: colors.line, margin: 0 }} />
			</Section>
			{socials.length > 0 ? (
				<Section style={{ padding: "20px 32px 0", textAlign: "center" }}>
					{socials.map((social) => {
						const icon = socialIcon[social.platform];
						return (
							<Link
								key={`${social.platform}-${social.url}`}
								href={social.url}
								style={{ display: "inline-block", margin: "0 8px", verticalAlign: "middle" }}
							>
								<Img
									src={`${siteUrl}/brand/${icon.file}`}
									alt={icon.label}
									width={icon.width}
									style={{ height: "22px", width: "auto" }}
								/>
							</Link>
						);
					})}
				</Section>
			) : null}
			<Section style={{ padding: "16px 32px 28px", textAlign: "center" }}>
				{data.footerText ? (
					<Text style={{ margin: "0 0 8px", fontFamily: font, fontSize: "12px", lineHeight: "1.5", color: colors.muted }}>
						{data.footerText}
					</Text>
				) : null}
				<Text style={{ margin: 0, fontFamily: font, fontSize: "12px", lineHeight: "1.5", color: colors.muted }}>
					{links.map((link) => (
						<span key={`${link.label}-${link.url}`}>
							<Link href={link.url} style={{ color: colors.muted, textDecoration: "underline" }}>
								{link.label}
							</Link>
							{" · "}
						</span>
					))}
					{/* Always present; officers can't remove it. */}
					<Link href={unsubscribeUrl} style={{ color: colors.muted, textDecoration: "underline" }}>
						Unsubscribe
					</Link>
				</Text>
			</Section>
		</Container>
	);
}

export default function NewsletterEmail(props: NewsletterEmailProps) {
	return (
		<Html lang="en">
			<Head>
				<title>{props.data.introHeading || props.data.headerTitle}</title>
			</Head>
			{props.data.previewText ? <Preview>{props.data.previewText}</Preview> : null}
			<Body style={{ margin: 0, padding: "24px 12px", backgroundColor: colors.page, fontFamily: font }}>
				<NewsletterContent {...props} />
			</Body>
		</Html>
	);
}
