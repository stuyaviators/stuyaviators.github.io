# Sending a newsletter

The site **builds** the newsletter; you **send** it by hand from the club Gmail account. There
is no email service and nothing is sent automatically. That keeps the site free, and means
you decide exactly who gets each email.

## 1. Build it

1. Sign in at `/dashboard` → **Newsletter** → **New newsletter** (or start from a preset).
2. Fill in the header, intro and content blocks. Changes save automatically; the status at the
   top says "All changes saved". If it says another officer saved a newer version, choose
   **Load their version** or **Keep mine**.
3. Optional: type a web address and press **Publish web version**. The email then gets a
   "View in browser" link to `/newsletter/<address>`. Publish *before* copying into Gmail so
   the link is included.

## 2. Get the recipients

1. Open the **sign-up Sheet** (linked on the dashboard Overview; `SIGNUP_SHEET_URL`). Every
   mailing-list sign-up from the website and the forms lands there.
2. Copy the email column.
3. **Remove everyone who unsubscribed.** Unsubscribe requests arrive at the club Gmail
   inbox (subject "Unsubscribe"); delete those addresses from your list.
4. Remove duplicates and anything that isn't a valid address.

## 3. Send from Gmail

1. In the newsletter editor press **Copy for Gmail**.
2. In the club Gmail account, **Compose** a new message and paste (Ctrl/Cmd+V) into the body.
   The formatting, images and buttons come with it.
3. Put the addresses in **BCC**, never **To** or **CC**. Otherwise every recipient sees
   everyone else’s email address. Put the club address itself in **To**.
4. Write the subject line and send a **test to yourself** first. Check it on your phone.
5. Send.

If pasting doesn't keep the formatting, use **Copy HTML**, or **Download** the `.html` file,
and ask an admin for help.

## Rules to keep

- **Always keep the unsubscribe link.** The footer adds it automatically; don't delete it
  from the pasted email. Honor unsubscribes: remove the person before the next send.
- **Gmail's daily limit** is about **500 recipients per day** for a regular Gmail account (a
  message to 100 people uses 100 of those). If the list is bigger than that, split it across
  days, and don't use the same group of recipients twice in one day. Going over can lock the
  account for up to a day.
- **Use BCC.** Sending to the list in To/CC leaks everyone’s address.
- Only email people who signed up. Don't add addresses by hand from other lists.
- Keep email images small. Uploads are shrunk automatically, but a newsletter of ten large
  photos is slow on phones.

## Related

- `docs/google-forms-setup.md`: how the sign-up form works.
- `docs/google-oauth-setup.md`: who can sign in to the dashboard.
