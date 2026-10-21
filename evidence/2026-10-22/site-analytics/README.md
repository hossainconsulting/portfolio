# Personal portfolio analytics
Date: 22 October 2026, Australia/Sydney.

User requested Google Analytics and Tag Manager across personal and agency sites. Production portfolio inspection found no Google tracking scripts.

Prepared: self-hosted external loader public/site-tracking.js for GA4 G-HS1897RD72 and GTM-PML7PHT5, restricted to portfolio.hossainconsulting.com; included on public HTML pages. No inline script allowance added. CSP permits only specific Google script/collection hosts; privacy notice updated. Query strings/fragments and form values are not intentionally sent by the loader. Existing footer markup retained.

Validation: node --check public/site-tracking.js passed. npm run check passed syntax checks, but prompt-sync explicitly SKIPPED because the private acquisition-system specification is not checked out alongside this repository. git diff --check passed.

Not deployed: Wrangler reports not authenticated. No credentials read or exported. GitHub publication also blocked by automatic review of the companion website push; this branch is retained locally for user review. Live tracking on the portfolio is not claimed.
