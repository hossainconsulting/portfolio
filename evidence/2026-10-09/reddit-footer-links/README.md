# Reddit links added to site footers

Date: 9 October 2026 (Australia/Sydney).
Target: hossainconsulting/portfolio and hossainconsulting/home-services-ai, branch claude/add-reddit-footer-links-ov8bgh. Source edits only; no deployment.

## Requirement

Hemayet reported two Reddit accounts, shown in the Reddit app account switcher: personal u/hemayetAI and agency u/hossainconsulting. Add both to site footers, labelled accordingly.

## Change

- Footers now link "Reddit (agency)" (https://www.reddit.com/user/hossainconsulting/) and "Reddit (personal)" (https://www.reddit.com/user/hemayetAI/): public/index.html, 404.html, study/index.html, writing/claude-with-microsoft-365.html, service-agent-patterns.html, and platform/src/pages/layout.ts.
- public/links.html: both profiles listed; the commented-out agency placeholder was replaced.
- presence/profiles.md: agency row changed from CLAIM to CONFIRM, personal row added.
- home-services-ai README.md "Connect" footer: both links added.
- Other six repositories have no website footer or README Connect section; unchanged.

## Validation

- git diff --check: no whitespace errors.
- npm run check (portfolio): syntax checks passed; prompt-sync skipped (private spec absent).
- NOT run: platform tests/typecheck (platform dependencies not installed), rendered-page browser check, live URL check. Profile URLs were not fetched; account existence is taken from Hemayet's screenshot only (hemayetAI shows Account Age 2m, 0 contributions).

## Limitations

Not deployed; changes are not live until a manual Wrangler release. JSON-LD sameAs was not changed.
