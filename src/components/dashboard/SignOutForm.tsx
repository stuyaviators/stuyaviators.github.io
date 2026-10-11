"use client";

import { signOutAction } from "@/actions/auth";
import { Spinner } from "@/components/dashboard/Spinner";
import { Button } from "@/components/ui/Button";
import { LogOut } from "lucide-react";
import { useRef, useState } from "react";

const leaveMs = 380;

/**
Sign-out button: the whole dashboard fades away, then the sign-out runs.
*/
export default function SignOutForm({
	className,
}: {
	readonly className?: string;
}) {
	const form = useRef<HTMLFormElement>(null);
	const [isLeaving, setIsLeaving] = useState(false);

	function leave(event: React.MouseEvent) {
		if (isLeaving) {
			event.preventDefault();
			return;
		}

		event.preventDefault();
		setIsLeaving(true);
		const isReduced = globalThis.matchMedia(
			"(prefers-reduced-motion: reduce)"
		).matches;
		document.documentElement.classList.add("dash-leaving");
		setTimeout(
			() => {
				form.current?.requestSubmit();
			},
			isReduced ? 0 : leaveMs
		);
		// Still here a few seconds later means the sign-out didn't happen.
		setTimeout(() => {
			document.documentElement.classList.remove("dash-leaving");
			setIsLeaving(false);
		}, 8000);
	}

	return (
		<form ref={form} action={signOutAction} className={className}>
			<Button
				type="submit"
				variant="secondary"
				className="w-full"
				aria-busy={isLeaving}
				onClick={leave}
			>
				{isLeaving ? <Spinner /> : <LogOut aria-hidden className="size-4" />}
				{isLeaving ? "Signing out…" : "Sign out"}
			</Button>
		</form>
	);
}
