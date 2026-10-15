# Tasks that need a computer

Saved 2026-10-15 at Hemayet's request, so they are not lost when working from a phone. Tick each one when done and note the date. None of these can be done by Claude: they need your accounts.

- [ ] **Gmail "Send mail as":** add `hemayet@hossainconsulting.com` and `hemayet@hemayethossain.com` (Settings > See all settings > Accounts and Import). Test each with a message to another account.
- [ ] **Choose the email platform** (Brevo suggested) and add `hossainconsulting.com` as a sender domain.
- [ ] **Cloudflare DNS for `hossainconsulting.com`:** add the platform's DKIM and verification records (CNAMEs set to "DNS only"), merge the platform into the single existing SPF record, add `_dmarc` with `p=none`. If you use Google Workspace, also turn on Google's DKIM.
- [ ] **Check authentication:** send a test and use "Show original" in Gmail; SPF, DKIM and DMARC should all show PASS.
- [ ] **Set the lead webhook:** `npx wrangler secret put LEAD_WEBHOOK_URL` using the platform's webhook URL.
- [ ] **Calendly:** edit the "20-minute intro call" description. Remove the free workflow snapshot and "+GST". Say "including GST" for any price mention.
- [ ] **Agency site `/services`** (repo `hossainconsulting-portfolio`): remove the free "one agreed small fix" and align the privacy page with this funnel.
- [ ] **Cloudflare rate limit:** add a rule on `/api/optin` before sending traffic.
- [ ] **Legal review:** send the Privacy Policy and Terms (and the payments terms when drafted) to a lawyer. Name the email provider and payment provider in the Privacy Policy.
- [ ] **Deploy:** `npx wrangler deploy`, then test with your own email: form, email arrives, PDF link, unsubscribe, `/book`, `/thanks`.
- [ ] **Decide the hub files** that still show the Gmail address (`wrangler.jsonc`, `platform/wrangler.jsonc`, `src/index.js`, `public/widget.js`, `public/index.html`).

Reference: `funnels/README.md` (setup and contact addresses) and `funnels/client-tools-and-payments-policy.md`.
