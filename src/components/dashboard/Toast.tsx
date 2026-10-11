"use client";

import { cn } from "@/lib/cn";
import { CheckCircle2, Info, TriangleAlert, X } from "lucide-react";
import {
	createContext,
	useCallback,
	useContext,
	useMemo,
	useRef,
	useState,
} from "react";

/*
 * The pop-up messages in the corner of the dashboard: "Saved", "Deleted
 * “Summer camp”", or what went wrong. They live in the dashboard layout, so
 * one shown just before moving to another page (saving a card sends you back
 * to the list) stays on screen.
 */

type Tone = "good" | "bad" | "neutral";
type ToastItem = { id: number; message: string; tone: Tone };

const showMs: Record<Tone, number> = { good: 4500, neutral: 4500, bad: 8000 };
const maxVisible = 4;

const ToastContext = createContext<{
	toast: (message: string, tone?: Tone) => void;
}>({
	toast() {
		// Outside the dashboard there is nowhere to show it.
	},
});

export function useToast() {
	return useContext(ToastContext);
}

const icons = {
	good: CheckCircle2,
	bad: TriangleAlert,
	neutral: Info,
} as const;

const toneClasses: Record<Tone, string> = {
	good: "border-success/60",
	bad: "border-danger/70",
	neutral: "border-hairline",
};

const iconClasses: Record<Tone, string> = {
	good: "text-success",
	bad: "text-danger",
	neutral: "text-brand",
};

export function ToastProvider({
	children,
}: {
	readonly children: React.ReactNode;
}) {
	const [items, setItems] = useState<ToastItem[]>([]);
	const nextId = useRef(1);

	const dismiss = useCallback((id: number) => {
		setItems((current) => current.filter((item) => item.id !== id));
	}, []);

	const toast = useCallback(
		(message: string, tone: Tone = "good") => {
			const id = nextId.current++;
			setItems((current) =>
				[...current, { id, message, tone }].slice(-maxVisible)
			);
			setTimeout(() => {
				dismiss(id);
			}, showMs[tone]);
		},
		[dismiss]
	);

	const value = useMemo(() => ({ toast }), [toast]);

	return (
		<ToastContext.Provider value={value}>
			{children}
			<div
				role="region"
				aria-label="Notifications"
				className="pointer-events-none fixed inset-x-4 bottom-4 z-[60] flex flex-col items-stretch gap-2 sm:inset-x-auto sm:right-6 sm:bottom-6 sm:w-96"
			>
				{items.map((item) => {
					const Icon = icons[item.tone];
					return (
						<div
							key={item.id}
							role={item.tone === "bad" ? "alert" : "status"}
							className={cn(
								"dash-pop pointer-events-auto flex items-start gap-3 rounded-2xl border bg-surface px-4 py-3 text-sm shadow-card",
								toneClasses[item.tone]
							)}
						>
							<Icon
								aria-hidden
								className={cn("mt-0.5 size-5 shrink-0", iconClasses[item.tone])}
							/>
							<p className="min-w-0 flex-1 font-medium break-words">
								{item.message}
							</p>
							<button
								type="button"
								aria-label="Dismiss"
								className="-m-1 inline-flex size-8 shrink-0 items-center justify-center rounded-full text-muted transition-colors hover:bg-surface-2 hover:text-text"
								onClick={() => {
									dismiss(item.id);
								}}
							>
								<X aria-hidden className="size-4" />
							</button>
						</div>
					);
				})}
			</div>
		</ToastContext.Provider>
	);
}
