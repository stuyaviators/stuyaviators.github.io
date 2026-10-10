import { PageHero } from "@/components/ui/PageHero";
import { site } from "@/content/site";

export default function Home() {
	return <PageHero eyebrow={site.eyebrow} title="StuyAviators" intro={site.tagline} />;
}
