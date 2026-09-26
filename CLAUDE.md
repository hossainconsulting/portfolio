# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working in this project.

## What this is

`portfolio.hossainconsulting.com` — a static portfolio site served by a Cloudflare
Workers static-asset Worker. Plain HTML, **no build step, no dependencies, no
server code**. Two pages and a headers file.

```
public/index.html   the site
public/404.html     served for unknown paths (not_found_handling: "404-page")
public/_headers     response headers, read natively by Workers static assets
wrangler.jsonc      tells Wrangler to serve ./public as static assets
```

Keep it that way. A framework, a bundler or a dependency here would be cost with no
benefit — the site is two pages of hand-written HTML and that is a feature.

## Pushing to `main` publishes nothing

**Deploys are manual.** There is no GitHub Actions workflow, no Cloudflare Workers
Builds connection, no webhook. This was verified on 19/08/2026, after an earlier
version of the README claimed otherwise. A merged pull request changes the
repository and nothing else.

To release:

```bash
npx wrangler login     # once per machine, opens a browser
npx wrangler deploy
```

Never state or imply that a change is live because it was pushed. If asked whether
something is deployed, check:

```bash
curl -sS https://portfolio.hossainconsulting.com/ | diff - public/index.html && echo "in sync"
```

`wrangler deploy` publishes to the public internet. Do not run it without being
asked.

## Two Cloudflare settings that cannot be fixed from this repo

Both are zone-level and both were outstanding as of 19/08/2026. If either is
mentioned, the fix is in the dashboard, not in a commit:

1. **Always Use HTTPS is off.** `http://portfolio.hossainconsulting.com/` returns
   200 over plain HTTP with no redirect. `_headers` sets HSTS, which protects
   repeat visitors but does nothing for a first-time arrival over `http://`.
   SSL/TLS → Edge Certificates → Always Use HTTPS.
2. **The apex domain 403s.** Only the `portfolio.` subdomain is routed to this
   Worker, and `index.html` links to `https://hossainconsulting.com` in the site
   header — so the live site contains a broken link. Decision of 19/08/2026: 301
   the apex to the subdomain via a Redirect Rule. The README carries the exact rule
   configuration and the originless-placeholder DNS record it needs.

## Configuration decisions already made

`wrangler.jsonc` sets `workers_dev: false` and `preview_urls: false` deliberately.
Both default to true, which publishes identical content at a second public URL that
search engines read as duplicate content. Do not remove them.

## The disclosure is not optional

Every project listed on this site is a **simulation, not client work**. SunRise
Solar Solutions, Meridian Field Services, TradeLink Group, Coastline Retail Group,
Ironbark Industrial Supply, Kurrajong Energy and Meridian Appliance Care are
fictional companies. The disclosure appears in the README and must stay visible on
the site itself. Never write copy that describes these as client engagements,
consulting work, or anything a reader could mistake for real customers.

## Verifying a deploy

```bash
# 404 page renders rather than returning an empty body
curl -sS -o /dev/null -w '%{http_code} %{size_download} bytes\n' \
  https://portfolio.hossainconsulting.com/no-such-page

# security headers are present
curl -sSI https://portfolio.hossainconsulting.com/ \
  | grep -Ei 'strict-transport|content-security|x-frame|x-content-type|referrer-policy|permissions-policy'
```

If TLS looks wrong on a machine running antivirus HTTPS inspection (Norton,
Kaspersky, ESET), that is local interception, not a site problem. Check from a
browser or an external service before chasing it.
