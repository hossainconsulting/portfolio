# Hub contact address: agency email

Date: 2026-10-15

Change: the hub site (portfolio.hossainconsulting.com) now shows `hemayet@hossainconsulting.com`
instead of the Gmail address in `public/index.html`, `public/widget.js`, the `src/index.js`
default and `CONTACT_EMAIL` in `wrangler.jsonc`.

Not changed: `OWNER_EMAIL` in `platform/wrangler.jsonc` (private notification inbox, not shown to visitors).

Checks: `npm run check` and `git diff --check` run after the edit (prompt-sync skipped, private spec absent).
Not deployed. The Worker needs an explicit `npx wrangler deploy` request before this is live.
The alias forwarding is user-reported, not verified by Claude.
