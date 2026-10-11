"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import {
	motion,
	useMotionTemplate,
	useMotionValue,
	useReducedMotion,
	useSpring,
} from "motion/react";

/**
Pointer-position 3D tilt with spring damping and a soft moving highlight.
Mouse/pen only; touch and reduced-motion users get a flat card.
*/
export default function TiltCard({
	children,
	className,
	max = 6,
}: {
	readonly children: ReactNode;
	readonly className?: string;
	readonly max?: number;
}) {
	const isReducedMotion = useReducedMotion();
	const rotateX = useSpring(0, { stiffness: 220, damping: 20 });
	const rotateY = useSpring(0, { stiffness: 220, damping: 20 });
	const glareX = useMotionValue(50);
	const glareY = useMotionValue(50);
	const glare = useMotionTemplate`radial-gradient(420px circle at ${glareX}% ${glareY}%, rgb(255 255 255 / 0.12), transparent 60%)`;

	return isReducedMotion ? (
		<div className={className}>{children}</div>
	) : (
		<motion.div
			className={cn("relative [transform-style:preserve-3d]", className)}
			style={{ rotateX, rotateY, transformPerspective: 900 }}
			whileHover={{ scale: 1.015 }}
			transition={{ type: "spring", stiffness: 260, damping: 22 }}
			onPointerMove={(event) => {
				if (event.pointerType === "touch") {
					return;
				}

				const rect = event.currentTarget.getBoundingClientRect();
				const px = (event.clientX - rect.left) / rect.width;
				const py = (event.clientY - rect.top) / rect.height;
				rotateY.set((px - 0.5) * 2 * max);
				rotateX.set((0.5 - py) * 2 * max);
				glareX.set(px * 100);
				glareY.set(py * 100);
			}}
			onPointerLeave={() => {
				rotateX.set(0);
				rotateY.set(0);
			}}
		>
			{children}
			<motion.div
				aria-hidden
				className="pointer-events-none absolute inset-0 rounded-[inherit]"
				style={{ background: glare }}
			/>
		</motion.div>
	);
}
