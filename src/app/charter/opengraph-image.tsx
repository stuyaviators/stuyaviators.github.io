import { ogContentType, ogSize, renderOg } from "@/lib/og";

export const alt = "Club Charter & Rules · StuyAviators";
export const size = ogSize;
export const contentType = ogContentType;

export default async function Image() {
	return renderOg({ title: "Club Charter & Rules", eyebrow: "About", photo: "hero-sim-classroom" });
}
