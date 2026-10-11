import type { Metadata } from "next";
import {
	Badge,
	Card,
	formatWhen,
	Notice,
	PageHeader,
} from "@/components/dashboard/ui";
import CountUp from "@/components/motion/CountUp";
import { ButtonLink } from "@/components/ui/Button";
import { getDb } from "@/db";
import { envChecklist, sheetUrl } from "@/lib/dashboard-env";
import { getDashboardStats } from "@/lib/dashboard-stats";
import { getEpsilonStatus } from "@/lib/epsilon-token";
import { hasRole, requirePageUser } from "@/lib/session";
import { Check, ExternalLink, Minus } from "lucide-react";
import Link from "next/link";

// The layout's "- Dashboard" template skips pages in its own folder.
export const metadata: Metadata = {
	title: { absolute: "Overview - Dashboard" },
};

type SearchParameters = { denied?: string };

export default async function OverviewPage({
	searchParams,
}: {
	readonly searchParams: Promise<SearchParameters>;
}) {
	const user = await requirePageUser();
	const { denied } = await searchParams;
	const isAdmin = hasRole(user, "admin");
	const db = getDb();
	const [stats, epsilon] = await Promise.all([
		db ? getDashboardStats(db).catch(() => undefined) : undefined,
		db && isAdmin ? getEpsilonStatus(db).catch(() => undefined) : undefined,
	]);
	const checklist = envChecklist();
	const missing = checklist.filter((item) => item.isRequired && !item.isSet);
	const signup = sheetUrl("SIGNUP_SHEET_URL");

	const tiles = stats
		? [
				{
					label: "Opportunities",
					href: "/dashboard/opportunities",
					...stats.opportunities,
				},
				{
					label: "Scholarships",
					href: "/dashboard/scholarships",
					...stats.scholarships,
				},
				{
					label: "Newsletters",
					href: "/dashboard/newsletter",
					...stats.newsletters,
				},
			]
		: [];

	return (
		<>
			<PageHeader
				title={`Hi${user.name ? `, ${user.name.split(" ", 1)[0]}` : ""}`}
				description="Update what’s on the site. Changes to opportunities and scholarships show up on the public pages right away."
			/>

			{denied ? (
				<Notice tone="warn" className="mb-6">
					That page is for admins only.
				</Notice>
			) : null}

			{db ? null : (
				<Notice tone="bad" className="mb-6">
					The database isn’t connected, so there’s nothing to edit yet. Set{" "}
					<code>DATABASE_URL</code> (see the checklist below).
				</Notice>
			)}

			{tiles.length > 0 ? (
				<ul className="grid gap-4 sm:grid-cols-3">
					{tiles.map((tile) => (
						<li key={tile.label}>
							<Link
								href={tile.href}
								className="block rounded-2xl border border-hairline bg-surface p-5 transition-colors hover:border-brand"
							>
								<p className="label text-muted">{tile.label}</p>
								<p className="mt-2 text-4xl font-semibold">
									<CountUp value={tile.published} duration={0.9} />
								</p>
								<p className="text-sm text-muted">
									published
									{tile.draft > 0
										? ` · ${tile.draft} draft${tile.draft === 1 ? "" : "s"}`
										: ""}
								</p>
							</Link>
						</li>
					))}
				</ul>
			) : null}

			<div className="mt-6 grid gap-4 lg:grid-cols-2">
				<Card aria-labelledby="lists-heading">
					<h2 id="lists-heading" className="text-xl">
						Mailing lists
					</h2>
					<p className="mt-1 text-sm text-muted">
						Sign-ups land in a Google Sheet. See{" "}
						<code>docs/sending-newsletters.md</code> before sending.
					</p>
					<div className="mt-4 flex flex-wrap gap-2">
						{signup ? (
							<ButtonLink href={signup} variant="secondary">
								Sign-up Sheet <ExternalLink aria-hidden className="size-4" />
							</ButtonLink>
						) : (
							<Badge>SIGNUP_SHEET_URL not set</Badge>
						)}
					</div>
				</Card>

				{isAdmin ? (
					<Card aria-labelledby="epsilon-heading">
						<h2 id="epsilon-heading" className="text-xl">
							Epsilon meetings
						</h2>
						<p className="mt-2 text-sm">
							{epsilon?.state === "connected" ? (
								<>
									<Badge tone="good">Connected</Badge>{" "}
									<span className="text-muted">
										{epsilon.email ?? "officer account"}, refreshed{" "}
										{formatWhen(epsilon.refreshedAt)}
									</span>
								</>
							) : epsilon?.state === "error" ? (
								<>
									<Badge tone="bad">Needs a new token</Badge>{" "}
									<span className="text-muted">{epsilon.error}</span>
								</>
							) : epsilon?.envFallback ? (
								<>
									<Badge tone="warn">Using EPSILON_ACCESS_TOKEN</Badge>{" "}
									<span className="text-muted">expires about hourly</span>
								</>
							) : (
								<>
									<Badge>Not connected</Badge>{" "}
									<span className="text-muted">
										The departure board shows the manual list.
									</span>
								</>
							)}
						</p>
						<div className="mt-4">
							<ButtonLink href="/dashboard/settings" variant="secondary">
								Manage token
							</ButtonLink>
						</div>
					</Card>
				) : null}
			</div>

			<Card className="mt-6" aria-labelledby="setup-heading">
				<h2 id="setup-heading" className="text-xl">
					Setup checklist
				</h2>
				<p className="mt-1 text-sm text-muted">
					{missing.length === 0
						? "Everything required is set."
						: `${missing.length} required variable${missing.length === 1 ? " is" : "s are"} missing. Set them in .env.local, and in Vercel’s project settings for the live site.`}
				</p>
				<ul className="mt-4 divide-y divide-hairline">
					{checklist.map((item) => (
						<li key={item.name} className="flex items-start gap-3 py-2.5">
							{item.isSet ? (
								<Check
									aria-label="Set"
									className="mt-0.5 size-4 shrink-0 text-success"
								/>
							) : (
								<Minus
									aria-label={item.isRequired ? "Missing" : "Not set"}
									className={`mt-0.5 size-4 shrink-0 ${item.isRequired ? "text-danger" : "text-muted"}`}
								/>
							)}
							<div className="min-w-0">
								<code className="text-sm font-semibold">{item.name}</code>
								<p className="text-sm text-muted">
									{item.purpose}
									{item.isRequired ? "" : " (optional)"}
								</p>
							</div>
						</li>
					))}
				</ul>
			</Card>
		</>
	);
}
