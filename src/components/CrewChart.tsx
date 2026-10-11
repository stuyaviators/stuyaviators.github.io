"use client";

import type { CrewGroup, CrewMember } from "@/content/crew";
import { cn } from "@/lib/cn";
import { motion, useReducedMotion } from "motion/react";
import Image from "next/image";
import { Initials } from "./ui/Initials.tsx";

/*
 * Flight Crew org chart: current leadership in a centered, animated
 * hierarchy (advisors → captains → first officer → officers → crew), with
 * tiers popping in and connector lines drawing down as you scroll. Past
 * leadership flanks the chart in faded black and white, coming back to
 * color on hover.
 */
type Tier = { label: string; members: CrewMember[]; size: "lg" | "md" | "sm" };

const ease = [0.16, 1, 0.3, 1] as const;

const avatarSize = {
	lg: "size-32 sm:size-40",
	md: "size-24 sm:size-28",
	sm: "size-20 sm:size-24",
	past: "size-14",
};

function Avatar({
	member,
	size,
	sizes,
	className,
}: {
	readonly member: CrewMember;
	readonly size: keyof typeof avatarSize;
	readonly sizes: string;
	readonly className?: string;
}) {
	return (
		<div
			className={cn(
				"relative shrink-0 overflow-hidden rounded-full bg-surface-2",
				avatarSize[size],
				className
			)}
		>
			{member.photo ? (
				<Image
					src={member.photo}
					alt={`Portrait of ${member.name}`}
					fill
					placeholder="blur"
					sizes={sizes}
					className="object-cover"
				/>
			) : (
				<Initials
					name={member.name}
					className={cn("absolute inset-0", size === "past" ? "text-base" : "")}
				/>
			)}
		</div>
	);
}

function displayName(member: CrewMember) {
	return member.classOf ? `${member.name} (${member.classOf})` : member.name;
}

function Connector({ isDashed = false }: { readonly isDashed?: boolean }) {
	const isReducedMotion = useReducedMotion();
	return (
		<motion.div
			aria-hidden
			className={cn(
				"mx-auto h-12 w-0 origin-top border-l-2 sm:h-16",
				isDashed ? "border-dashed border-field" : "border-brand"
			)}
			initial={isReducedMotion ? false : { scaleY: 0 }}
			whileInView={{ scaleY: 1 }}
			viewport={{ once: true, margin: "0px 0px -20% 0px" }}
			transition={{ duration: 0.7, ease }}
		/>
	);
}

function TierRow({ tier }: { readonly tier: Tier }) {
	const isReducedMotion = useReducedMotion();
	const sizes =
		tier.size === "lg" ? "160px" : tier.size === "md" ? "112px" : "96px";
	return (
		<div className="text-center">
			<p className="label text-accent-text">{tier.label}</p>
			<ul className="mt-5 flex flex-wrap justify-center gap-x-8 gap-y-6 sm:gap-x-12">
				{tier.members.map((member, index) => (
					<motion.li
						key={member.name}
						className="group flex w-40 flex-col items-center sm:w-48"
						initial={isReducedMotion ? false : { opacity: 0, scale: 0.6, y: 24 }}
						whileInView={{ opacity: 1, scale: 1, y: 0 }}
						viewport={{ once: true, margin: "0px 0px -15% 0px" }}
						transition={{
							type: "spring",
							stiffness: 260,
							damping: 22,
							delay: 0.12 * index,
						}}
					>
						<Avatar
							member={member}
							size={tier.size}
							sizes={sizes}
							className="ring-4 ring-brand/80 ring-offset-4 ring-offset-bg transition-transform duration-500 group-hover:scale-105 motion-reduce:transition-none"
						/>
						<p className="mt-4 leading-snug font-semibold">
							{displayName(member)}
						</p>
						<p className="mt-1 text-sm text-muted">{member.role}</p>
					</motion.li>
				))}
			</ul>
		</div>
	);
}

function PastColumn({
	title,
	members,
	side,
}: {
	readonly title: string;
	readonly members: CrewMember[];
	readonly side: "left" | "right";
}) {
	const isReducedMotion = useReducedMotion();
	return (
		<div>
			<p
				className={cn(
					"label text-muted",
					side === "right" ? "lg:text-right" : ""
				)}
			>
				{title}
			</p>
			<ul className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-1">
				{members.map((member, index) => (
					<motion.li
						key={member.name}
						initial={
							isReducedMotion
								? false
								: { opacity: 0, x: side === "left" ? -32 : 32 }
						}
						whileInView={{ opacity: 1, x: 0 }}
						viewport={{ once: true, margin: "0px 0px -10% 0px" }}
						transition={{ duration: 0.6, delay: 0.06 * index, ease }}
					>
						<div
							className={cn(
								"flex items-center gap-3 opacity-50 grayscale transition-[opacity,filter] duration-500 hover:opacity-100 hover:grayscale-0",
								side === "right" && "lg:flex-row-reverse lg:text-right"
							)}
						>
							<Avatar member={member} size="past" sizes="56px" />
							<span className="min-w-0">
								<span className="block text-sm leading-snug font-semibold">
									{displayName(member)}
								</span>
								<span className="block text-xs text-muted">
									{member.role}
								</span>
							</span>
						</div>
					</motion.li>
				))}
			</ul>
		</div>
	);
}

export default function CrewChart({
	groups,
}: {
	readonly groups: CrewGroup[];
}) {
	const group = (id: string) =>
		groups.find((item) => item.id === id)?.members ?? [];
	const current = group("current");
	const captains = current.filter((m) => m.role.startsWith("Captain"));
	const firstOfficers = current.filter((m) =>
		m.role.startsWith("First Officer")
	);
	const officers = current.filter(
		(m) => !captains.includes(m) && !firstOfficers.includes(m)
	);

	const tiers: Tier[] = [
		{ label: "Faculty advisors", members: group("advisors"), size: "sm" },
		{ label: "Captains", members: captains, size: "lg" },
		{ label: "First officer", members: firstOfficers, size: "md" },
		{ label: "Officers", members: officers, size: "md" },
		{ label: "Crew", members: group("helpers"), size: "sm" },
	].filter((tier): tier is Tier => tier.members.length > 0);

	const past = group("past");
	const half = Math.ceil(past.length / 2);
	const leftPast = past.slice(0, half);
	const rightPast = [
		...past.slice(half),
		...group("past-helpers"),
		...group("alliance"),
	];

	return (
		<div className="grid gap-16 lg:grid-cols-[13rem_1fr_13rem] lg:gap-8">
			<div className="order-2 lg:order-1 lg:pt-10">
				<PastColumn title="Past leadership" members={leftPast} side="left" />
			</div>
			<div className="order-1 lg:order-2">
				{tiers.map((tier, index) => (
					<div key={tier.label}>
						{index > 0 ? (
							<Connector isDashed={index === 1 || tier.label === "Crew"} />
						) : null}
						<TierRow tier={tier} />
					</div>
				))}
			</div>
			<div className="order-3 lg:pt-10">
				<PastColumn
					title="Past crew & alliance"
					members={rightPast}
					side="right"
				/>
			</div>
		</div>
	);
}
