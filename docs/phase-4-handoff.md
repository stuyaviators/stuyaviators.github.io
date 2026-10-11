# Phase 4 handoff (for a fresh chat)

Read this file, `AGENTS.md` and the decisions log in `docs/proposal.md` (§6). Don't read anything
else until you need it; the map below says where things are. Next.js here is 16.3.8 with
breaking changes: check `node_modules/next/dist/docs/` before using a Next API.

## State
- Branch `rebuild` (== `main` plus the newest commits). Phases 1-3 are done and merged to `main`;
  production is `stuyaviators.vercel.app` (Vercel Hobby, deploys `main`).
- Dashboard works locally: Google sign-in, opportunities, scholarships, newsletter builder,
  officers, settings (Epsilon token stored), animations. 156 Vitest tests pass.
- `.env.local` has the DB, Auth, Discord, Google OAuth and `DASHBOARD_OPEN_SIGNIN=true`
  (dev-only). Never print its values; use `node --env-file=.env.local`.
- The user still has to: set the env vars in Vercel (they do this; never you), finish Google
  branding re-verification, and later do Phase 5 (`gh-pages` redirect branch, README, cutover).

## Phase 4: what was approved
Build (decisions log, 2026-10-10 "P3"): submissions inbox, flight crew in the dashboard,
announcement banner, events calendar (page + `.ics`), testimonials + gallery in the
dashboard, deadline digest builder, newsletter archive, dynamic Open Graph images.
Already done: analytics (`@vercel/analytics`, `@vercel/speed-insights`), static per-page OG
images. **Not building:** activity log. **On hold:** meetings CRUD (meetings come from Epsilon).

Suggested order (value / effort): 1 submissions inbox, 2 announcement banner, 3 events calendar +
`.ics`, 4 newsletter archive, 5 deadline digest, 6 flight crew, 7 testimonials + gallery,
8 dynamic OG images. Do one feature, verify, commit, then the next. Stop for the user's review
at the end of the phase.

Notes per feature:
- **Inbox** (`/dashboard/inbox`; the Discord alert already links there): table `submissions`
  exists (`type`: contact|story|photo|meeting_idea|mailing_list, `status`: new|read|archived,
  `data` jsonb, `mailingList`). Needs list + filters + mark read/archive + detail view; later
  "approve story -> testimonial" and "approve photo -> gallery". Add a "new" count to the nav.
- **Announcement banner:** one row (text, link, on/off, optional end date), shown site-wide
  in `SiteChrome`, dismissal remembered per message in localStorage. Needs a new table + migration.
- **Calendar:** `getUpcomingMeetings()` in `src/lib/meetings.ts` (Epsilon -> manual fallback).
  Add `/meetings/calendar.ics` route + "Add to calendar" buttons. Escape ICS text, CRLF lines.
- **Newsletter archive:** public `/newsletter` listing published web versions
  (`getPublishedNewsletter` and `src/lib/newsletters-public.ts` show the cached-read pattern;
  expire with the `newsletters` tag).
- **Digest builder:** a button that creates a newsletter draft from listings with a deadline in
  14-21 days (`defaultNewsletter()`/`newBlock()` in `src/lib/newsletter/defaults.ts`).
- **Flight crew / testimonials / gallery:** content is static today (`src/content/crew.ts`,
  `home.ts`, `photos.ts`/`gallery.ts`). Moving it to Postgres means: new tables, a one-time
  seed from the static content (extend `scripts/seed.ts`), dashboard CRUD with image upload
  (purpose `headshot`/`highlight` already exist in `src/lib/uploads.ts`), and the public pages
  reading from the DB with the static content as fallback. Don't change public-page layouts or
  animations. Gallery uploads go to Vercel Blob (watch free-tier storage).
- **Dynamic OG:** `src/lib/og.tsx` `renderOg()`; add `opengraph-image.tsx` for listings and
  newsletters (those pages don't have per-item URLs yet; decide the route first and ask).

## Where things are
- Server Actions: `src/actions/*.ts` (`"use server"`). Pattern: `guarded(role, async ({ user, db }) => ...)`
  from `src/lib/action-guard.ts` (re-checks session + role, needs DB, turns errors into
  messages), Zod input, then `updateTag(tag)` + `revalidatePath` for public pages. Tests:
  `src/actions/dashboard-auth.test.ts` shows how to mock `@/auth`, `@/db`, `next/cache`.
- Pages: `src/app/dashboard/**` (each page calls `requirePageUser(role)`; the layout alone is
  not enough). Use `/dashboard/[kind]` pages as the template for list + form screens.
- UI: `src/components/dashboard/` (`ui.tsx` Card/Badge/Notice/PageHeader, `fields.tsx`
  Select/Checkbox/ImageField, `Confirm.tsx` dialog, `use-action.ts` hook with `leavingId`
  row animation, `Spinner`). Site fields: `src/components/forms/Field.tsx`. Tokens: `bg`,
  `surface`, `surface-2`, `hairline`, `text`, `muted`, `brand`, `danger`, `success`.
- DB: `src/db/schema.ts` (Drizzle, snake_case), migrations in `drizzle/` via
  `pnpm db:generate` then `pnpm db:migrate` (applies to the real Neon DB; tests use PGlite
  with the same migration files via `src/test/pglite.ts`). Use `(await q).at(0)`-style access in
  two statements, not `const [row] =`, to satisfy lint.
- Animations: CSS classes `dash-rise`, `dash-stagger`, `dash-pop`, `dash-leave` in
  `src/styles/globals.css`; all off under reduced motion.

## Rules (from the user)
- $0 budget, no billing anywhere. Only: Vercel, Neon, Vercel Blob, Google OAuth/Forms/Sheets,
  Behold, Google Maps embed, Gmail, Discord webhook. Ask before adding any other service.
- Never commit secrets. Don't change GitHub Pages, DNS, Vercel project settings, Google Forms
  or Behold settings. Never create a Vercel project. **Ask before any `git push`**; commits are
  fine. Don't submit test entries to the live Google Form.
- Don't build on or merge `recode`; credit ported code. No screenshots or browser captures
  unless asked. Don't change public-page animations unless asked.
- Name: "StuyAviators" (caps "STUYAVIATORS" where it looks better); never "Stuy aviators".
  Placeholder person: Peter Stuyvesant / `pstuyvesant60@stuy.edu`. Page titles aren't changed.
- Commit messages end with `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`.
- Format only the files you touch (`npx prettier --write <paths>`); never run `lint:fix` or
  Prettier over all of `src` (it rewrote finished public pages once).

## Verify
`pnpm lint && pnpm typecheck && pnpm test && pnpm build:check` (build goes to `.next-build`;
never run `pnpm build` while `pnpm dev` is running; delete `.next-build/types` if typecheck
trips on stale types). The dev server may already be on :3000 (check `lsof -iTCP:3000`).
To look at signed-in pages without the browser, start a second server with
`NEXT_DIST_DIR=.next-verify DASHBOARD_OPEN_SIGNIN=true pnpm exec next dev -p 3100` and a
locally signed `authjs.session-token` cookie; then stop it, delete `.next-verify` and
`git checkout tsconfig.json` (Next edits it).

## Keeping context small
Read only the files you're changing plus one template file. Don't dump big tool output;
grep or use `sed -n` ranges. Don't re-read files you just wrote. Write the migration and tests for each feature in the same step.
