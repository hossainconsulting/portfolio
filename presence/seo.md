# Search engines: Google and Microsoft

The goal is a **knowledge panel** for "Hemayet Hossain" and "Hossain
Consulting" and a first-page result for "Salesforce consultant Sydney"
within a year. Both come from the same three things: an entity search engines
can resolve, a site they can crawl, and profiles that all agree with each other.

## 1. The entity (schema.org)

`public/index.html` carries a JSON-LD block with:

- `Person` — Hemayet Hossain, `jobTitle`, `knowsAbout`, `hasCredential` for
  each passed certification, `worksFor` the business, and `sameAs` listing
  every profile URL in `profiles.md`.
- `ProfessionalService` — Hossain Consulting, `areaServed` Sydney, `founder`
  the person, `sameAs` the business profiles.
- `WebSite` — the hub.

`sameAs` is the mechanism that merges the profiles into one entity in Google's
knowledge graph. **Every profile URL must resolve and must link back to the
hub** or the signal is one-directional and weak.

The CSP in `_headers` is `script-src 'none'`. That is fine: a
`type="application/ld+json"` block is data, not executed script. Browsers do
not run it and Google parses it regardless of CSP.

Validate after every change: https://validator.schema.org and Google's Rich
Results Test.

## 2. Crawlability

| File | Purpose |
|---|---|
| `public/robots.txt` | Allows everything, names the sitemap. |
| `public/sitemap.xml` | Lists `/` and `/links`. Add entries when pages are added. `lastmod` is updated by hand on release. |
| `<link rel="canonical">` | On every page, pointing at the `portfolio.` hostname. |
| `wrangler.jsonc` | `workers_dev: false` so there is no second hostname serving duplicate content. Already done. |

Two zone-level items in `../README.md` are prerequisites, still outstanding as
of 06/09/2026:

1. **Always Use HTTPS** — a plain-http hub is a ranking negative and breaks
   the HSTS story.
2. **Apex 301** — `hossainconsulting.com` returns 403. Instagram's bio points
   at `www.hossainconsulting.com`. Until one canonical host serves and the
   others 301 to it, link equity is split three ways. Decision recorded in
   `../README.md`: apex 301s to `portfolio.`. Add `www.` to the same redirect
   rule.

## 3. Google Search Console

1. https://search.google.com/search-console → Add property → **Domain**
   property `hossainconsulting.com` (covers every subdomain and protocol).
2. Verify by DNS TXT record. Cloudflare → DNS → add the `google-site-verification=…` TXT at `@`.
3. Submit `https://portfolio.hossainconsulting.com/sitemap.xml`.
4. URL Inspection → Request indexing for `/` and `/links` once.
5. Settings → Users → nothing else needed for a personal site.

Check monthly: Performance (queries), Pages (indexed vs. not), Enhancements
(structured data errors).

## 4. Bing Webmaster Tools (covers Bing, Copilot, DuckDuckGo, Yahoo, Ecosia)

1. https://www.bing.com/webmasters → Sign in → **Import from Google Search
   Console**. One click, same verification, same sitemap.
2. Confirm the sitemap imported. Submit it manually if not.
3. Turn on **IndexNow** (below). Bing shows an IndexNow report once keys are
   seen.

## 5. IndexNow (instant indexing on Bing, Yandex, Naver, Seznam)

The key file lives at the site root: `public/<key>.txt` containing the key
itself. The key in this repo was generated on 06/09/2026 and is intentionally
public; that is how the protocol works.

After every deploy, ping once per changed URL:

```bash
KEY=$(basename public/*.txt .txt | grep -E '^[a-f0-9]{32}$')
curl -sS "https://api.indexnow.org/indexnow?url=https://portfolio.hossainconsulting.com/&key=$KEY"
curl -sS "https://api.indexnow.org/indexnow?url=https://portfolio.hossainconsulting.com/links&key=$KEY"
```

`202` means accepted. Google does not use IndexNow; use Search Console's
request-indexing for Google.

## 6. Google Business Profile and Bing Places (local search, Maps, Copilot)

See `platforms/google-business-profile.md` and `platforms/bing-places.md`.
The short version: claim GBP as a **service-area business** with the address
hidden, verify by video or postcard, fill every field, add the hub as
website, then import the whole thing into Bing Places.

## 7. Off-site signals that move a knowledge panel

In rough order of weight:

1. Wikipedia-grade sources are out of reach; **consistent NAP** (name,
   address, phone) across GBP, Bing Places, Apple Business Connect, LinkedIn
   company page and the ABN lookup is the substitute for a small business.
2. **Trailblazer profile** public with certifications visible. Salesforce's
   own domain vouching for the credentials is a strong signal.
3. **GitHub** organisation with the nine public repositories, each README
   linking to the hub and the LinkedIn profile (done on this branch).
4. **LinkedIn** personal profile with the hub in Contact info and a custom
   URL matching the handle.
5. **YouTube** channel with the hub as the verified website link (YouTube
   verifies the domain; that link is followed).
6. **Directory listings** (once, then never touch): Yellow Pages AU, True
   Local, Hotfrog, Clutch, GoodFirms, the Salesforce Partner Finder if and when
   eligible.

## 8. Open Graph and Twitter Cards

In `index.html` and `links.html`:

- `og:title`, `og:description`, `og:image` (`/og.png`, 1200×630), `og:url`,
  `og:type=website`, `og:locale=en_AU`
- `twitter:card=summary_large_image`, `twitter:site=@hossainconsulting` once
  the X handle exists

Test with LinkedIn Post Inspector, Facebook Sharing Debugger and X Card
Validator after each deploy. All three cache aggressively; use the "scrape
again" button.

## 9. What not to do

- No keyword stuffing in the hub copy. The copy is good because it is specific.
- No paid backlinks, no link exchanges, no directory spam.
- No second hostname serving the same page (see `wrangler.jsonc`).
- No client-side analytics script. Cloudflare Web Analytics is server-side.
