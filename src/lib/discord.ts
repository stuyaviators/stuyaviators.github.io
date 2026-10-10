/*
 * New-submission alerts to the officers' Discord channel via a webhook.
 * DISCORD_WEBHOOK_URL is a secret (anyone with it can post): env var only.
 * Mentions are disabled so submitted text can't ping @everyone, and email
 * addresses aren't included (officers see them in the dashboard).
 */

const labels: Record<string, string> = {
	contact: "Contact message",
	story: "Story submission",
	photo: "Photo submission",
	meeting_idea: "Meeting idea",
	mailing_list: "Mailing-list sign-up",
};

export async function notifyDiscord(
	submission: { type: string; name?: string | null; message?: string | null },
	fetcher: typeof fetch = fetch
): Promise<void> {
	const url = process.env.DISCORD_WEBHOOK_URL;
	if (!url) return;
	const site = process.env.NEXT_PUBLIC_SITE_URL ?? "https://stuyaviators.vercel.app";
	const preview = (submission.message ?? "").slice(0, 300);
	try {
		await fetcher(url, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				username: "StuyAviators website",
				allowed_mentions: { parse: [] },
				embeds: [
					{
						title: labels[submission.type] ?? "New submission",
						description: preview || undefined,
						color: 0x0b_64_a9,
						fields: submission.name
							? [{ name: "From", value: submission.name.slice(0, 100) }]
							: [],
						url: `${site}/dashboard/inbox`,
						timestamp: new Date().toISOString(),
					},
				],
			}),
			signal: AbortSignal.timeout(5000),
		});
	} catch {
		// Alerts are best-effort; the submission is already saved.
	}
}
