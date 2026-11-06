# Pause unverified checklist signup

Date: 6 November 2026 (UTC). Owner: Hemayet Hossain. Implementation: OpenAI Codex, review-only.

## Target and starting state

Repository: hossainconsulting/portfolio, separate from the agency/personal Next.js site.
Fresh clone and subsequent `git ls-remote origin refs/heads/main` both confirmed base
`5c2241270d95f63a9b9c682bc8d6cdc9a9b0ca70`. Branch: `codex/pause-unverified-checklist-signup`.
Read AGENTS.md, EVIDENCE.md, README.md, package scripts, Wrangler configuration and
repository delivery skill before changing code. No CODEOWNERS file was found.

The coordinating website review reported a public HTTP 200 checklist form with
email delivery, tips and unsubscribe promises, conflicting with the agency site's
paused signup notice. Source inspection confirmed that `/api/optin` forwarded to
`LEAD_WEBHOOK_URL` and no unsubscribe handler was present. Provider delivery and
suppression were not verified. This task did not submit any live form.

## Changes

- The opt-in endpoint returns 503 for POST before reading or logging the body,
  irrespective of webhook configuration. Other methods retain 405. No feature flag
  or secret can accidentally reopen it; reopening needs a reviewed code change.
- Checklist signup fields and delivery claims are replaced by the existing public
  PDF download. No new system or asset was introduced. Older pages loading the
  updated funnel script have their form replaced without reading/sending data.
- `/thanks` no longer claims subscription or email delivery.
- Privacy/terms narrowly describe paused new signup, future launch prerequisites,
  and contact routes for withdrawing any previous marketing consent. Existing chat,
  booking and analytics disclosures remain. Paid service terms remain unchanged.
- Funnel README corrects its outdated blanket claim that nothing was deployed,
  distinguishes future flow from present containment, and lists reopening gates.
- Added `npm test` with eight focused Node tests using synthetic data and mocks.

The chat handler, lead-delivery function, shared webhook configuration and prompt
were not changed. This does not stop any existing external marketing automation,
remove historical subscribers, establish suppression, or verify provider accounts.
It contains new signup only after an approved release reaches production.

## Actual checks in the cloud container

- Node v24.22.1; npm 11.9.0.
- Initial `npm ci --ignore-scripts --no-audit --no-fund` failed because its default
  cache `/home/agent/.npm` could not be created. Retried with writable cache:
  `npm ci --ignore-scripts --no-audit --no-fund --cache /tmp/portfolio-repair-npm-cache`
  succeeded, exit 0, 44 packages installed. Dependency install scripts were disabled.
- `npm run check`: exit 0. Source/widget syntax passed. Prompt-sync explicitly
  SKIPPED because the private acquisition-system sibling is not present; not a
  passed synchronization check.
- Initial `npm test` was attempted before dependencies were available and failed
  with ERR_MODULE_NOT_FOUND. After successful install, final `npm test`: exit 0,
  eight tests passed, zero failed. See `test-results.txt`.
- Tests cover valid, malformed, oversized and honeypot POST payloads under absent
  and configured secrets; request body remains unread and fetch is never called.
  They cover method rejection, no-store response, existing static binding, direct
  PDF availability, removed form/delivery claims, and the legacy form guard.
- Chat regression uses a mocked SDK tool-use response and mocked webhook: the
  existing chat route still forwards one synthetic widget lead to its configured
  destination and returns the model's closing reply. No real provider was called.
- `node --check public/funnel.js`: exit 0.
- `git diff --check`: exit 0. Reviewed complete task diff; no secrets or customer
  data included.

## Verification limits and release gate

A local static preview server was attempted. Headless Chromium could not render:
its default profile creation failed; with a writable profile it aborted with
`socket() failed: Operation not permitted` and crashpad errors. No screenshots,
responsive/keyboard browser pass, Wrangler integration pass or live release test
is claimed. The DOM compatibility test is a mock, not a browser render.

No `.github/workflows` directory exists. README explicitly documents manual
Wrangler deployment and states a Git push is not a deployment step. Wrangler has
workers.dev and preview URLs disabled. Branch publication/draft PR is review-only;
no merge, deploy, production setting change, external signup, live Anthropic call,
real webhook call or account change was performed. CI status is separate from the
local results above.

Before release: review legal wording, test the actual Worker and static page
routing in an authorised environment, inspect responsive/keyboard rendering, and
obtain Hemayet's written approval for merge/deployment. Before reopening signup:
identify provider and data locations, implement separate marketing consent,
verify delivery and end-to-end unsubscribe/suppression, review abuse controls and
update notices. Do not alter the existing shared chat secret merely to pause signup.
