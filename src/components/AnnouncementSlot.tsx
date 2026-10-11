import AnnouncementBanner from "@/components/AnnouncementBanner";
import { getPublicAnnouncement } from "@/lib/announcement";

/**
The banner under the header, when an officer has one switched on.
*/
export default async function AnnouncementSlot() {
	const announcement = await getPublicAnnouncement();
	return announcement ? (
		<AnnouncementBanner announcement={announcement} />
	) : null;
}
