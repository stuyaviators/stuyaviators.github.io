"use client";

import { renderMarkdown } from "@/lib/markdown";
import { type NewsletterFormData } from "@/types/email-builder";

type PreviewRendererProps = {
	data: NewsletterFormData;
	onReorderArticles?: (fromIndex: number, toIndex: number) => void;
};

export const PreviewRenderer: React.FC<PreviewRendererProps> = ({ data }) => {
	return (
		<div
			className="preview-renderer-content"
			style={{
				fontFamily: "Arial, Helvetica, sans-serif",
				backgroundColor: "#11111b",
				color: "#cdd6f4",
				padding: "8px",
				minHeight: "400px",
			}}
		>
			<div
				style={{
					maxWidth: "600px",
					margin: "20px auto",
					padding: "16px",
					borderRadius: "16px",
					background:
						"linear-gradient(135deg, rgba(49, 50, 68, 0.75) 0%, rgba(30, 30, 46, 0.65) 50%, rgba(49, 50, 68, 0.55) 100%)",
					backdropFilter: "blur(20px)",
					border: "1px solid rgba(127, 132, 156, 0.6)",
					boxShadow:
						"0px 18px 38px rgba(0, 0, 0, 0.35), 0px 0px 24px rgba(127, 132, 156, 0.16)",
				}}
			>
				{/* Header */}
				<div
					style={{
						marginBottom: "20px",
						padding: "12px 16px",
						borderRadius: "12px",
						background:
							"linear-gradient(135deg, rgba(49, 50, 68, 0.75) 0%, rgba(30, 30, 46, 0.65) 50%, rgba(49, 50, 68, 0.55) 100%)",
						border: "1px solid rgba(127, 132, 156, 0.35)",
						display: "flex",
						alignItems: "center",
						justifyContent: "space-between",
					}}
				>
					<div style={{ display: "flex", alignItems: "center" }}>
						{data.headerLogoUrl && (
							<img
								src={data.headerLogoUrl}
								alt={data.headerTitle}
								style={{
									width: "40px",
									height: "40px",
									marginRight: "12px",
									borderRadius: "6px",
								}}
							/>
						)}
						<div>
							<div style={{ fontSize: "16px", fontWeight: "bold", margin: 0 }}>
								{data.headerTitle}
							</div>
							{data.headerSubtitle && (
								<div
									style={{
										fontSize: "11px",
										color: "#a6adc8",
										marginTop: "2px",
									}}
								>
									{data.headerSubtitle}
								</div>
							)}
						</div>
					</div>
				</div>

				{/* Intro Section */}
				<div
					style={{
						marginBottom: "20px",
						padding: "12px 16px",
						borderRadius: "12px",
						background:
							"linear-gradient(135deg, rgba(49, 50, 68, 0.75) 0%, rgba(30, 30, 46, 0.65) 50%, rgba(49, 50, 68, 0.55) 100%)",
						border: "1px solid rgba(127, 132, 156, 0.35)",
					}}
				>
					<h2
						style={{
							margin: "0 0 8px 0",
							fontSize: "20px",
							fontWeight: "700",
						}}
					>
						{data.introHeading}
					</h2>
					<div
						style={{ margin: 0, lineHeight: "1.5", fontSize: "13px" }}
						dangerouslySetInnerHTML={{
							__html: renderMarkdown(data.introText),
						}}
					/>
				</div>

				{/* Articles Section Divider */}
				{data.articles.length > 0 && (
					<div
						style={{
							margin: "24px 0",
							height: "1px",
							background: "rgba(127, 132, 156, 0.25)",
						}}
					/>
				)}

				{/* Articles */}
				{data.articles.map((article) => {
					if (article.type === "separator") {
						return (
							<div
								key={article.id}
								style={{
									position: "relative",
									margin: "24px 0",
									padding: "12px 0",
								}}
							>
								<h1
									style={{
										margin: 0,
										fontSize: "24px",
										fontWeight: 700,
										letterSpacing: "0.02em",
										color: "#cdd6f4",
									}}
								>
									{article.title ?? ""}
								</h1>
							</div>
						);
					}

					if (article.type === "subheading") {
						return (
							<div
								key={article.id}
								style={{
									position: "relative",
									margin: "20px 0",
									padding: "8px 12px",
									borderRadius: "10px",
									background:
										"linear-gradient(135deg, rgba(49, 50, 68, 0.65) 0%, rgba(30, 30, 46, 0.55) 100%)",
									border: "1px solid rgba(127, 132, 156, 0.35)",
								}}
							>
								<h2
									style={{
										margin: 0,
										fontSize: "14px",
										fontWeight: 700,
										letterSpacing: "0.08em",
										textTransform: "uppercase",
										color: "#a6adc8",
									}}
								>
									{article.title ?? ""}
								</h2>
							</div>
						);
					}

					if (article.type === "image") {
						return (
							<div
								key={article.id}
								style={{
									position: "relative",
									marginBottom: "20px",
									padding: "12px 16px",
									borderRadius: "12px",
									background:
										"linear-gradient(135deg, rgba(49, 50, 68, 0.75) 0%, rgba(30, 30, 46, 0.65) 50%, rgba(49, 50, 68, 0.55) 100%)",
									border: "1px solid rgba(127, 132, 156, 0.35)",
								}}
							>
								{article.imageUrl && (
									<img
										src={article.imageUrl}
										alt={article.description ?? "Image"}
										style={{
											width: "100%",
											height: "auto",
											borderRadius: "8px",
											display: "block",
											marginBottom: article.description ? "12px" : 0,
										}}
									/>
								)}
								{article.description && (
									<div
										style={{
											fontSize: "13px",
											color: "#a6adc8",
											fontStyle: "italic",
											lineHeight: "1.5",
										}}
										dangerouslySetInnerHTML={{
											__html: renderMarkdown(article.description ?? ""),
										}}
									/>
								)}
							</div>
						);
					}

					return (
						<div
							key={article.id}
							style={{
								position: "relative",
								marginBottom: "20px",
								padding: "12px 16px",
								borderRadius: "12px",
								background:
									"linear-gradient(135deg, rgba(49, 50, 68, 0.75) 0%, rgba(30, 30, 46, 0.65) 50%, rgba(49, 50, 68, 0.55) 100%)",
								border: "1px solid rgba(127, 132, 156, 0.35)",
							}}
						>
							{article.imageUrl && (
								<img
									src={article.imageUrl}
									alt={article.title ?? "Article image"}
									style={{
										width: "100%",
										borderRadius: "8px",
										marginBottom: "12px",
										display: "block",
										maxHeight: "200px",
										objectFit: "cover",
									}}
								/>
							)}
							{article.title && (
								<h3
									style={{
										margin: "0 0 8px 0",
										fontSize: "18px",
										fontWeight: "600",
									}}
								>
									{article.title}
								</h3>
							)}
							{article.description && (
								<div
									style={{
										margin: "0 0 12px 0",
										lineHeight: "1.6",
										fontSize: "14px",
									}}
									dangerouslySetInnerHTML={{
										__html: renderMarkdown(article.description ?? ""),
									}}
								/>
							)}
							{article.buttonUrl && article.buttonText && (
								<a
									href={article.buttonUrl}
									style={{
										display: "inline-block",
										padding: "6px 10px",
										borderRadius: "8px",
										background:
											"linear-gradient(135deg, rgba(127, 132, 156, 0.20) 0%, rgba(127, 132, 156, 0.14) 100%)",
										border: "1px solid rgba(127, 132, 156, 0.45)",
										color: "#cdd6f4",
										fontSize: "12px",
										fontWeight: "600",
										textDecoration: "none",
									}}
								>
									{article.buttonText}
								</a>
							)}
						</div>
					);
				})}

				{/* Footer Divider */}
				<div
					style={{
						margin: "32px 0 24px 0",
						height: "1px",
						background: "rgba(127, 132, 156, 0.25)",
					}}
				/>

				{/* Social Icons */}

				{(() => {
					const items = data.socialLinks.filter((s) => s.platform && s.url);
					const epsilonUrl = `https://stuyaviators.vercel.app/epsilon-wordmark.png`;
					{
						/* This is the only way you can align it btw (i think) */
					}

					return (
						<table
							role="presentation"
							style={{
								width: "100%",
								borderCollapse: "collapse",
								marginBottom: 24,
							}}
						>
							<tbody>
								<tr>
									<td style={{ textAlign: "center" }}>
										<table
											role="presentation"
											style={{
												display: "inline-table",
												borderCollapse: "collapse",
											}}
										>
											<tbody>
												<tr>
													{items.map((social, index) => {
														const platform = social.platform
															.trim()
															.toLowerCase();
														const slug = platform.replaceAll(/\s+/g, "");
														const isEpsilon = platform === "epsilon";
														const href =
															platform === "gmail" || platform === "email"
																? `mailto:${social.url}`
																: social.url;
														const iconUrl = isEpsilon
															? epsilonUrl
															: `https://stuyaviators.vercel.app/${slug}.png`;

														return (
															<td
																key={`item-${index}`}
																style={{
																	padding: "0 8px",
																	verticalAlign: "middle",
																}}
															>
																<a
																	href={href}
																	title={social.platform}
																	style={{
																		display: "inline-flex",
																		alignItems: "center",
																		lineHeight: 0,
																	}}
																>
																	<img
																		src={iconUrl}
																		alt={social.platform}
																		style={{
																			display: "block",
																			height: 20,
																			width: "auto",
																			border: 0,
																		}}
																	/>

																	{isEpsilon && index < items.length - 1 && (
																		<span
																			style={{
																				display: "inline-block",
																				width: 1,
																				height: 20,
																				backgroundColor:
																					"rgba(166, 173, 200, 0.3)",
																				marginLeft: 8,
																				verticalAlign: "middle",
																			}}
																		/>
																	)}
																</a>
															</td>
														);
													})}
												</tr>
											</tbody>
										</table>
									</td>
								</tr>
							</tbody>
						</table>
					);
				})()}

				{/* Footer */}
				<div
					style={{
						fontSize: "12px",
						textAlign: "center",
						color: "#a6adc8",
						lineHeight: "1.5",
					}}
				>
					<p style={{ margin: "0 0 12px 0" }}>{data.footerText}</p>
					<div style={{ fontSize: "11px", color: "#7f849c" }}>
						{data.footerLinks.map((link, index) => (
							<span key={link.label}>
								{index > 0 && " | "}
								<a
									href={link.url}
									style={{
										color: "#a6adc8",
										textDecoration: "underline",
									}}
								>
									{link.label}
								</a>
							</span>
						))}
					</div>
				</div>
			</div>
		</div>
	);
};
