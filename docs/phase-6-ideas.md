# Phase 6: improvements and things to work on

Written at the end of Phase 5's build work (branch `rebuild`, not yet merged to `main`).
Priorities: **P1** do soon, **P2** worth doing, **P3** nice to have. Effort: **S** an hour or
two, **M** a day, **L** several days. "Needs OK" means it adds a service or a cost, so the
$0 rule says to ask first.

## 0. Finish launch (carried over from Phase 5)

These are the Phase 5 items that were not done yet. Nothing here is new work.

| P | Item | Notes |
|---|---|---|
| P1 | Add the missing Vercel environment variables, then merge `rebuild` to `main` | See "Vercel variables" below. Merge only after the preview works. |
| P1 | Add `https://stuyaviators.vercel.app/api/auth/callback/google` as an authorized redirect URI in Google Cloud | Needed before anyone can sign in on Vercel. |
| P1 | Paste a fresh Epsilon refresh token on Dashboard → Settings | The saved one was refused by Epsilon. Until then the meeting boards say "Board is down". |
| P1 | Rotate the Gemini key in Google AI Studio | It was pasted in a chat. |
| P1 | Rewrite `README.md` and add `docs/officer-guide.md` | The README is still ten lines. The officer guide should cover roles, the permission number, the trash and autofill. |
| P2 | Mark `docs/proposal.md` and the phase handoffs as historical; update the decisions log | One line at the top of each. |
| P2 | Submit `/sitemap.xml` in Search Console; re-verify Google OAuth branding if the domain changes | |
| P2 | Delete the two stale `vercel/*` branches; stop `gh-pages` building on Vercel | Settings → Git → Ignored Build Step. |
| P2 | Click through production once with real data | Forms (one real submission per type), upload, newsletter publish/unpublish. |

### Vercel variables

Already in the project: the Blob store variables, `DISCORD_WEBHOOK_URL` (production only) and
the Neon variables from the integration (`stuyaviators_DATABASE_URL` and friends; the code
accepts that prefix).

Add (Production, and Preview where you want previews to work):
`AUTH_SECRET`, `AUTH_GOOGLE_ID`, `AUTH_GOOGLE_SECRET`, `GEMINI_API_KEY`, `SIGNUP_SHEET_URL`,
optionally `NEXT_PUBLIC_SITE_URL=https://stuyaviators.vercel.app`.

`AUTH_SECRET` must be the **same value** as in `.env.local`: the saved Epsilon token is
encrypted with it, so a different secret makes the token unreadable.

Do not add: `DASHBOARD_OPEN_SIGNIN`, `DASHBOARD_DEV_ROLE`, `EPSILON_ACCESS_TOKEN` (no longer
read), `aviatorsblob_STORE_ID`. `ADMIN_EMAILS` is optional now: the five admins are already
in the database.

## 1. Safety and trust

| P | Idea | Effort | Why |
|---|---|---|---|
| P1 | **CI on GitHub Actions**: lint, typecheck, tests, `build:check` on every push and PR | S | Free, and nothing currently stops a broken push reaching `main`. |
| P1 | **Backups**: a scheduled export of the database to a file (Drive or a private repo) | M | Neon's free history is short. The trash protects against deletes, not against a bad migration. |
| P2 | **Activity log**: who did what and when (the "Added by" tags are only the first step) | M | Decided against in Phase 4; revisit now that there are five admins and four roles. |
| P2 | **Edit-your-own option**: a box that limits editing, not just deleting, to what you added | M | Today a Contributor can edit anyone's card. Deleting is covered, vandalism by editing is not. |
| P2 | **Version history** for cards and newsletters, with restore | M | Pairs with the activity log. |
| P2 | Security headers (CSP, `X-Content-Type-Options`, frame options) and a `security.txt` | S | None are set. The dashboard and the takeoff animation need a short CSP review. |
| P3 | Dependabot or a monthly dependency pass; pin Node | S | Next is on a fast-moving version. |
| P3 | Shorter session for admins; "sign out everywhere" | S | |

## 2. Meetings and Epsilon

The Epsilon login is the most fragile part of the site.

- **P1: show the last good meetings instead of "Board is down".** Cache the last successful
  list (a row in the database) and show it with "as of 3:10 PM" when Epsilon is unreachable.
  Show "Board is down" only when there has never been a good read. (S/M)
- **P1: stop losing the token.** Epsilon rotates refresh tokens on every use; a timeout after a
  successful refresh loses the new one. Ideas: a longer timeout, retry once with the same token
  before giving up, and one place doing refreshes (local and production share a database and can
  race). Better: ask the Student Union for a read-only key or a public feed. (M)
- **P2: a real link per meeting.** Epsilon's own code has no page for a single meeting (its
  calendar opens a modal), so "View on Epsilon" opens the club page. If a link format turns up,
  change `epsilonClubUrl()` in `src/lib/meetings.ts` (one place).
- P2: meeting archive page (past meetings, attendance counts only, never names); calendar
  feeds per meeting type; "Event" structured data for search results.
- P3: ISR means the board can stay "down" for up to 15 minutes after Epsilon recovers; add
  on-demand revalidation when a token is saved.

## 3. Dashboard and content

- **P1: officer guide in the dashboard** (a Help page that mirrors `docs/officer-guide.md`). (S)
- **P2: autofill improvements**: pages that load content with scripts return little. Options:
  Gemini summary of the page text (free tier, same key; Needs OK for sending page text), or
  better parsing of common sites (Eventbrite, Common App, FAFSA-style pages). (M)
- P2: gallery: drag to reorder, edit descriptions in bulk, albums, regenerate an AI caption in
  one click, delete the Blob file when a photo is purged from the trash. (M)
- P2: Blob cleanup: purged items leave their image files in storage; a purge step should delete
  them (check nothing else uses the URL first). (S)
- P2: inbox: assign, reply templates, archive rules, spam protection (Needs OK: a CAPTCHA is a
  new service). (M)
- P2: annual rollover for the Flight Crew page: a button that moves everyone to "past" and
  starts a new year's list. (M)
- P3: scheduled posts (publish a card or newsletter at a time). Needs a scheduler. (M)
- P3: replace the Google Sheet mailing list with a database table and tokenised unsubscribe
  links, so unsubscribing needs no email. (L)
- P3: email sending from the dashboard (Gmail API). Needs OK; today newsletters are copied into
  Gmail by hand.

## 4. Public site: quality and polish

- **P1: a Lighthouse and keyboard pass** on the home page, one listing page and the dashboard
  (the Phase 5 list). Fix what turns up without changing public layouts. (M)
- **P1: real-device testing** on iPhone Safari and an Android phone: the scroll-driven scenes,
  the sideways meeting row, the stacking cards, the takeoff animation and the intro video. All
  review so far was desktop Chrome, headless. (S)
- P2: short-screen behaviour. Scroll-locked scenes switch off when the window is shorter than
  their content (and the sideways row under 560px tall). That prevents clipping but means small
  laptops see fewer effects. Consider compact layouts for the pinned scenes. (M)
- P2: the hero video is the heaviest asset; check LCP, serve a smaller file on mobile data. (S)
- P2: structured data (Organization, Event), per-page Open Graph checks, `lastmod` in the
  sitemap. (S)
- P2: the takeoff animation moves whatever is visible using a general rule; spot-check every
  page (the gallery and charter are the busiest) and skip any element that looks wrong. (S)
- P3: reduced-motion audit of the newer animations (takeoff, Instagram panel, stacking cards). (S)
- P3: automated accessibility checks (axe) in CI. (S)

## 5. Tests and code health

- **P1: end-to-end tests** (Playwright, free) for sign-in (local mode), adding a card, the
  trash, and the Officers calculator. Today the actions are well covered but the screens are
  not. (M)
- P2: tests for the front-end pieces that only have manual checks: `Lightbox`,
  `HorizontalShowcase`, `StackingCards`, `HomeIntro`, `takeoff`. (M)
- P2: split the large files: `src/lib/autofill.ts` (about 700 lines), `GalleryManager.tsx`,
  `NewsletterEditor.tsx`. Several functions trip the complexity warning (the overview page,
  `ListingForm`, `parsePage`). (M)
- P3: remove the unused `media` role value from the database enum when convenient (it needs a
  type rebuild); drop the old per-type trash wording from docs. (S)
- P3: credit pass: confirm every ported piece from `recode` is still credited. (S)

## 6. Decisions to make

- Final domain: stay on `stuyaviators.vercel.app` or buy one? (Needs OK: it costs money.)
- Who should hold the Trash box and the Flight Crew box besides admins? (Roles are presets;
  any mix is possible from the Officers screen.)
- Keep AI-written gallery captions, given they can be wrong? The label and tooltip are in; a
  review step (the officer must tick "checked") would be stricter.
- The open decisions from `docs/proposal.md` (D3, D4, D5, D9 to D16): list what is still
  undecided and the page each one affects, then choose.

## 7. Known limits of what shipped

- The "board is down" notice can outlive an Epsilon outage by up to 15 minutes (page caching).
- The trash clean-up runs when someone opens the dashboard (at most hourly), not on a timer.
- Purged items leave their Blob image files behind.
- Deleting is restricted to your own work for the limited roles; editing is not.
- The takeoff animation and the scroll scenes were verified by measuring positions in headless
  Chrome, not on a phone.
- Local mode (`DASHBOARD_OPEN_SIGNIN`) shares the production database, so local clicks change
  live data. Consider a separate Neon branch for development. (S, free)
