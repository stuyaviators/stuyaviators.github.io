import { ogContentType, ogSize, renderOg } from "@/lib/og";

export const alt = "Future Careers · StuyAviators";
export const size = ogSize;
export const contentType = ogContentType;

export default async function Image() {
	return renderOg({ title: "Future Careers", eyebrow: "Explore", photo: "event-airline-booth", detail: "87 careers in aviation and aerospace" });
}
