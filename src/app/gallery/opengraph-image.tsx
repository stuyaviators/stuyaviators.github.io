import { ogContentType, ogSize, renderOg } from "@/lib/og";

export const alt = "Community Highlights · StuyAviators";
export const size = ogSize;
export const contentType = ogContentType;

export default async function Image() {
	return renderOg({ title: "Community Highlights", eyebrow: "Community · Gallery", photo: "gallery-strut-coastline" });
}
