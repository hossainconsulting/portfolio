# Recruiter FAQ in place of the paid chat widget, 31 October 2026

**Request:** Hemayet said in chat on 31 Oct 2026: "Yes, you can build [the FAQ] section". This was in reply to Claude's offer of a static "Ask about my work" section, after he ruled out API fees ("I want to use only anthropic subscription per month").

**Target:** `public/index.html` on branch `claude/portfolio-faq-2026-10-31`, based on `main` at `3477308`. Source change only. **Not deployed.**

## What changed

- New section `#ask` "Questions recruiters ask", placed after "For recruiters, agencies and hiring managers". It holds 9 `<details>` questions. The questions recruiters actually ask are: paid experience, certifications, what can be seen now, what is finished, Python, Agentforce/AI, the home lab, roles, and contact.
- Every answer restates text already on the page: certification dates, project statuses, the 7 Sep SunRise record, the home-lab statuses and the AI-assisted note. Nothing new is claimed. Python and Ansible are described as planned.
- No JavaScript and no model call. It costs nothing to run.
- The CONCIERGE chat launcher, panel and `<script src="/widget.js">` are removed from the page. `public/widget.js`, `src/index.js` and its CSS remain in the repo. Parked PR #36 holds the Q&A version if Hemayet ever wants it with API billing.
- The recruiter call-to-action line now links to the FAQ instead of saying the assistant "requires live configuration".
- The credentials section has `id="credentials"` so the FAQ can link to it.

## Validation actually run

- HTML tag-balance check (Python `html.parser`): no unclosed or mismatched tags.
- `npm run check`: syntax checks pass; prompt-sync skipped (private repo unavailable).
- Playwright/Chromium against `python3 -m http.server` on `public/`:
  - 9 questions render;
  - the Python question opens with keyboard focus and Enter;
  - the chat launcher is absent;
  - no page errors.
  - Screenshots: `faq-desktop.png` (1280 wide, section crop, Python open) and `faq-mobile.png` (390×844, first question open).
- Facts cross-checked by hand against the same page and `brain/resources/career/skills-inventory.md`.

## Limitations

- Static answers cover only these questions. Anything else falls back to email.
- When a project's status changes on the page, the matching FAQ answer has to be edited by hand.
- Not deployed. Publishing needs Hemayet's explicit go-ahead and the manual Wrangler release in README.md.
