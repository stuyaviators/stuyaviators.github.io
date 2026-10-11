# Phase 5 handoff (for a fresh chat): launch and cutover

Read this file, `AGENTS.md` and the decisions log in `docs/proposal.md` (§6). Don't read anything
else until you need it. Next.js here is 16.3.8 with breaking changes: check
`node_modules/next/dist/docs/` before using a Next API. `docs/phase-4-handoff.md` still has the
code map (where actions, pages, dashboard UI and the DB live) and the rules; they all still apply.

## State
- Branch `rebuild`, 14 commits ahead of `origin/rebuild`/`origin/main` (both at `b4a56dc`).
  **Nothing from Phase 4 has been pushed.** Phases 1-3 are on `main`, which Vercel deploys to
  `stuyaviators.vercel.app` (Hobby).
- Phase 4 is built and tested (231 Vitest tests; lint, typecheck and `build:check` pass):
  submissions inbox, announcement banner, meetings calendar (`/meetings/calendar.ics`),
  newsletter archive (`/newsletter`), deadline digest, dashboard-managed flight crew,
  testimonials and gallery, own pages for each opportunity/scholarship
  (`/opportunities/<slug>`), dynamic OG images for newsletters and cards, per-page analytics.
- Neon DB (shared by local and production) has migrations 0000-0005 applied. The listings table
  is empty. `.env.local` has the DB, Auth, Discord, Google OAuth, `DASHBOARD_OPEN_SIGNIN=true`
  (dev only) and the Vercel Blob store (`aviatorsblob_*`; the code accepts that prefixed name).
  Never print its values; use `node --env-file=.env.local`.
- The crew, testimonials and gallery screens in the dashboard each have a one-time "Copy the
  current ... here" button. **Nobody has clicked them**, so the public pages still show the
  built-in content. Removing everything from one of those screens brings the built-in content back.
- Not built (decided): activity log, meetings CRUD (meetings come from Epsilon).

## Problem to check first
`main` already contains the Next.js app, but `origin` has **no `gh-pages` branch**
(`git ls-remote --heads origin` shows main, rebuild, recode and two `vercel/*` branches). The
proposal (§4) said the redirect branch must exist and be selected for GitHub Pages *before*
merging to `main`. So `https://stuyaviators.github.io` may be serving a 404 or the README right
now. You can't see GitHub settings; ask the user what that address shows and which source
Settings -> Pages uses (branch + folder). If it's broken, the redirect branch (step 3) becomes
the first job. Don't change Pages settings yourself; give the user the exact clicks.

## Goal
Everything the old Mobirise site served keeps working, the new site is live and the officers
can run it without a developer. The work is mostly setup the user does, plus a few things in
the repo.

### 1. Review and push (ask first)
- The user reviews Phase 4 locally (`pnpm dev`; sign in; click each import button once).
- **Ask before any `git push`.** Push `rebuild` -> Vercel makes a preview deployment. Use the
  preview to check: public pages, sign-in on the preview URL (Google OAuth only allows listed
  redirect URIs, so the user may need to add the preview or final domain in Google Cloud), image
  upload, forms, `/meetings/calendar.ics`, sitemap, OG images (paste a link into Discord).
- Don't merge to `main` until step 2 (env vars) and step 3 (redirect branch) are done.

### 2. Vercel environment (the user does this; list it for them, don't touch the project)
Project -> Settings -> Environment Variables, Production (and Preview where useful). All names
are in `.env.example`; the real values are in `.env.local`. At minimum: `DATABASE_URL`
(`stuyaviators_DATABASE_URL` also works), `AUTH_SECRET`, `AUTH_GOOGLE_ID`, `AUTH_GOOGLE_SECRET`,
`ADMIN_EMAILS`, the Blob token (`aviatorsblob_READ_WRITE_TOKEN` or `BLOB_READ_WRITE_TOKEN`),
`NEXT_PUBLIC_SITE_URL` (the final public address), `DISCORD_WEBHOOK_URL`, the Google Form
settings from `docs/google-forms-setup.md`, Behold from `docs/behold-setup.md`.
**`DASHBOARD_OPEN_SIGNIN` must not be set on Vercel** (it's ignored there, but keep it out).
Also: framework preset Next.js, a current Node LTS, Web Analytics and Speed Insights switched on
in the project, the Blob store connected to the project. After the first production sign-in the
user adds the Epsilon token on `/dashboard/settings`.
The dashboard Overview shows an environment checklist; use it to confirm.

### 3. The `gh-pages` redirect branch
- Create an orphan branch `gh-pages` containing static redirect pages only, mirroring the old
  `.html` files so old Google results and shared links still land on the right page. Map from
  `legacy/*.html` and the redirect table in `docs/proposal.md` §1 (also `legacyRedirects` in
  `next.config.ts`): index, mission, story, charter, expectations, meetings, opportunities,
  scholarships, careers, flight-crew, share-story, highlights, socials, contact-us, plus a
  `404.html` that sends anything else to the home page. Each file: `<meta http-equiv="refresh">`,
  `<link rel="canonical">`, a `location.replace` script (keep `#hash` where the target has one)
  and a visible link as fallback, `noindex`. Target = `NEXT_PUBLIC_SITE_URL`. Add `.nojekyll`.
- Commit it locally, show the user the file list, **ask before pushing**, then give the user
  the Pages click-path (Settings -> Pages -> Source = branch `gh-pages`, folder `/`). Verify with
  `curl -sI` against a few old URLs after they switch it.
- Nothing may leave `gh-pages` with real secrets or the Next source.

### 4. Merge and first production run
- After steps 2 and 3, the user merges `rebuild` into `main` (a PR is fine: ask before opening
  it). Vercel deploys production.
- Run once against production (same Neon DB, so migrations are already applied): confirm
  `pnpm db:migrate` reports nothing to do, `pnpm db:seed` makes the admins, then in the
  dashboard click the three "Copy the current ... here" buttons, then replace placeholder content:
  2026-27 crew photos, real opportunities/scholarships (launch with the empty state if none),
  the announcement banner if wanted.
- Smoke test production: every page in `src/app/(site)`, sign-in/out, one form per type
  (do **not** submit test entries to the live Google Form: use the inbox path only if the form
  isn't wired, otherwise ask the user to do one real submission), upload, newsletter publish
  and unpublish, `/sitemap.xml`, `/robots.txt`.

### 5. README and docs
- Rewrite `README.md` (currently ten lines): what the site is, the stack, how to run it
  (`pnpm i`, `.env.local`, `pnpm dev`, `pnpm db:migrate`, `pnpm db:seed`), scripts, project
  layout (public pages, dashboard, actions, lib, content, db), the content model (what lives in
  the code vs the database, the import buttons), deploying (Vercel, env vars, the `gh-pages`
  redirect branch), how officers get access, and the credits to `recode`/webcubed that are
  already there (keep them). Link the docs in `docs/` rather than copying them.
- Add a short `docs/officer-guide.md` for non-developers: sign in, add an opportunity, publish
  a newsletter, read the inbox, edit the crew, change the banner. Plain language, no jargon.
- Mark `docs/proposal.md` and the phase handoffs as historical (one line at the top), and update
  the decisions log with what shipped.

### 6. After launch (ask the user)
- Google OAuth branding re-verification and Search Console: the user does these. Update the
  authorized redirect URIs and the privacy/terms URLs if the final domain changed, and submit
  `/sitemap.xml` in Search Console.
- Old branches: `recode` is kept as-is (never build on or merge it). The two `vercel/*` branches
  look stale; ask before deleting anything remote.
- Anything left from the proposal's open decisions (D3, D4, D5, D9-D16): list what is still
  undecided with the page it affects and let the user choose.
- A final pass: run Lighthouse or at least keyboard and 320px checks on the home page, one
  listing page and the dashboard, and fix what turns up without changing public-page layouts.

## Rules (from the user)
- $0 budget, no billing anywhere. Only: Vercel, Neon, Vercel Blob, Google OAuth/Forms/Sheets,
  Behold, Google Maps embed, Gmail, Discord webhook. Ask before adding any other service.
- Never commit secrets. Don't change GitHub Pages, DNS, Vercel project settings, Google Forms
  or Behold settings: the user does those, so give exact steps. Never create a Vercel project.
  **Ask before any `git push`** and before opening a PR; commits are fine.
- Don't build on or merge `recode`; credit ported code. No screenshots or browser captures
  unless asked. Don't change public-page animations or layouts unless asked.
- Name: "StuyAviators" (caps "STUYAVIATORS" where it looks better); never "Stuy aviators".
  Placeholder person: Peter Stuyvesant / `pstuyvesant60@stuy.edu`. Page titles aren't changed.
- Commit messages end with `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`.
- Format only the files you touch (`npx prettier --write <paths>`); never run `lint:fix` or
  Prettier over all of `src` (it rewrote finished public pages once, and does so again if you
  run it on `src/app/(site)/*` files you only touch lightly: check `git diff --stat`).

## Verify
`pnpm lint && pnpm typecheck && pnpm test && pnpm build:check` (build goes to `.next-build`;
never run `pnpm build` while `pnpm dev` is running; delete `.next-build/types` if typecheck
trips on stale types). The dev server may already be on :3000 (`lsof -iTCP:3000`). Restart it
after changing `.env.local`. Database tests use PGlite with the real migration files.

## Done means
The old URLs redirect, production works with real data, the officers have a guide, the README
is accurate, nothing secret is in git, and the user has a short list of anything still open.
Stop for the user's review before step 4's merge and again at the end.
