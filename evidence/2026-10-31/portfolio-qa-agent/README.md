# Portfolio Q&A agent: evidence, 31 October 2026

**Request (Hemayet, chat, 31 Oct 2026):** build an agent that answers visitors' questions about his work, in his tone, using only what is actually on the portfolio: projects, stack and experience. Example: a recruiter at 3am asks what he has built with Python and gets a real answer.

**Target:** `hossainconsulting/portfolio`, branch `claude/portfolio-qa-agent-2026-10-31`. Source only. **Not deployed**, no secrets set, no live model calls.

## What changed

| File | Change |
|---|---|
| `scripts/build-knowledge.mjs` | New. Turns `public/index.html`, `public/service-agent-patterns.html` and `public/writing/claude-with-microsoft-365.html` into plain text (links kept, widget markup and scripts dropped). `--check` fails if the output is stale |
| `src/knowledge.js` | New, generated. About 40,000 characters of portfolio text |
| `src/system-prompt.js` | Rewritten for Q&A first: answer only from the `<portfolio>` block, say "isn't on the portfolio" otherwise, keep each item's stated status, Hemayet's voice rules (from brain `resources/profiles/voice-and-style.md`), hand-off via `capture_lead` kept. All sync anchors kept |
| `src/index.js` | Sends the portfolio text as a second system block with `cache_control`; model `claude-opus-5` → `claude-opus-5-5` at `low` effort; server-side refusal fallback (`fallbacks: "default"`); default email aligned with the page |
| `public/widget.js`, `public/index.html` | Greeting invites questions; launcher "Ask about Hemayet's work"; header "Answers from this portfolio" replaces the unverified "Replies within one business day"; fallback email aligned |
| `wrangler.jsonc` | `CONTACT_EMAIL` → `hemayet@hemayethossain.com`, the only address on `public/index.html` |
| `test/chat.test.mjs` | New. 5 offline tests against a local mock of the Anthropic API |
| `test/eval-questions.md` | New. 12 live-eval questions with pass/fail criteria. **Not run** |
| `package.json`, `README.md` | `npm test`, `npm run knowledge`, knowledge check in `npm run check`; README section |

## Validation actually run (sandbox, Node 22)

- `npm run check`: exit 0. Syntax checks pass; `knowledge: src/knowledge.js matches the public pages.`; prompt-sync **skipped** (private `acquisition-system` repo not available here).
- `npm test`: 5 pass, 0 fail. Checks: request uses `claude-opus-5-5`, `fallbacks: "default"` with the beta header, `effort: low`; system has two blocks, the second is `<portfolio>…` with `cache_control`; system blocks are byte-identical across requests; `capture_lead` without a webhook returns "Not delivered"; malformed history gets 400 before any model call; the knowledge holds the disclosure, the no-paid-engagement line, the credential dates and the Python learning-plan line, and no widget/script markup.
- Browser (Playwright/Chromium, `python3 -m http.server` on `public/`, `/api/chat` mocked): widget opens, greeting shows, a question round-trips. Screenshots: `widget-desktop-mock.png` (1280×900; the reply text is a mock, not model output), `widget-mobile-greeting.png` (390×844).
- Privacy: searched `src/knowledge.js` for street-address patterns; none found. No keys or visitor data in this evidence.

## Not done / limitations

- **No live model call.** Answer quality, tone and grounding by the real model are unmeasured until the `test/eval-questions.md` run (costs API credit; needs approval and `ANTHROPIC_API_KEY`).
- Cache hits not verified (needs live `usage.cache_read_input_tokens`).
- Private authored prompt `acquisition-system/agents/Agent_Inbound_CONCIERGE.md` not updated (repo not available here); it now differs from the running prompt and needs the same change.
- Existing launch blockers from the README still stand: rate limiting on `/api/chat`, `LEAD_WEBHOOK_URL` delivery, privacy statement, deployment.
- Email change (`hossainconsulting.com` → `hemayethossain.com` for this recruiter site) is a judgement call for Hemayet to confirm.

## Decisions, 31 Oct 2026 (Hemayet in chat: "1-4 yes")

1. Email change to hemayet@hemayethossain.com: **confirmed**.
2. Paid live eval: **approved**. Not run: no `ANTHROPIC_API_KEY` in the cloud session. `scripts/run-eval.mjs` added so it can run where the key exists.
3. Sync the private `acquisition-system` CONCIERGE prompt: **approved**, but blocked. This session's GitHub access cannot see `hossainconsulting/acquisition-system`.
4. Launch blockers acknowledged. Deployment, rate limiting and webhook setup change live accounts, so each still needs its own explicit go-ahead.
