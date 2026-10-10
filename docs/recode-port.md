# `recode` branch: port list

Source: `origin/recode` @ `654e855` (orphan branch, 34 commits from 2025-12-04 to 2026-02-05, all by
**webcubed**). Nothing is merged or checked out. Files are read with `git show origin/recode:<path>`
and adapted. Every commit that ports something says so ("Port X from recode branch"), and the
README credits webcubed.

## Verdicts

| recode element | Verdict | Reason |
|---|---|---|
| `package.json` stack: Next 16, React 19.2, TS 5.9, Tailwind 4.1, `motion`, `lucide-react`, `simple-icons`, `markdown-it` | **Port** (bump to latest patch) | Matches the target stack. It pins `next@16.1.1`; I'll use the latest **16.x patch** at scaffold time (security fixes) and keep React 19.2.x. |
| `package.json` scripts | **Port, fix** | `lint` = `xo src xo.config.mjs` is fine. Remove the `email` script (points to a missing `src/emails`; re-added when React Email lands in Phase 3). Add `test` (Vitest), `db:*` (Drizzle). |
| `prettier` in `dependencies` | **Port, move** | It's a dev tool, so it goes in `devDependencies`. |
| `mapbox-gl`, `@catppuccin/tailwindcss`, `tw-animate-css`, `class-variance-authority`, `eslint-config-next`, `components.json` (shadcn) | **Skip** | Unused or explicitly excluded. xo is the linter. |
| `clsx` + `tailwind-merge` | **Port** | Installed but unused in recode. I'll use them for a small `cn()` helper. |
| `@react-email/*`, `react-email` | **Port later (Phase 3)** | Needed for newsletters. `@react-email/render` must be a runtime **dependency** (it renders on the server), not a devDependency as in recode. |
| `prettier.config.mjs` (tabs, double quotes, es5 commas, tailwind/pkgsort/import-sort plugins) | **Port** | Use as is. |
| `xo.config.mjs` | **Port** | Use as is; add ignores for `legacy/**` and `drizzle/**`. |
| `tsconfig.json` | **Port** | Standard Next config with `@/*` → `src/*`. |
| `postcss.config.mjs` | **Port** | Tailwind v4 PostCSS plugin. |
| `pnpm-workspace.yaml` (`onlyBuiltDependencies`: esbuild, sharp, unrs-resolver) | **Port** | Needed for pnpm 10 build scripts (sharp is used for uploads). |
| `.gitignore` | **Port, fix** | Its `.env*` rule would also ignore `.env.example`; add `!.env.example`. Also ignore `legacy/**/.DS_Store`. |
| `.prettierignore` | **Port** | Add `legacy/`. |
| `next.config.ts` (`outputFileTracingRoot`) | **Skip** | Not needed at the repo root. The new config adds redirects and `images.remotePatterns`. |
| `src/app/layout.tsx`: **Lexend + B612** via `next/font/google` | **Port** | Core of the type system. Add **B612 Mono** for the departure board and counters. Drop `className="dark"` / `data-catppuccin`. |
| `src/components/TransitionProvider.tsx`: `Stagger` | **Port and fix** | See issues below: reduced motion, a stale-counter bug, and content hidden before hydration. |
| `src/components/Header.tsx`: hide-on-scroll + mobile menu | **Port logic, rebuild UI** | Keep the thresholds (36 px down / 12 px up / 8 px min-top) and the `NEXT_PUBLIC_HEADER_HIDE_ON_SCROLL` toggle. Rebuild the markup with full dropdown nav. Skip the flavor switcher, glass styling and Epsilon gradient wordmark. |
| `src/app/connect/page.tsx`: contact list, socials, copy buttons | **Port** content and copy behavior | Contacts match `main`. Add `aviators-media@stuy.edu` if approved (D16). The page becomes a Server Component, with only the copy button as a client island. |
| `src/app/connect/page.tsx`: Mapbox map | **Skip** | Needs a Mapbox token/account. Replaced by `<GoogleMap>` keyless embed. |
| `src/app/connect/page.tsx`: `andrew-ryanair.jpg` "Team photo" | **Decide** | It's one person's travel photo labelled "Team photo". Port only if you want it (as a gallery photo with an accurate alt). |
| `src/app/email-builder/*`, `src/types/email-builder.ts` | **Port and adapt** → `/dashboard/newsletter` | Keep the block model (article / separator / subheading / image), presets, preview, copy and download. Corrections below. |
| `src/app/api/email-builder/render/route.ts` | **Skip** (replace) | A stub that interpolates unescaped user input into HTML and is marked `"use server"` (meaningless in a Route Handler). Replaced by React Email rendering in a Server Action behind auth. |
| `src/app/api/upload/route.ts` → catbox.moe | **Skip** | An unauthenticated open proxy to a public file host, with no type or size checks, that echoes upstream error text. Replaced by Vercel Blob behind an officer session, with `sharp` resize, a MIME/magic-byte check and a size cap. |
| `src/lib/markdown.ts` (`html: false`, linkify, breaks) | **Port** | Safe default. markdown-it's `validateLink` already blocks `javascript:`/`vbscript:`/`file:`/most `data:`. Add `rel="noopener noreferrer"` + `target="_blank"` on external links and disallow images in card descriptions. |
| `src/util/copy.ts` | **Port, fix** | Falling back to `navigator.share` is surprising for a copy button. Replace with a hidden-textarea `execCommand` fallback. The caller ignores the boolean result, so the user never sees "Copied" or "Couldn't copy"; add a polite live-region status. |
| `src/components/Confirm.tsx` | **Port logic, restyle** | No focus management. Rebuild on native `<dialog>` (`showModal()` gives a focus trap, Escape and inert background), focus Cancel by default, and return focus on close. |
| `src/components/FormField.tsx` | **Port logic, restyle** | `<label>` isn't associated with its input (no `htmlFor`/`id`). Add `useId()`, `aria-describedby` for hint/error and `aria-invalid`, and render errors. |
| `src/components/Card.tsx`, `GlassButton.tsx`, `src/styles/globals.css` (Catppuccin + shadcn tokens), `src/lib/theme.ts`, `src/hooks/use-theme.ts` | **Skip** | Glass and blur styling and the Catppuccin theme are excluded. Rebuilt as `Button`, `BoardingPass`, `FlightStrip`, etc. in the new design system. |
| `src/lib/svgPaths.ts` (Epsilon / Discord / Instagram SVG strings) | **Partly** | Keep the Epsilon wordmark path (no icon library has it) as a component. Discord/Instagram come from `simple-icons`. |
| `public/logo.png`, `public/stuyaviators.png` | **Port** (compressed) | Club logo, white-disc and transparent variants. 3696 px at 550–620 KB each; they'll be resized to 512/1024 px PNGs and an SVG-free favicon set. |
| `public/epsilon-wordmark.svg/.png`, `src/assets/epsilon-wordmark.svg` | **Port** | Used on the site (SVG) and in emails (PNG). |
| `public/discord.png`, `public/instagram.png` (24 px), `src/assets/*.svg` | **Port** | The PNGs are email-safe social icons, since Gmail won't render SVG. They'll be re-exported at 48 px for retina. |
| `public/file.svg`, `globe.svg`, `window.svg`, `favicon.ico` | **Skip** | create-next-app defaults. |
| `src/types/globals.d.ts` (`declare module "*.css"`) | **Skip** | Not needed with Next's types. |
| Page structure `/about`, `/connect`, `/gallery`, `/leadership` | **Considered** | `/about`, `/connect`, `/gallery` adopted; `/leadership` → keep `/flight-crew`. See proposal. |
| `stuyaviators.vercel.app` references | **Keep** | You confirmed this is the existing project in your account. It's the canonical site URL; no new project will be created. |

## Issues in code being ported

### `Stagger` / `TransitionProvider`
1. **No reduced-motion support** (the TODO). Fix: wrap in `<MotionConfig reducedMotion="user">`
   and, in `Stagger`, skip `initial` entirely when `useReducedMotion()` is true, so there's no fade
   either.
2. **Stale counter on navigation.** `indexRef` is reset in a `useEffect`, which runs *after* the new
   page's `Stagger`s have already registered. On the second client-side navigation the indices keep
   counting from the previous page, so delays grow (item 1 on page 3 might wait over 1 s). Fix:
   derive the reset from `pathname` during render (keyed provider), or reset in the same render
   via a `pathname` ref comparison.
3. **Content hidden until hydration.** `initial={{ opacity: 0 }}` is server-rendered as inline
   `opacity:0`, so with slow or failed JS the page stays blank. Fix: render visible on the server
   and animate only after mount, or use a CSS animation with a `prefers-reduced-motion` override.
4. Registering in render (`indexRef.current ??= ctx.register()`) is impure. It's tolerable under
   StrictMode double render (indices skip), but I'll make it deterministic with an explicit
   `index` prop fallback.

### `Header`
1. The mobile panel uses `role="menu"` without arrow-key handling, which misleads screen readers.
   Use a plain `<nav>` list with a disclosure button.
2. No Escape-to-close, no focus return to the toggle, and no closing on outside click.
3. `<a href>` instead of `next/link` causes full page reloads.
4. Reduced motion: the debounce is skipped, but the CSS `transition duration-200` still animates
   the slide. Add `motion-reduce:transition-none`.
5. The scroll effect depends on `[mounted]` while reading a config object recreated every render.
   Hoist the config to module scope.
6. Above-the-fold logo uses `loading="lazy"`. Use `next/image` with `priority`.
7. `useRef<HTMLHeadingElement>` on a `<header>` is the wrong type (`HTMLElement`).

### Email builder
1. **"Drag-reorder" is not implemented.** Reordering is up/down buttons only; `onReorderArticles`
   is passed to the preview but never used. I'll keep the buttons (they work on phones) and add
   pointer + keyboard drag with `@dnd-kit` only if you want real drag. Otherwise up/down is the
   accessible default.
2. **Two divergent renderers.** The on-screen preview handles all 4 block types and markdown. The
   "Copy Raw HTML" / "Download" generator renders every block as an article, ignores markdown, and
   uses `<style>`, `backdrop-filter` and web fonts that Gmail strips. Both are replaced by one React
   Email template used for preview, copy, download and the web version.
3. "Copy Rendered" copies the preview DOM, including the app's dark-glass styling. The
   replacement copies the React Email HTML as `text/html` + `text/plain`.
4. Button URLs aren't validated. Restrict them to `http(s):` and `mailto:` with Zod.
5. Preset delete is one click, hover-only (unreachable by keyboard and touch), with no confirm.
6. Preset modal has no `role="dialog"`, labelled title or Escape handling. Use `<dialog>`.
7. Default "Epsilon" social link points to `stuyaviators.github.io`, and the footer is
   hard-coded "© 2025".
8. Drafts in `localStorage` move to Postgres (shared across officers), with optimistic autosave and
   a "last saved by X at Y" indicator.

### Accessibility, general
- Icon-only buttons (move up/down, delete) rely on `title`. Add `aria-label`.
- Collapse toggles lack `aria-expanded` / `aria-controls`.
- Status text after upload isn't announced. Use `role="status"`.
