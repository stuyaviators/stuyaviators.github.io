import type { Metadata } from "next";
import { ButtonLink } from "@/components/ui/Button";
import { Container } from "@/components/ui/Section";
import { site } from "@/content/site";
import { renderMarkdown } from "@/lib/markdown";
import { meetingStatusLabels, meetingTypes } from "@/lib/meeting-options";
import { dayFormat, meetingWhen, timeFormat } from "@/lib/meeting-when";
import { epsilonClubUrl, getMeeting } from "@/lib/meetings";
import { ArrowLeft, ArrowUpRight, CalendarPlus } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

export const revalidate = 900;

export async function generateMetadata({
	params,
}: {
	readonly params: Promise<{ id: string }>;
}): Promise<Metadata> {
	const { id } = await params;
	const meeting = await getMeeting(id);
	if (!meeting) {
		return { title: "Meeting not found", robots: { index: false } };
	}

	const start = new Date(meeting.start);
	return {
		title: meeting.title,
		description: `${dayFormat.format(start)}, ${timeFormat.format(start)}${
			meeting.room ? ` · Room ${meeting.room}` : ""
		}`,
		alternates: { canonical: `${site.url}/meetings/${meeting.id}` },
	};
}

export default async function MeetingPage({
	params,
}: {
	readonly params: Promise<{ id: string }>;
}) {
	const { id } = await params;
	const meeting = await getMeeting(id);
	if (!meeting) {
		notFound();
	}

	const start = new Date(meeting.start);
	const end = meeting.end ? new Date(meeting.end) : undefined;
	const { day, time } = meetingWhen(start, end);
	const isOver = (end ?? start) < new Date();
	const type = meetingTypes.find((item) => item.code === meeting.code);
	const facts = [
		{ label: "Date", value: day },
		{ label: "Time", value: time },
		{ label: "Room", value: meeting.room ?? "To be announced" },
		type ? { label: "Type", value: `${type.code} · ${type.name}` } : undefined,
	].filter((fact) => fact !== undefined);

	return (
		<Container className="pt-8 pb-16 sm:pb-24">
			<Link
				href="/meetings#upcoming"
				className="inline-flex min-h-11 items-center gap-1.5 text-sm font-semibold text-brand"
			>
				<ArrowLeft aria-hidden className="size-4" />
				All meetings
			</Link>
			<article className="mt-4 max-w-3xl">
				<p className="label text-accent-text">
					Meeting{meeting.code ? ` · ${meeting.code}` : ""}
				</p>
				<h1 className="mt-2 text-3xl sm:text-5xl">{meeting.title}</h1>
				{meeting.status === "scheduled" ? null : (
					<p className="label mt-4 inline-block rounded-sm bg-danger px-2 py-0.5 text-bg">
						{meetingStatusLabels[meeting.status]}
					</p>
				)}
				{isOver ? (
					<p className="mt-4 rounded-xl border border-hairline bg-surface-2 px-4 py-3 text-sm">
						This meeting has already happened. See the{" "}
						<Link
							href="/meetings#upcoming"
							className="font-semibold text-brand"
						>
							upcoming meetings
						</Link>
						.
					</p>
				) : null}
				<dl className="mt-6 grid gap-x-6 gap-y-4 rounded-2xl border border-hairline bg-surface p-5 sm:grid-cols-2">
					{facts.map((fact) => (
						<div key={fact.label}>
							<dt className="label text-muted">{fact.label}</dt>
							<dd className="mt-1 font-semibold">{fact.value}</dd>
						</div>
					))}
				</dl>
				{meeting.description ? (
					<div
						className="prose-club mt-8"
						dangerouslySetInnerHTML={{
							__html: renderMarkdown(meeting.description),
						}}
					/>
				) : null}
				<div className="mt-8 flex flex-wrap gap-3">
					{meeting.linkUrl ? (
						<ButtonLink href={meeting.linkUrl} variant="accent">
							{meeting.linkLabel ?? "More info"}
							<ArrowUpRight aria-hidden className="btn-arrow size-4" />
							<span className="sr-only">(opens in a new tab)</span>
						</ButtonLink>
					) : null}
					<ButtonLink
						external
						href={`/meetings/${meeting.id}/calendar.ics`}
						variant="secondary"
					>
						<CalendarPlus aria-hidden className="size-4" />
						Add to calendar
					</ButtonLink>
					{meeting.source === "epsilon" ? (
						<ButtonLink href={epsilonClubUrl()} variant="secondary">
							View on Epsilon
							<ArrowUpRight aria-hidden className="btn-arrow size-4" />
							<span className="sr-only">(opens in a new tab)</span>
						</ButtonLink>
					) : null}
				</div>
			</article>
		</Container>
	);
}
