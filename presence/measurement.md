# Measurement

Two audiences, two scorecards. Anything not on a scorecard is not a goal.

## Recruiter scorecard (monthly)

| Metric | Where | Target after 90 days |
|---|---|---|
| LinkedIn profile views | LinkedIn analytics | 300 / month |
| Search appearances | LinkedIn analytics → "search appearances" | 150 / week |
| Recruiter InMails and messages | Inbox count, logged in the review | 4 / month |
| Hub visits from LinkedIn | Cloudflare Web Analytics, referrer | 100 / month |
| GitHub profile visitors | GitHub Insights → Traffic on the profile repo | 60 / month |
| Trailblazer profile views | Trailblazer profile stats | Tracked, no target |

## Client scorecard (monthly)

| Metric | Where | Target after 90 days |
|---|---|---|
| Google Business Profile: searches, views, website clicks, calls | GBP performance | 100 views, 10 clicks |
| Bing Places impressions | Bing Places dashboard | Tracked |
| Branded search impressions for "Hossain Consulting" | Google Search Console → Queries | 40 / month |
| Non-branded impressions ("salesforce consultant sydney", "salesforce for tradies") | Search Console | 500 / month |
| Enquiries (form, email, DM, call) | Logged in the review | 2 / month |
| Facebook / Instagram DMs from Sydney trades | Meta Business Suite inbox | Tracked |

## Reach scorecard (monthly, secondary)

| Metric | Where |
|---|---|
| LinkedIn post impressions and followers | LinkedIn analytics |
| YouTube watch time, subscribers, traffic source | YouTube Studio |
| TikTok / Reels / Shorts views and profile visits | Each app |
| Pinterest outbound clicks | Pinterest analytics |
| X impressions and profile visits | X analytics |
| Reddit karma in r/salesforce | Profile |

## UTM convention

Every link back to the hub carries a source so the referrer is not lost to
in-app browsers.

```
https://portfolio.hossainconsulting.com/?utm_source=<platform>&utm_medium=<placement>&utm_campaign=<pillar-or-piece>
```

| Field | Allowed values |
|---|---|
| `utm_source` | `linkedin`, `linkedin-company`, `github`, `x`, `instagram`, `tiktok`, `youtube`, `facebook`, `reddit`, `pinterest`, `gbp`, `bing`, `threads`, `bluesky`, `trailblazer`, `email` |
| `utm_medium` | `profile` (the bio link), `post`, `video`, `pin`, `comment`, `dm` |
| `utm_campaign` | The pillar (`build-log`, `cert`, `ai`, `craft`, `trades`) or a slug for the specific piece |

Bio links use `utm_medium=profile`. The `/links` page is the target for
single-link platforms and carries `utm_source` on each of its own buttons.

## Analytics stack (all free, no cookies, no consent banner needed)

- **Cloudflare Web Analytics** — enable in the dashboard under the zone;
  it works server-side for proxied hostnames, so no script and no CSP change.
- **Google Search Console** and **Bing Webmaster Tools** — see `seo.md`.
- **Platform native analytics** — enough for the scorecards above.

Do not add a client-side tracker. The CSP in `public/_headers` is
`script-src 'none'` on purpose and the site's credibility is partly that it
loads nothing.

## The monthly review (30 minutes, first Monday)

1. Fill the three scorecards from the sources above into
   `presence/reviews/YYYY-MM.md` (create the folder on the first review).
2. Note the single best-performing piece and the single worst.
3. Decide one thing to do more of and one to stop.
4. Run `/presence-check`. Fix any drift before publishing anything new.
5. Update `profiles.md` statuses.
