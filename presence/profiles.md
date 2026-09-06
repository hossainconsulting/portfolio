# Profile directory — source of truth

Edit this file first. `index.html` (JSON-LD `sameAs`), `links.html`, the
repository README footers and every bio are derived from it. Run
`/presence-check` after any change.

**Canonical handle:** `hossainconsulting`
**Fallback order if taken:** `hossain-consulting` → `hossainconsultingau` → `hemayethossain`
**Canonical hub:** https://portfolio.hossainconsulting.com
**Canonical name:** Hemayet Hossain (person) · Hossain Consulting (business)
**Location string:** Sydney, Australia (profile) · Crows Nest NSW 2065 (Google Business Profile service area)

## Status key

| Status | Meaning |
|---|---|
| **VERIFIED** | Found live on 06/09/2026 from outside the account. |
| **CONFIRM** | Almost certainly exists but the exact URL was not verifiable from here. Paste the real URL in. |
| **CLAIM** | Not found. Register the handle now, even if the platform is low priority, so nobody else does. |
| **OPTIONAL** | Register the handle, park it with a bio and a link to the hub, no content commitment. |

## Tier 1 — where recruiters and clients actually decide

| Platform | URL | Status | Audience | Cadence |
|---|---|---|---|---|
| Portfolio hub | https://portfolio.hossainconsulting.com | VERIFIED | Both | Update per project milestone |
| Company site | https://hossainconsulting.com | CONFIRM — apex returns 403, `www.` is the URL Instagram links to. Decide which one serves and 301 the other (see `../README.md`). | Clients | Quarterly |
| GitHub | https://github.com/hossainconsulting | VERIFIED | Both (proof) | Continuous |
| LinkedIn (personal) | https://www.linkedin.com/in/`<slug>` | CONFIRM — paste the exact slug. Set a custom URL: `hossainconsulting` or `hemayethossain`. | Recruiters first, clients second | 3 posts / week |
| LinkedIn (company) | https://www.linkedin.com/company/hossain-consulting | VERIFIED | Clients | 1 post / week (reshare) |
| Google Business Profile | Search "Hossain Consulting Crows Nest" — claim via https://business.google.com | CLAIM | Clients (local search, Maps) | 1 update / week |
| Salesforce Trailblazer | https://www.salesforce.com/trailblazer/`<slug>` | CONFIRM — this is the certification verifier recruiters click. Make the profile public and link it from LinkedIn. | Recruiters | Per badge |

## Tier 2 — reach and search surface

| Platform | URL | Status | Audience | Cadence |
|---|---|---|---|---|
| YouTube | https://www.youtube.com/@hossainconsulting | CLAIM | Both (long-form proof) | 1 long / fortnight, 2 Shorts / week |
| Instagram | https://www.instagram.com/hossainconsulting/ | VERIFIED | Clients | 2 posts / week + Reels mirrored from TikTok |
| X (Twitter) | https://x.com/hossainconsulting | CLAIM | Industry, recruiters | Near-daily, repurposed |
| TikTok | https://www.tiktok.com/@hossainconsulting | CLAIM | Clients (trades owners), general | 2 / week, same video as Shorts and Reels |
| Facebook Page | https://www.facebook.com/hossainconsulting | CLAIM | Clients (Sydney trades groups) | 1 / week mirror + group answers |
| Bing Places for Business | https://www.bingplaces.com — import from Google Business Profile | CLAIM | Clients (Microsoft search, Copilot) | Sync with GBP |

## Tier 3 — evergreen search and community

| Platform | URL | Status | Audience | Cadence |
|---|---|---|---|---|
| Reddit | https://www.reddit.com/user/hossainconsulting | CLAIM | Industry (r/salesforce, r/SalesforceDeveloper, r/AusFinance-adjacent trades subs) | Answer-only, 2 / week, no self-promotion |
| Pinterest | https://www.pinterest.com/hossainconsulting/ | CLAIM | Search (diagrams, checklists, carousels) | Monthly batch of 8–12 pins |
| Threads | https://www.threads.net/@hossainconsulting | OPTIONAL — comes free with the Instagram account | Overflow from X | Mirror X |
| Bluesky | https://bsky.app/profile/hossainconsulting.com | OPTIONAL — set the handle to the domain via a DNS TXT record in Cloudflare (`_atproto.hossainconsulting.com`). Free verification. | Industry | Mirror X |
| Medium / dev.to | https://medium.com/@hossainconsulting · https://dev.to/hossainconsulting | OPTIONAL | Search (long-form) | Canonical-tagged reposts of build logs only |
| Apple Business Connect | https://businessconnect.apple.com | OPTIONAL | Clients (Apple Maps) | Sync with GBP |

## What every profile must carry (the minimum viable profile)

1. Name exactly as canonical. Photo: the same headshot everywhere.
2. Headline: the positioning sentence from `brand-kit.md`, trimmed to the field limit.
3. Location: Sydney, Australia.
4. Link: the hub, or `/links` on platforms that allow one URL. Use the UTM
   convention in `measurement.md`.
5. Bio: the length-matched bio from `brand-kit.md`. Include the disclosure
   line wherever projects are mentioned.
6. Banner: the banner from `assets/` at the platform's size.
7. Pinned item: the portfolio hub, or the current best project.

## Where the URLs are repeated (update all when this file changes)

- `../public/index.html` — `sameAs` array in the JSON-LD block and the header `.links` row
- `../public/links.html` — the link-in-bio page
- `README.md` "Connect" footer in each of the eight project repositories
- `github-profile-README.md`
- LinkedIn personal → Contact info → Websites (3 allowed: hub, GitHub, company site)
- Google Business Profile → Social profiles (Google supports LinkedIn, X, Instagram, YouTube, Facebook, TikTok, Pinterest)
