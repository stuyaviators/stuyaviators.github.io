"use client";

import type { MotionValue } from "motion/react";
import type { CSSProperties, ReactNode } from "react";
import type { CrewGroup, CrewMember, PartnerClub } from "@/content/crew";
import { cn } from "@/lib/cn";
import {
	motion,
	useReducedMotion,
	useScroll,
	useSpring,
	useTransform,
} from "motion/react";
import Image from "next/image";
import { useRef } from "react";
import { Initials } from "./ui/Initials.tsx";

/*
 * Flight Crew, top to bottom: Cockpit Crew, Leadership Team, Flight Crew,
 * Faculty Advisors, the Alliance of partner clubs, then past leadership &
 * crew. Each person swings in like the story timeline (from the side,
 * tilted, blurred, small), then floats gently and drifts at their own depth
 * as you scroll. Past members are faded and black and white until hovered.
 * Reduced motion: static layout.
 */
type Size = "lg" | "md" | "sm" | "past";

const avatarSize: Record<Size, string> = {
	lg: "size-28 sm:size-36",
	md: "size-24 sm:size-28",
	sm: "size-20 sm:size-24",
	past: "size-16 sm:size-20",
};

const imageSizes: Record<Size, string> = {
	lg: "144px",
	md: "112px",
	sm: "96px",
	past: "80px",
};

function displayName(member: CrewMember) {
	return member.classOf ? `${member.name} (${member.classOf})` : member.name;
}

function Avatar({
	member,
	size,
	isCurrent,
}: {
	readonly member: CrewMember;
	readonly size: Size;
	readonly isCurrent: boolean;
}) {
	return (
		<div className="relative">
			{isCurrent ? (
				<span
					aria-hidden
					className="absolute inset-0 -z-10 scale-110 rounded-full bg-brand/25 blur-xl"
				/>
			) : null}
			<div
				className={cn(
					"relative overflow-hidden rounded-full bg-surface-2",
					avatarSize[size],
					isCurrent && "ring-2 ring-brand/70 ring-offset-4 ring-offset-bg"
				)}
			>
				{member.photo ? (
					<Image
						src={member.photo}
						alt={`Portrait of ${member.name}`}
						fill
						placeholder="blur"
						sizes={imageSizes[size]}
						className="object-cover"
					/>
				) : (
					<Initials
						name={member.name}
						className={cn(
							"absolute inset-0",
							size === "past" ? "text-lg" : ""
						)}
					/>
				)}
			</div>
		</div>
	);
}

/**
One person: swings in on scroll, then floats and drifts at a depth.
*/
function FloatingMember({
	member,
	size,
	index,
	drift,
	isPast = false,
}: {
	readonly member: CrewMember;
	readonly size: Size;
	readonly index: number;
	readonly drift: MotionValue<number>;
	readonly isPast?: boolean;
}) {
	const ref = useRef<HTMLLIElement>(null);
	const isReducedMotion = useReducedMotion();
	const isFromLeft = index % 2 === 0;
	const { scrollYProgress } = useScroll({
		target: ref,
		offset: ["start end", "center 65%"],
	});
	const progress = useSpring(scrollYProgress, {
		stiffness: 140,
		damping: 22,
		mass: 0.4,
	});
	const x = useTransform(progress, [0, 1], [isFromLeft ? -110 : 110, 0]);
	const rotate = useTransform(progress, [0, 1], [isFromLeft ? -14 : 14, 0]);
	const scale = useTransform(progress, [0, 1], [0.6, 1]);
	const opacity = useTransform(progress, [0, 0.6], [0, 1]);
	const filter = useTransform(progress, [0, 0.8], ["blur(10px)", "blur(0px)"]);
	// Each person sits at their own depth, so a row parallaxes apart.
	const depth = ((index * 37) % 5) - 2;
	const y = useTransform(drift, [0, 1], [depth * 14, depth * -14]);
	const floatStyle: Record<string, string> = {
		"--float-d": `${5 + ((index * 13) % 4)}s`,
		"--float-delay": `${-((index * 7) % 5)}s`,
		"--float-rot": `${index % 2 === 0 ? 1.5 : -1.5}deg`,
	};

	return (
		<motion.li
			ref={ref}
			style={isReducedMotion ? undefined : { x, rotate, scale, opacity, filter }}
		>
			<motion.div style={isReducedMotion ? undefined : { y }}>
				<div
					className={cn(
						"float flex flex-col items-center text-center",
						isPast
							? "w-32 opacity-50 grayscale transition-[opacity,filter] duration-500 hover:opacity-100 hover:grayscale-0 sm:w-36"
							: "w-36 sm:w-44"
					)}
					style={floatStyle}
				>
					<Avatar member={member} size={size} isCurrent={!isPast} />
					<p
						className={cn(
							"mt-4 leading-snug font-semibold",
							isPast ? "text-sm" : ""
						)}
					>
						{displayName(member)}
					</p>
					<p className={cn("mt-0.5 text-muted", isPast ? "text-xs" : "text-sm")}>
						{member.role}
					</p>
				</div>
			</motion.div>
		</motion.li>
	);
}

function Tier({
	title,
	children,
}: {
	readonly title: string;
	readonly children: ReactNode;
}) {
	return (
		<div className="text-center">
			<h3 className="text-2xl sm:text-3xl">{title}</h3>
			<div className="mt-10">{children}</div>
		</div>
	);
}

function Row({
	members,
	size,
	drift,
	offset = 0,
	isPast = false,
}: {
	readonly members: CrewMember[];
	readonly size: Size;
	readonly drift: MotionValue<number>;
	readonly offset?: number;
	readonly isPast?: boolean;
}) {
	return (
		<ul className="flex flex-wrap justify-center gap-x-6 gap-y-10 sm:gap-x-10">
			{members.map((member, index) => (
				<FloatingMember
					key={member.name}
					member={member}
					size={size}
					index={index + offset}
					drift={drift}
					isPast={isPast}
				/>
			))}
		</ul>
	);
}

export default function CrewChart({
	groups,
	partners,
	allianceIntro,
	pastExtra = [],
}: {
	readonly groups: CrewGroup[];
	readonly partners: PartnerClub[];
	readonly allianceIntro: string;
	readonly pastExtra?: CrewMember[];
}) {
	const ref = useRef<HTMLDivElement>(null);
	const isReducedMotion = useReducedMotion();
	const { scrollYProgress: drift } = useScroll({
		target: ref,
		offset: ["start end", "end start"],
	});
	const group = (id: string) =>
		groups.find((item) => item.id === id)?.members ?? [];
	const past = [...group("past"), ...group("past-helpers"), ...pastExtra];

	return (
		<div ref={ref} className="space-y-24 sm:space-y-32">
			<Tier title="Cockpit Crew">
				<Row members={group("cockpit")} size="lg" drift={drift} />
			</Tier>
			<Tier title="Leadership Team">
				<Row members={group("officers")} size="md" drift={drift} offset={3} />
			</Tier>
			<Tier title="Flight Crew">
				<Row members={group("helpers")} size="sm" drift={drift} offset={5} />
			</Tier>
			<Tier title="Faculty Advisors">
				<Row members={group("advisors")} size="md" drift={drift} offset={6} />
			</Tier>
			<Tier title="Alliance">
				<p className="mx-auto -mt-4 mb-10 max-w-2xl text-lg text-muted">
					{allianceIntro}
				</p>
				<ul className="mx-auto grid max-w-3xl gap-6 sm:grid-cols-2">
					{partners.map((club, index) => (
						<motion.li
							key={club.name}
							className="flex items-center justify-center gap-4 rounded-3xl border border-hairline bg-surface p-6 sm:p-8"
							initial={
								isReducedMotion
									? false
									: { opacity: 0, y: 40, rotate: index % 2 === 0 ? -3 : 3 }
							}
							whileInView={{ opacity: 1, y: 0, rotate: 0 }}
							viewport={{ once: true, margin: "0px 0px -10% 0px" }}
							transition={{ type: "spring", stiffness: 160, damping: 20 }}
						>
							<Initials
								name={club.name}
								className="size-14 shrink-0 rounded-full text-lg"
							/>
							<div className="text-left">
								<p className="font-display text-xl font-semibold">
									{club.name}
								</p>
								<p className="label text-accent-text">Partnered club</p>
							</div>
						</motion.li>
					))}
				</ul>
			</Tier>
			<Tier title="Past Leadership & Crew">
				<Row isPast members={past} size="past" drift={drift} offset={8} />
			</Tier>
		</div>
	);
}
