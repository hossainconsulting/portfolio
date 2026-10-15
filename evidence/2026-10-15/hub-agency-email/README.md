# Hub contact address: agency email

Date: 2026-10-15

Change: the hub site (portfolio.hossainconsulting.com) now shows `hemayet@hossainconsulting.com`
instead of the Gmail address in `public/index.html`, `public/widget.js`, the `src/index.js`
default and `CONTACT_EMAIL` in `wrangler.jsonc`.

Not changed: `OWNER_EMAIL` in `platform/wrangler.jsonc` (private notification inbox, not shown to visitors).

Checks: `npm run check` and `git diff --check` run after the edit (prompt-sync skipped, private spec absent).
Not deployed. The Worker needs an explicit `npx wrangler deploy` request before this is live.
The alias forwarding is user-reported, not verified by Claude.

## Addendum: legal pages (2026-10-15)

Privacy and Terms bumped to version 2026-10-15 (and `data-consent` on the checklist form to match, so recorded consent names the current wording). Privacy gained a Payments section and a pointer to the agency notice; Terms section 5 no longer calls all prices indicative. `npm run check` and `git diff --check` re-run. Not legally reviewed; not deployed.
