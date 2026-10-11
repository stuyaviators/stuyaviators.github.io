# Google sign-in setup (officer dashboard)

The dashboard at `/dashboard` uses **Sign in with Google** (Auth.js). Google only proves who
someone is; the site then checks the email against the **officer list** in the database. Nobody
gets in just by having a Google account.

This is **free** and needs **no billing account or credit card**. You only create an OAuth
client; you do not enable any paid API.

## 1. Create a Google Cloud project

1. Go to <https://console.cloud.google.com/> and sign in with the club Gmail account (or any
   account an officer will always have access to).
2. Click the project picker at the top → **New project**. Name it `StuyAviators site`. Leave the
   organization empty. If Google offers to set up billing, skip it; you don't need it.

## 2. Configure the consent screen

Google calls this **Google Auth Platform** (older docs say "OAuth consent screen"). Open it from
the menu → **APIs & Services → OAuth consent screen**.

1. **Branding**: app name `StuyAviators Dashboard`, a support email, and a developer contact
   email.
2. **Audience**: choose **External**.
3. **Data access (scopes)**: add only `openid`, `email` and `profile`. These are Google's
   default sign-in scopes and need no verification. Do not add anything else.
4. **Publishing status: set it to "In production".** On **Audience**, click **Publish app**.
   - If you leave it on **Testing**, only the test users you add by hand can sign in, and
     their sign-in expires after 7 days. That's the most common reason sign-in "randomly"
     stops working.
   - With only the three basic scopes, publishing doesn't trigger Google's app review.

## 3. Create the OAuth client

Go to **Clients → Create client** (older UI: **Credentials → Create credentials → OAuth client
ID**).

- **Application type:** Web application
- **Name:** `StuyAviators site`
- **Authorized JavaScript origins:**
  - `http://localhost:3000`
  - `https://stuyaviators.vercel.app`
- **Authorized redirect URIs** (must match exactly, including the path):
  - `http://localhost:3000/api/auth/callback/google`
  - `https://stuyaviators.vercel.app/api/auth/callback/google`

Click **Create**, then copy the **Client ID** and **Client secret**.

### Vercel preview deployments

Google does **not** allow wildcard redirect URIs, and every preview deployment has its own URL.
Sign-in therefore works on a preview only if you add that exact URL (origin and
`/api/auth/callback/google` redirect) to the client. Easiest: test the dashboard locally, and
add a preview URL only if you really need it. If you add a custom domain later, add it here
too.

## 4. Add the values to the site

**Locally**, in `.env.local` (never commit this file):

```
AUTH_SECRET=<run: openssl rand -base64 32>
AUTH_GOOGLE_ID=<Client ID>
AUTH_GOOGLE_SECRET=<Client secret>
ADMIN_EMAILS=you@gmail.com
```

`AUTH_SECRET` signs the sign-in cookie and encrypts the stored Epsilon token. If you change it
later, everyone is signed out and the Epsilon token has to be pasted in again.

**On Vercel**, an admin sets the same four variables in the project's **Settings →
Environment Variables** (Production, and Preview if you want previews to work). Redeploy
afterwards. Nothing here is set automatically.

## 5. Who can sign in

- `ADMIN_EMAILS` (comma separated) is only used to create the **first** admin: the first time
  one of those accounts signs in while the officer list has **no admins at all**. After that,
  the database is the only source of truth.
- Admins manage everyone else on **Dashboard → Officers**: add an email with the role
  `officer` (edits content) or `admin` (also manages officers and settings). The last admin
  can't be removed or demoted.
- Removing someone takes effect on their very next click, even if they're still signed in.
- The email must match the Google account's **verified** primary email.

### School Google accounts

A school Google Workspace account (such as `@stuy.edu`) may be set by the school to **block
third-party sign-in**. If an officer sees "app blocked" or "access denied" from Google, have
them use a **personal Gmail** instead and add that address to the officer list. The list works
with any Google account.

## 6. Local testing without the officer list

For testing on your own computer you can let any Google account in as an admin. In
`.env.local`:

```
DASHBOARD_OPEN_SIGNIN=true
```

This is ignored in production builds, so it **cannot** take effect on Vercel. A red banner
shows in the dashboard while it's on. Remove it when you're done.

## Troubleshooting

| What you see | Cause |
|---|---|
| Google: `Error 400: redirect_uri_mismatch` | The redirect URI in step 3 doesn't match exactly (scheme, host, port, path). |
| Google: "This app isn't verified" or "access blocked: has not completed verification" | Publishing status is still **Testing**, or extra scopes were added. Publish it and keep only `openid`, `email`, `profile`. |
| Site: "You're not authorized" | The Google account signed in fine but isn't on the officer list. Add that exact email in **Officers** (or in `ADMIN_EMAILS` for the very first admin). |
| `/sign-in` says "Sign-in isn't set up yet" | `AUTH_GOOGLE_ID`, `AUTH_GOOGLE_SECRET` or `AUTH_SECRET` is missing. |
| Works locally, not on Vercel | The variables aren't set in Vercel, or the production URL isn't in the OAuth client. |
