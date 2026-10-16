# Prepare portfolio consistency fixes

Date: 16 October 2026, Australia/Sydney.
Target: portfolio.hossainconsulting.com, static assets served by the existing Cloudflare Worker.
Starting main: 91739c50b29e9570a18325edb60413bd591e7eda. Branch: codex/website-conflicts-20261016.

Hemayet requested fixes prepared for review and confirmed Claude was idle. Claude's public PR #31 handover confirms it has finished editing both website repositories. Existing checkouts and other branches were preserved. No merge, production deployment, account change or message was performed.

## Changes

- Align the homepage, link hub, page/share metadata and preview card with Salesforce Administrator/CRM support candidate positioning and a longer-term FDE goal. Remove the unsupported current Solutions Engineer jobTitle from structured data. Agency structured data now describes the developing practice, preparation for launch and NSW-only scope, matching the agency site.
- Recruitment contact on the portfolio now uses the personal branded email. Agency enquiries remain directed to the agency website. No mailbox configuration changed.
- Replace direct private SunRise repository/evidence anchors in the homepage and link hub with a stable `#sunrise` status section and personal-email evidence request. Keep the canonical current repository name in explanatory text without an inaccessible public link. Preserve the 7 September progress record as explicitly historical; do not invent an updated implementation result.
- Add existing portfolio privacy/terms pages to the homepage footer and align the portfolio terms' paid-service paragraph with the agency's prelaunch/payment/legal-review gate. The notice files and canonical SunRise source already existed on current main but were absent from the older live site during the audit; this patch does not recreate them or change routing.
- Regenerate `public/og.png` from the edited `presence/assets/og.html` using isolated headless Edge at 1200x630. Visually reviewed: candidate copy fits and the four credential badges remain.
- Correct `#cx-panel[hidden]` styling. Browser checks demonstrated that existing `display:flex` overrode the hidden state and covered page content before a visitor opened the assistant. The explicit hidden rule restores the existing open/close behaviour; no chat/backend configuration or model calls changed.

## Actual validation

- Locked dependencies installed with `npm ci --ignore-scripts --no-audit --no-fund`. Initial certificate-chain error resolved by retrying with `NODE_OPTIONS=--use-system-ca` (Windows trust store); verification was not disabled. Lockfile unchanged.
- `npm run check`: JavaScript syntax checks passed. Prompt-sync explicitly skipped because its private sibling specification is unavailable; not a validated prompt-sync result.
- Ran Wrangler locally on port 8793, without model/webhook secrets. Static `/`, `/links`, `/privacy`, `/terms` all returned 200; unknown route returned 404. Existing notice clean URLs work locally without a route change. Results: `local-routes.json`. Wrangler emitted a certificate warning fetching optional Request.cf metadata and used a placeholder; local static responses worked.
- Parsed changed HTML and JSON-LD; checked canonical candidate wording, absence of private SunRise anchors, personal contact, historical-date wording, notice anchors and prelaunch terms. Results: `content-checks.json`.
- Playwright with isolated headless Edge at 390x844 and 1280x844: document width equals viewport, hidden panel computes to `display:none`, open/close works without submitting messages. Screenshots: `portfolio-390.png`, `portfolio-1280.png`; results: `browser-checks.json`. Reproduction helper: `verify-browser.cjs` (requires Playwright installed externally or provided through PLAYWRIGHT_MODULE; no added runtime dependency).
- `git diff --check`: passed. Diff/evidence/screenshots reviewed for secrets, private notes, customer data and unrelated content before staging.

## Review/release boundaries

Companion changes are in `hossainconsulting/hossainconsulting-portfolio`, branch `codex/website-conflicts-20261016`. Review and release together because the personal site will use the new SunRise fragment. The current main already contains other unpublished work; a later release must review that full release difference, including existing legal/collection/assistant source, rather than assume this copy-only patch approves all of it.

Live production still serves older content until an approved deployment. Notice publication, email delivery, booking completion, model calls, lead delivery, sign-ups, payments and professional legal review were not verified or activated. The separate shared booking account may still contain old summary wording noted in the existing funnel README; no account setting change is authorised by this source patch. A separate catalogue advisory product mentioned in the handover remains Hemayet's decision and was not changed.
