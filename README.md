# Hossain Consulting Portfolio

Hemayet Hossain’s Salesforce + AI Solutions Engineering portfolio,
building toward Forward Deployed Engineering.

The portfolio presents self-directed projects across Salesforce,
automation, AI and integrations. Project pages distinguish work in
progress from queued work.

**Live portfolio:** https://portfolio.hossainconsulting.com
**GitHub:** https://github.com/hossainconsulting

## Technology and structure

Static HTML and CSS served through Cloudflare Workers static assets, with
a Worker endpoint for the proposed CONCIERGE widget. There is no frontend
build step; the Worker uses the Anthropic SDK.

- `public/index.html` — portfolio homepage.
- [public/service-agent-patterns.html](public/service-agent-patterns.html) — service-agent pattern library, linked from the Meridian Appliance Care card at `/service-agent-patterns`; live routing awaits release verification.
- `public/404.html` — custom page for unknown paths.
- `public/_headers` — static asset response headers.
- `wrangler.jsonc` — Worker and static asset configuration.

The Worker is named `portfolio`. Its asset directory is `public/`,
with `not_found_handling` set to `404-page`. The configuration disables
workers.dev and preview URLs.

## CONCIERGE widget (draft)

This branch adds `public/widget.js`, widget markup in `public/index.html`, and a Worker in `src/index.js` serving static assets and `POST /api/chat`. The system prompt is in `src/system-prompt.js`. This describes proposed source functionality, not a verified live release.

The browser sends conversation history to the Worker. The Worker checks message roles, content types, message and conversation size, and turn count before calling Anthropic. The API key is supplied as a Worker secret, rather than embedded in browser code. The `capture_lead` tool sends the structured lead and transcript to `LEAD_WEBHOOK_URL`; delivery failures are reported to the assistant for an email fallback. Lead details are also logged by the Worker.

### Configuration and launch requirements

- `ANTHROPIC_API_KEY`: Worker secret required for model calls.
- `LEAD_WEBHOOK_URL`: Worker secret for lead delivery; configure and verify delivery before promising a reply.
- `CONTACT_EMAIL`: public configuration in `wrangler.jsonc`.
- `CONTACT_PHONE`: optional Worker secret; supplying it allows the assistant to share that number publicly.
- Rate-limit `/api/chat` before public traffic. Request-size limits do not limit request frequency.
- Publish and link a privacy statement describing lead and transcript handling before launch.

These requirements were not verified during the 7 October 2026 conflict resolution. The PR remains draft. No secrets were configured and no deployment ran.

### Local widget checks

```bash
npm install
npm run check
npm run dev
```

Use a gitignored `.dev.vars` for local secrets. Never commit real keys or webhook credentials. Python's static preview below cannot exercise `/api/chat`.

`npm run check` checks JavaScript syntax and compares the runtime prompt with the private `acquisition-system/agents/Agent_Inbound_CONCIERGE.md` source when that sibling repository is available; otherwise that comparison is skipped. It does not prove live model compatibility, browser behaviour or webhook delivery. The initial PR describes historical mock checks; those were not independently replayed for this documentation resolution. A live conversation and lead-delivery check remain launch prerequisites.

## Local preview

From the repository root:

```bash
python3 -m http.server 8000 --bind 127.0.0.1 --directory public
```

Open http://localhost:8000. Stop the server with Ctrl+C.

This previews page content. Python’s server does not apply Cloudflare’s
`_headers` file or reproduce its routing configuration.

## Deployment

The established release process is manual using Wrangler.
A Git push is not a deployment step in this workflow.

Prerequisites: Node.js, npm and access to the Cloudflare account
hosting the `portfolio` Worker.

From the repository root:

```bash
npx wrangler login
npx wrangler whoami
npx wrangler deploy
```

Login is needed when the machine is not already authenticated.
Check the account before deploying.

The positioning update from PR #14 was manually deployed on
15 September 2026 and verified in a browser on the public domain.

## Domain observations

Checked on 16 September 2026:

| Address | Observed response |
| --- | --- |
| http://portfolio.hossainconsulting.com/ | 301 redirect to the HTTPS portfolio address |
| https://hossainconsulting.com/ | 200 response with a Vercel server header; no redirect in that response |

These observations replace the outdated 19 August notes about HTTP
being served without a redirect and the apex domain returning 403.

The portfolio address is https://portfolio.hossainconsulting.com.
The apex domain currently responds separately. Its hosting and
configuration are outside this repository.

Response checks do not establish which dashboard setting implements
a redirect. Recheck behaviour before changing domain configuration.

## Release verification

Open the public portfolio and confirm the expected content after a
hard refresh.

From the repository root, compare the deployed homepage with the
local file:

```bash
curl -fsS --max-time 20 https://portfolio.hossainconsulting.com/ -o /tmp/hossain-portfolio-live.html &&
diff - /tmp/hossain-portfolio-live.html < public/index.html
```

No diff output means the files match.

Check the custom 404 response; expect status 404 and a nonempty body:

```bash
curl -sS --max-time 20 -o /dev/null \
  -w '%{http_code} %{size_download} bytes\n' \
  https://portfolio.hossainconsulting.com/no-such-page
```

Inspect deployed response headers against `public/_headers`:

```bash
curl -sSI --max-time 20 https://portfolio.hossainconsulting.com/
```

Check domain responses:

```bash
curl -sSI --max-time 20 http://portfolio.hossainconsulting.com/
curl -sSI --max-time 20 https://hossainconsulting.com/
```

## AI-assisted project method

The [AI-assisted project workflow](docs/ai-assisted-project-workflow.md) maps learning, research, writing and evaluation prompts to existing repositories. Its examples are planning aids; project completion requires linked evidence.

## Simulation disclosure

The Salesforce projects presented here are simulations, not client work.
SunRise Solar Solutions, Meridian Field Services, TradeLink Group,
Meridian Appliance Care, Coastline Retail Group, Ironbark Industrial
Supply and Kurrajong Energy are fictional companies.

Home Services AI is a self-directed AI engineering project.
In-progress and queued work must not be presented as completed delivery.

No real customer data is used in these portfolio simulations.

## Verified Salesforce credentials

Hemayet Hossain holds four credentials verified through Salesforce's public credential record: Salesforce Certified Agentforce Specialist, Salesforce Certified Platform Administrator II, Salesforce Certified Platform App Builder, and Salesforce Certified Platform Administrator.

[View the public Salesforce credential record](https://trailhead.salesforce.com/en/credentials/certification-detail-print/?searchString=/EMytG9drkgo/H4/0tgVITa/sw2U8vhbkvkc3jqlaJgauY5cCr+PvNo4YAw1Ki9f) · [Review the Salesforce User Lifecycle SOP](https://github.com/hossainconsulting/salesforce-user-lifecycle-sop)


## AI contributor credit

**OpenAI Codex** is credited as an AI-assisted contributor (Chief of Engineer) for authorised
repository work under Hemayet Hossain's direction. This includes assistance
with documentation and repository maintenance; implementation or validation
contributions are recorded in the relevant commits and task evidence.

**Anthropic Claude Code** is also credited as an AI-assisted contributor (Chief of Staff) for
authorised repository work under Hemayet Hossain's direction, including coding,
writing and documentation. Commits it co-authored carry a
`Co-Authored-By: Claude` trailer.

Hemayet Hossain remains the project owner and decision-maker. These credits do
not represent separate GitHub accounts or collaborator invitations, and do
not change existing authorship, licensing or project completion claims.
