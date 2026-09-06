# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working in this project.

## What this is

`portfolio.hossainconsulting.com` — a static portfolio site served by a Cloudflare
Workers static-asset Worker. **Plain HTML, no build step, no dependencies, no server
code.** Six tracked files:

- `public/index.html` — the site
- `public/404.html` — served for unknown paths (`not_found_handling: "404-page"`)
- `public/_headers` — response headers, read natively by Workers static assets
- `wrangler.jsonc` — serves `public/` as static assets
- `README.md`, `.gitignore`

Keep it that way. Adding a framework, a bundler or a `package.json` to this repo needs a
reason better than habit — "no build step" is the feature that makes it deployable from
any machine in one command.

## Deploys are manual — pushing to `main` publishes nothing

This is the single most important fact about this repo, and an earlier README got it
wrong. Verified 19/08/2026: there is **no GitHub Actions workflow, no Cloudflare Workers
Builds connection, no webhooks**, and pushes produce no check runs or deployments.

```bash
npx wrangler login     # once per machine, opens a browser
npx wrangler deploy
```

**Never tell the user a change is live because it was pushed.** It is live when
`wrangler deploy` has run and the verification below passes. If push-to-deploy is ever
connected (Workers & Pages → `portfolio` → Settings → Builds), update the README and
this file together.

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

If these run on a machine with antivirus HTTPS inspection (Norton, Kaspersky, ESET and
similar), the certificate seen will be the antivirus's, not Cloudflare's. That is local
interception, not a site problem.

## Configuration that does not live in this repo

Two zone-level Cloudflare settings cannot be changed from here, and both were
outstanding as of 19/08/2026. Do not "fix" either one in code — the fix is a dashboard
toggle, and the README carries the click path.

1. **Always Use HTTPS — outstanding.** `http://portfolio.hossainconsulting.com/` returns
   200 over plain HTTP with no redirect. `_headers` sets HSTS, which protects anyone who
   has reached the site over HTTPS at least once; it does **not** protect a first-time
   visitor arriving over `http://`.
2. **The apex domain — outstanding.** `https://hossainconsulting.com/` returns 403; only
   the `portfolio.` subdomain routes to this Worker. This is a live bug, not just
   untidiness: `index.html` links to `https://hossainconsulting.com` in the site header,
   so the deployed site contains a broken link. **Decision (19/08/2026): 301 the apex to
   the portfolio subdomain**, with `portfolio.hossainconsulting.com` as the single
   canonical address.

`wrangler.jsonc` sets `workers_dev: false` and `preview_urls: false` deliberately — both
default to true, which would publish identical content at a second public URL and read
as duplicate content to search engines. Do not remove them.

## The disclosure is not optional

The projects listed on this site are **simulations, not client work**. SunRise Solar
Solutions, Meridian Field Services, TradeLink Group and Meridian Appliance Care are
fictional companies used to develop and evidence Salesforce implementation skills. The
disclosure appears in `README.md` and must remain visible on the site itself. Any new
project added to the site carries the same framing — never describe a simulation in
language that implies a paying client.

## Content accuracy

This site is read by recruiters and hiring managers. Every claim on it should be one
that survives being asked about in an interview: no shipped-status for work that is not
shipped, no metrics that were not measured, no credential listed before it is earned.
The sibling repos' `deliverables/` folders are the source of truth for what was actually
built.

## Agent workflow

Superpowers is expected to be installed as a **user-level plugin**
(`/plugin install superpowers@claude-plugins-official`), not vendored into this repo.
With no build and no tests, most of that workflow has nothing to run here — the parts
that apply are verification-before-completion (deploy, then check with the curl commands
above) and honest status reporting.
