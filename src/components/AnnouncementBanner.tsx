"use client";

import type { Announcement } from "@/lib/announcement";
import { X } from "lucide-react";
import Link from "next/link";
import { useSyncExternalStore } from "react";

/*
 * The site-wide announcement. Pages are cached, so the end date is checked
 * here in the browser (New York time), and a dismissal is remembered per
 * message in localStorage: editing the text or link shows it again.
 */

const storageKey = "stuyaviators:dismissed-announcement";
const listeners = new Set<() => void>();

function subscribe(callback: () => void) {
	listeners.add(callback);
	return () => {
		listeners.delete(callback);
	};
}

function readDismissed() {
	try {
		return localStorage.getItem(storageKey) ?? "";
	} catch {
		return "";
	}
}

function dismiss(key: string) {
	try {
		localStorage.setItem(storageKey, key);
	} catch {
		// Private mode: it just comes back on the next visit.
	}

	for (const listener of listeners) {
		listener();
	}
}

const newYorkDay = new Intl.DateTimeFormat("en-CA", {
	timeZone: "America/New_York",
});

export function hasEnded(endsOn: string | undefined, now = new Date()) {
	return endsOn !== undefined && newYorkDay.format(now) > endsOn;
}

export default function AnnouncementBanner({
	announcement,
}: {
	readonly announcement: Announcement;
}) {
	const key = `${announcement.text}|${announcement.linkUrl}`;
	// The server and first client render show it; a dismissal hides it after.
	const dismissed = useSyncExternalStore(subscribe, readDismissed, () => "");
	if (dismissed === key || hasEnded(announcement.endsOn)) {
		return null;
	}

	const isExternal = announcement.linkUrl.startsWith("http");
	return (
		<div
			role="region"
			aria-label="Announcement"
			className="relative z-10 bg-brand px-12 py-2.5 text-center text-sm font-semibold text-brand-ink"
		>
			<span>{announcement.text}</span>
			{announcement.linkUrl === "" ? null : (
				<>
					{" "}
					<Link
						href={announcement.linkUrl}
						{...(isExternal
							? { target: "_blank", rel: "noopener noreferrer" }
							: {})}
						className="underline underline-offset-2 hover:no-underline"
					>
						{announcement.linkLabel}
					</Link>
				</>
			)}
			<button
				type="button"
				aria-label="Dismiss announcement"
				onClick={() => {
					dismiss(key);
				}}
				className="absolute inset-y-0 right-1 inline-flex min-w-11 items-center justify-center rounded-full hover:bg-black/10"
			>
				<X aria-hidden className="size-4" />
			</button>
		</div>
	);
}
