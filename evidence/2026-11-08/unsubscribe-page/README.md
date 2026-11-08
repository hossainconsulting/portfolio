# Unsubscribe page

Date/time and timezone: 8 November 2026, 00:03 UTC
Requirement or issue: Add a working `/unsubscribe` page and an Unsubscribe footer link so outreach compliance is not blocked by the current 404. The page must match the existing privacy and terms pattern, use mailto links only, and offer both the recruitment and agency addresses.
Environment/target: Repository `hossainconsulting/portfolio`, branch `cursor/unsubscribe-page-af1e`. Local Worker preview with Wrangler 4.129.0 at `http://127.0.0.1:8793`. Headless Chrome 156.0.8078.47. This is source and local routing evidence. It is not a deployment to https://portfolio.hossainconsulting.com.

Starting state: `public/privacy.html` and `public/terms.html` are served at `/privacy` and `/terms` by Cloudflare Workers static assets, with no extra route. The homepage footer listed Privacy and Terms only. There was no `public/unsubscribe.html`.

Changes made:

- Added `public/unsubscribe.html` in the same chrome as the privacy and terms pages (`funnel.css`, the same nav, and `site-tracking.js`).
- Added an Unsubscribe link beside Privacy and Terms in the footers of the homepage, privacy, terms, unsubscribe, thanks, audit-score, book and checklist pages.
- Added `/unsubscribe` to the funnel path table in `funnels/README.md`.
- No Worker route, `wrangler.jsonc` change, form, phone number, or street address was added. Policy body text on the privacy and terms pages was left as it was.

Mailto targets, both with subject `Unsubscribe request` and body:

```
Please unsubscribe this email address from marketing messages.

Email address to remove:
```

- Recruitment / personal: `hemayet@hemayethossain.com`
- Agency / Hossain Consulting: `hemayet@hossainconsulting.com`

Validation procedure/command:

1. Decoded every `mailto:` href in `public/unsubscribe.html` with Python `urllib.parse`. Exit status 0. Four links, two per address. Subject was `Unsubscribe request`. Body contained `Email address to remove:`. No `<form>` element.
2. `git diff --check` before this evidence file. Exit status 0.
3. `npm run check`. Exit status 0. JavaScript syntax checks passed. `prompt-sync: skipped — no spec at /acquisition-system/agents/Agent_Inbound_CONCIERGE.md`.
4. `npx wrangler dev --local --port 8793 --ip 127.0.0.1`. Ready on `http://127.0.0.1:8793`. First responses, redirects not followed:

| Path | Status |
| --- | --- |
| `/` | 200, footer contains `/unsubscribe` |
| `/privacy` | 200, footer contains `/unsubscribe` |
| `/privacy.html` | 307 to `/privacy` |
| `/terms` | 200, footer contains `/unsubscribe` |
| `/terms.html` | 307 to `/terms` |
| `/unsubscribe` | 200, 3217 bytes |
| `/unsubscribe.html` | 307 to `/unsubscribe` |
| `/unsubscribe/` | 307 to `/unsubscribe` |
| `/book`, `/checklist`, `/thanks`, `/audit-score` | 200, each footer contains `/unsubscribe` |
| `/no-such-page` | 404 |

5. Headless Chrome opened the local preview, tabbed through the links, clicked Privacy, Terms, the unsubscribe footer, and the homepage footer link, and clicked the recruitment mailto button. Result file: `browser-check.json`. Exit of that script: 0 (`BROWSER_CHECK_OK`).

Observed result:

- `/unsubscribe` is served the same way as `/privacy` and `/terms`: clean URL 200, `.html` and trailing slash 307 back to the clean URL.
- The page has no form. Visible copy states that nothing is submitted on this website, that requests are honoured within 5 working days, and that no other personal information, login, account, or fee is required.
- Keyboard tab reached the brand link, both mailto buttons, both plain address links, Privacy, Terms, and the footer links.
- Clicking the recruitment mailto issued a browser request to `mailto:hemayet@hemayethossain.com?subject=Unsubscribe%20request&body=...` and left the page at `/unsubscribe`. No request was sent to the site origin.
- Desktop and 390px mobile layouts had no horizontal overflow. Screenshots: `unsubscribe-desktop.png`, `unsubscribe-mobile.png`, `homepage-footer-clip.png`, `privacy-footer-clip.png`, `terms-footer-clip.png`.

Supporting files: the screenshots and `browser-check.json` in this directory.

Limitations / checks not run:

- No mail application is installed here, so the composed message was not sent and no inbox was checked.
- `npm run check` does not exercise the page. Prompt-source comparison was skipped because the private spec is not in this environment.
- A direct request from this environment to `https://portfolio.hossainconsulting.com/unsubscribe` and `/privacy` returned HTTP 403 with `cf-mitigated: challenge`. That does not confirm the previously reported live 404, and it does not show the new page on the public site. This change was not deployed. `npx wrangler deploy` was not run.
- Live homepage comparison against production was not run, because this commit is not published.

Related issue/PR: pull request for branch `cursor/unsubscribe-page-af1e`.
