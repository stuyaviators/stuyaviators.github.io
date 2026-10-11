export const site = {
	name: "StuyAviators",
	url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://stuyaviators.vercel.app",
	tagline:
		"Bringing aviation to life at Stuyvesant High School, making the skies inclusive and accessible, and inspiring today’s youth to become tomorrow’s aviation leaders.",
	eyebrow: "Stuyvesant High School’s Official Aviation Club",
	founded: "2022-11-19",
	epsilonUrl: "https://epsilon.stuysu.org/stuyaviators",
	instagramHandle: "stuyaviators",
	address: {
		line: "345 Chambers St, New York, NY 10282",
		school: "Stuyvesant High School",
		query: "345 Chambers St, New York, NY 10282",
	},
} as const;

export type NavLink = { href: string; label: string; description?: string };
export type NavGroup = { label: string; links: NavLink[] };

export const nav: NavGroup[] = [
	{
		label: "About",
		links: [
			{
				href: "/about",
				label: "Our Mission",
				description: "Project Skylab and why we exist",
			},
			{ href: "/story", label: "Our Story", description: "Since 2022" },
			{
				href: "/charter",
				label: "Club Charter",
				description: "How the club runs, plus the rules",
			},
			{
				href: "/brand",
				label: "Brand Guidelines",
				description: "Logos, colors and type",
			},
		],
	},
	{
		label: "Explore",
		links: [
			{
				href: "/meetings",
				label: "Meetings",
				description: "Upcoming and meeting types",
			},
			{
				href: "/opportunities",
				label: "Opportunities",
				description: "Programs and internships",
			},
			{
				href: "/scholarships",
				label: "Scholarships",
				description: "Funding for school and flight",
			},
			{
				href: "/careers",
				label: "Future Careers",
				description: "Every path in aviation",
			},
		],
	},
	{
		label: "Community",
		links: [
			{
				href: "/flight-crew",
				label: "The Flight Crew",
				description: "Leadership and positions",
			},
			{
				href: "/gallery",
				label: "Community Highlights",
				description: "Photos from members",
			},
			{
				href: "/stories",
				label: "Share Your Story",
				description: "Journeys into flight",
			},
		],
	},
	{
		label: "Connect",
		links: [
			{
				href: "/connect",
				label: "Connect",
				description: "Email, Discord and Instagram",
			},
			{
				href: "#mailing-list",
				label: "Mailing List",
				description: "News in your inbox",
			},
			{
				href: "/dashboard",
				label: "Crew Dashboard",
				description: "For club officers",
			},
		],
	},
];

export function isNavGroup(item: NavGroup | NavLink): item is NavGroup {
	return "links" in item;
}

/**
Links that open something on the current page (the mailing-list modal).
*/
export function isHashLink(href: string) {
	return href.startsWith("#");
}

export type Contact = {
	label: string;
	value: string;
	href: string;
	note?: string;
};

export const contacts: Contact[] = [
	{
		label: "Outreach",
		value: "aviators-outreach@stuy.edu",
		href: "mailto:aviators-outreach@stuy.edu",
		note: "Questions, partnerships, guest speakers and story submissions",
	},
	{
		label: "Media",
		value: "aviators-media@stuy.edu",
		href: "mailto:aviators-media@stuy.edu",
		note: "Photo and video submissions for the gallery",
	},
];

/**
Administrative contact, shown in the footer.
*/
export const adminContact: Contact = {
	label: "Administrative",
	value: "aviators-exec@stuy.edu",
	href: "mailto:aviators-exec@stuy.edu",
};

export type SocialKey =
	"instagram" | "discord" | "youtube" | "facebook" | "epsilon";

export type Social = {
	key: SocialKey;
	label: string;
	href: string;
	action: string;
};

export const socials: Social[] = [
	{
		key: "instagram",
		label: "Instagram",
		href: "https://www.instagram.com/stuyaviators",
		action: "Follow us",
	},
	{
		key: "discord",
		label: "Discord",
		href: "https://discord.gg/PCywWHervk",
		action: "Join our server",
	},
	{
		key: "youtube",
		label: "YouTube",
		href: "https://www.youtube.com/@stuyaviators",
		action: "Watch",
	},
	{
		key: "facebook",
		label: "Facebook",
		href: "https://www.facebook.com/groups/stuyaviators",
		action: "Join our group",
	},
	{
		key: "epsilon",
		label: "Epsilon",
		href: "https://epsilon.stuysu.org/stuyaviators",
		action: "Join the club",
	},
];

export const mapsLinks = {
	open: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent("Stuyvesant High School, 345 Chambers St, New York, NY 10282")}`,
	directions: `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent("Stuyvesant High School, 345 Chambers St, New York, NY 10282")}`,
	embed:
		"https://www.google.com/maps?q=Stuyvesant+High+School,+345+Chambers+St,+New+York,+NY+10282&output=embed",
};
