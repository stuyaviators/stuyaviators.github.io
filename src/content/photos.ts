import type { StaticImageData } from "next/image";
import bgHighAltitudeImg from "@/assets/photos/bg-high-altitude.jpg";
import eventAirlineBoothImg from "@/assets/photos/event-airline-booth.jpg";
import eventAviationHsPanelImg from "@/assets/photos/event-aviation-hs-panel.jpg";
import galleryAerLingusImg from "@/assets/photos/gallery-aer-lingus.jpg";
import galleryAmericanGateImg from "@/assets/photos/gallery-american-gate.jpg";
import galleryApronMountainsImg from "@/assets/photos/gallery-apron-mountains.jpg";
import galleryBomberFlybyImg from "@/assets/photos/gallery-bomber-flyby.jpg";
import galleryC17Img from "@/assets/photos/gallery-c17.jpg";
import galleryCapCessnaImg from "@/assets/photos/gallery-cap-cessna.jpg";
import galleryCargoRainImg from "@/assets/photos/gallery-cargo-rain.jpg";
import galleryCessnaHangarImg from "@/assets/photos/gallery-cessna-hangar.jpg";
import galleryCoastGuardDolphinImg from "@/assets/photos/gallery-coast-guard-dolphin.jpg";
import galleryCockpitWindscreenImg from "@/assets/photos/gallery-cockpit-windscreen.jpg";
import galleryControlTowerImg from "@/assets/photos/gallery-control-tower.jpg";
import galleryE2HawkeyeImg from "@/assets/photos/gallery-e2-hawkeye.jpg";
import galleryEmiratesVirginImg from "@/assets/photos/gallery-emirates-virgin.jpg";
import galleryFarmlandImg from "@/assets/photos/gallery-farmland.jpg";
import galleryFrontSeatImg from "@/assets/photos/gallery-front-seat.jpg";
import galleryGlassCockpitImg from "@/assets/photos/gallery-glass-cockpit.jpg";
import galleryHarborSunset1Img from "@/assets/photos/gallery-harbor-sunset-1.jpg";
import galleryHarborSunset2Img from "@/assets/photos/gallery-harbor-sunset-2.jpg";
import galleryHelicopterHangarImg from "@/assets/photos/gallery-helicopter-hangar.jpg";
import galleryHelicopterMarshImg from "@/assets/photos/gallery-helicopter-marsh.jpg";
import galleryHelmetRoomImg from "@/assets/photos/gallery-helmet-room.jpg";
import galleryJalRunwayImg from "@/assets/photos/gallery-jal-runway.jpg";
import galleryJetsSmokeImg from "@/assets/photos/gallery-jets-smoke.jpg";
import galleryNightCabinImg from "@/assets/photos/gallery-night-cabin.jpg";
import galleryRunwayApproachImg from "@/assets/photos/gallery-runway-approach.jpg";
import galleryStrutCoastlineImg from "@/assets/photos/gallery-strut-coastline.jpg";
import galleryUnitedTerminalImg from "@/assets/photos/gallery-united-terminal.jpg";
import galleryWingClouds1Img from "@/assets/photos/gallery-wing-clouds-1.jpg";
import galleryWingClouds2Img from "@/assets/photos/gallery-wing-clouds-2.jpg";
import galleryWingForestImg from "@/assets/photos/gallery-wing-forest.jpg";
import galleryWingSunset1Img from "@/assets/photos/gallery-wing-sunset-1.jpg";
import galleryWingSunset2Img from "@/assets/photos/gallery-wing-sunset-2.jpg";
import galleryWingTownImg from "@/assets/photos/gallery-wing-town.jpg";
import heroCessnaBackseatImg from "@/assets/photos/hero-cessna-backseat.jpg";
import heroCessnaSunsetImg from "@/assets/photos/hero-cessna-sunset.jpg";
import heroClassroomMeetingImg from "@/assets/photos/hero-classroom-meeting.jpg";
import heroJoystickImg from "@/assets/photos/hero-joystick.jpg";
import heroLandingChallengeImg from "@/assets/photos/hero-landing-challenge.jpg";
import heroPresentationImg from "@/assets/photos/hero-presentation.jpg";
import heroSimClassroomImg from "@/assets/photos/hero-sim-classroom.jpg";
import heroSimDisplayImg from "@/assets/photos/hero-sim-display.jpg";
import heroSimRyanairImg from "@/assets/photos/hero-sim-ryanair.jpg";
import heroSimSetupImg from "@/assets/photos/hero-sim-setup.jpg";
import heroWorksheetsImg from "@/assets/photos/hero-worksheets.jpg";
import homeGrassRunwayImg from "@/assets/photos/home-grass-runway.jpg";
import meetingAtcImg from "@/assets/photos/meeting-atc.jpg";
import meetingChallengeImg from "@/assets/photos/meeting-challenge.jpg";
import meetingFsdImg from "@/assets/photos/meeting-fsd.jpg";
import meetingGuestSpeakerImg from "@/assets/photos/meeting-guest-speaker.jpg";
import meetingPciImg from "@/assets/photos/meeting-pci.jpg";
import meetingPresentationImg from "@/assets/photos/meeting-presentation.jpg";
import meetingStudentCourseImg from "@/assets/photos/meeting-student-course.jpg";
import meetingTrip747Img from "@/assets/photos/meeting-trip-747.jpg";
import spotlightAirlinerCockpitImg from "@/assets/photos/spotlight-airliner-cockpit.jpg";
import spotlightCoastInletImg from "@/assets/photos/spotlight-coast-inlet.jpg";
import spotlightConferenceImg from "@/assets/photos/spotlight-conference.jpg";
import spotlightFlightSuitCessnaImg from "@/assets/photos/spotlight-flight-suit-cessna.jpg";
import spotlightHeadsetsImg from "@/assets/photos/spotlight-headsets.jpg";
import spotlightHelicopterImg from "@/assets/photos/spotlight-helicopter.jpg";
import spotlightMilitaryHelicopterImg from "@/assets/photos/spotlight-military-helicopter.jpg";
import spotlightRocketBuildImg from "@/assets/photos/spotlight-rocket-build.jpg";
import storyFirstGuestSpeakerImg from "@/assets/photos/story-first-guest-speaker.jpg";
import storyJerryQiuImg from "@/assets/photos/story-jerry-qiu.jpg";
import storyMatthewMongeImg from "@/assets/photos/story-matthew-monge.jpg";
import storyYunusGubrudImg from "@/assets/photos/story-yunus-gubrud.jpg";

export type Photo = { src: StaticImageData; alt: string };

/**
Club photos with descriptive alt text (empty alt = decorative).
*/
export const photos = {
	meetingChallenge: {
		src: meetingChallengeImg,
		alt: "Members gather around a classroom screen running a flight simulator during an aviation challenge",
	},
	eventAirlineBooth: {
		src: eventAirlineBoothImg,
		alt: "Students try a flight simulator at an American Airlines booth",
	},
	meetingAtc: {
		src: meetingAtcImg,
		alt: "Laptop running an air traffic control simulation with aircraft on approach routes",
	},
	eventAviationHsPanel: {
		src: eventAviationHsPanelImg,
		alt: "A panel of aviation professionals speaking at Aviation High School in New York",
	},
	galleryCapCessna: {
		src: galleryCapCessnaImg,
		alt: "A Cessna in Civil Air Patrol colors parked on the ramp",
	},
	galleryE2Hawkeye: {
		src: galleryE2HawkeyeImg,
		alt: "A Navy E-2 Hawkeye with its rotating radar dome, parked on the ramp",
	},
	galleryBomberFlyby: {
		src: galleryBomberFlybyImg,
		alt: "A vintage four-engine bomber flying overhead",
	},
	galleryCoastGuardDolphin: {
		src: galleryCoastGuardDolphinImg,
		alt: "A Coast Guard MH-65 Dolphin helicopter on display with visitors around it",
	},
	galleryStrutCoastline: {
		src: galleryStrutCoastlineImg,
		alt: "Looking down at the coastline past a small plane’s wing strut",
	},
	galleryGlassCockpit: {
		src: galleryGlassCockpitImg,
		alt: "An airliner flight deck with glass cockpit displays",
	},
	spotlightCoastInlet: {
		src: spotlightCoastInletImg,
		alt: "Aerial view of a coastline and inlet seen past a high-wing plane’s strut",
	},
	galleryHelicopterHangar: {
		src: galleryHelicopterHangarImg,
		alt: "A military helicopter and its cockpit seat in a maintenance hangar",
	},
	galleryJetsSmoke: {
		src: galleryJetsSmokeImg,
		alt: "Two fighter jets trailing smoke above the clouds",
	},
	galleryHelicopterMarsh: {
		src: galleryHelicopterMarshImg,
		alt: "A pilot flies a helicopter over marshland, seen from the back seat",
	},
	bgHighAltitude: { src: bgHighAltitudeImg, alt: "" },
	meetingStudentCourse: {
		src: meetingStudentCourseImg,
		alt: "A student teaches a class at the front of a classroom",
	},
	galleryApronMountains: {
		src: galleryApronMountainsImg,
		alt: "Airliners and ground vehicles on an airport apron with mountains behind",
	},
	spotlightFlightSuitCessna: {
		src: spotlightFlightSuitCessnaImg,
		alt: "A student in a flight suit flies a small plane next to an instructor",
	},
	homeGrassRunway: {
		src: homeGrassRunwayImg,
		alt: "Rolling down a runway lined with grass, seen from inside a small plane",
	},
	spotlightAirlinerCockpit: {
		src: spotlightAirlinerCockpitImg,
		alt: "A student sits in an airliner cockpit",
	},
	storyYunusGubrud: {
		src: storyYunusGubrudImg,
		alt: "Yunus Gubrud in an airliner cockpit",
	},
	spotlightConference: {
		src: spotlightConferenceImg,
		alt: "Audience at an aviation conference presentation",
	},
	heroCessnaBackseat: {
		src: heroCessnaBackseatImg,
		alt: "A student flies a Cessna with an instructor, seen from the back seat",
	},
	galleryWingClouds1: {
		src: galleryWingClouds1Img,
		alt: "An airliner wing above a layer of clouds",
	},
	galleryWingClouds2: {
		src: galleryWingClouds2Img,
		alt: "An airliner wing over scattered clouds",
	},
	galleryWingForest: {
		src: galleryWingForestImg,
		alt: "An airliner wing above forested hills",
	},
	galleryWingTown: {
		src: galleryWingTownImg,
		alt: "An airliner wing above a town and farmland",
	},
	storyJerryQiu: {
		src: storyJerryQiuImg,
		alt: "Jerry Qiu in a flight suit beside a Cessna",
	},
	galleryRunwayApproach: {
		src: galleryRunwayApproachImg,
		alt: "On approach to a runway surrounded by forest",
	},
	galleryFrontSeat: {
		src: galleryFrontSeatImg,
		alt: "A student in a flight suit in the front seat of a small plane",
	},
	spotlightHelicopter: {
		src: spotlightHelicopterImg,
		alt: "A student in front of a helicopter on the ramp",
	},
	galleryCockpitWindscreen: {
		src: galleryCockpitWindscreenImg,
		alt: "The cockpit of a small aircraft in flight, looking out the windscreen",
	},
	spotlightHeadsets: {
		src: spotlightHeadsetsImg,
		alt: "A student pilot and an instructor wearing headsets in a small plane cockpit",
	},
	heroCessnaSunset: {
		src: heroCessnaSunsetImg,
		alt: "A Cessna on the ramp under a pink sunset sky",
	},
	heroClassroomMeeting: {
		src: heroClassroomMeetingImg,
		alt: "Members gather in a classroom for a club meeting",
	},
	galleryHelmetRoom: {
		src: galleryHelmetRoomImg,
		alt: "A student in a flight suit in an equipment room with flight helmets on the shelves",
	},
	spotlightMilitaryHelicopter: {
		src: spotlightMilitaryHelicopterImg,
		alt: "A student in a flight suit inside a military helicopter cabin",
	},
	heroPresentation: {
		src: heroPresentationImg,
		alt: "A member presents slides to a classroom",
	},
	meetingPresentation: {
		src: meetingPresentationImg,
		alt: "Members watch a presentation about an airliner on a classroom screen",
	},
	galleryCessnaHangar: {
		src: galleryCessnaHangarImg,
		alt: "A student sitting on top of a Cessna inside a hangar",
	},
	galleryHarborSunset1: {
		src: galleryHarborSunset1Img,
		alt: "New York harbor at sunset from an airliner window",
	},
	galleryHarborSunset2: {
		src: galleryHarborSunset2Img,
		alt: "The harbor and city skyline at sunset from an airliner window",
	},
	heroSimClassroom: {
		src: heroSimClassroomImg,
		alt: "Members fly a flight simulator projected on a classroom screen",
	},
	heroJoystick: {
		src: heroJoystickImg,
		alt: "A member flies the simulator with a joystick while others watch",
	},
	heroSimRyanair: {
		src: heroSimRyanairImg,
		alt: "Members watch a Ryanair jet land in the simulator on a classroom screen",
	},
	heroLandingChallenge: {
		src: heroLandingChallengeImg,
		alt: "Members pose in front of a Plane Landing Challenge slide",
	},
	galleryUnitedTerminal: {
		src: galleryUnitedTerminalImg,
		alt: "A United airliner taxiing near a terminal",
	},
	galleryCargoRain: {
		src: galleryCargoRainImg,
		alt: "A cargo jet on a rainy airport apron",
	},
	galleryJalRunway: {
		src: galleryJalRunwayImg,
		alt: "A Japan Airlines jet on a wet runway",
	},
	meetingTrip747: {
		src: meetingTrip747Img,
		alt: "A four-engine jumbo jet on a taxiway on an overcast day",
	},
	heroSimDisplay: {
		src: heroSimDisplayImg,
		alt: "Members gather around a flight simulator display in a classroom",
	},
	galleryC17: {
		src: galleryC17Img,
		alt: "A C-17 transport plane in front of a 305th Airlift Wing hangar",
	},
	heroSimSetup: {
		src: heroSimSetupImg,
		alt: "Members set up a flight simulator with a projector and laptops",
	},
	meetingFsd: {
		src: meetingFsdImg,
		alt: "A member flies a simulator projected at the front of a classroom",
	},
	spotlightRocketBuild: {
		src: spotlightRocketBuildImg,
		alt: "Members assemble a rocket outdoors on a grass field",
	},
	storyFirstGuestSpeaker: {
		src: storyFirstGuestSpeakerImg,
		alt: "Members seated in a classroom for the club’s first guest speaker event",
	},
	meetingGuestSpeaker: {
		src: meetingGuestSpeakerImg,
		alt: "A guest speaker presentation about flight schools on a classroom screen",
	},
	meetingPci: {
		src: meetingPciImg,
		alt: "Members work through a crash investigation lab at their desks",
	},
	heroWorksheets: {
		src: heroWorksheetsImg,
		alt: "Members fill out worksheets during a meeting",
	},
	storyMatthewMonge: {
		src: storyMatthewMongeImg,
		alt: "Matthew Monge with a model rocket in a field",
	},
	galleryNightCabin: {
		src: galleryNightCabinImg,
		alt: "An airliner cabin in blue mood lighting during a night flight",
	},
	galleryFarmland: {
		src: galleryFarmlandImg,
		alt: "Patchwork farmland seen from an airliner window",
	},
	galleryAmericanGate: {
		src: galleryAmericanGateImg,
		alt: "An American Airlines widebody jet at a gate",
	},
	galleryAerLingus: {
		src: galleryAerLingusImg,
		alt: "An Aer Lingus jet at a gate as another plane flies overhead",
	},
	galleryControlTower: {
		src: galleryControlTowerImg,
		alt: "An airport control tower against a blue sky",
	},
	galleryEmiratesVirgin: {
		src: galleryEmiratesVirginImg,
		alt: "Emirates and Virgin Atlantic jets on the apron, seen through a window",
	},
	galleryWingSunset1: {
		src: galleryWingSunset1Img,
		alt: "Sunset over the clouds beyond an airliner wing",
	},
	galleryWingSunset2: {
		src: galleryWingSunset2Img,
		alt: "The sun setting behind clouds past an airliner engine",
	},
} satisfies Record<string, Photo>;

export type PhotoKey = keyof typeof photos;

/**
Order matches the legacy Highlights page.
*/
export const galleryPhotos: PhotoKey[] = [
	"galleryE2Hawkeye",
	"galleryBomberFlyby",
	"galleryJetsSmoke",
	"galleryGlassCockpit",
	"galleryHelicopterMarsh",
	"galleryUnitedTerminal",
	"galleryFarmland",
	"galleryWingSunset2",
	"galleryHarborSunset2",
	"galleryCessnaHangar",
	"galleryWingSunset1",
	"galleryWingClouds1",
	"galleryWingForest",
	"galleryFrontSeat",
	"galleryApronMountains",
	"galleryHarborSunset1",
	"galleryWingClouds2",
	"galleryNightCabin",
	"galleryJalRunway",
	"galleryC17",
	"galleryAmericanGate",
	"galleryAerLingus",
	"galleryControlTower",
	"galleryCapCessna",
	"galleryHelicopterHangar",
	"galleryCoastGuardDolphin",
	"galleryEmiratesVirgin",
	"galleryCargoRain",
	"galleryHelmetRoom",
	"galleryCockpitWindscreen",
	"galleryWingTown",
	"galleryRunwayApproach",
];

/**
Former "Story Spotlights" photos from the Share Your Story page.
*/
export const spotlightPhotos: PhotoKey[] = [
	"spotlightCoastInlet",
	"spotlightFlightSuitCessna",
	"spotlightHeadsets",
	"spotlightRocketBuild",
	"spotlightAirlinerCockpit",
	"spotlightMilitaryHelicopter",
	"spotlightConference",
	"spotlightHelicopter",
];
