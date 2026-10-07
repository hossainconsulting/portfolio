# Hossain Consulting Platform

The place where the projects, AI agents and agency services from
[portfolio.hossainconsulting.com](https://portfolio.hossainconsulting.com) are
sold. A customer signs in with an email link, subscribes through Stripe, gets an
API key, and calls hosted agents whose every call is counted against a monthly
quota. The owner gets a daily reminder email and a Monday digest with MRR, usage
and the next roadmap items.

Lives in the `portfolio` repository as a second, independent Worker. The static
portfolio in `../public` is untouched and still has no server code.

## Stack, and why

| Layer | Choice | Reason |
|---|---|---|
| Compute | Cloudflare Workers | Already the host for the portfolio, same account, same `wrangler` habit. Free tier covers a long way; no cold starts; no servers to patch. |
| Framework | Hono | Small, typed, edge-native router with a safe `html` template helper, so pages are server-rendered with **zero client JavaScript** and a strict CSP. |
| Database | Cloudflare D1 (SQLite) | Zero egress, migrations in the repo, works identically in tests through the Workers test pool. |
| Payments | Stripe Checkout + Customer Portal + webhooks | Hosted payment pages, so no card data touches this code. Prices are resolved by `lookup_key`, so the catalogue is the source of truth and nothing is pasted into config. |
| Agents | Anthropic SDK, `claude-opus-5`, structured JSON output | Prompts are frozen per agent and cached; outputs are schema-constrained so callers get JSON, not prose. Server-side refusal fallbacks are on. |
| Email | Resend HTTP API | One `fetch`, works from Workers, logs instead of sending when the key is absent. |
| Tests | Vitest + `@cloudflare/vitest-pool-workers` | Integration tests run inside the real Workers runtime against a real D1, so the auth and quota paths are tested end to end, not mocked. |

The alternative considered was Next.js + Supabase + Stripe on Vercel. It is a
fine stack, and the better one if the product ever needs a rich client-side
app. It was not chosen because it introduces a second hosting account, a second
billing line, a build step, and client JavaScript for what is, today, a catalogue,
a dashboard and an API. Everything here can move later; the data model and the
Stripe integration would come along unchanged.

## What is in the box

```
platform/
  wrangler.jsonc          Worker config: D1 binding, two cron triggers, custom domain
  migrations/0001_init.sql
  seed/catalogue.json     what is sold; edit this, then `npm run db:seed`
  scripts/seed-sql.mjs    catalogue.json -> catalogue.sql
  scripts/stripe-sync.mjs catalogue.json -> Stripe products and prices (idempotent)
  src/index.ts            routes and the scheduled handler
  src/agents/registry.ts  the three hosted agents: prompts, models, JSON schemas
  src/agents/run.ts       one Anthropic call with caching, effort and fallbacks
  src/stripe.ts           checkout, portal, webhook -> entitlements
  src/auth.ts             magic links, sessions, API keys (hashes only)
  src/digest.ts           weekly digest and reminder emails (pure, tested)
  src/pages/*.ts          server-rendered HTML, same design tokens as the portfolio
  test/                   37 tests: unit + full HTTP flows against D1
  ROADMAP.md              read by the weekly digest and the Monday check-in agent
```

### Routes

| Method | Path | Who | What |
|---|---|---|---|
| GET | `/` | anyone | catalogue: agents, projects, services |
| GET/POST | `/login`, `/auth/:token`, `/logout` | anyone | magic-link sign-in |
| GET | `/buy/:slug` | signed in | redirects to Stripe Checkout |
| POST | `/billing/portal` | signed in | Stripe Customer Portal |
| POST | `/webhooks/stripe` | Stripe | signature-verified, idempotent |
| GET | `/dashboard` | signed in | subscriptions, agents, API keys, reminders |
| POST | `/api/keys`, `/api/keys/:id/revoke` | signed in | API key lifecycle |
| GET | `/api/agents` | key or session | agents you can call, with quota |
| POST | `/api/agents/:slug/run` | key or session | run an agent: `{"input": "..."}` |
| POST | `/reminders`, `/reminders/:id/done` | signed in | owner/customer reminders |
| GET | `/admin` | owner | MRR, usage, config status, roadmap |

### Entitlement model

`offerings` is the catalogue. An agent offering lists the `agent_slugs` it unlocks
and a `monthly_call_quota`. A `subscriptions` row (Stripe subscription id, or the
Checkout session id for one-off purchases) with an entitled status grants access.
Usage is one `usage_events` row per call; the quota is a count of those rows in the
current UTC month. The Trades AI Suite is simply an offering that lists all three
agents with a bigger quota.

Two things are deliberately not the model's job, carried over from the Meridian
engagement rules: totals (Notes to Invoice returns quantities only) and safety
escalation thresholds (After-Hours Triage is told the rules; it does not decide them).

## Local development

```bash
cd platform
npm install --legacy-peer-deps     # npm 10 has a peer-resolver bug with vitest 4; this sidesteps it
npm run db:migrate:local
npm run db:seed:local
cp .dev.vars.example .dev.vars     # optional; see the file
npm run dev                        # http://localhost:8787
```

Without `RESEND_API_KEY`, the sign-in link prints in the `wrangler dev` terminal.
Open it and you are signed in. Sign in with the `OWNER_EMAIL` from `wrangler.jsonc`
to see `/admin`.

```bash
npm test          # 37 tests inside the Workers runtime
npm run typecheck
```

## Going live

1. **Database.** `npx wrangler d1 create platform-db`, paste the id into
   `wrangler.jsonc`, then `npm run db:migrate && npm run db:seed`.
2. **Secrets.** `npx wrangler secret put STRIPE_SECRET_KEY`, then
   `STRIPE_WEBHOOK_SECRET`, `ANTHROPIC_API_KEY`, `RESEND_API_KEY`.
3. **Stripe.** Set real prices in `seed/catalogue.json`, `npm run db:seed`, then
   `STRIPE_SECRET_KEY=sk_test_... npm run stripe:sync`. Add a webhook endpoint in
   the Stripe dashboard for `https://platform.hossainconsulting.com/webhooks/stripe`
   with events `checkout.session.completed`, `customer.subscription.*`,
   `invoice.paid`; that gives you the webhook secret for step 2. Enable the
   Customer Portal under Settings → Billing.
4. **Email.** Verify `hossainconsulting.com` in Resend so `MAIL_FROM` delivers.
5. **Deploy.** `npm run deploy`. Wrangler creates the `platform.` DNS record.
6. **Prove it.** Sign in as the owner, create an API key, subscribe to Quote
   Triage with a Stripe test card, and run the curl on the dashboard.

Do steps 3 and 6 in Stripe test mode first, then repeat with live keys.

## The reminder and build agent

Two layers, so the reminders keep coming even if one is off:

- **In the Worker.** Cron at 07:00 Sydney emails any reminder due that day
  (added on the dashboard). Cron at 08:00 Monday emails the owner a digest in the
  same five-line shape as the weekly status emails from the engagements: state,
  usage, next (from `ROADMAP.md`), reminders, decisions needed.
- **In Claude Code.** A weekly Routine opens a fresh session on Monday morning,
  reads every repository, summarises what moved, reads `ROADMAP.md`, proposes the
  next build step, and sends a push notification. It only implements an item on
  its own when the roadmap marks it `auto-build: yes`. It can be paused or deleted
  from the Routines list in Claude Code.

## Security posture

No client JavaScript, CSP `script-src 'none'`, HSTS, no framing. Form posts are
checked against the site origin. Sessions are random 256-bit ids in an
`HttpOnly; Secure; SameSite=Lax` cookie. Login tokens and API keys are stored as
SHA-256 hashes only, and login tokens are single-use with a 15-minute life.
Webhooks are signature-verified and replay-safe by event id. Stripe hosts every
payment page. Agent input is capped at 12,000 characters and quota is checked
before the model is called.
