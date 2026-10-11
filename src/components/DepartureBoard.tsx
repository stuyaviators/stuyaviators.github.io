import type { Meeting } from "@/lib/meetings";
import { epsilonClubUrl } from "@/lib/meetings";
import Link from "next/link";

/*
 * Split-flap style departure board for upcoming meetings. Characters flip in
 * once via CSS (disabled under prefers-reduced-motion). Each meeting has a
 * "View on Epsilon" button. When Epsilon can't be read (no working token) the
 * board says it is down and points to Epsilon; when it can be read but nothing
 * is scheduled it shows the charter's regular schedule.
 */
const timeFormat = new Intl.DateTimeFormat("en-US", {
	timeZone: "America/New_York",
	hour: "2-digit",
	minute: "2-digit",
	hour12: false,
});
const dateFormat = new Intl.DateTimeFormat("en-US", {
	timeZone: "America/New_York",
	weekday: "short",
	day: "2-digit",
	month: "short",
});

function Flap({
	text,
	className,
}: {
	readonly text: string;
	readonly className?: string;
}) {
	// Characters flip individually, but words stay together when wrapping.
	let index = 0;
	return (
		<span className={className} aria-label={text}>
			{text
				.toUpperCase()
				.split(" ")
				.map((word, wordIndex) => (
					<span key={`${word}-${wordIndex}`} aria-hidden>
						{wordIndex > 0 ? " " : null}
						<span className="whitespace-nowrap">
							{[...word].map((char) => {
								const i = index++;
								return (
									<span
										key={i}
										className="flap"
										style={{ "--flap-i": i } as React.CSSProperties}
									>
										{char}
									</span>
								);
							})}
						</span>
					</span>
				))}
		</span>
	);
}

const statusLabel: Record<Meeting["status"], string> = {
	scheduled: "On time",
	cancelled: "Cancelled",
	moved: "Moved",
};

const epsilonButton =
	"label inline-flex items-center gap-1 rounded-full border border-board-line px-3 py-1 text-board-text transition-colors hover:border-board-text";

export default function DepartureBoard({
	meetings,
	status = "up",
	showAllLink = true,
}: {
	readonly meetings: Meeting[];
	// "down" when Epsilon can't be read: shows the notice instead of meetings.
	readonly status?: "up" | "down";
	readonly showAllLink?: boolean;
}) {
	const epsilonUrl = epsilonClubUrl();
	if (status === "down") {
		return (
			<div className="overflow-hidden rounded-2xl border border-board-line bg-board-bg font-mono text-board-text shadow-card">
				<div className="flex items-center justify-between border-b border-board-line px-4 py-3 sm:px-6">
					<p className="label font-bold">Departures</p>
					<p className="label text-[#ff8a80]">Board down</p>
				</div>
				<div role="status" className="px-4 py-6 sm:px-6 sm:py-8">
					<p className="text-lg sm:text-2xl">
						<Flap text="Board is down" />
					</p>
					<p className="mt-3 max-w-xl text-board-dim">
						We can’t load the meeting times right now. Check Epsilon for more
						information, or ask on Discord.
					</p>
					<a
						href={epsilonUrl}
						target="_blank"
						rel="noopener noreferrer"
						className={`${epsilonButton} mt-5`}
					>
						Check Epsilon <span aria-hidden>↗</span>
						<span className="sr-only">(opens in a new tab)</span>
					</a>
				</div>
			</div>
		);
	}

	return (
		<div className="overflow-hidden rounded-2xl border border-board-line bg-board-bg font-mono text-board-text shadow-card">
			<div className="flex items-center justify-between border-b border-board-line px-4 py-3 sm:px-6">
				<p className="label font-bold">Departures</p>
				<p className="label text-board-dim">Stuyvesant HS · NYC</p>
			</div>
			<table className="hidden w-full text-left text-sm sm:table sm:text-base">
				<caption className="sr-only">Upcoming StuyAviators meetings</caption>
				<thead className="label text-[0.68rem] text-board-dim">
					<tr>
						<th scope="col" className="px-4 py-2 font-normal sm:px-6">
							Time
						</th>
						<th scope="col" className="px-2 py-2 font-normal">
							Date
						</th>
						<th scope="col" className="px-2 py-2 font-normal">
							Meeting
						</th>
						<th
							scope="col"
							className="hidden px-2 py-2 font-normal sm:table-cell"
						>
							Room
						</th>
						<th scope="col" className="px-2 py-2 text-right font-normal">
							Status
						</th>
						<th
							scope="col"
							className="px-4 py-2 text-right font-normal sm:px-6"
						>
							Details
						</th>
					</tr>
				</thead>
				<tbody>
					{meetings.length > 0 ? (
						meetings.map((meeting) => {
							const start = new Date(meeting.start);
							return (
								<tr key={meeting.id} className="border-t border-board-line">
									<td className="px-4 py-3 sm:px-6">
										<Flap text={timeFormat.format(start)} />
									</td>
									<td className="px-2 py-3 whitespace-nowrap">
										<Flap text={dateFormat.format(start).replace(",", "")} />
									</td>
									<td className="px-2 py-3">
										{meeting.code ? (
											<span className="mr-2 text-board-dim">
												{meeting.code}
											</span>
										) : null}
										<Flap text={meeting.title} />
									</td>
									<td className="hidden px-2 py-3 sm:table-cell">
										{meeting.room ?? "TBA"}
									</td>
									<td
										className={`px-2 py-3 text-right whitespace-nowrap ${meeting.status === "scheduled" ? "" : "text-[#ff8a80]"}`}
									>
										{statusLabel[meeting.status].toUpperCase()}
									</td>
									<td className="px-4 py-3 text-right whitespace-nowrap sm:px-6">
										<a
											href={epsilonUrl}
											target="_blank"
											rel="noopener noreferrer"
											aria-label={`View ${meeting.title} on Epsilon (opens in a new tab)`}
											className={epsilonButton}
										>
											View on Epsilon <span aria-hidden>↗</span>
										</a>
									</td>
								</tr>
							);
						})
					) : (
						<tr className="border-t border-board-line">
							<td className="px-4 py-4 sm:px-6">
								<Flap text="After school" />
							</td>
							<td className="px-2 py-4">
								<Flap text="Wed–Fri" />
							</td>
							<td className="px-2 py-4">
								<Flap text="Regular meetings" />
							</td>
							<td className="hidden px-2 py-4 sm:table-cell">TBA</td>
							<td className="px-2 py-4 text-right text-board-dim">
								SEE DISCORD
							</td>
							<td className="px-4 py-4 sm:px-6" />
						</tr>
					)}
				</tbody>
			</table>
			<ul
				className="divide-y divide-board-line sm:hidden"
				aria-label="Upcoming StuyAviators meetings"
			>
				{meetings.length > 0 ? (
					meetings.map((meeting) => {
						const start = new Date(meeting.start);
						return (
							<li key={meeting.id} className="px-4 py-3">
								<div className="flex items-baseline justify-between gap-3 text-sm">
									<span>
										<Flap text={timeFormat.format(start)} />{" "}
										<span className="text-board-dim">·</span>{" "}
										<Flap text={dateFormat.format(start).replace(",", "")} />
									</span>
									<span
										className={
											meeting.status === "scheduled"
												? "text-board-dim"
												: "text-[#ff8a80]"
										}
									>
										{statusLabel[meeting.status].toUpperCase()}
									</span>
								</div>
								<p className="mt-1">
									{meeting.code ? (
										<span className="mr-2 text-board-dim">{meeting.code}</span>
									) : null}
									<Flap text={meeting.title} />
								</p>
								<p className="label mt-1 text-board-dim">
									Room {meeting.room ?? "TBA"}
								</p>
								<a
									href={epsilonUrl}
									target="_blank"
									rel="noopener noreferrer"
									aria-label={`View ${meeting.title} on Epsilon (opens in a new tab)`}
									className={`${epsilonButton} mt-3`}
								>
									View on Epsilon <span aria-hidden>↗</span>
								</a>
							</li>
						);
					})
				) : (
					<li className="px-4 py-4 text-sm">
						<p>
							<Flap text="Wed–Fri · after school" />
						</p>
						<p className="mt-1 text-board-dim">
							REGULAR MEETINGS · SEE DISCORD
						</p>
					</li>
				)}
			</ul>
			{showAllLink ? (
				<div className="flex flex-wrap justify-between gap-2 border-t border-board-line px-4 py-3 text-sm sm:px-6">
					<p className="text-board-dim">
						{meetings.length > 0
							? "Times shown in New York time."
							: "Meetings run until 5:00 PM. Exact dates are posted on Discord and Epsilon."}
					</p>
					<Link href="/meetings" className="label underline underline-offset-4">
						All meetings →
					</Link>
				</div>
			) : null}
		</div>
	);
}
