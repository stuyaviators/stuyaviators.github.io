import type { StaticImageData } from "next/image";
import alexanderSmelyansky from "@/assets/crew/alexander-smelyansky.jpg";
import allysonWin from "@/assets/crew/allyson-win.jpg";
import andrewZhang from "@/assets/crew/andrew-zhang.jpg";
import chloeTam from "@/assets/crew/chloe-tam.jpg";
import estherLee from "@/assets/crew/esther-lee.jpg";
import evanYe from "@/assets/crew/evan-ye.jpg";
import florenceWu from "@/assets/crew/florence-wu.jpg";
import jamesDillon from "@/assets/crew/james-dillon.jpg";
import jerryQiu from "@/assets/crew/jerry-qiu.jpg";
import matthewKarp from "@/assets/crew/matthew-karp.jpg";
import matthewLin from "@/assets/crew/matthew-lin.jpg";
import stevenWu from "@/assets/crew/steven-wu.jpg";
import williamVongphanith from "@/assets/crew/william-vongphanith.jpg";
import yunusGubrud from "@/assets/crew/yunus-gubrud.jpg";

/*
 * 2026–27 roster, matching officer roles on Epsilon. The class of 2026 and
 * former officers moved to the past sections. Becomes dashboard-managed in
 * Phase 4. People without a supplied photo get an initials placeholder.
 */
export type CrewMember = {
	name: string;
	classOf?: string;
	role: string;
	photo?: StaticImageData;
};

export type CrewGroup = {
	id: string;
	title: string;
	introKey?: "current" | "past" | "advisors" | "helpers" | "alliance";
	members: CrewMember[];
};

export const crewGroups: CrewGroup[] = [
	{
		id: "current",
		title: "Current Leadership",
		introKey: "current",
		// Roles from the club's Epsilon page (Oct 2026). Class years and photos
		// for newer officers still to be supplied.
		members: [
			{
				name: "Andrew Zhang",
				classOf: "'27",
				role: "Captain (Co-President)",
				photo: andrewZhang,
			},
			{
				name: "Alexander Smelyansky",
				classOf: "'27",
				role: "Captain (Co-President)",
				photo: alexanderSmelyansky,
			},
			{ name: "Caleb Paugh", role: "First Officer (Vice President)" },
			{ name: "Sheng Yue Huang", role: "Flight Engineer (Secretary)" },
			{ name: "Nathan Lai", role: "Flight Technician (IT)" },
		],
	},
	{
		id: "advisors",
		title: "Faculty Advisors",
		introKey: "advisors",
		members: [
			{ name: "Mr. James Dillon", role: "(2024 - Present)", photo: jamesDillon },
		],
	},
	{
		id: "helpers",
		title: "Helpers & Contributors",
		introKey: "helpers",
		members: [
			{
				name: "Yunus Gubrud",
				classOf: "'28",
				role: "Flight Attendant (Helper)",
				photo: yunusGubrud,
			},
		],
	},
	{
		id: "past",
		title: "Past Leadership",
		introKey: "past",
		members: [
			{
				name: "Jerry Qiu",
				classOf: "'26",
				role: "Co-Founder & Captain (President)",
				photo: jerryQiu,
			},
			{
				name: "Matthew Lin",
				classOf: "'26",
				role: "First Officer (Vice President)",
				photo: matthewLin,
			},
			{
				name: "Chloe Tam",
				classOf: "'26",
				role: "Air Traffic Controller (Outreach)",
				photo: chloeTam,
			},
			{
				name: "Allyson Win",
				classOf: "'27",
				role: "Flight Engineer (Secretary)",
				photo: allysonWin,
			},
			{
				name: "Andrew Archvadze",
				classOf: "'28",
				role: "Flight Engineer (Secretary)",
			},
			{
				name: "Evan Ye",
				classOf: "'27",
				role: "Aircraft Mechanic (Treasurer)",
				photo: evanYe,
			},
			{
				name: "William Vongphanith",
				classOf: "'23",
				role: "Co-Founder & First Officer (Vice President)",
				photo: williamVongphanith,
			},
			{
				name: "Florence Wu",
				classOf: "'27",
				role: "Radio Operator (Communications)",
				photo: florenceWu,
			},
		],
	},
	{
		id: "past-helpers",
		title: "Past Helpers & Contributors",
		members: [
			{
				name: "Steven Wu",
				classOf: "'26",
				role: "Flight Attendant (Helper)",
				photo: stevenWu,
			},
			{
				name: "Matthew Karp",
				classOf: "'26",
				role: "First Class (Expert)",
				photo: matthewKarp,
			},
			{
				name: "Ethan Saldanha",
				classOf: "'26",
				role: "Flight Attendant (Helper)",
			},
		],
	},
	{
		id: "alliance",
		title: "Alliance Members",
		introKey: "alliance",
		members: [
			{
				name: "Esther Lee",
				classOf: "'26",
				role: "K2-18B Rocketry President",
				photo: estherLee,
			},
		],
	},
];

export const crewApplyUrl = "https://forms.gle/4dRYhvUt7iZH7u9E6";
