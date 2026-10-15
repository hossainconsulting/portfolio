# Hub contact address: agency email

Date: 2026-10-15

Change: the hub site (portfolio.hossainconsulting.com) now shows `hemayet@hossainconsulting.com`
instead of the Gmail address in `public/index.html`, `public/widget.js`, the `src/index.js`
default and `CONTACT_EMAIL` in `wrangler.jsonc`.


Checks: `npm run check` and `git diff --check` run after the edit (prompt-sync skipped, private spec absent).
Not deployed. The Worker needs an explicit `npx wrangler deploy` request before this is live.
The alias forwarding is user-reported, not verified by Claude.

## Addendum: legal pages (2026-10-15)

Privacy and Terms bumped to version 2026-10-15 (and `data-consent` on the checklist form to match, so recorded consent names the current wording). Privacy gained a Payments section and a pointer to the agency notice; Terms section 5 no longer calls all prices indicative. `npm run check` and `git diff --check` re-run. Not legally reviewed; not deployed.

## Addendum: platform owner email (2026-10-15)

`OWNER_EMAIL` in `platform/wrangler.jsonc` also changed to `hemayet@hossainconsulting.com` at Hemayet's request. It is the owner sign-in identity, digest recipient and landing-page contact. Platform tests not run (dependencies not installed here). If the platform is already deployed with an owner account under the Gmail address, that account would need migrating before deploy; not checked.
