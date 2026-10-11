import type { Meeting } from "@/lib/meetings";
import Link from "next/link";

/*
 * Split-flap style departure board for upcoming meetings. Characters flip in
 * once via CSS (disabled under prefers-reduced-motion). Falls back to the
 * charter's regular schedule when no meetings are scheduled.
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

export default function DepartureBoard({
	meetings,
	showAllLink = true,
}: {
	readonly meetings: Meeting[];
	readonly showAllLink?: boolean;
}) {
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
						<th
							scope="col"
							className="px-4 py-2 text-right font-normal sm:px-6"
						>
							Status
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
										className={`px-4 py-3 text-right whitespace-nowrap sm:px-6 ${meeting.status === "scheduled" ? "" : "text-[#ff8a80]"}`}
									>
										{statusLabel[meeting.status].toUpperCase()}
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
							<td className="px-4 py-4 text-right text-board-dim sm:px-6">
								SEE DISCORD
							</td>
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
					<Link
						href="/meetings"
						className="label underline underline-offset-4"
					>
						All meetings →
					</Link>
				</div>
			) : null}
		</div>
	);
}
