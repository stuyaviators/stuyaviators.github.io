import { ogContentType, ogSize, renderOg } from "@/lib/og";

export const alt = "The Flight Crew · StuyAviators";
export const size = ogSize;
export const contentType = ogContentType;

export default async function Image() {
	return renderOg({ title: "The Flight Crew", eyebrow: "Community", photo: "hero-classroom-meeting" });
}
