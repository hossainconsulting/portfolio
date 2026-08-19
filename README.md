# portfolio.hossainconsulting.com

Static portfolio site on Cloudflare Workers.

> **Deploys are manual.** An earlier version of this README claimed the site
> deployed on every push to `main`. It does not — verified 19/08/2026: the repo
> has no GitHub Actions workflow, no Cloudflare Workers Builds connection, no
> webhooks, and pushes produce no check runs or deployments. **Pushing to `main`
> publishes nothing.**
>
> To release:
>
> ```bash
> npx wrangler login     # once per machine, opens a browser
> npx wrangler deploy
> ```
>
> Then run the verification commands at the bottom of this file. If you want
> push-to-deploy, connect the repo under Workers & Pages → `portfolio` →
> **Settings** → **Builds**, and this note can go.

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

**Decision (19/08/2026): 301 the apex to the portfolio subdomain.**
`portfolio.hossainconsulting.com` stays the single canonical address.

> Cloudflare dashboard → select `hossainconsulting.com` → **Rules** →
> **Redirect Rules** → **Create rule**.
>
> - **Name:** `apex to portfolio`
> - **When incoming requests match:** Custom filter expression →
>   `(http.host eq "hossainconsulting.com")`
> - **Then:** Type **Dynamic**, Expression
>   `concat("https://portfolio.hossainconsulting.com", http.request.uri.path)`
> - **Status code:** `301`
> - Tick **Preserve query string**
>
> Deploy the rule. A DNS record must exist for the apex and be **proxied**
> (orange cloud) for the rule to fire — Cloudflare only applies redirect rules
> to hostnames whose traffic it proxies.
>
> If there is no apex record, add a proxied placeholder: `AAAA` for `@` pointing
> at `100::`, or `A` for `@` pointing at `192.0.2.0`. Both are
> [reserved originless placeholders](https://developers.cloudflare.com/dns/manage-dns-records/how-to/create-dns-records/#originless-setups) —
> because the record is proxied, requests never reach the address; Cloudflare
> intercepts them and applies the rule.

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
