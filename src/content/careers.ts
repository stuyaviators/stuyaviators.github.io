/*
 * Careers page content (written for the rebuild, not from the legacy site).
 * Requirements are summarized from FAA, BLS and service sources; they change,
 * so each family links to an official source. No salary figures on purpose.
 */

export type Career = {
	name: string;
	what: string;
	path: string;
	/** Licenses or certificates, if any. */
	credential?: string;
	/** Fields of study or degrees that help. */
	study: string[];
};

export type CareerFamily = {
	id: string;
	name: string;
	summary: string;
	/** Fields of study that help across the family. */
	studies: string[];
	/** StuyAviators meetings that give a taste of this work. */
	tryIt?: string;
	sources: Array<{ label: string; url: string }>;
	careers: Career[];
};

export const careerFamilies: CareerFamily[] = [
	{
		id: "flying",
		name: "Flying",
		summary:
			"Pilots fly people, cargo and missions. Most paths start the same way: a student pilot certificate at 16, a private pilot certificate, then instrument and commercial ratings.",
		studies: ["Aviation / aeronautical science", "Physics", "Meteorology", "Business (for airline management later)"],
		tryIt: "Flight Simulator Demonstrations (FSD) and Student-Led Courses (SLC)",
		sources: [
			{ label: "FAA: Become a pilot", url: "https://www.faa.gov/pilots/become" },
			{ label: "BLS: Airline and commercial pilots", url: "https://www.bls.gov/ooh/transportation-and-material-moving/airline-and-commercial-pilots.htm" },
		],
		careers: [
			{
				name: "Airline pilot",
				what: "Flies passengers for scheduled airlines, starting as a first officer and upgrading to captain.",
				path: "Earn private, instrument, commercial and multi-engine ratings, build hours (often as a flight instructor), then join a regional or major airline.",
				credential: "FAA Airline Transport Pilot (ATP) certificate: generally 1,500 hours, with reduced minimums for military pilots and some aviation degree graduates.",
				study: ["Aviation / aeronautical science", "Any bachelor’s degree (many airlines prefer one)"],
			},
			{
				name: "Cargo pilot",
				what: "Flies freight for carriers such as FedEx, UPS and Atlas, often overnight and internationally.",
				path: "Same certificates as airline pilots; many build time at smaller feeder cargo operators first.",
				credential: "ATP certificate for major cargo airlines; commercial certificate for smaller feeders.",
				study: ["Aviation science", "Logistics / supply chain management"],
			},
			{
				name: "Corporate / business-jet pilot",
				what: "Flies executives and private clients on business jets, with varied destinations and schedules.",
				path: "Commercial and instrument ratings plus jet type ratings; networking and experience matter.",
				credential: "Commercial or ATP certificate and aircraft type ratings.",
				study: ["Aviation science", "Business administration"],
			},
			{
				name: "Charter / air-taxi pilot",
				what: "Flies on-demand trips in smaller aircraft for charter companies.",
				path: "Commercial certificate plus the hours and experience required by the operator.",
				credential: "FAA commercial pilot certificate; operators set additional minimums.",
				study: ["Aviation science"],
			},
			{
				name: "Flight instructor (CFI)",
				what: "Teaches new pilots on the ground and in the air; a common way to build hours.",
				path: "Earn a commercial certificate, then the flight instructor certificate and, often, an instrument instructor rating (CFII).",
				credential: "FAA flight instructor certificate.",
				study: ["Aviation science", "Education"],
			},
			{
				name: "Helicopter pilot",
				what: "Flies medical, news, tour, offshore, utility and law-enforcement helicopter missions.",
				path: "Train for rotorcraft ratings at a helicopter school or in the military; build experience as an instructor or tour pilot.",
				credential: "FAA commercial pilot certificate with rotorcraft-helicopter rating.",
				study: ["Aviation science", "Emergency medical services (for air medical work)"],
			},
			{
				name: "Agricultural pilot",
				what: "Applies seed, fertilizer and crop protection from low-flying aircraft.",
				path: "Commercial certificate, tailwheel experience and specialized ag training with an operator.",
				credential: "FAA commercial certificate; operators work under FAA Part 137.",
				study: ["Agriculture / agronomy", "Aviation science"],
			},
			{
				name: "Aerial firefighting pilot",
				what: "Drops water and retardant from airtankers and helicopters on wildfires.",
				path: "Usually comes after significant commercial, ag or military flying experience.",
				credential: "FAA commercial or ATP certificate plus agency carding.",
				study: ["Aviation science", "Fire science / forestry"],
			},
			{
				name: "Bush pilot",
				what: "Flies people and supplies to remote areas, often on floats or skis in places like Alaska.",
				path: "Commercial certificate, tailwheel and seaplane ratings, and lots of backcountry experience.",
				credential: "FAA commercial certificate; seaplane rating helps.",
				study: ["Aviation science"],
			},
			{
				name: "Aerial survey, photo and banner-tow pilot",
				what: "Flies precise patterns for mapping, photography, pipeline patrol or advertising banners.",
				path: "A common early-career job for new commercial pilots building hours.",
				credential: "FAA commercial pilot certificate.",
				study: ["Geography / GIS", "Photography"],
			},
			{
				name: "Ferry pilot",
				what: "Delivers aircraft between owners, factories and maintenance shops, sometimes across oceans.",
				path: "Commercial certificate and broad experience across aircraft types.",
				credential: "FAA commercial pilot certificate.",
				study: ["Aviation science"],
			},
			{
				name: "Test pilot",
				what: "Flies new and modified aircraft to measure performance and find problems before they enter service.",
				path: "Usually military or highly experienced civilian pilots who attend a test pilot school; an engineering degree is common.",
				credential: "Test pilot school graduation; employer-specific requirements.",
				study: ["Aerospace engineering", "Mechanical engineering", "Physics"],
			},
		],
	},
	{
		id: "uncrewed",
		name: "Drones & uncrewed aircraft",
		summary:
			"Uncrewed aircraft inspect infrastructure, map land, film movies and fly military missions. You can earn the FAA drone certificate at 16.",
		studies: ["Geography / GIS", "Computer science", "Electrical engineering", "Film and photography"],
		tryIt: "Student-Led Courses such as Drone Basics",
		sources: [
			{ label: "FAA: Drones (UAS)", url: "https://www.faa.gov/uas" },
		],
		careers: [
			{
				name: "Commercial drone pilot",
				what: "Flies drones for real estate, film, events, agriculture and journalism.",
				path: "Study for and pass the FAA Part 107 knowledge test; build a portfolio.",
				credential: "FAA Remote Pilot Certificate (Part 107), minimum age 16.",
				study: ["Film and photography", "Business"],
			},
			{
				name: "Drone inspection & mapping specialist",
				what: "Uses drones and sensors to inspect bridges, power lines and roofs or to create 3D maps.",
				path: "Part 107 certificate plus training in photogrammetry or GIS software.",
				credential: "FAA Remote Pilot Certificate (Part 107).",
				study: ["GIS / surveying", "Civil engineering"],
			},
			{
				name: "Military UAS operator",
				what: "Flies remotely piloted aircraft for surveillance and missions.",
				path: "Enlist or commission in a service branch and complete its UAS training pipeline.",
				study: ["Any bachelor’s degree (for officers)"],
			},
			{
				name: "Drone engineer / developer",
				what: "Designs drone hardware, flight software and autonomy systems.",
				path: "Engineering or computer science degree; build drones through clubs and competitions.",
				study: ["Electrical engineering", "Computer science", "Robotics"],
			},
		],
	},
	{
		id: "cabin",
		name: "In the cabin",
		summary:
			"Cabin crew keep passengers safe and comfortable. Airlines train new hires themselves, so a degree isn’t required.",
		studies: ["Hospitality", "Languages", "Communications", "Nursing or EMT training (a plus)"],
		sources: [
			{ label: "BLS: Flight attendants", url: "https://www.bls.gov/ooh/transportation-and-material-moving/flight-attendants.htm" },
		],
		careers: [
			{
				name: "Flight attendant",
				what: "Handles safety, emergencies and service on board commercial flights.",
				path: "Apply to an airline (usually 18–21+, high school diploma); complete several weeks of airline training.",
				credential: "FAA Certificate of Demonstrated Proficiency, earned during airline training.",
				study: ["Hospitality", "Foreign languages"],
			},
			{
				name: "Purser / lead flight attendant",
				what: "Leads the cabin crew on a flight and coordinates with the pilots.",
				path: "Promotion from flight attendant with experience and additional training.",
				study: ["Hospitality management", "Communications"],
			},
			{
				name: "Corporate flight attendant",
				what: "Provides safety and high-end service on private and business jets.",
				path: "Airline or hospitality experience plus specialized corporate training.",
				study: ["Hospitality", "Culinary arts"],
			},
		],
	},
	{
		id: "atc",
		name: "Air traffic & airspace",
		summary:
			"Controllers and airspace specialists keep aircraft safely separated. The FAA hires and trains most U.S. controllers itself.",
		studies: ["Air traffic management (FAA AT-CTI schools)", "Aviation science", "Mathematics"],
		tryIt: "Air Traffic Control Simulation (ATC)",
		sources: [
			{ label: "FAA careers", url: "https://www.faa.gov/jobs" },
			{ label: "BLS: Air traffic controllers", url: "https://www.bls.gov/ooh/transportation-and-material-moving/air-traffic-controllers.htm" },
		],
		careers: [
			{
				name: "Air traffic controller",
				what: "Directs aircraft from a tower, an approach facility (TRACON) or an en-route center.",
				path: "Apply to the FAA (generally before age 31), pass the aptitude test and medical, train at the FAA Academy in Oklahoma City, then certify on the job. Military controller training is another route.",
				credential: "FAA training and facility certification.",
				study: ["Air traffic management (AT-CTI)", "Any bachelor’s degree"],
			},
			{
				name: "Flight service specialist",
				what: "Gives pilots weather briefings, files flight plans and helps aircraft in trouble.",
				path: "Hired by flight service providers; aviation or weather background helps.",
				study: ["Meteorology", "Aviation science"],
			},
			{
				name: "Airspace & procedure designer",
				what: "Designs approach and departure procedures and airspace structures.",
				path: "Usually experienced controllers or pilots with additional FAA training.",
				study: ["Aviation science", "Geography / GIS", "Engineering"],
			},
			{
				name: "Traffic flow management specialist",
				what: "Balances national air traffic demand against weather and capacity, deciding delays and reroutes.",
				path: "Typically experienced controllers or airline operations staff.",
				study: ["Operations research", "Aviation science"],
			},
		],
	},
	{
		id: "operations",
		name: "Flight operations",
		summary:
			"The people on the ground who plan every flight: dispatchers, schedulers, load planners and weather forecasters.",
		studies: ["Aviation management", "Meteorology", "Mathematics", "Logistics"],
		sources: [
			{ label: "BLS: Atmospheric scientists", url: "https://www.bls.gov/ooh/life-physical-and-social-science/atmospheric-scientists-including-meteorologists.htm" },
		],
		careers: [
			{
				name: "Aircraft dispatcher",
				what: "Plans routes, fuel and weather for airline flights and shares legal responsibility for each flight with the captain.",
				path: "Complete an FAA-approved dispatcher course and pass the written, oral and practical exams.",
				credential: "FAA Aircraft Dispatcher certificate (minimum age 23 to hold).",
				study: ["Aviation management", "Meteorology"],
			},
			{
				name: "Operations control / crew scheduler",
				what: "Keeps an airline running in real time, reassigning crews and aircraft when things go wrong.",
				path: "Entry-level roles at airlines; aviation degrees and internships help.",
				study: ["Aviation management", "Operations management"],
			},
			{
				name: "Load planner",
				what: "Calculates weight and balance so each aircraft is loaded safely.",
				path: "Airline or cargo operator training.",
				study: ["Mathematics", "Logistics"],
			},
			{
				name: "Aviation meteorologist",
				what: "Forecasts turbulence, icing, storms and winds for airlines, airports and the National Weather Service.",
				path: "Earn a meteorology or atmospheric science degree.",
				study: ["Meteorology / atmospheric science", "Physics", "Mathematics"],
			},
		],
	},
	{
		id: "maintenance",
		name: "Maintenance & technicians",
		summary:
			"Technicians keep aircraft airworthy. FAA-approved schools (Part 147) can get you certified in about two years, no four-year degree needed.",
		studies: ["Aviation maintenance technology (Part 147 school)", "Electronics", "Mechanical technology"],
		tryIt: "Plane Crash Investigation Labs (PCI), for how systems fail",
		sources: [
			{ label: "FAA: Aviation mechanics", url: "https://www.faa.gov/mechanics" },
			{ label: "BLS: Aircraft and avionics technicians", url: "https://www.bls.gov/ooh/installation-maintenance-and-repair/aircraft-and-avionics-equipment-mechanics-and-technicians.htm" },
		],
		careers: [
			{
				name: "Airframe & powerplant (A&P) mechanic",
				what: "Inspects, repairs and maintains aircraft structures, engines and systems.",
				path: "Attend an FAA Part 147 school or gain documented experience, then pass written, oral and practical exams (minimum age 18).",
				credential: "FAA mechanic certificate with airframe and powerplant ratings.",
				study: ["Aviation maintenance technology"],
			},
			{
				name: "Avionics technician",
				what: "Installs and repairs aircraft electronics: radios, navigation, autopilots and displays.",
				path: "Avionics or electronics training; many also earn the A&P.",
				credential: "FCC radio license often required; A&P helpful.",
				study: ["Electronics technology", "Electrical engineering technology"],
			},
			{
				name: "Inspector (IA)",
				what: "Signs off major repairs and annual inspections.",
				path: "Hold an A&P for at least three years with recent experience, then pass the FAA inspection authorization test.",
				credential: "FAA Inspection Authorization.",
				study: ["Aviation maintenance technology"],
			},
			{
				name: "NDT technician",
				what: "Finds hidden cracks and corrosion with ultrasound, X-ray and eddy-current testing.",
				path: "Specialized NDT training and certification levels.",
				study: ["Materials science", "Engineering technology"],
			},
			{
				name: "Composites & sheet-metal technician",
				what: "Repairs and builds aircraft structures from aluminum and carbon fiber.",
				path: "Trade school or on-the-job training at repair stations and manufacturers.",
				study: ["Manufacturing technology", "Materials science"],
			},
			{
				name: "Engine overhaul technician",
				what: "Disassembles, inspects and rebuilds jet and piston engines.",
				path: "A&P certificate (powerplant) and manufacturer training.",
				study: ["Aviation maintenance technology", "Mechanical engineering technology"],
			},
			{
				name: "Flight simulator technician",
				what: "Maintains full-motion simulators used to train airline and military pilots.",
				path: "Electronics or IT background plus simulator manufacturer training.",
				study: ["Electronics", "Computer engineering"],
			},
		],
	},
	{
		id: "engineering",
		name: "Engineering",
		summary:
			"Engineers design, build and test aircraft and spacecraft. An ABET-accredited bachelor’s degree is the usual starting point.",
		studies: ["Aerospace engineering", "Mechanical engineering", "Electrical engineering", "Computer science", "Physics", "Materials science"],
		tryIt: "Aviation Challenges & Competitions, plus 3D-design and glider projects",
		sources: [
			{ label: "BLS: Aerospace engineers", url: "https://www.bls.gov/ooh/architecture-and-engineering/aerospace-engineers.htm" },
			{ label: "BLS: Aerospace engineering technicians", url: "https://www.bls.gov/ooh/architecture-and-engineering/aerospace-engineering-and-operations-technicians.htm" },
		],
		careers: [
			{ name: "Aerospace / aeronautical engineer", what: "Designs aircraft and their systems, from wings to cabins.", path: "Bachelor’s in aerospace or mechanical engineering; internships at manufacturers or NASA help.", study: ["Aerospace engineering", "Mechanical engineering"] },
			{ name: "Astronautical engineer", what: "Designs spacecraft, satellites and launch vehicles.", path: "Aerospace engineering degree with a space focus; rocketry clubs help.", study: ["Aerospace engineering", "Physics"] },
			{ name: "Propulsion engineer", what: "Designs jet engines, rocket engines and electric propulsion.", path: "Mechanical or aerospace degree with thermodynamics and fluids focus.", study: ["Mechanical engineering", "Aerospace engineering"] },
			{ name: "Structures & stress engineer", what: "Makes sure airframes are strong, light and fatigue-resistant.", path: "Mechanical, civil or aerospace degree.", study: ["Mechanical engineering", "Civil engineering"] },
			{ name: "Aerodynamics / CFD engineer", what: "Shapes aircraft using wind tunnels and computer simulations.", path: "Aerospace degree; graduate study is common.", study: ["Aerospace engineering", "Applied mathematics"] },
			{ name: "Avionics & electrical engineer", what: "Designs flight computers, sensors, wiring and power systems.", path: "Electrical or computer engineering degree.", study: ["Electrical engineering", "Computer engineering"] },
			{ name: "Guidance, navigation & control engineer", what: "Writes the math and code that steer autopilots, missiles and spacecraft.", path: "Aerospace, electrical or mechanical degree with controls focus.", study: ["Aerospace engineering", "Electrical engineering", "Mathematics"] },
			{ name: "Flight software engineer", what: "Builds safety-critical software that runs aircraft and spacecraft.", path: "Computer science or computer engineering degree.", study: ["Computer science", "Computer engineering"] },
			{ name: "Systems engineer", what: "Makes sure all the parts of a complex aircraft work together and meet requirements.", path: "Any engineering degree plus experience.", study: ["Systems engineering", "Any engineering discipline"] },
			{ name: "Flight test engineer", what: "Plans test flights, instruments aircraft and analyzes the data.", path: "Aerospace or mechanical degree; some attend test pilot school as engineers.", study: ["Aerospace engineering", "Data science"] },
			{ name: "Materials engineer", what: "Develops alloys and composites that survive extreme heat and stress.", path: "Materials science or chemical engineering degree.", study: ["Materials science", "Chemical engineering"] },
			{ name: "Human factors engineer", what: "Designs cockpits and procedures around how people think and make mistakes.", path: "Psychology or industrial engineering, often with graduate study.", study: ["Psychology", "Industrial engineering"] },
			{ name: "Manufacturing & quality engineer", what: "Plans how aircraft are built and checks they meet strict standards.", path: "Industrial or mechanical engineering degree.", study: ["Industrial engineering", "Mechanical engineering"] },
		],
	},
	{
		id: "space",
		name: "Space",
		summary:
			"From mission control to the astronaut corps, space careers mix engineering, science and operations.",
		studies: ["Aerospace engineering", "Physics", "Astronomy", "Computer science", "Medicine"],
		sources: [
			{ label: "NASA careers", url: "https://www.nasa.gov/careers" },
			{ label: "U.S. Space Force", url: "https://www.spaceforce.com" },
		],
		careers: [
			{
				name: "Astronaut",
				what: "Flies to space for NASA or commercial companies to run experiments and operate spacecraft.",
				path: "NASA requires U.S. citizenship, a master’s in a STEM field (or an accepted alternative such as test pilot school or a medical degree), relevant experience or jet pilot time, and passing a physical.",
				study: ["Engineering", "Physical or biological sciences", "Computer science", "Mathematics", "Medicine"],
			},
			{ name: "Mission / flight controller", what: "Monitors spacecraft systems and talks to crews from mission control.", path: "Engineering or science degree; hired and trained by NASA or contractors.", study: ["Aerospace engineering", "Physics"] },
			{ name: "Launch operations specialist", what: "Prepares rockets and launch pads and runs countdowns.", path: "Engineering or technician background at launch providers.", study: ["Mechanical engineering", "Engineering technology"] },
			{ name: "Spacecraft & satellite operator", what: "Flies satellites from the ground: maneuvers, health checks and data.", path: "Engineering degree or military space training.", study: ["Aerospace engineering", "Electrical engineering"] },
			{ name: "Space Force Guardian", what: "Operates space surveillance, satellite communications and missile warning systems.", path: "Enlist or commission in the U.S. Space Force.", study: ["STEM degree (for officers)"] },
			{ name: "Planetary scientist / astrophysicist", what: "Studies planets, stars and galaxies using spacecraft and telescope data.", path: "Physics or astronomy degree, usually followed by a PhD.", study: ["Physics", "Astronomy", "Geology"] },
		],
	},
	{
		id: "airports",
		name: "Airports",
		summary:
			"Airports are small cities. They need managers, firefighters, planners, wildlife experts and ground crews.",
		studies: ["Airport management", "Civil engineering", "Urban planning", "Fire science", "Biology"],
		sources: [
			{ label: "BLS: Firefighters", url: "https://www.bls.gov/ooh/protective-service/firefighters.htm" },
		],
		careers: [
			{ name: "Airport manager / operations", what: "Runs daily airport operations, safety inspections and emergency plans.", path: "Aviation management degree; start as an operations agent.", credential: "AAAE certifications help.", study: ["Airport / aviation management", "Business administration"] },
			{ name: "Aircraft rescue & firefighting (ARFF)", what: "Responds to aircraft emergencies with specialized crash trucks.", path: "Firefighter certification plus ARFF training required at FAA-certificated airports.", study: ["Fire science", "Emergency management"] },
			{ name: "Ramp agent / ground handling", what: "Loads bags and cargo, marshals and pushes back aircraft.", path: "Entry-level airline or ground-handler jobs; a common first step into aviation.", study: ["High school diploma", "Logistics"] },
			{ name: "Aircraft fueler", what: "Fuels aircraft safely and tests fuel quality.", path: "On-the-job training with fixed-base operators.", study: ["High school diploma"] },
			{ name: "Airport wildlife biologist", what: "Keeps birds and animals away from runways to prevent strikes.", path: "Biology or wildlife management degree.", study: ["Wildlife biology", "Ecology"] },
			{ name: "Airport planner / engineer", what: "Designs runways, terminals and long-term airport growth.", path: "Civil engineering or planning degree.", study: ["Civil engineering", "Urban planning", "Architecture"] },
			{ name: "Aviation security", what: "Screens passengers and protects airports and aircraft.", path: "TSA or airport security employment and training.", study: ["Criminal justice", "Homeland security"] },
		],
	},
	{
		id: "safety",
		name: "Safety, investigation & regulation",
		summary:
			"These people make aviation one of the safest ways to travel, by investigating accidents and writing and enforcing the rules.",
		studies: ["Aviation safety", "Engineering", "Law", "Public policy", "Human factors"],
		tryIt: "Plane Crash Investigation Labs (PCI)",
		sources: [
			{ label: "NTSB", url: "https://www.ntsb.gov" },
			{ label: "FAA careers", url: "https://www.faa.gov/jobs" },
		],
		careers: [
			{ name: "Accident investigator (NTSB)", what: "Investigates crashes to find causes and recommend safety changes.", path: "Engineering, pilot, maintenance or ATC expertise plus years of experience.", study: ["Aerospace engineering", "Aviation safety"] },
			{ name: "FAA aviation safety inspector", what: "Oversees airlines, repair stations and pilots to make sure they follow regulations.", path: "Extensive experience as a pilot, mechanic or avionics technician.", credential: "Relevant FAA certificates.", study: ["Aviation science", "Aviation maintenance"] },
			{ name: "Safety & quality auditor", what: "Runs safety management programs and audits inside airlines and manufacturers.", path: "Aviation degree and operational experience.", study: ["Aviation safety", "Industrial engineering"] },
			{ name: "Aviation attorney", what: "Handles aviation regulation, accidents, contracts and aircraft transactions.", path: "Bachelor’s degree, then law school and the bar exam.", study: ["Pre-law", "Political science", "Then a J.D."] },
			{ name: "Policy / regulatory analyst", what: "Shapes aviation rules for governments, airlines and advocacy groups.", path: "Policy, economics or aviation degree.", study: ["Public policy", "Economics"] },
		],
	},
	{
		id: "business",
		name: "Business of aviation",
		summary:
			"Airlines and aerospace companies are businesses. They need people who plan networks, set prices, sell aircraft and manage programs.",
		studies: ["Business administration", "Finance", "Economics", "Marketing", "Data science", "Supply chain management"],
		sources: [],
		careers: [
			{ name: "Airline network planner", what: "Decides which routes an airline flies and how often.", path: "Analytical degree and airline internships.", study: ["Economics", "Data science", "Business"] },
			{ name: "Revenue management analyst", what: "Sets fares and seat inventory to maximize revenue.", path: "Quantitative degree; heavy use of data and modeling.", study: ["Finance", "Mathematics", "Economics"] },
			{ name: "Aircraft sales, leasing & finance", what: "Buys, sells, leases and finances aircraft worth tens of millions of dollars.", path: "Finance or business degree; banks and leasing firms hire analysts.", study: ["Finance", "Business administration"] },
			{ name: "Aviation insurance underwriter", what: "Prices risk and insures aircraft, airlines and airports.", path: "Business or finance degree; insurance training programs.", study: ["Finance", "Risk management"] },
			{ name: "Air cargo & logistics specialist", what: "Moves freight through global airline and cargo networks.", path: "Logistics degree or entry-level cargo operations jobs.", study: ["Supply chain management", "Logistics"] },
			{ name: "Aerospace program manager", what: "Leads budgets, schedules and teams that build aircraft or spacecraft.", path: "Engineering or business degree plus experience; MBA is common.", study: ["Engineering", "Business administration"] },
			{ name: "Customer service / gate agent", what: "Helps passengers check in, board and rebook.", path: "Entry-level airline job with airline training; flight benefits are a perk.", study: ["Hospitality", "Communications"] },
			{ name: "Aviation marketing & communications", what: "Tells an airline or aerospace brand’s story through campaigns and media.", path: "Marketing or communications degree.", study: ["Marketing", "Communications"] },
		],
	},
	{
		id: "military",
		name: "Military & public service",
		summary:
			"Every branch flies, and the military trains pilots, controllers and technicians at no cost in exchange for a service commitment.",
		studies: ["Any bachelor’s degree (required for officers)", "ROTC programs", "Service academies"],
		sources: [
			{ label: "U.S. Air Force", url: "https://www.airforce.com" },
			{ label: "U.S. Navy", url: "https://www.navy.com" },
			{ label: "U.S. Army", url: "https://www.goarmy.com" },
			{ label: "U.S. Marine Corps", url: "https://www.marines.com" },
			{ label: "U.S. Coast Guard", url: "https://www.gocoastguard.com" },
			{ label: "Civil Air Patrol", url: "https://www.gocivilairpatrol.com" },
		],
		careers: [
			{ name: "Air Force pilot or combat systems officer", what: "Flies fighters, bombers, tankers, transports and more.", path: "Commission through the Air Force Academy, ROTC or Officer Training School, then complete pilot training.", study: ["Any bachelor’s degree", "STEM preferred"] },
			{ name: "Navy / Marine Corps aviator", what: "Flies jets, helicopters and tiltrotors, including from aircraft carriers.", path: "Commission through the Naval Academy, NROTC or Officer Candidate School, then flight training.", study: ["Any bachelor’s degree"] },
			{ name: "Army aviator", what: "Flies helicopters such as the Black Hawk, Apache and Chinook.", path: "The Army’s warrant officer flight training program accepts applicants without a college degree; officers commission first.", study: ["High school diploma (warrant officers)", "Any bachelor’s degree (officers)"] },
			{ name: "Coast Guard aviator", what: "Flies search-and-rescue, law-enforcement and environmental missions.", path: "Commission through the Coast Guard Academy or OCS; the College Student Pre-Commissioning Initiative helps students.", study: ["Any bachelor’s degree"] },
			{ name: "Military air traffic controller or aircraft maintainer", what: "Enlisted careers that train you in ATC or maintenance, skills that carry over to civilian jobs.", path: "Enlist and qualify for the career field through the ASVAB.", study: ["High school diploma"] },
			{ name: "Civil Air Patrol cadet", what: "The Air Force auxiliary’s youth program: orientation flights, leadership and STEM, starting at age 12.", path: "Join a local squadron; a great way to start in high school.", study: ["Open to middle and high school students"] },
			{ name: "Law-enforcement & public-safety aviation", what: "Police, border and wildfire agencies fly patrol, rescue and surveillance missions.", path: "Usually experienced officers or agents who then train as pilots.", study: ["Criminal justice", "Aviation science"] },
		],
	},
	{
		id: "people",
		name: "Health, education & media",
		summary:
			"Aviation needs doctors, nurses, teachers, curators, writers and security experts too.",
		studies: ["Nursing", "Medicine", "Education", "Journalism", "Photography", "Cybersecurity", "History"],
		tryIt: "Community-Led Presentations (CLP) and Guest Speaker Events",
		sources: [
			{ label: "FAA: Aviation medical examiners", url: "https://www.faa.gov/pilots/amelocator" },
		],
		careers: [
			{ name: "Aviation medical examiner / flight surgeon", what: "Doctors who give pilots and controllers their medical certificates, or care for military aircrew.", path: "Medical school and residency, then FAA designation or military flight-surgeon training.", study: ["Pre-med / biology", "Then medical school (M.D./D.O.)"] },
			{ name: "Flight nurse / flight paramedic", what: "Cares for critically ill patients on medical helicopters and jets.", path: "Nursing degree (or paramedic training) plus several years of critical-care experience.", study: ["Nursing (BSN)", "Paramedicine"] },
			{ name: "Aviation educator", what: "Teaches aviation in high schools, colleges and flight academies.", path: "Education or aviation degree; flight instructor certificate helps.", study: ["Education", "Aviation science"] },
			{ name: "Museum curator / historian", what: "Preserves and explains aviation history at places like the Intrepid and the Smithsonian.", path: "History or museum studies, often with a graduate degree.", study: ["History", "Museum studies"] },
			{ name: "Aviation journalist or photographer", what: "Covers the industry, reviews aircraft and captures air-to-air photography.", path: "Journalism or photography degree and a strong portfolio.", study: ["Journalism", "Photography", "Communications"] },
			{ name: "Aviation cybersecurity specialist", what: "Protects aircraft systems, airlines and air traffic networks from cyberattacks.", path: "Computer science or cybersecurity degree and certifications.", study: ["Cybersecurity", "Computer science"] },
			{ name: "Aviation psychologist", what: "Studies pilot performance, fatigue and crew teamwork, and helps select candidates.", path: "Psychology degree with graduate study.", study: ["Psychology", "Human factors"] },
		],
	},
];

export const startNow = [
	{ title: "Come to a flight sim meeting", body: "Get stick time for free in StuyAviators’ Flight Simulator Demonstrations." },
	{ title: "Take a discovery flight", body: "Many flight schools offer an introductory lesson where you fly with an instructor." },
	{ title: "Join Civil Air Patrol", body: "Cadets from age 12 get orientation flights, leadership training and aerospace education." },
	{ title: "Earn your drone certificate at 16", body: "The FAA Part 107 knowledge test is your first real aviation credential." },
	{ title: "Learn from people who do it", body: "Ask questions at StuyAviators guest speaker events and visit airports and museums on group trips." },
];
