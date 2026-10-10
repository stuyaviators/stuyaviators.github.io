# Content inventory: `main` (Mobirise site)

Audit of all 14 HTML pages on `main` as of commit `4b2ccd1` (2026-10-10), plus where `recode`
(`654e855`) disagrees. Long paragraphs are referenced by section ID and opening words instead of
reproduced; the full text will stay in `legacy/*.html` and will be copied **verbatim** into the new
site unless a "Decision" item below says otherwise.

Legend: **KEEP** = real content, carried over as written · **CUT** = generic/filler/template ·
**BROKEN** = doesn't work · **DECIDE** = needs an answer from you · **VS** = `main` vs `recode`.

---

## Site-wide (every page)

**KEEP**
- Logo `assets/images/frame-1.png` (3696×3696 PNG, also the favicon). Brand blue sampled from it:
  `#0C64A9`.
- Nav labels and grouping: About (Our Mission, Our Story, Club Charter, Rules & Expectations) ·
  Explore (Meetings, Opportunities, Scholarships, Future Careers) · Get Involved (Join the Flight
  Crew, Share Your Story, Feature Photos & Videos) · Connect (Socials, Contact Us).
- "JOIN NOW" CTA → `https://epsilon.stuysu.org/stuyaviators`.
- Per-page `<meta name="description">` text (reused for the Metadata API; each one equals that
  page's hero subtitle).

**CUT**
- Mobirise footer badge on every page, each with a different SEO anchor: "AI Website Software"
  (index), "AI Website Generator" (mission, careers), "Website Building Software" (story), "Free AI
  Website Builder" (charter, scholarships, flight-crew), "HTML Generator" (expectations), "Offline
  Website Builder" (meetings, contact-us), "Best AI Website Creator" (opportunities, share-story),
  "AI Website Builder" (highlights), "Offline Website Creator" (socials). Plus the 1×1 tracking GIF
  link to `mobiri.se/4183083`.
- Full-screen hero on every page with a "Learn More" / "Connect now" button that only scrolls to the
  next section.
- All Mobirise runtime: Bootstrap, jQuery-era plugins, Formoid, Embla, masonry, parallax,
  ytplayer/vimeoplayer, smoothscroll, dropdown, socicon, animatecss.

**BROKEN**
- The four top-level nav items (ABOUT / EXPLORE / GET INVOLVED / CONNECT) link to
  `https://mobiri.se`, so clicking a group label leaves the site.
- No real footer: no contact info, socials, or school affiliation anywhere except their own pages.
- Images are 137 MB total. The largest originals are 4–8 MB (`image-3.png` 8.1 MB,
  `img-6477-original.png` 7.8 MB, `img-4359.jpg` 4.5 MB). OG images are 4000–5700 px wide and up to
  2.9 MB (should be 1200×630).
- Unused files: `contact-us-meta.jpeg`, `image%25202-2000x1125.png`, `image0-4.jpeg`, `hashes.json`.
- Alt text is filenames ("feature-1", "story-3", "jerry-crew") or worse ("Mobirise Website
  Builder", "temporary").

---

## 1. `index.html` → Home

**KEEP**
- H1 "STUYAVIATORS".
- Tagline: "Bringing aviation to life at Stuyvesant High School, making the skies inclusive and
  accessible, and inspiring today's youth to become tomorrow's aviation leaders."
- Testimonials (section `people02-13`):
  - "Joining StuyAviators gave me a sense of community at a new school. It was the first club I
    joined over the summer, and I'm glad I did. Through the club, I have been able to meet
    like-minded people who love aviation, as well as gain valuable connections in the industry."
    — Yunus Gubrud ('28)
  - "StuyAviators has allowed me to make so many aviation-loving friends. Their meetings give me
    opportunities I wouldn't have had otherwise and have become something I look forward to each
    week." — Anonymous
- Background videos from the club's own YouTube channel (`@stuyaviators`):
  `https://youtu.be/eHTaCeVl_wo` ("web-video-1", hero) and `https://youtu.be/Z3JjQClGkOo`
  ("web-video-2", testimonials). Testimonial background image `image-3.png`.
- OG image `index-meta.png`.

**CUT**
- Slogan carousel (`gallery08-14`): "Dream • Create • Inspire", "From idea to reality • Start
  small", "Be fearless • Start now!".
- "WHAT OUR MEMBERS SAY" intro sentence "Our members share their experiences, what they've
  learned, and how StuyAviators has made aviation more fun and accessible." (generic; the quotes
  speak for themselves). *Flag only; cut on your OK.*

**DECIDE**
- **D1.** The two YouTube videos were silent autoplay backgrounds. Options: (a) drop them, (b) show
  one as a click-to-play lite embed ("See a meeting"), (c) keep a muted looping background (heavy;
  not recommended). Recommend **(b)**.

---

## 2. `mission.html` → About

**KEEP**
- Hero: "OUR MISSION" + "Uniting students to explore aviation through hands-on projects,
  simulations, labs, and challenges, fostering teamwork, technical skills, and leadership while
  turning a passion for flight into real-world experience."
- "ABOUT PROJECT SKYLAB" (`article12-7`), three paragraphs: "Project Skylab's name takes
  inspiration from the United States' first space station, Skylab, which was launched by NASA in
  May 1973 and was in operation until July 1979." / "Project Skylab aims to inspire future
  generations…" / "Beyond simulation, Project Skylab engages students with community-led
  presentations…" ("Our mission is simple: make aviation education inclusive, accessible, and
  inspiring.")
- "OBJECTIVES" (`features029-9`): intro paragraph, three stage paragraphs, and the numbered
  summaries:
  - 01. "Establish a thriving aviation community where curiosity and passion for flight can take
    root."
  - 02. "Grow the club's impact by offering advanced experiences, guest speakers, and more
    hands-on learning opportunities."
  - 03. "Deliver a permanent flight simulation device and advocate for aviation education at
    Stuyvesant High School."
  - Detail: the final stage commissions a full-sized flight simulator "nicknamed the 'Skylab'".
- Images: hero `img-6328.jpg`, Impact background `img-6584-2000x2667.jpeg`, OG `mission-meta.jpg`.

**CUT / REWRITE (flag only)**
- "IMPACT & BENEFITS" (`features010-6`): four paragraphs (Educational Enrichment, Skill
  Development, Inclusivity & Accessibility, Career Pathways). These read as generated filler ("bring
  STEM concepts to life", "cultivate confidence and initiative") and repeat the Skylab and charter
  text. Recommend cutting them or condensing each to one specific sentence. **DECIDE D2.**
- Objectives intro paragraph ("Project Skylab is designed as a step-by-step journey…") repeats
  the three stages. Recommend cutting. Part of **D2**.

---

## 3. `story.html` → Our Story

**KEEP**
- Hero: "OUR STORY" + "From a small group of aviation enthusiasts to a thriving student community,
  StuyAviators' history highlights milestones, achievements, and a dedication to education,
  collaboration, and a passion for flight."
- "Founded on November 19, 2022".
- "StuyAviators was founded by Jerry Qiu ('26) and William Vongphanith ('23) to unite students
  passionate about aviation…" (2 paragraphs).
- "FROM HOBBY TO INITIATIVE" paragraph.
- "LAUNCHING PROJECT SKYLAB": image `img-6526202-1696x1272.jpeg` with caption "January 8, 2025: Our
  first guest speaker event, featuring Alvin Arjoon (AVHS '24)." Then 5 paragraphs, including "In
  the 2024-25 school year…" and "With guidance from faculty advisor Mr. Dillon, the club acquired
  professional-grade flight simulation software and realistic controls…".
- Images: hero `img-6093-2000x1500.jpeg`, OG `story-meta.jpeg`.

**Timeline items for the waypoint layout** (dates from the copy only; nothing invented):
Nov 19, 2022 founded → early days / hobby to initiative (undated) → 2024–25 Project Skylab
launched → Jan 8, 2025 first guest speaker.

**CUT / REWRITE (flag only)**
- Closing paragraph "Project Skylab set the foundation for future growth, ambitious initiatives,
  and opportunities for every member to soar beyond the classroom…" is generic. Recommend cutting.
  **D2.**

**DECIDE**
- **D3.** The story stops at January 2025. Any 2025–26 milestones to add (trips, competitions,
  simulator purchase, new leadership)? I won't write any without your text.

---

## 4. `charter.html` → Club Charter

**KEEP** (all of section `list02-t`, verbatim)
- "THE FOUNDATION OF OUR CLUB" intro.
- "OUR PURPOSE": 4 paragraphs, including the career-paths list (piloting, drone operation, air
  traffic control, aerial firefighting, search and rescue, United States Air Force, aerospace /
  aeronautical / astronautical / mechanical engineering, aviation technology, avionics).
- "WHEN WE MEET": "Wednesday, Thursday, Friday".
- "SCHEDULE OVERVIEW": 5 paragraphs, including SING! season / AP Exam Month pauses and RUSH events
  ("Relax, Unwind, Simulate, Hangout").
- "TYPICAL MEETING STRUCTURE": "approximately 75 minutes — from the end of school until 5:00 PM",
  plus the meeting-type list and a link to `/meetings`.
- "LEADERSHIP APPOINTMENT PROCEDURES": Helpers, Department Heads (biannual applications), Vice
  Presidents, Co-Presidents succession, and the disciplinary paragraph with links to:
  - `/expectations`
  - Student Union rules `https://epsilon.stuysu.org/rules`
  - Stuyvesant HS `https://stuy.enschool.org/apps/pages/index.jsp?uREC_ID=126635&type=d`
  - NYC DOE A-601 `https://www.schools.nyc.gov/docs/default-source/default-document-library/a-601-english.pdf`

  All three external links return 200.
- "WHAT MAKES US UNIQUE": 5 paragraphs, including the X-Plane 12 / FAA-certified flight training
  devices line and the motto "For the community, by the community."
- Pull quote: **"Aviation didn't formally exist at Stuyvesant—so we built the space for it."**
  (proposed as the homepage's mission line).
- Images: hero `img-6080.jpeg`, OG `charter-meta.jpeg`.

**CUT / REWRITE (flag only)**
- "Our sophisticated appointment procedures are crucial to the successful operation of
  StuyAviators." "Sophisticated" reads oddly. Suggest "Our appointment procedures keep
  StuyAviators running smoothly." **D2.**

---

## 5. `expectations.html` → Rules & Expectations

**KEEP** (verbatim)
- "CODE OF CONDUCT" intro + 10 numbered items: Respect for All · Prohibition of Malicious Humor ·
  Commitment to Inclusivity · Responsible Use of Resources · Collaboration and Cooperation ·
  Respectful Communication · Adherence to Leadership and Advisor Guidance · Privacy and Consent ·
  Dedication to Learning · Compliance with Institutional Policies (same 3 external links as the
  charter).
- "ATTENDANCE POLICY": 3 paragraphs (general members not required to attend; leadership expected
  to).
- "MEETING ETIQUETTE": Attendance Recording (first 15 min) · Meeting Cancellations (20 min no-show)
  · Punctuality and Courtesy · Conduct and Behavior.
- "CANCELLATIONS & RESCHEDULING": 3 paragraphs (12-hour notice via Discord, email or Epsilon).
- Images: hero `img-4177-1464x1098.jpeg`, OG `expectations-meta.jpeg`.

**CUT**: hero subtitle only if you approve a shorter page intro (**D2**).

---

## 6. `meetings.html` → Meetings

**KEEP**
- Intro: "Discover our six core meeting types, along with two pilot sessions currently being tested
  to expand our offerings."
- Eight meeting types, each with an image, tagline and paragraph (verbatim):

  | Code | Name | Tagline | Image |
  |---|---|---|---|
  | FSD | Flight Simulator Demonstrations | "Experience flight, anytime, anywhere!" | `img-6464.jpeg` |
  | CLP | Community-Led Presentations | "For the community, by the community!" | `img-4296.jpg` |
  | PCI | Plane Crash Investigation Labs | "Think like an NTSB investigator!" | `img-6581.jpg` |
  | — | Aviation Challenges & Competitions | "Test your skills, compete, and soar!" | `20241018-161455.jpeg` |
  | — | Guest Speaker Events | "Learn from professionals!" | `img-6538.jpg` |
  | — | Group Trips | "Learning beyond the classroom!" | `img-6205.jpeg` |
  | ATC | [NEW] Air Traffic Control Simulation | "Coordinate, communicate, conquer the airspace." | `20241019-112057.jpg` |
  | SLC | [NEW] Student-Led Courses | "Get a head start on flight training and theory!" | `ff992932-…jpeg` (alt "slc-temp") |
- "HAVE AN IDEA FOR A MEETING?" form: "We're always looking to improve and expand our sessions—your
  input matters!" Fields: Full Name, Email, Suggestion. Button "LET US KNOW!". Success: "Thanks for
  your input!"
- Images: hero `img-6441.jpeg`, OG `meetings-meta.jpeg`.

**BROKEN / NOTE**
- Both forms on the site (this one and the mailing list) post to Mobirise's Formoid service
  (`mobirise.eu`), which emails whoever owns the Mobirise account. **DECIDE D4:** who receives these
  today, and is there anything in that inbox to migrate? The rebuild saves meeting ideas to
  Postgres (dashboard inbox).
- SLC image alt "slc-temp" suggests a placeholder photo. **DECIDE D5:** keep it or replace it?
- There are **no actual meeting dates** anywhere on the site, only the general schedule in the
  charter. The departure board needs real upcoming meetings (date, time, room, type) from officers.
  Until they exist, it falls back to the charter schedule ("Wed–Fri · end of school – 5:00 PM").

---

## 7. `opportunities.html` → Opportunities

**KEEP**
- Hero subtitle / meta: "Discover aviation programs, internships, and hands-on experiences that help
  students develop skills, deepen their passion for flight, and connect with industry mentors."
- OG `opportunities-meta.jpg`, hero `20241019-94955.jpg`.

**CUT**
- "EXPLORE OPPORTUNITIES" paragraph (generic; repeats the hero).
- "Coming Soon!" empty state and its "Learn More" button.

**BROKEN**: "Learn More" button has no `href`. The page has no listings.

**DECIDE**
- **D6.** Do you have any real opportunities or scholarships to seed? Otherwise both pages launch
  with the designed empty state.

---

## 8. `scholarships.html` → Scholarships

Same structure as Opportunities. **KEEP** the hero subtitle, OG `scholarships-meta.jpg` and hero
`img-4028.jpg`. **CUT** the "EXPLORE SCHOLARSHIPS" paragraph and the "Coming Soon!" block.
**BROKEN**: "Learn More" with no `href`.

---

## 9. `careers.html` → Future Careers

**KEEP**: hero subtitle, hero image `20241019-111042.jpg`, OG `careers-meta.jpg`.

**CUT / BROKEN**
- The whole body is a placeholder: "COMING SOON! This page is work-in-progress; check back later!",
  two "N/A" cells, and a "Learn more" link back to `/careers`.

**DECIDE**
- **D7.** Options: (a) drop the page and redirect `/careers` → `/opportunities` (recommended), (b) a
  short "Career paths" section on Opportunities using the charter's existing career list verbatim,
  (c) keep a Careers page and you supply content. (a) and (b) can be combined.

---

## 10. `flight-crew.html` → The Flight Crew

**KEEP**
- Hero subtitle: "Meet the team that keeps StuyAviators running…"
- "POSITIONS": 9 positions, each with a commitment level and Responsibilities / Prerequisites
  lists (verbatim):
  - Trainee Pilot (Pre-Vice President), Very High
  - Flight Engineer (Secretary), High
  - Flight Navigator (Coordinations), Medium
  - Radio Operator (Communications), Medium
  - Aircraft Mechanic (Finance), Low
  - Flight Technician (IT), Medium
  - Air Traffic Controller (Outreach), Medium
  - Flight Attendant (Helper), Low
  - First Class (Expert), Very Low (uses an "Achievements" heading instead of "Prerequisites")
- "WANT TO JOIN THE TEAM?" paragraph + "APPLY NOW" → `https://forms.gle/4dRYhvUt7iZH7u9E6`.
- People (name, class, role, photo):

  | Group | Name | Role | Photo |
  |---|---|---|---|
  | Current | Jerry Qiu ('26) | Co-Founder & Captain (President) | `jerry-qiu-1.jpeg` |
  | Current | Matthew Lin ('26) | First Officer (Vice President) | `unnamed-8-matthew-lin.jpg` |
  | Current | Andrew Zhang ('27) | Second Officer (Vice President) | `img-2296-andrew-zhang-1.jpeg` |
  | Current | Alexander Smelyansky ('27) | Third Officer (Vice President) | `img-20241004-…-alexander-smelyansky-1.jpeg` |
  | Current | Allyson Win ('27) | Flight Engineer (Secretary) | `20241007-234842-allyson-win.jpg` |
  | Current | Andrew Archvadze ('28) | Flight Engineer (Secretary) | **`shop2.jpg` = Mobirise stock photo (soap bottles)** |
  | Current | Chloe Tam ('26) | Air Traffic Controller (Outreach) | `img-1184-chloe-tam-2.jpeg` |
  | Current | Evan Ye ('27) | Aircraft Mechanic (Treasurer) | `evanye-headshot.jpeg` |
  | Past | William Vongphanith ('23) | Co-Founder & First Officer (Vice President) | `william-v.jpeg` |
  | Past | Florence Wu ('27) | Radio Operator (Communications) | `florence-niuniu-wu.webp` |
  | Advisor | Mr. James Dillon | (2024 - Present) | `dillon-pic.jpeg` |
  | Helper | Steven Wu ('26) | Flight Attendant (Helper) | `bucaramanga-cliff-steven-wu-1.jpeg` |
  | Helper | Matthew Karp ('26) | First Class (Expert) | `20240616-152704-matthew-karp.jpeg` |
  | Helper | Yunus Gubrud ('28) | Flight Attendant (Helper) | `yunus-stuy-aviators-picture-yunus-gubrud.jpeg` |
  | Helper | Ethan Saldanha ('26) | Flight Attendant (Helper) | **`shop3.jpg` = Mobirise stock photo (teddy bear)** |
  | Alliance (SAAA) | Esther Lee ('26) | K2-18B Rocketry President | `estherl-headshot.jpeg` |
- SAAA paragraph: "The Stuyvesant Aviation & Aerospace Alliance (SAAA) brings together student
  clubs…"
- Images: hero `img-4029.png` (also the "Want to join" background), Alliance background
  `clouds-2295189.jpg`, OG `flight-crew-meta.png`.

**BROKEN**
- Two stock placeholder headshots (above). Their alt texts are "temporary" and "Mobirise Website
  Builder".
- The "APPLY NOW" form redirects to Google sign-in (HTTP 401). It's probably restricted to
  `@stuy.edu` accounts.

**DECIDE**
- **D8 (important). The roster is out of date.** It's October 2026, so everyone marked '26 (Jerry
  Qiu, Matthew Lin, Chloe Tam, Steven Wu, Matthew Karp, Ethan Saldanha, Esther Lee) graduated in
  June. Who is the 2026–27 Flight Crew, and should the '26 members move to Past Leadership / Past
  Helpers?
- **D9.** Real photos for Andrew Archvadze and Ethan Saldanha, or use a neutral initials
  placeholder (recommended over stock photos)?
- **D10.** Evan Ye's role says "Aircraft Mechanic (Treasurer)" but the position is "Aircraft
  Mechanic (Finance)". Which one?
- **D11.** Is the crew application form current, and is the `@stuy.edu` sign-in restriction
  intended? If so, the button will say "Stuy account required".

---

## 11. `share-story.html` → Share Your Story

**KEEP**
- Hero subtitle: "A space for members to share their personal journeys…"
- "STORY SPOTLIGHTS" images (8, uncaptioned real member photos: flight-deck views, cockpit selfie,
  etc.): `505114239-…n.jpeg`, `image-2025-08-28t165750.313-2.png`, `img-3870.jpeg`,
  `img-6477-original.png`, `image0-2.jpeg`, `img-4081.jpeg`, `img-2792.jpeg`, `img-3806.jpeg`.
- "STORIES WE'VE SHARED": 3 member stories, verbatim:
  - **Yunus Gubrud**, Stuyvesant High School Class of 2028 (`image0.jpeg`): "Yunus has always had a
    curiosity for aviation…"
  - **Jerry Qiu**, Class of 2026 (`img-3478.jpeg`): "Jerry has transformed a lifelong curiosity
    about aviation into a serious pursuit…"
  - **Matthew Monge**, Class of 2024 (`img-6897-original.jpeg`): "Matthew Monge is a mechanical
    engineering undergraduate at NYU…" (film title *Apollo 13* in italics).
- "READY TO SHARE YOUR STORY?" → `aviators-outreach@stuy.edu` or Instagram DM.
- Images: hero `img-3212.jpeg`, OG `share-story-meta.jpeg`.

**CUT (flag only)**
- "Behind every face is a story worth sharing. Story Spotlights shine a light on…" (filler, 4
  sentences). Recommend replacing it with one line. **D2.**

**DECIDE**
- **D12.** The 8 spotlight photos have no captions or names. Should they get captions (you supply
  them), or move into the Gallery as plain photos?

---

## 12. `highlights.html` → Community Highlights

**KEEP**
- "WANT TO SEE YOUR CONTENT FEATURED?" → send to `aviators-media@stuy.edu` "including your name and
  a brief description…"
- "FEATURED MOMENTS": 33 community photos (list in the HTML, `gallery02-1y`; each appears twice
  because of the lightbox).
- Images: hero `504463674-…n.jpeg`, OG `highlights-meta.jpeg`.

**CUT (flag only)**
- "FEATURES" paragraph ("Features is the place to share your aviation photos and videos…
  Features celebrates the creativity, passion, and dedication…") and the "FEATURED MOMENTS" intro
  paragraph. Both are filler. **D2.**

**BROKEN / NOTE**
- The page name differs in three places: `<title>` "Community Highlights", nav "Feature Photos &
  Videos", section heading "FEATURES". It also promises videos but contains none.
- Alt texts are "feature-N" (duplicates: two "feature-13") and "Mobirise Website Builder" ×33.

---

## 13. `socials.html` → Socials

**KEEP**
- "STAY IN THE LOOP":
  - Instagram `https://www.instagram.com/stuyaviators`
  - Discord `https://discord.gg/PCywWHervk` (invite checked: valid)
  - Facebook group `https://www.facebook.com/groups/stuyaviators`
  - Epsilon `https://epsilon.stuysu.org/stuyaviators`
- "MAILING LIST" form: fields "Your Full Name" and "Stuyvesant Email Address", button "Sign up!".
  Success copy "Thanks for signing up for the mailing list! +1 giveaway entry granted".
- Images: hero `img-6082.jpeg`, OG `socials-meta.jpeg`.

**DECIDE**
- **D13.** "Join the mailing list for a free candy and +1 entry in our giveaway!" Is the
  candy/giveaway still running? If not, the new copy will be "Join the mailing list" with a neutral
  success message.
- **D14.** The club's YouTube channel (`youtube.com/@stuyaviators`) exists but isn't linked
  anywhere. Add it to socials?
- **D15.** Keep Facebook? `recode` deliberately removed it (commit `3237cbe` "remove facebook").

---

## 14. `contact-us.html` → Contact Us

**KEEP**
- "School: aviators-outreach@stuy.edu", "Other: stuyaviators@gmail.com", "Address: 345 Chambers St,
  New York, NY 10282".
- "Should you wish to contact us, please send an email to our school email address. Expect
  responses within 3-5 business days."
- Google Maps embed. It already uses the keyless `maps/embed?pb=…` form ("Stuyvesant High School"
  pin), so it can be reused as is.
- Images: hero `img-6085.jpg`, OG `contact-us-meta.jpg`.

**CUT (flag only)**: the 3-sentence hero paragraph ("Reach out to StuyAviators for any questions,
ideas, or collaboration opportunities. Whether you're interested in…"). **D2.**

**DECIDE**
- **D16.** Club email addresses found: `aviators-outreach@stuy.edu` (contact, stories),
  `aviators-media@stuy.edu` (photo submissions), `stuyaviators@gmail.com` (other), and
  `aviators-exec@stuy.edu` (LICENSE only). Should all four stay public, and which one receives the
  new contact form's notifications? (Note: the form saves to the dashboard inbox; there's no email
  API, so nobody gets emailed automatically.)

---

## `main` vs `recode` disagreements

| Topic | `main` | `recode` | Proposed |
|---|---|---|---|
| Contact emails | outreach@ + gmail (+ media@ on Highlights) | outreach@ + gmail only | Keep all from `main` (D16) |
| Address | 345 Chambers St, New York, NY 10282 | same | same |
| Map | Google keyless embed | Mapbox GL (needs token) | Google keyless embed |
| Socials | Instagram, Discord, Facebook, Epsilon | Discord, Instagram; Epsilon as header button; Facebook removed | D14 / D15 |
| Discord invite | `discord.gg/PCywWHervk` | same | same |
| Join CTA | "JOIN NOW" → Epsilon | Epsilon wordmark button → Epsilon | "Join Now" → `/join` page with Epsilon as the main action (see proposal) |
| Socials + contact pages | `/socials`, `/contact-us` | `/connect` | `/connect` |
| Crew page | `/flight-crew` "The Flight Crew" | `/leadership` (empty); `/about` heading "Meet the team" | `/flight-crew` (club's own term) |
| Photos page | `/highlights` "Community Highlights" / "Feature Photos & Videos" | `/gallery` (empty) | `/gallery` |
| Hero line | Tagline above | "Stuyvesant High School's Aviation Club" | `main` tagline, with recode's line as the eyebrow label |
| Logo | `frame-1.png` (blue on transparent) | `stuyaviators.png` (same art) + `logo.png` (white on blue disc) | Keep both variants |
| Newsletter "Epsilon" link | n/a | `https://stuyaviators.github.io` (wrong) | `https://epsilon.stuysu.org/stuyaviators` |
| Site domain | `stuyaviators.github.io` | `stuyaviators.vercel.app` | `stuyaviators.vercel.app` (existing Vercel project in your account; see proposal §Hosting) |
| Copyright | "© 2025 StuyAviators" (LICENSE) | "© 2025" (newsletter) | Generate the year automatically |
