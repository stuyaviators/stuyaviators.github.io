/*
 * The club meets in New York, so the dashboard's date and time boxes are New
 * York wall-clock time whatever time zone the officer's computer is in. These
 * convert between that and the exact instants stored in the database.
 */

const zone = "America/New_York";
const wallClock =
	/^(?<y>\d{4})-(?<mo>\d{2})-(?<d>\d{2})T(?<h>\d{2}):(?<mi>\d{2})$/u;

const parts = new Intl.DateTimeFormat("en-US", {
	timeZone: zone,
	hourCycle: "h23",
	year: "numeric",
	month: "2-digit",
	day: "2-digit",
	hour: "2-digit",
	minute: "2-digit",
});

function wallParts(instant: Date) {
	const found: Record<string, string> = {};
	for (const part of parts.formatToParts(instant)) {
		found[part.type] = part.value;
	}

	return {
		y: found.year ?? "",
		mo: found.month ?? "",
		d: found.day ?? "",
		h: found.hour ?? "",
		mi: found.minute ?? "",
	};
}

/**
The instant for "2026-10-12T15:30" read as New York time, or undefined when it
isn't a real date and time (a skipped hour at the spring clock change counts
as not real).
*/
export function newYorkToInstant(value: string): Date | undefined {
	const match = wallClock.exec(value.trim());
	const found = match?.groups;
	if (!found) {
		return undefined;
	}

	const asIfUtc = Date.UTC(
		Number(found.y),
		Number(found.mo) - 1,
		Number(found.d),
		Number(found.h),
		Number(found.mi)
	);
	// New York is 4 or 5 hours behind UTC; try both and keep the one that
	// reads back as the same wall-clock time.
	for (const hours of [4, 5]) {
		const candidate = new Date(asIfUtc + hours * 60 * 60 * 1000);
		const back = wallParts(candidate);
		if (
			back.y === found.y &&
			back.mo === found.mo &&
			back.d === found.d &&
			back.h === found.h &&
			back.mi === found.mi
		) {
			return candidate;
		}
	}

	return undefined;
}

/**
The "2026-10-12T15:30" text for a date and time box, in New York time.
*/
export function instantToNewYork(instant: Date): string {
	const p = wallParts(instant);
	return `${p.y}-${p.mo}-${p.d}T${p.h}:${p.mi}`;
}
