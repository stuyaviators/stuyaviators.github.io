# Rebuild proposal: page structure, design, Phase 4 menu

Companion to [content-inventory.md](content-inventory.md) (decisions **D1–D16**) and
[recode-port.md](recode-port.md).

---

## 1. Page structure

Old slugs are kept wherever the page survives, so most old clean URLs keep working with no
redirect. Pages are merged only where both halves are thin or overlapping.

| New URL | Built from | Notes |
|---|---|---|
| `/` | index | Hero, departure board, mission line, meeting types, quotes, Instagram strip, sign-up |
| `/about` | mission | Mission + Project Skylab + 3-stage roadmap (waypoint layout). recode's `/about`. |
| `/story` | story | Waypoint timeline |
| `/charter` | charter **+ expectations** | One governance document with a sticky table of contents: Purpose · Meetings · Leadership · Code of Conduct · Attendance · Etiquette · Cancellations. *Merge is optional; say if you'd rather keep two pages.* |
| `/meetings` | meetings | Departure board (upcoming), 8 meeting types, schedule overview, meeting-idea form → Postgres |
| `/opportunities` | opportunities | DB-driven boarding-pass cards, filters, search, "Closing soon", collapsed "Past" |
| `/scholarships` | scholarships | Same component, scholarship fields (amount) |
| `/flight-crew` | flight-crew | Positions, Apply, current/past leadership, advisor, helpers, Alliance |
| `/gallery` | highlights (+ spotlight photos from share-story, D12) | Photo grid with lightbox, "Submit your photos" |
| `/stories` | share-story | 3 member stories + share-your-story form → Postgres |
| `/connect` | socials **+** contact-us | Contacts with copy, map, socials, Instagram grid with profile header, contact form → Postgres, mailing list |
| `/join` | *(new, short)* | Target of "Join Now". Steps: join on Epsilon (primary) → Discord → mailing list → come to a meeting. Uses only existing links and copy. No separate join form (it would duplicate Epsilon). |
| `/newsletter/unsubscribe` | new | Google Form when configured, else `mailto:` |
| `/newsletter/[slug]` | new | Published web versions (Phase 3) |
| `/dashboard/**` | new | Behind Google sign-in; not in public nav |
| — | careers | **Dropped** → redirect to `/opportunities` (D7) |

### Nav

```
[logo] StuyAviators    About ▾        Explore ▾        Community ▾     Connect    [ Join Now ]
                       About & Skylab Meetings         Flight Crew
                       Our Story      Opportunities    Gallery
                       Charter & Rules Scholarships    Member Stories
```

- Group labels are `<button>`s (disclosure pattern, not `role="menu"`). Enter/Space/↓ opens,
  Escape closes and returns focus, and Tab moves through the links. They no longer link to
  mobiri.se.
- Mobile: full-width sheet with the same groups as headings, and Join Now pinned at the bottom.
- Footer: logo + tagline · socials · contact emails · address · mailing-list sign-up · "Stuyvesant
  High School · 345 Chambers St" · "Officer login" (small) · © year.

### Redirects (`next.config.ts`, all `permanent: true` → 308)

| From | To |
|---|---|
| `/index.html`, `/index` | `/` |
| `/mission`, `/mission.html` | `/about` |
| `/story.html` | `/story` |
| `/charter.html` | `/charter` |
| `/expectations`, `/expectations.html` | `/charter#code-of-conduct` |
| `/meetings.html` | `/meetings` |
| `/opportunities.html` | `/opportunities` |
| `/scholarships.html` | `/scholarships` |
| `/careers`, `/careers.html` | `/opportunities` |
| `/flight-crew.html` | `/flight-crew` |
| `/leadership` (recode) | `/flight-crew` |
| `/share-story`, `/share-story.html` | `/stories` |
| `/highlights`, `/highlights.html` | `/gallery` |
| `/socials`, `/socials.html` | `/connect` |
| `/contact-us`, `/contact-us.html` | `/connect` |
| `/email-builder` (recode) | `/dashboard/newsletter` |

Old in-page anchors (e.g. `/mission#article12-7`) are dropped by the redirect; the target page
still loads. The `gh-pages` redirect branch (Phase 5) mirrors these 14 `.html` files.

---

## 2. Design

**Direction:** an airline or aerospace operations site. Flat, precise and typographic, with the
aviation identity carried by **data styling**, not illustration. Real club photography does the
emotional work.

### Palette (anchored on the logo blue `#0C64A9`, accent = runway amber)

| Token | Dark (default at night) | Light | Use |
|---|---|---|---|
| `bg` | `#0A1422` night navy | `#F7F5F0` chart paper | page |
| `surface` | `#12223A` | `#FFFFFF` | cards |
| `text` | `#E8EEF5` (15.8:1) | `#0B1A2C` (16.1:1) | body |
| `muted` | `#9FB0C4` (8.4:1) | `#4A5B70` (6.4:1) | secondary text |
| `brand` | `#5AA9E6` (7.3:1) | `#0C64A9` (5.7:1) | links, focus ring |
| `accent` | `#F5B83D` amber (10.4:1) | `#F5B83D` fill + navy text (9.9:1); `#8A5A00` as text (5.4:1) | CTA, "Closing soon", board text |
| `field-border` | `#5F7A9C` (4.2:1) | `#6B8299` (3.7:1) | inputs (≥3:1 non-text) |
| `hairline` | `#1E3350` | `#DCE1E8` | decorative dividers only |
| `board` | `#05090F` bg + `#FFC845` text (12.9:1) | same (the board stays dark in both themes) | departure board |
| `danger` | `#FF8A80` | `#B42318` | errors |

All text pairs were computed against WCAG AA (≥4.5:1 text, ≥3:1 UI). Theme follows
`prefers-color-scheme`, with a manual Light/Dark/System toggle in the header (stored in
`localStorage`, applied pre-paint with an inline script so there's no flash).

### Type
- **Lexend** (400/500/600): body and headings. Headings 600 with slight negative tracking; body
  17–18 px, line-height 1.6.
- **B612** (400/700): labels, flight-strip headers, badges, nav group labels. Uppercase, +0.08 em
  tracking.
- **B612 Mono**: departure board, stat counters, deadlines, amounts (tabular figures).
- All three via `next/font/google` (self-hosted at build, no runtime Google Fonts request).

### Motifs (five of the listed ideas, used sparingly)
1. **Flight-strip section labels.** A thin bordered strip above each section heading: amber left
   bar · `02` · `MEETINGS` · right-aligned `STUY · EST 2022`. B612, 12 px.
2. **Departure board** for upcoming meetings, on home and `/meetings`. Columns TIME · DATE ·
   MEETING (code + name) · ROOM · STATUS (`ON TIME` / `CANCELLED` / `MOVED`). Characters do a short
   split-flap flip once on first view (static under reduced motion). Fallback row when empty:
   `WED–FRI · END OF SCHOOL–17:00 · SEE DISCORD` (charter wording; no invented times).
3. **Boarding-pass cards** for crew, opportunities and scholarships. Main body (title, org, short
   description) plus a stub after a perforated divider with the data fields (DEADLINE / AMOUNT /
   GRADES, or ROLE / CLASS for crew).
4. **Waypoint path.** A dashed route line with waypoint diamonds linking timeline items on `/story`
   and the 3 Skylab stages on `/about`.
5. **Runway centerline divider.** A dashed amber line with threshold bars, used between major
   homepage sections only.

Not used: chart textures, altitude dials, any plane clip-art. Stats appear as plain B612 Mono
readouts using real numbers only (Est. 2022 · 8 meeting types · crew count from DB · Instagram
followers from Behold).

### Motion
- Ported `Stagger` for section entrances (fixed, see recode-port.md).
- One hero moment: a 1 px contrail line draws left-to-right behind the H1 (1.4 s, once), ending in
  a small geometric top-down airliner silhouette (simple SVG, not a cartoon).
- `prefers-reduced-motion`: no entrance, no contrail draw (rendered in its final state), no
  split-flap, and the header shows/hides instantly.

### Homepage wireframe (desktop; mobile stacks top to bottom)

```
┌──────────────────────────────────────────────────────────────────────────────┐
│ (logo) StuyAviators   About▾  Explore▾  Community▾  Connect   ◐   [Join Now] │  floating, hides on scroll
└──────────────────────────────────────────────────────────────────────────────┘
┌──────────────────────────────────────────────────────────────────────────────┐
│  STUYVESANT HIGH SCHOOL'S AVIATION CLUB · EST. NOV 19 2022    (B612 eyebrow) │
│                                                                              │
│  StuyAviators                                    ┌─────────────────────────┐ │
│  ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ✈ (contrail)            │  club photo             │ │
│  Bringing aviation to life at Stuyvesant High    │  (cockpit / sim night)  │ │
│  School, making the skies inclusive and          │  next/image priority    │ │
│  accessible, and inspiring today's youth to      └─────────────────────────┘ │
│  become tomorrow's aviation leaders.                                          │
│  [ Join on Epsilon ]  [ See meetings → ]                                     │
└──────────────────────────────────────────────────────────────────────────────┘
▌01  NEXT DEPARTURES ─────────────────────────────────────── STUY · EST 2022
┌──────────────────────────────────────────────────────────────────────────────┐
│ TIME   DATE        MEETING                            ROOM    STATUS         │  dark board, SAMPLE rows
│ 15:35  WED 14 OCT  FSD  FLIGHT SIM DEMONSTRATION      615     ON TIME        │  amber mono
│ 15:35  FRI 16 OCT  PCI  CRASH INVESTIGATION LAB       615     ON TIME        │
│                                  [ Add to calendar ] [ All meetings → ]     │
└──────────────────────────────────────────────────────────────────────────────┘
═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═  runway centerline  ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═
▌02  OUR MISSION
  "Aviation didn't formally exist at Stuyvesant—so we built the space for it."
  ◆────────────◆────────────◆        Project Skylab: 01 Community · 02 Growth ·
  01           02           03       03 Permanent simulator         [About →]
▌03  WHAT WE DO
  ┌ FSD ┐ ┌ CLP ┐ ┌ PCI ┐ ┌ ATC ┐  horizontal scroll-snap row of 8 photo tiles,
  │photo│ │photo│ │photo│ │photo│  code + name + tagline from meetings page
  └─────┘ └─────┘ └─────┘ └─────┘                                [Meetings →]
▌04  FROM OUR MEMBERS
  ┌───────────────────────────────────┐ ┌───────────────────────────────────┐
  │ "Joining StuyAviators gave me a   │ │ "StuyAviators has allowed me to   │
  │  sense of community…"             │ │  make so many aviation-loving…"   │
  │  — Yunus Gubrud ('28)             │ │  — Anonymous                      │
  └───────────────────────────────────┘ └───────────────────────────────────┘
  EST  2022   ·   MEETING TYPES  08   ·   CREW  NN   ·   FOLLOWERS  N,NNN    (mono readout)
▌05  OPPORTUNITIES   (hidden if none published)
  ┌────────────────────────┬──────┐ ┌────────────────────────┬──────┐
  │ Program title          ┆ DEAD │ │ Scholarship title      ┆ AMT  │  boarding passes,
  │ Org · short desc       ┆ LINE │ │ Provider · short desc  ┆ $NNN │  "CLOSING SOON" badge
  └────────────────────────┴──────┘ └────────────────────────┴──────┘
▌06  FROM THE FLIGHT DECK                                  @stuyaviators →
  [post][post][post][post][post][post]     6 Behold tiles (2×3 on mobile)
┌──────────────────────────────────────────────────────────────────────────────┐
│ MAILING LIST     Full name [__________]  Stuy email [__________]  [Sign up]  │
│ We only use your email for club updates. Unsubscribe any time.               │
└──────────────────────────────────────────────────────────────────────────────┘
 footer: logo · socials · emails · address · school · Officer login · © 2026
```

A rendered HTML mock of this direction (palette, type, board, boarding pass) can be made for
review on request.

---

## 3. Phase 4 menu (ranked by usefulness ÷ effort)

| # | Feature | Usefulness | Effort | Notes |
|---|---|---|---|---|
| 1 | **Meetings in the dashboard** | Very high | Low–Med | Drives the departure board. Without it, adding a meeting needs a code change or SQL. The table exists from Phase 2 (seeded); this adds CRUD. |
| 2 | **Submissions inbox** (read/archive) | Very high | Low | Phase 2 forms save to Postgres; without an inbox officers can't see them. **I recommend pulling the read/archive part into Phase 3.** "Approve → publish to Gallery/testimonials" stays here. |
| 3 | **Flight crew in the dashboard** (bios, headshots, roles, past/current) | High | Med | The roster goes stale every June (it already has, see D8). |
| 4 | **Announcement banner** | High | Low | One row: text, link, on/off, optional end date. Dismissal remembered per message. |
| 5 | **Calendar**: "Add to calendar" + `.ics` feed | Med–High | Low | Needs #1. Room shown with the map link pattern. |
| 6 | **Analytics** (`@vercel/analytics`, `@vercel/speed-insights`) | Med | Trivial | Hobby includes limited monthly events; cookieless, no banner needed. |
| 7 | **Testimonials + gallery in the dashboard** | Med | Med | Gallery uploads go to Blob (watch the free-tier storage). |
| 8 | **Deadline digest builder** | Med | Low–Med | One click → newsletter draft with items closing in 14–21 days. |
| 9 | **Newsletter archive** (`/newsletter`) | Low–Med | Low | Lists published web versions. |
| 10 | **Activity log** | Low–Med | Low–Med | Useful once there are 5+ officers. |
| 11 | *Extra:* per-listing Open Graph images (`next/og`) | Low–Med | Low | Nicer previews when opportunities are shared in Discord or Instagram. |

---

## 4. Hosting notes

- **Vercel project:** use your existing `stuyaviators` project (serving `stuyaviators.vercel.app`).
  No new project will be created.
- The project is Git-connected, so pushing the `rebuild` branch will create **preview
  deployments** automatically. I'll ask before the first push.
- Merging into `main` will deploy the Next.js app to production on Vercel. Env vars (DB, auth) must
  be set in the project before that merge. I won't change project settings myself; Phase 5 lists
  exactly what to set (framework preset → Next.js, Node version, env vars).
- GitHub Pages also serves `main`, so the `gh-pages` redirect branch must exist and be selected
  **before** merging (per the brief).

---

## 5. Decisions needed (from the inventory)

| # | Question | My recommendation |
|---|---|---|
| D1 | Club YouTube videos (former backgrounds) | One click-to-play lite embed on Home |
| D2 | Cut/condense the flagged filler (Mission "Impact & Benefits", objectives intro, story closer, spotlight/features intros, contact hero, "sophisticated") | Cut. I'll show the exact before/after list before applying it. |
| D3 | Story milestones after Jan 2025 | Your text, or leave as is |
| D4 | Who receives current Mobirise form emails? Anything to migrate? | — |
| D5 | SLC photo labelled "slc-temp" | Keep until replaced |
| D6 | Real opportunities/scholarships to seed? | Launch with empty state if none |
| D7 | Careers page | Drop + redirect to `/opportunities` |
| D8 | **2026–27 Flight Crew roster; move '26 grads to Past** | Needed before launch |
| D9 | Photos for Andrew Archvadze, Ethan Saldanha | Initials placeholder until supplied |
| D10 | Evan Ye: "Treasurer" vs "Finance" | — |
| D11 | Crew application form current? Stuy sign-in intended? | — |
| D12 | Captions for the 8 spotlight photos, or move to Gallery | Move to Gallery |
| D13 | Candy / +1 giveaway still running? | — |
| D14 | Add YouTube to socials | Yes |
| D15 | Keep Facebook group link | — |
| D16 | Which of the 4 club emails stay public | All except `aviators-exec@` |
| P1 | Merge Charter + Rules into one page | Yes |
| P2 | Real drag-and-drop in the newsletter builder (adds `@dnd-kit`) vs up/down buttons | Up/down + keyboard; add drag only if wanted |
| P3 | Which Phase 4 features to build | #1–#6 |

---

## 6. Decisions log

| Date | # | Decision |
|---|---|---|
| 2026-10-10 | D8 | Andrew Zhang ('27) and Alexander Smelyansky ('27) are the new co-presidents. Rest of the 2026–27 roster TBD (editable in the dashboard). |
| 2026-10-10 | D13 | Giveaway is **not** running. Mailing-list copy becomes "Join the mailing list" with a neutral success message. |
| 2026-10-10 | Meetings | Meeting data will come from an **API** (details to come). The departure board and calendar read from a `getUpcomingMeetings()` adapter so the source can be plugged in later. Phase 4 #1 (meetings CRUD) is on hold until the API is known. |
| 2026-10-10 | P3 | Phase 4 approved: submissions inbox, flight crew in dashboard, announcement banner, events calendar (page + `.ics`), analytics, testimonials + gallery in dashboard, deadline digest, newsletter archive. **Not** building: activity log. OG images: pending explanation. |
| 2026-10-10 | D8 | Co-president title: **"Captain (Co-President)"**. All '26 members move to Past Leadership / Past Helpers (Esther Lee to past Alliance). |
| 2026-10-10 | D2 | Keep the relevant copy, cut the filler (my judgment, list below). Cut text stays in `legacy/`. |
| 2026-10-10 | D7 | **Keep Careers.** Static page written by Claude covering every major aviation/aerospace career family. **Not** dashboard-managed. Outline in §7. |
| 2026-10-10 | D16 | All four emails stay public: outreach@, media@, exec@ (stuy.edu) and stuyaviators@gmail.com. |
| 2026-10-10 | Notify | Approved service: **Discord webhook** for new-submission alerts. URL lives only in the `DISCORD_WEBHOOK_URL` env var, never in the repo. Messages disable all @mentions. |
| 2026-10-10 | #11 | OG images approved: static per-page images **and** dynamic `next/og` images for opportunities, scholarships and newsletters. |

### D2: what's cut vs kept

| Text | Verdict |
|---|---|
| Home slogan carousel ("Dream • Create • Inspire"…) | Cut |
| Home "Our members share their experiences…" | Cut |
| Mission Impact & Benefits: Educational Enrichment, Skill Development | Cut (generic) |
| Mission Impact & Benefits: Inclusivity & Accessibility, Career Pathways | **Keep** (specific: free simulator access; links to Careers) |
| Mission Objectives intro paragraph | Cut (repeats the stages) |
| Story closing paragraph ("set the foundation for future growth…") | Cut |
| Charter "Our sophisticated appointment procedures…" | **Keep as written** (no rewording without approval) |
| Share Your Story "Behind every face is a story worth sharing…" | Cut |
| Highlights "Features is the place…" and "Featured Moments" intros | Cut |
| Opportunities / Scholarships "Explore…" intros and "Coming Soon!" blocks | Cut (replaced by designed empty state) |
| Contact intro "Reach out to StuyAviators…" | **Keep** (page meta description) |
| Hero subtitles on every page | **Keep** (used as page intros and meta descriptions) |
| Mobirise badges, "Learn More" scroll buttons | Cut |

---

## 7. Careers page outline

Static content in `src/content/careers.ts`. Each career has: what the job is, a typical path from
high school, the key credential(s), and a link to an official source (FAA, BLS Occupational Outlook
Handbook, NTSB, NASA, armed-services recruiting). No salary figures (they go stale); BLS links cover
that. A "Try it at StuyAviators" tag maps careers to meeting types (FSD → pilots, ATC sim →
controllers, PCI → investigators, CLP/SLC → instructors). Filter chips by family plus text search.

1. **Flying:** airline pilot · cargo pilot · corporate/business-jet pilot · charter/air-taxi
   pilot · flight instructor (CFI) · helicopter pilot (EMS, offshore, news, tours) · agricultural
   pilot · aerial firefighting pilot · bush pilot · banner-tow/aerial survey/photography pilot ·
   ferry pilot · test pilot · military aviator
2. **Uncrewed & remote:** commercial drone (Part 107) operator · military UAS pilot · drone
   inspection/mapping specialist
3. **In the cabin:** flight attendant · purser/lead · corporate flight attendant
4. **Air traffic & airspace:** air traffic controller (tower, TRACON, en-route center) · flight
   service specialist · airspace/procedure designer · traffic flow management specialist
5. **Flight operations:** aircraft dispatcher · operations control/crew scheduling · load planner ·
   aviation meteorologist
6. **Maintenance & technicians:** A&P mechanic · avionics technician · inspector (IA) · NDT
   technician · composites/sheet-metal technician · engine overhaul technician · simulator
   technician
7. **Engineering:** aerospace/aeronautical · astronautical · propulsion · structures & stress ·
   aerodynamics/CFD · avionics & electrical · guidance, navigation & control · flight software ·
   systems · flight test engineer · materials · human factors · manufacturing/quality engineer
8. **Space:** astronaut · mission/flight controller · launch operations · spacecraft operations ·
   satellite engineer · space systems operator (Space Force)
9. **Airports:** airport manager/operations · ARFF firefighter · ramp/ground handling · fueler ·
   wildlife biologist · airport planner/engineer · security
10. **Safety, investigation & regulation:** accident investigator (NTSB) · FAA aviation safety
    inspector · safety management/quality auditor · aviation attorney · policy/regulatory analyst
11. **Business of aviation:** airline network planning · revenue management · aircraft
    sales/leasing/finance · aviation insurance · air cargo & logistics · program manager · customer
    service/gate agent
12. **Military & public service:** USAF · Navy/Marine Corps · Army aviation · Coast Guard ·
    Space Force · Civil Air Patrol (cadet program) · law-enforcement aviation · search and rescue
13. **Health, education & media:** aviation medical examiner/flight surgeon · flight nurse/paramedic
    · aviation educator · museum curator · aviation journalist/photographer · aviation cybersecurity

Closing section: "Start now" with free/low-cost first steps (new copy, part of the careers content)
(flight sims, guest speakers, Civil Air Patrol cadets, Part 107 for 16+, discovery flights).
