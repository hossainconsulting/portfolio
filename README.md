# portfolio.hossainconsulting.com

Static portfolio site. Deployed to Cloudflare on every push to `main`.

- `public/` — the site. Plain HTML, no build step, no dependencies.
  - `index.html` — the site itself
  - `404.html` — served for unknown paths (`not_found_handling: "404-page"`)
  - `_headers` — response headers, read natively by Workers static assets
- `wrangler.jsonc` — tells Wrangler to serve `public/` as static assets.

## Configuration that does not live in this repo

Two things are zone-level Cloudflare settings and cannot be set from here. Both
were outstanding as of 19/08/2026:

### 1. Always Use HTTPS — **outstanding**

`http://portfolio.hossainconsulting.com/` currently returns **200 and serves the
page over plain HTTP**, with no redirect to HTTPS.

`_headers` sets `Strict-Transport-Security`, which protects anyone who has
reached the site over HTTPS at least once. It does **not** protect a first-time
visitor arriving over `http://`. That needs the zone toggle:

> Cloudflare dashboard → select `hossainconsulting.com` → **SSL/TLS** → **Edge
> Certificates** → turn on **Always Use HTTPS**.

Verify with:

```bash
curl -sSI http://portfolio.hossainconsulting.com/ | head -1
# want: HTTP/1.1 301 Moved Permanently
```

### 2. The apex domain — **outstanding**

`https://hossainconsulting.com/` returns **403**. Only the `portfolio.`
subdomain is routed to this Worker.

This matters beyond tidiness: `index.html` links to `https://hossainconsulting.com`
in the site header, so the live site currently contains a broken link.

Either point the apex at this Worker, or redirect it:

> **Redirect (simpler):** Cloudflare dashboard → **Rules** → **Redirect Rules** →
> create rule, hostname equals `hossainconsulting.com`, dynamic redirect to
> `concat("https://portfolio.hossainconsulting.com", http.request.uri.path)`,
> status 301.
>
> **Or serve the site at the apex:** Workers & Pages → `portfolio` → **Settings**
> → **Domains & Routes** → add `hossainconsulting.com` as a custom domain. Then
> decide which hostname is canonical and redirect the other, so the same content
> is not served on two addresses.

Verify with:

```bash
curl -sS -o /dev/null -w '%{http_code} %{url_effective}\n' -L https://hossainconsulting.com/
```

## Verifying a deploy

```bash
# up, and serving what is in this repo
curl -sS https://portfolio.hossainconsulting.com/ | diff - public/index.html && echo "in sync"

# 404 page renders rather than returning an empty body
curl -sS -o /dev/null -w '%{http_code} %{size_download} bytes\n' \
  https://portfolio.hossainconsulting.com/no-such-page

# security headers are present
curl -sSI https://portfolio.hossainconsulting.com/ \
  | grep -Ei 'strict-transport|content-security|x-frame|x-content-type|referrer-policy|permissions-policy'
```

Note: if you run these on a machine with antivirus HTTPS inspection enabled
(Norton, Kaspersky, ESET and similar), the TLS certificate you see will be the
antivirus's, not Cloudflare's. That is local interception, not a site problem —
check the real certificate from a browser or an external service.

## Disclosure

The projects listed on this site are **simulations, not client work**. SunRise
Solar Solutions, Meridian Field Services, TradeLink Group and Meridian Appliance
Care are fictional companies used to develop and evidence Salesforce
implementation skills. No real customer data is involved.
