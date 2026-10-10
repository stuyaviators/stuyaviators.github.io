import { ogContentType, ogSize, renderOg } from "@/lib/og";

export const alt = "StuyAviators · StuyAviators";
export const size = ogSize;
export const contentType = ogContentType;

export default async function Image() {
	return renderOg({ title: "StuyAviators", eyebrow: "Stuyvesant High School’s aviation club", photo: "hero-cessna-backseat", detail: "Making the skies inclusive and accessible" });
}
