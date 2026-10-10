# Mailing list (Google Forms)

The website's mailing-list sign-up looks like part of the site, but each
sign-up is quietly submitted to a Google Form owned by the club Gmail account.
Responses land in that form's Google Sheet, which is the mailing list.

> **Unofficial endpoint.** This uses Google Forms' `formResponse` URL, which
> Google doesn't officially document for this use. If Google changes it,
> sign-ups fail safely: visitors see a link to the real Google Form instead of a
> fake "you're signed up" message, so nobody is lost.

## How the current form is wired up

| Setting | Value |
| --- | --- |
| Form | "mailing list", in `stuyaviators@gmail.com` |
| Public link (fallback) | https://forms.gle/vzSfXNKrsejNe1rd6 |
| Submit endpoint | `https://docs.google.com/forms/d/e/1FAIpQLScbjyhaEiBhMZPDi8TNQJZemMCSR9xfpChoRN0RP_sDhfS-ag/formResponse` |
| Full name question | `entry.1248809368` |
| Stuy email question | `entry.1701037871` |

These live in environment variables, so a new form can be swapped in without
touching code:

```
GOOGLE_FORM_SIGNUP_ACTION
GOOGLE_FORM_SIGNUP_NAME_ENTRY
GOOGLE_FORM_SIGNUP_EMAIL_ENTRY
GOOGLE_FORM_SIGNUP_FALLBACK_URL
```

What happens when someone signs up:

1. The browser checks the name and email as they type (rules below).
2. The website's server checks them again (the browser can't be trusted), then
   checks the hidden anti-bot field and the rate limit (5 tries per 10 minutes
   per connection).
3. The server fixes capitalization (`peter stuyvesant` → `Peter Stuyvesant`) and
   lowercases the email, then sends both to Google. The visitor's browser never
   talks to Google.
4. Only a successful response from Google counts as "signed up". Anything else
   shows the fallback link.
5. The sign-up is also logged in the dashboard inbox, and a short alert goes to
   the officers' Discord channel (no email addresses are posted there).

Other forms on the site (contact, share your story, photo submissions and
meeting ideas) **also add the person to the mailing list automatically** when
they use a valid Stuy email that matches their name. Those forms say so under
the submit button.

## The validation rules, in plain English

- **Full name:** first and last name required. Letters (including accents),
  spaces, hyphens, apostrophes and periods only. Extra spaces are removed.
- **Email:** must be a `@stuy.edu` address.
- **Email format:** Stuy emails are first initial + last name + numbers, for
  example `pstuyvesant60@stuy.edu`. The email has to end in numbers with nothing
  after them.
- **Last name must match the email.** The first name is deliberately *not*
  checked, because people's preferred names often differ from the name on their
  school account ("Bob" vs. "Robert").
  - One-word last names must match exactly (Stuyvesant → `pstuyvesant60` ✓,
    `psmith60` ✗).
  - Multi-part last names ("De La Cruz", "Smith-Jones", or a middle name) pass
    if the email contains any part that's 3+ letters long (`mcruz12` ✓) or all
    the parts joined (`mdelacruz12` ✓). Short particles like "de" or "la" don't
    count on their own.
  - Accents and punctuation are ignored when comparing (Peña → `pena`,
    O'Brien → `obrien`).
- If someone's email genuinely doesn't follow the pattern, the error message
  links them to the real Google Form so they can still sign up.

The code for all of this is in `src/lib/mailing-list.ts`, with tests in
`src/lib/mailing-list.test.ts`.

## Finding `entry.<id>` values for a form

Each question in a Google Form has a hidden ID. Two ways to find it:

**Pre-filled link (easiest)**

1. Open the form in edit mode → ⋮ menu → **Get pre-filled link**.
2. Type anything (e.g. `NAME`, `EMAIL`) into each question and click
   **Get link** → **Copy link**.
3. Paste the link somewhere. It contains pieces like `entry.1248809368=NAME`.
   That number is the question's entry ID.

**Page source**

1. Open the public form, right-click → **View page source**.
2. Search for `FB_PUBLIC_LOAD_DATA_`. Each question appears with its title
   followed by a long number. That number is the entry ID (add `entry.` in
   front).

The submit endpoint is the form's public URL with `viewform` replaced by
`formResponse`.

## Settings that must stay OFF

In the form's **Settings** tab:

- **Collect email addresses:** off (otherwise Google requires sign-in and
  rejects the website's submissions).
- **Require sign-in / Restrict to users in your organization:** off.
- **Limit to 1 response:** off (it requires sign-in).

Both questions should stay **optional** in the form; the website does the
checking. Making them required in Google doesn't hurt, but it's not needed.

## Why the form must live in the club Gmail

Forms created in a `@stuy.edu` Google account can be restricted by the school
to school users only, and the account disappears when its owner graduates.
Keep forms (and their response Sheets) in `stuyaviators@gmail.com` and share
edit access with officers.

## Creating the unsubscribe form

There's no unsubscribe form yet. Until there is, every unsubscribe link points
to `mailto:stuyaviators@gmail.com?subject=Unsubscribe`, and officers remove
those people by hand.

To set one up:

1. In `stuyaviators@gmail.com`, create a form called "unsubscribe" with one
   short-answer question: **Stuy email**.
2. Apply the "must stay OFF" settings above.
3. Find the question's `entry.<id>` and the `formResponse` URL as described
   above.
4. In Vercel → Project → Settings → Environment Variables, set:
   - `GOOGLE_FORM_UNSUBSCRIBE_ACTION`: the `formResponse` URL
   - `GOOGLE_FORM_UNSUBSCRIBE_EMAIL_ENTRY`: e.g. `entry.123456789`
   - `GOOGLE_FORM_UNSUBSCRIBE_FALLBACK_URL`: the form's public link
   - `UNSUBSCRIBE_SHEET_URL`: the response Sheet, linked from the dashboard
5. Redeploy. `/newsletter/unsubscribe` now shows a form (it only checks
   `@stuy.edu` and the trailing numbers, not the last name), and newsletter
   unsubscribe links point there.

## Testing safely

Don't submit test entries to the live form. Either:

- run the automated tests (`pnpm test`), which fake Google's response, or
- make a copy of the form, point the `GOOGLE_FORM_SIGNUP_*` variables in your
  local `.env.local` at the copy, and test against that.
