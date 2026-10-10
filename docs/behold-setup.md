# Instagram feed (Behold)

The website shows the latest @stuyaviators Instagram posts on the homepage
("From the flight deck") and the Connect page. It gets them from
[Behold](https://behold.so), a free service that turns an Instagram account
into a JSON feed.

## How it works

- **Feed URL:** `https://feeds.behold.so/CDSpFlcqkbtsbwbH8PR1`. It's public and
  needs no key. The site reads it from the `BEHOLD_FEED_URL` environment
  variable, falling back to this URL.
- The website fetches the feed **on the server** and caches it for an hour, so
  visitors never load Behold's script and Instagram changes show up within an
  hour.
- The free plan returns the **6 most recent posts**. The layouts are designed
  for 6.
- Images come only from Behold's own image CDN (`behold.pictures`). Instagram's
  direct image links expire, so the site never uses them.
- If the feed is down, slow (over 4 seconds) or empty, the Instagram sections
  simply disappear. The rest of the page still works.

## Where it's managed

1. Sign in at [app.behold.so](https://app.behold.so) with the account that
   created the feed (ask the previous Flight Technician if you don't know which
   one; ideally it's the club Gmail, `stuyaviators@gmail.com`).
2. Open the feed named for @stuyaviators. Its ID ends in `CDSpFlcqkbtsbwbH8PR1`.

You can change which posts are included (for example, hide a post) in the feed
settings. Changes appear on the site within an hour.

## If the feed stops updating

Instagram disconnects Behold when the Instagram password changes, when the
account's security settings change, or every so often for no clear reason.
Symptoms: the site keeps showing old posts, or the Instagram sections vanish.

1. Sign in to Behold and open the feed. A banner will say the source needs
   attention.
2. Click **Reconnect** and log in to Instagram as @stuyaviators.
3. Approve the permissions. The feed refreshes within a few minutes; the site
   picks it up within an hour.

If you ever have to create a brand-new feed, copy its new feed URL and set it
as `BEHOLD_FEED_URL` in Vercel (Project → Settings → Environment Variables),
then redeploy. No code changes are needed.

## Free-plan limits

- 6 posts per feed and a limited refresh rate. That's fine for this site.
- Behold's limits change from time to time; check
  [behold.so/pricing](https://behold.so/pricing) if something stops working.
