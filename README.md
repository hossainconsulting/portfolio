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

- `public/` — the site. Plain HTML, no build step.
  - `index.html` — the site itself
  - `404.html` — served for unknown paths (`not_found_handling: "404-page"`)
  - `widget.js` — the CONCIERGE chat widget, browser half
  - `_headers` — response headers, read natively by Workers static assets
- `src/` — the Worker.
  - `index.js` — serves `public/` and handles `POST /api/chat`
  - `system-prompt.js` — the widget's system prompt (the copy that runs)
- `scripts/check-prompt-sync.mjs` — checks that prompt against its authored source
- `wrangler.jsonc` — Worker config and the static-asset binding

## The CONCIERGE widget

A chat widget in the bottom-right corner asks visitors whether they want to hire
Hemayet or engage him as a consultant, collects enough detail for a useful reply,
and hands the lead on. It is the site's only interactive part.

**The API key never reaches the browser.** The browser holds the conversation and
posts it to `/api/chat`; the Worker calls the Anthropic API with a key held as a
Worker secret. A widget that called the API directly from the page would publish
the key to anyone who opened devtools.

Because the browser holds the history, everything arriving at `/api/chat` is
treated as untrusted: role, type, per-message length, total length and turn count
are all checked before a request is billed (`src/index.js`).

Lead capture is a tool call. Once the assistant has a name and one contact route
it calls `capture_lead`, and the Worker POSTs the structured lead plus the full
transcript to `LEAD_WEBHOOK_URL`. **If delivery fails, the tool result tells the
assistant so**, and it gives the visitor the email address instead of promising a
reply within one business day. A promise nobody can keep is worse than no promise.

### Required configuration

```bash
npx wrangler secret put ANTHROPIC_API_KEY   # required — without it the widget
                                            # answers with the email fallback
npx wrangler secret put LEAD_WEBHOOK_URL    # required for the one-business-day
                                            # promise to mean anything
```

`LEAD_WEBHOOK_URL` is any endpoint that turns a JSON POST into something Hemayet
reads daily — an n8n or Make webhook that emails him is the least work. Without
it, leads are only written to the Worker log, which nobody watches.

### Optional configuration

```bash
npx wrangler secret put CONTACT_PHONE       # optional — see below
```

`CONTACT_EMAIL` is a plain var in `wrangler.jsonc`. `CONTACT_PHONE` is a secret
and is **unset by default**: a number handed out by a public chat assistant is a
public number, so publishing the mobile is a deliberate act, not a side effect of
a commit. With it unset, the assistant offers the email and takes the visitor's
number instead. Set it and the assistant volunteers it.

### Decisions worth knowing about

- **Model: `claude-opus-5`, effort `low`.** Opus with low effort, not a smaller
  model — the visitor's first impression of the practice is this conversation.
  Low effort keeps latency and spend down without turning thinking off. Both are
  one-line changes at the top of `src/index.js` if the bill argues otherwise.
- **Thinking stays on.** Disabling it on this model can leak reasoning into the
  visible reply or put a tool call into prose where it never executes. Lowering
  effort is the cheaper lever and has neither failure mode.
- **Server-side refusal fallbacks are not enabled.** For a greeter, the right
  response to a refusal is the polite close the prompt already specifies, not a
  reroute to a weaker model. The Worker checks `stop_reason === "refusal"` and
  returns the fallback line with the email address.
- **CSP moved from `script-src 'none'` to `'self'`**, and no further. The widget's
  behaviour is in `/widget.js`, not an inline `<script>`, so injected inline
  script still cannot run.

### Before this gets real traffic

1. **Rate-limit `/api/chat`.** There is no per-IP limit in the Worker — the
   per-request caps bound one conversation, not a thousand of them. Add a
   Cloudflare WAF rate-limiting rule on the path (`portfolio.hossainconsulting.com`
   → Security → WAF → Rate limiting rules); the free plan allows one, which is
   all this needs. **Do this before announcing the site.**
2. **Set `LEAD_WEBHOOK_URL`**, or the response standard is not being met.
3. **Publish a privacy statement** and link it from the footer. The widget
   collects names, emails and phone numbers from people in Australia, and says
   in-chat what happens to them; a linked statement is the other half.

### Working on the widget

```bash
npm install
npx wrangler dev              # needs .dev.vars — gitignored
npm run check                 # syntax + prompt-sync
```

`.dev.vars` for local work:

```
ANTHROPIC_API_KEY="sk-ant-..."
LEAD_WEBHOOK_URL="https://..."      # optional
ANTHROPIC_BASE_URL="http://..."     # optional, point at a mock
```

The system prompt exists twice: `src/system-prompt.js` is what runs, and the
authored source is in the private `acquisition-system` repo
(`agents/Agent_Inbound_CONCIERGE.md`). `npm run check` compares them when both
repos are checked out side by side, and skips when they are not.

**What has been tested:** routing, the 404 fallthrough, every request-validation
rejection, the full `capture_lead` round-trip against a mock API, all three lead
delivery outcomes (delivered, webhook 5xx, no webhook configured), a refusal, and
a rejected API key. **What has not:** a real conversation against the live
Anthropic API. Have one before announcing the site.

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

# the widget endpoint is alive and rejecting rubbish
curl -sS -X POST https://portfolio.hossainconsulting.com/api/chat \
  -H 'content-type: application/json' -d '{}'
# want: {"error":"messages must be a non-empty array"}

# and answers a real message
curl -sS -X POST https://portfolio.hossainconsulting.com/api/chat \
  -H 'content-type: application/json' \
  -d '{"messages":[{"role":"user","content":"Hi, who is Hemayet?"}]}'
```

The first `diff` above compares the served page with `public/index.html`. That
still holds — the Worker serves the same file — but the widget only works when
`ANTHROPIC_API_KEY` is set, and a page that looks right can still have a dead
endpoint behind it. Run the two `/api/chat` checks as well.

Note: if you run these on a machine with antivirus HTTPS inspection enabled
(Norton, Kaspersky, ESET and similar), the TLS certificate you see will be the
antivirus's, not Cloudflare's. That is local interception, not a site problem —
check the real certificate from a browser or an external service.

## Disclosure

The projects listed on this site are **simulations, not client work**. SunRise
Solar Solutions, Meridian Field Services, TradeLink Group and Meridian Appliance
Care are fictional companies used to develop and evidence Salesforce
implementation skills. No real customer data is involved.
