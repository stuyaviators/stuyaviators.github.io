/*
 * Careers page content (written for the rebuild, not from the legacy site).
 * Requirements are summarized from FAA, BLS and service sources and change
 * over time. No salary figures on purpose.
 */

export type Career = {
	name: string;
	what: string;
	path: string;
	/**
	Licenses or certificates, if any.
	*/
	credential?: string;
	/**
	Fields of study or degrees that help.
	*/
	study: string[];
};

export type CareerFamily = {
	id: string;
	name: string;
	summary: string;
	/**
	Fields of study that help across the family.
	*/
	studies: string[];
	careers: Career[];
};

export const careerFamilies: CareerFamily[] = [
	{
		id: "flying",
		name: "Flying",
		summary:
			"Pilots fly people, cargo and missions. Most paths start the same way: a student pilot certificate at 16, a private pilot certificate, then instrument and commercial ratings.",
		studies: [
			"Aviation / Aeronautical Science",
			"Physics",
			"Meteorology",
			"Business (for airline management later)",
		],
		careers: [
			{
				name: "Airline Pilot",
				what: "Flies passengers for scheduled airlines, starting as a first officer and upgrading to captain.",
				path: "Earn private, instrument, commercial and multi-engine ratings, build hours (often as a flight instructor), then join a regional or major airline.",
				credential:
					"FAA Airline Transport Pilot (ATP) certificate: generally 1,500 hours, with reduced minimums for military pilots and some aviation degree graduates.",
				study: [
					"Aviation / Aeronautical Science",
					"Any Bachelor’s Degree (many airlines prefer one)",
				],
			},
			{
				name: "Cargo Pilot",
				what: "Flies freight for carriers such as FedEx, UPS and Atlas, often overnight and internationally.",
				path: "Same certificates as airline pilots; many build time at smaller feeder cargo operators first.",
				credential:
					"ATP certificate for major cargo airlines; commercial certificate for smaller feeders.",
				study: ["Aviation Science", "Logistics / Supply Chain Management"],
			},
			{
				name: "Corporate / Business-Jet Pilot",
				what: "Flies executives and private clients on business jets, with varied destinations and schedules.",
				path: "Commercial and instrument ratings plus jet type ratings; networking and experience matter.",
				credential: "Commercial or ATP certificate and aircraft type ratings.",
				study: ["Aviation Science", "Business Administration"],
			},
			{
				name: "Charter / Air-Taxi Pilot",
				what: "Flies on-demand trips in smaller aircraft for charter companies.",
				path: "Commercial certificate plus the hours and experience required by the operator.",
				credential:
					"FAA commercial pilot certificate; operators set additional minimums.",
				study: ["Aviation Science"],
			},
			{
				name: "Flight Instructor (CFI)",
				what: "Teaches new pilots on the ground and in the air; a common way to build hours.",
				path: "Earn a commercial certificate, then the flight instructor certificate and, often, an instrument instructor rating (CFII).",
				credential: "FAA flight instructor certificate.",
				study: ["Aviation Science", "Education"],
			},
			{
				name: "Helicopter Pilot",
				what: "Flies medical, news, tour, offshore, utility and law-enforcement helicopter missions.",
				path: "Train for rotorcraft ratings at a helicopter school or in the military; build experience as an instructor or tour pilot.",
				credential:
					"FAA commercial pilot certificate with rotorcraft-helicopter rating.",
				study: [
					"Aviation Science",
					"Emergency Medical Services (for air medical work)",
				],
			},
			{
				name: "Agricultural Pilot",
				what: "Applies seed, fertilizer and crop protection from low-flying aircraft.",
				path: "Commercial certificate, tailwheel experience and specialized ag training with an operator.",
				credential:
					"FAA commercial certificate; operators work under FAA Part 137.",
				study: ["Agriculture / Agronomy", "Aviation Science"],
			},
			{
				name: "Aerial Firefighting Pilot",
				what: "Drops water and retardant from airtankers and helicopters on wildfires.",
				path: "Usually comes after significant commercial, ag or military flying experience.",
				credential: "FAA commercial or ATP certificate plus agency carding.",
				study: ["Aviation Science", "Fire Science / Forestry"],
			},
			{
				name: "Bush Pilot",
				what: "Flies people and supplies to remote areas, often on floats or skis in places like Alaska.",
				path: "Commercial certificate, tailwheel and seaplane ratings, and lots of backcountry experience.",
				credential: "FAA commercial certificate; seaplane rating helps.",
				study: ["Aviation Science"],
			},
			{
				name: "Aerial Survey, Photo and Banner-Tow Pilot",
				what: "Flies precise patterns for mapping, photography, pipeline patrol or advertising banners.",
				path: "A common early-career job for new commercial pilots building hours.",
				credential: "FAA commercial pilot certificate.",
				study: ["Geography / GIS", "Photography"],
			},
			{
				name: "Ferry Pilot",
				what: "Delivers aircraft between owners, factories and maintenance shops, sometimes across oceans.",
				path: "Commercial certificate and broad experience across aircraft types.",
				credential: "FAA commercial pilot certificate.",
				study: ["Aviation Science"],
			},
			{
				name: "Test Pilot",
				what: "Flies new and modified aircraft to measure performance and find problems before they enter service.",
				path: "Usually military or highly experienced civilian pilots who attend a test pilot school; an engineering degree is common.",
				credential:
					"Test pilot school graduation; employer-specific requirements.",
				study: ["Aerospace Engineering", "Mechanical Engineering", "Physics"],
			},
		],
	},
	{
		id: "uncrewed",
		name: "Drones & Uncrewed Aircraft",
		summary:
			"Uncrewed aircraft inspect infrastructure, map land, film movies and fly military missions. You can earn the FAA drone certificate at 16.",
		studies: [
			"Geography / GIS",
			"Computer Science",
			"Electrical Engineering",
			"Film and Photography",
		],
		careers: [
			{
				name: "Commercial Drone Pilot",
				what: "Flies drones for real estate, film, events, agriculture and journalism.",
				path: "Study for and pass the FAA Part 107 knowledge test; build a portfolio.",
				credential: "FAA Remote Pilot Certificate (Part 107), minimum age 16.",
				study: ["Film and Photography", "Business"],
			},
			{
				name: "Drone Inspection & Mapping Specialist",
				what: "Uses drones and sensors to inspect bridges, power lines and roofs or to create 3D maps.",
				path: "Part 107 certificate plus training in photogrammetry or GIS software.",
				credential: "FAA Remote Pilot Certificate (Part 107).",
				study: ["GIS / Surveying", "Civil Engineering"],
			},
			{
				name: "Military UAS Operator",
				what: "Flies remotely piloted aircraft for surveillance and missions.",
				path: "Enlist or commission in a service branch and complete its UAS training pipeline.",
				study: ["Any Bachelor’s Degree (for officers)"],
			},
			{
				name: "Drone Engineer / Developer",
				what: "Designs drone hardware, flight software and autonomy systems.",
				path: "Engineering or computer science degree; build drones through clubs and competitions.",
				study: ["Electrical Engineering", "Computer Science", "Robotics"],
			},
		],
	},
	{
		id: "cabin",
		name: "In the Cabin",
		summary:
			"Cabin crew keep passengers safe and comfortable. Airlines train new hires themselves, so a degree isn’t required.",
		studies: [
			"Hospitality",
			"Languages",
			"Communications",
			"Nursing or EMT Training (a plus)",
		],
		careers: [
			{
				name: "Flight Attendant",
				what: "Handles safety, emergencies and service on board commercial flights.",
				path: "Apply to an airline (usually 18–21+, high school diploma); complete several weeks of airline training.",
				credential:
					"FAA Certificate of Demonstrated Proficiency, earned during airline training.",
				study: ["Hospitality", "Foreign Languages"],
			},
			{
				name: "Purser / Lead Flight Attendant",
				what: "Leads the cabin crew on a flight and coordinates with the pilots.",
				path: "Promotion from flight attendant with experience and additional training.",
				study: ["Hospitality Management", "Communications"],
			},
			{
				name: "Corporate Flight Attendant",
				what: "Provides safety and high-end service on private and business jets.",
				path: "Airline or hospitality experience plus specialized corporate training.",
				study: ["Hospitality", "Culinary Arts"],
			},
		],
	},
	{
		id: "atc",
		name: "Air Traffic & Airspace",
		summary:
			"Controllers and airspace specialists keep aircraft safely separated. The FAA hires and trains most U.S. controllers itself.",
		studies: [
			"Air Traffic Management (FAA AT-CTI schools)",
			"Aviation Science",
			"Mathematics",
		],
		careers: [
			{
				name: "Air Traffic Controller",
				what: "Directs aircraft from a tower, an approach facility (TRACON) or an en-route center.",
				path: "Apply to the FAA (generally before age 31), pass the aptitude test and medical, train at the FAA Academy in Oklahoma City, then certify on the job. Military controller training is another route.",
				credential: "FAA training and facility certification.",
				study: ["Air Traffic Management (AT-CTI)", "Any Bachelor’s Degree"],
			},
			{
				name: "Flight Service Specialist",
				what: "Gives pilots weather briefings, files flight plans and helps aircraft in trouble.",
				path: "Hired by flight service providers; aviation or weather background helps.",
				study: ["Meteorology", "Aviation Science"],
			},
			{
				name: "Airspace & Procedure Designer",
				what: "Designs approach and departure procedures and airspace structures.",
				path: "Usually experienced controllers or pilots with additional FAA training.",
				study: ["Aviation Science", "Geography / GIS", "Engineering"],
			},
			{
				name: "Traffic Flow Management Specialist",
				what: "Balances national air traffic demand against weather and capacity, deciding delays and reroutes.",
				path: "Typically experienced controllers or airline operations staff.",
				study: ["Operations Research", "Aviation Science"],
			},
		],
	},
	{
		id: "operations",
		name: "Flight Operations",
		summary:
			"The people on the ground who plan every flight: dispatchers, schedulers, load planners and weather forecasters.",
		studies: ["Aviation Management", "Meteorology", "Mathematics", "Logistics"],
		careers: [
			{
				name: "Aircraft Dispatcher",
				what: "Plans routes, fuel and weather for airline flights and shares legal responsibility for each flight with the captain.",
				path: "Complete an FAA-approved dispatcher course and pass the written, oral and practical exams.",
				credential:
					"FAA Aircraft Dispatcher certificate (minimum age 23 to hold).",
				study: ["Aviation Management", "Meteorology"],
			},
			{
				name: "Operations Control / Crew Scheduler",
				what: "Keeps an airline running in real time, reassigning crews and aircraft when things go wrong.",
				path: "Entry-level roles at airlines; aviation degrees and internships help.",
				study: ["Aviation Management", "Operations Management"],
			},
			{
				name: "Load Planner",
				what: "Calculates weight and balance so each aircraft is loaded safely.",
				path: "Airline or cargo operator training.",
				study: ["Mathematics", "Logistics"],
			},
			{
				name: "Aviation Meteorologist",
				what: "Forecasts turbulence, icing, storms and winds for airlines, airports and the National Weather Service.",
				path: "Earn a meteorology or atmospheric science degree.",
				study: ["Meteorology / Atmospheric Science", "Physics", "Mathematics"],
			},
		],
	},
	{
		id: "maintenance",
		name: "Maintenance & Technicians",
		summary:
			"Technicians keep aircraft airworthy. FAA-approved schools (Part 147) can get you certified in about two years, no four-year degree needed.",
		studies: [
			"Aviation Maintenance Technology (Part 147 school)",
			"Electronics",
			"Mechanical Technology",
		],
		careers: [
			{
				name: "Airframe & Powerplant (A&P) Mechanic",
				what: "Inspects, repairs and maintains aircraft structures, engines and systems.",
				path: "Attend an FAA Part 147 school or gain documented experience, then pass written, oral and practical exams (minimum age 18).",
				credential:
					"FAA mechanic certificate with airframe and powerplant ratings.",
				study: ["Aviation Maintenance Technology"],
			},
			{
				name: "Avionics Technician",
				what: "Installs and repairs aircraft electronics: radios, navigation, autopilots and displays.",
				path: "Avionics or electronics training; many also earn the A&P.",
				credential: "FCC radio license often required; A&P helpful.",
				study: ["Electronics Technology", "Electrical Engineering Technology"],
			},
			{
				name: "Inspector (IA)",
				what: "Signs off major repairs and annual inspections.",
				path: "Hold an A&P for at least three years with recent experience, then pass the FAA inspection authorization test.",
				credential: "FAA Inspection Authorization.",
				study: ["Aviation Maintenance Technology"],
			},
			{
				name: "NDT Technician",
				what: "Finds hidden cracks and corrosion with ultrasound, X-ray and eddy-current testing.",
				path: "Specialized NDT training and certification levels.",
				study: ["Materials Science", "Engineering Technology"],
			},
			{
				name: "Composites & Sheet-Metal Technician",
				what: "Repairs and builds aircraft structures from aluminum and carbon fiber.",
				path: "Trade school or on-the-job training at repair stations and manufacturers.",
				study: ["Manufacturing Technology", "Materials Science"],
			},
			{
				name: "Engine Overhaul Technician",
				what: "Disassembles, inspects and rebuilds jet and piston engines.",
				path: "A&P certificate (powerplant) and manufacturer training.",
				study: [
					"Aviation Maintenance Technology",
					"Mechanical Engineering Technology",
				],
			},
			{
				name: "Flight Simulator Technician",
				what: "Maintains full-motion simulators used to train airline and military pilots.",
				path: "Electronics or IT background plus simulator manufacturer training.",
				study: ["Electronics", "Computer Engineering"],
			},
		],
	},
	{
		id: "engineering",
		name: "Engineering & Technology",
		summary:
			"Engineers design, build and test aircraft and spacecraft. An ABET-accredited bachelor’s degree is the usual starting point.",
		studies: [
			"Aerospace Engineering",
			"Mechanical Engineering",
			"Electrical Engineering",
			"Computer Science",
			"Physics",
			"Materials Science",
		],
		careers: [
			{
				name: "Aerospace / Aeronautical Engineer",
				what: "Designs aircraft and their systems, from wings to cabins.",
				path: "Bachelor’s in aerospace or mechanical engineering; internships at manufacturers or NASA help.",
				study: ["Aerospace Engineering", "Mechanical Engineering"],
			},
			{
				name: "Astronautical Engineer",
				what: "Designs spacecraft, satellites and launch vehicles.",
				path: "Aerospace engineering degree with a space focus; rocketry clubs help.",
				study: ["Aerospace Engineering", "Physics"],
			},
			{
				name: "Propulsion Engineer",
				what: "Designs jet engines, rocket engines and electric propulsion.",
				path: "Mechanical or aerospace degree with thermodynamics and fluids focus.",
				study: ["Mechanical Engineering", "Aerospace Engineering"],
			},
			{
				name: "Structures & Stress Engineer",
				what: "Makes sure airframes are strong, light and fatigue-resistant.",
				path: "Mechanical, civil or aerospace degree.",
				study: ["Mechanical Engineering", "Civil Engineering"],
			},
			{
				name: "Aerodynamics / CFD Engineer",
				what: "Shapes aircraft using wind tunnels and computer simulations.",
				path: "Aerospace degree; graduate study is common.",
				study: ["Aerospace Engineering", "Applied Mathematics"],
			},
			{
				name: "Avionics & Electrical Engineer",
				what: "Designs flight computers, sensors, wiring and power systems.",
				path: "Electrical or computer engineering degree.",
				study: ["Electrical Engineering", "Computer Engineering"],
			},
			{
				name: "Guidance, Navigation & Control Engineer",
				what: "Writes the math and code that steer autopilots, missiles and spacecraft.",
				path: "Aerospace, electrical or mechanical degree with controls focus.",
				study: [
					"Aerospace Engineering",
					"Electrical Engineering",
					"Mathematics",
				],
			},
			{
				name: "Flight Software Engineer",
				what: "Builds safety-critical software that runs aircraft and spacecraft.",
				path: "Computer science or computer engineering degree.",
				study: ["Computer Science", "Computer Engineering"],
			},
			{
				name: "Systems Engineer",
				what: "Makes sure all the parts of a complex aircraft work together and meet requirements.",
				path: "Any engineering degree plus experience.",
				study: ["Systems Engineering", "Any Engineering Discipline"],
			},
			{
				name: "Flight Test Engineer",
				what: "Plans test flights, instruments aircraft and analyzes the data.",
				path: "Aerospace or mechanical degree; some attend test pilot school as engineers.",
				study: ["Aerospace Engineering", "Data Science"],
			},
			{
				name: "Materials Engineer",
				what: "Develops alloys and composites that survive extreme heat and stress.",
				path: "Materials science or chemical engineering degree.",
				study: ["Materials Science", "Chemical Engineering"],
			},
			{
				name: "Human Factors Engineer",
				what: "Designs cockpits and procedures around how people think and make mistakes.",
				path: "Psychology or industrial engineering, often with graduate study.",
				study: ["Psychology", "Industrial Engineering"],
			},
			{
				name: "Manufacturing & Quality Engineer",
				what: "Plans how aircraft are built and checks they meet strict standards.",
				path: "Industrial or mechanical engineering degree.",
				study: ["Industrial Engineering", "Mechanical Engineering"],
			},
			{
				name: "Aviation Cybersecurity Specialist",
				what: "Protects aircraft systems, airlines and air traffic networks from cyberattacks.",
				path: "Computer science or cybersecurity degree and certifications.",
				study: ["Cybersecurity", "Computer Science"],
			},
		],
	},
	{
		id: "space",
		name: "Space",
		summary:
			"From mission control to the astronaut corps, space careers mix engineering, science and operations.",
		studies: [
			"Aerospace Engineering",
			"Physics",
			"Astronomy",
			"Computer Science",
			"Medicine",
		],
		careers: [
			{
				name: "Astronaut",
				what: "Flies to space for NASA or commercial companies to run experiments and operate spacecraft.",
				path: "NASA requires U.S. citizenship, a master’s in a STEM field (or an accepted alternative such as test pilot school or a medical degree), relevant experience or jet pilot time, and passing a physical.",
				study: [
					"Engineering",
					"Physical or Biological Sciences",
					"Computer Science",
					"Mathematics",
					"Medicine",
				],
			},
			{
				name: "Mission / Flight Controller",
				what: "Monitors spacecraft systems and talks to crews from mission control.",
				path: "Engineering or science degree; hired and trained by NASA or contractors.",
				study: ["Aerospace Engineering", "Physics"],
			},
			{
				name: "Launch Operations Specialist",
				what: "Prepares rockets and launch pads and runs countdowns.",
				path: "Engineering or technician background at launch providers.",
				study: ["Mechanical Engineering", "Engineering Technology"],
			},
			{
				name: "Spacecraft & Satellite Operator",
				what: "Flies satellites from the ground: maneuvers, health checks and data.",
				path: "Engineering degree or military space training.",
				study: ["Aerospace Engineering", "Electrical Engineering"],
			},
			{
				name: "Space Force Guardian",
				what: "Operates space surveillance, satellite communications and missile warning systems.",
				path: "Enlist or commission in the U.S. Space Force.",
				study: ["STEM Degree (for officers)"],
			},
			{
				name: "Planetary Scientist / Astrophysicist",
				what: "Studies planets, stars and galaxies using spacecraft and telescope data.",
				path: "Physics or astronomy degree, usually followed by a PhD.",
				study: ["Physics", "Astronomy", "Geology"],
			},
		],
	},
	{
		id: "airports",
		name: "Airports",
		summary:
			"Airports are small cities. They need managers, firefighters, planners, wildlife experts and ground crews.",
		studies: [
			"Airport Management",
			"Civil Engineering",
			"Urban Planning",
			"Fire Science",
			"Biology",
		],
		careers: [
			{
				name: "Airport Manager / Operations",
				what: "Runs daily airport operations, safety inspections and emergency plans.",
				path: "Aviation management degree; start as an operations agent.",
				credential: "AAAE certifications help.",
				study: ["Airport / Aviation Management", "Business Administration"],
			},
			{
				name: "Aircraft Rescue & Firefighting (ARFF)",
				what: "Responds to aircraft emergencies with specialized crash trucks.",
				path: "Firefighter certification plus ARFF training required at FAA-certificated airports.",
				study: ["Fire Science", "Emergency Management"],
			},
			{
				name: "Ramp Agent / Ground Handling",
				what: "Loads bags and cargo, marshals and pushes back aircraft.",
				path: "Entry-level airline or ground-handler jobs; a common first step into aviation.",
				study: ["High School Diploma", "Logistics"],
			},
			{
				name: "Aircraft Fueler",
				what: "Fuels aircraft safely and tests fuel quality.",
				path: "On-the-job training with fixed-base operators.",
				study: ["High School Diploma"],
			},
			{
				name: "Airport Wildlife Biologist",
				what: "Keeps birds and animals away from runways to prevent strikes.",
				path: "Biology or wildlife management degree.",
				study: ["Wildlife Biology", "Ecology"],
			},
			{
				name: "Airport Planner / Engineer",
				what: "Designs runways, terminals and long-term airport growth.",
				path: "Civil engineering or planning degree.",
				study: ["Civil Engineering", "Urban Planning", "Architecture"],
			},
			{
				name: "Aviation Security",
				what: "Screens passengers and protects airports and aircraft.",
				path: "TSA or airport security employment and training.",
				study: ["Criminal Justice", "Homeland Security"],
			},
			{
				name: "Customer Service / Gate Agent",
				what: "Helps passengers check in, board and rebook.",
				path: "Entry-level airline job with airline training; flight benefits are a perk.",
				study: ["Hospitality", "Communications"],
			},
		],
	},
	{
		id: "safety",
		name: "Safety, Investigation & Regulation",
		summary:
			"These people make aviation one of the safest ways to travel, by investigating accidents and writing and enforcing the rules.",
		studies: [
			"Aviation Safety",
			"Engineering",
			"Law",
			"Public Policy",
			"Human Factors",
		],
		careers: [
			{
				name: "Accident Investigator (NTSB)",
				what: "Investigates crashes to find causes and recommend safety changes.",
				path: "Engineering, pilot, maintenance or ATC expertise plus years of experience.",
				study: ["Aerospace Engineering", "Aviation Safety"],
			},
			{
				name: "FAA Aviation Safety Inspector",
				what: "Oversees airlines, repair stations and pilots to make sure they follow regulations.",
				path: "Extensive experience as a pilot, mechanic or avionics technician.",
				credential: "Relevant FAA certificates.",
				study: ["Aviation Science", "Aviation Maintenance"],
			},
			{
				name: "Safety & Quality Auditor",
				what: "Runs safety management programs and audits inside airlines and manufacturers.",
				path: "Aviation degree and operational experience.",
				study: ["Aviation Safety", "Industrial Engineering"],
			},
			{
				name: "Aviation Attorney",
				what: "Handles aviation regulation, accidents, contracts and aircraft transactions.",
				path: "Bachelor’s degree, then law school and the bar exam.",
				study: ["Pre-Law", "Political Science", "Then a J.D."],
			},
			{
				name: "Policy / Regulatory Analyst",
				what: "Shapes aviation rules for governments, airlines and advocacy groups.",
				path: "Policy, economics or aviation degree.",
				study: ["Public Policy", "Economics"],
			},
		],
	},
	{
		id: "business",
		name: "Business of Aviation",
		summary:
			"Airlines and aerospace companies are businesses. They need people who plan networks, set prices, sell aircraft and manage programs.",
		studies: [
			"Business Administration",
			"Finance",
			"Economics",
			"Marketing",
			"Data Science",
			"Supply Chain Management",
		],
		careers: [
			{
				name: "Airline Network Planner",
				what: "Decides which routes an airline flies and how often.",
				path: "Analytical degree and airline internships.",
				study: ["Economics", "Data Science", "Business"],
			},
			{
				name: "Revenue Management Analyst",
				what: "Sets fares and seat inventory to maximize revenue.",
				path: "Quantitative degree; heavy use of data and modeling.",
				study: ["Finance", "Mathematics", "Economics"],
			},
			{
				name: "Aircraft Sales, Leasing & Finance",
				what: "Buys, sells, leases and finances aircraft worth tens of millions of dollars.",
				path: "Finance or business degree; banks and leasing firms hire analysts.",
				study: ["Finance", "Business Administration"],
			},
			{
				name: "Aviation Insurance Underwriter",
				what: "Prices risk and insures aircraft, airlines and airports.",
				path: "Business or finance degree; insurance training programs.",
				study: ["Finance", "Risk Management"],
			},
			{
				name: "Air Cargo & Logistics Specialist",
				what: "Moves freight through global airline and cargo networks.",
				path: "Logistics degree or entry-level cargo operations jobs.",
				study: ["Supply Chain Management", "Logistics"],
			},
			{
				name: "Aerospace Program Manager",
				what: "Leads budgets, schedules and teams that build aircraft or spacecraft.",
				path: "Engineering or business degree plus experience; MBA is common.",
				study: ["Engineering", "Business Administration"],
			},
		],
	},
	{
		id: "military",
		name: "Military & Public Service",
		summary:
			"Every branch flies, and the military trains pilots, controllers and technicians at no cost in exchange for a service commitment.",
		studies: [
			"Any Bachelor’s Degree (required for officers)",
			"ROTC Programs",
			"Service Academies",
		],
		careers: [
			{
				name: "Air Force Pilot or Combat Systems Officer",
				what: "Flies fighters, bombers, tankers, transports and more.",
				path: "Commission through the Air Force Academy, ROTC or Officer Training School, then complete pilot training.",
				study: ["Any Bachelor’s Degree", "STEM Preferred"],
			},
			{
				name: "Navy / Marine Corps Aviator",
				what: "Flies jets, helicopters and tiltrotors, including from aircraft carriers.",
				path: "Commission through the Naval Academy, NROTC or Officer Candidate School, then flight training.",
				study: ["Any Bachelor’s Degree"],
			},
			{
				name: "Army Aviator",
				what: "Flies helicopters such as the Black Hawk, Apache and Chinook.",
				path: "The Army’s warrant officer flight training program accepts applicants without a college degree; officers commission first.",
				study: [
					"High School Diploma (warrant officers)",
					"Any Bachelor’s Degree (officers)",
				],
			},
			{
				name: "Coast Guard Aviator",
				what: "Flies search-and-rescue, law-enforcement and environmental missions.",
				path: "Commission through the Coast Guard Academy or OCS; the College Student Pre-Commissioning Initiative helps students.",
				study: ["Any Bachelor’s Degree"],
			},
			{
				name: "Military Air Traffic Controller or Aircraft Maintainer",
				what: "Enlisted careers that train you in ATC or maintenance, skills that carry over to civilian jobs.",
				path: "Enlist and qualify for the career field through the ASVAB.",
				study: ["High School Diploma"],
			},
			{
				name: "Civil Air Patrol Cadet",
				what: "The Air Force auxiliary’s youth program: orientation flights, leadership and STEM, starting at age 12.",
				path: "Join a local squadron; a great way to start in high school.",
				study: ["Open to Middle and High School Students"],
			},
			{
				name: "Law-Enforcement & Public-Safety Aviation",
				what: "Police, border and wildfire agencies fly patrol, rescue and surveillance missions.",
				path: "Usually experienced officers or agents who then train as pilots.",
				study: ["Criminal Justice", "Aviation Science"],
			},
		],
	},
	{
		id: "health",
		name: "Health & Medicine",
		summary:
			"Doctors, nurses and psychologists keep pilots, crews and patients healthy, safe and fit to fly.",
		studies: ["Biology / Pre-Med", "Nursing", "Paramedicine", "Psychology"],
		careers: [
			{
				name: "Aviation Medical Examiner / Flight Surgeon",
				what: "Doctors who give pilots and controllers their medical certificates, or care for military aircrew.",
				path: "Medical school and residency, then FAA designation or military flight-surgeon training.",
				study: ["Pre-Med / Biology", "Medical School (M.D./D.O.)"],
			},
			{
				name: "Flight Nurse / Flight Paramedic",
				what: "Cares for critically ill patients on medical helicopters and jets.",
				path: "Nursing degree (or paramedic training) plus several years of critical-care experience.",
				study: ["Nursing (BSN)", "Paramedicine"],
			},
			{
				name: "Aviation Psychologist",
				what: "Studies pilot performance, fatigue and crew teamwork, and helps select candidates.",
				path: "Psychology degree with graduate study.",
				study: ["Psychology", "Human Factors"],
			},
		],
	},
	{
		id: "media",
		name: "Education & Media",
		summary:
			"Teachers, curators, journalists and marketers share aviation with the world and inspire the next generation.",
		studies: ["Education", "History", "Journalism", "Photography", "Marketing", "Communications"],
		careers: [
			{
				name: "Aviation Educator",
				what: "Teaches aviation in high schools, colleges and flight academies.",
				path: "Education or aviation degree; flight instructor certificate helps.",
				study: ["Education", "Aviation Science"],
			},
			{
				name: "Museum Curator / Historian",
				what: "Preserves and explains aviation history at places like the Intrepid and the Smithsonian.",
				path: "History or museum studies, often with a graduate degree.",
				study: ["History", "Museum Studies"],
			},
			{
				name: "Aviation Journalist or Photographer",
				what: "Covers the industry, reviews aircraft and captures air-to-air photography.",
				path: "Journalism or photography degree and a strong portfolio.",
				study: ["Journalism", "Photography", "Communications"],
			},
			{
				name: "Aviation Marketing & Communications",
				what: "Tells an airline or aerospace brand’s story through campaigns and media.",
				path: "Marketing or communications degree.",
				study: ["Marketing", "Communications"],
			},
		],
	},
];

export const startNow = [
	{
		title: "Come to a flight sim meeting",
		body: "Get stick time for free in StuyAviators’ Flight Simulator Demonstrations.",
	},
	{
		title: "Take a discovery flight",
		body: "Many flight schools offer an introductory lesson where you fly with an instructor.",
	},
	{
		title: "Join Civil Air Patrol",
		body: "Cadets from age 12 get orientation flights, leadership training and aerospace education.",
	},
	{
		title: "Earn your drone certificate at 16",
		body: "The FAA Part 107 knowledge test is your first real aviation credential.",
	},
	{
		title: "Learn from people who do it",
		body: "Ask questions at StuyAviators guest speaker events and visit airports and museums on group trips.",
	},
];
