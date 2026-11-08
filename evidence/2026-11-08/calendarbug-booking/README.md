# Portfolio booking uses the agency CalendarBug event

Date/time and timezone: 8 November 2026, 01:22 UTC
Requirement or issue: Make the portfolio booking page use the same CalendarBug event as the agency website, and update portfolio copy that says the booking opens Calendly.
Environment/target: Repository `hossainconsulting/portfolio`, branch `cursor/calendarbug-booking-8ecf`, based on `main` at `737c1a5`. Local static preview with Python `http.server` on `127.0.0.1:8765`. Headless Chrome 156.0.8078.47. This is source and local-preview evidence. It is not a deployment to https://portfolio.hossainconsulting.com.

Starting state: `public/book.html` linked "Pick a time" to `https://calendly.com/hemayet_hossain/20-minute-intro-call` and the line under the button said "Opens my calendar on Calendly." `public/privacy.html` (version 2026-10-15) named Calendly as the booking provider. Checklist, thanks and audit-score "book a call" links already pointed at `/book`, not at Calendly. No local `wrangler` binary was installed.

Changes made:

- `public/book.html` now opens `https://www.calendarbug.com/book/hemayet-hossain/free-introductory-call`. The line under the button says "Opens my calendar on CalendarBug." The page is still a free 20-minute introductory conversation. No phone number or street address was added.
- `public/privacy.html` now names CalendarBug for booking notes and as the booking provider. The version date is 2026-11-08, because that page says the version date changes when the policy changes. `public/terms.html` and `public/unsubscribe.html` do not mention Calendly and were not edited.
- Funnel notes, the three email-sequence drafts, the desktop task list, and the Google Business Profile and LinkedIn presence notes that named Calendly as the booking destination now name this same CalendarBug event. Checklist and footer "book a call" links stay on `/book`.
- Dated evidence from 14 October 2026 was left as a historical record. The 15 October 2026 Calendly description task in `funnels/desktop-tasks.md` is marked historical. No new CalendarBug event was created.

Validation procedure/command:

1. Served `public/` with `python3 -m http.server 8765 --bind 127.0.0.1 --directory public`.
2. Read `http://127.0.0.1:8765/book.html`. It contained the CalendarBug URL and "Opens my calendar on CalendarBug." It did not contain "calendly". Exit status 0.
3. Requested these local paths. Each returned HTTP 200: `/book.html`, `/funnel.css`, `/site-tracking.js`, `/checklist.html`, `/privacy.html`, `/terms.html`, `/unsubscribe.html`, `/thanks.html`, `/`.
4. Read `privacy.html`. It contained "Version 2026-11-08", "notes you type into CalendarBug" and "CalendarBug (bookings)", and did not contain "Calendly". `checklist.html` still linked to `/book?utm_source=site&utm_medium=nav` and did not contain "calendly".
5. `git diff --check` before this evidence file. Exit status 0.
6. `node --check src/index.js && node --check public/widget.js && node scripts/check-prompt-sync.mjs` (the `npm run check` script). Exit status 0. JavaScript syntax checks passed. Output: `prompt-sync: skipped — no spec at /agent/repos/acquisition-system/agents/Agent_Inbound_CONCIERGE.md`.
7. `curl -sSI --max-time 20 https://www.calendarbug.com/book/hemayet-hossain/free-introductory-call` returned HTTP 200, `server: Vercel`, `content-length: 5143`, `date: Sun, 08 Nov 2026 01:19:13 GMT`.
8. Headless Chrome screenshots of the local booking page at 1280×1400 and 390×2400, saved here as `book-desktop.png` and `book-mobile.png`. Both show "Pick a time" and "Opens my calendar on CalendarBug." The mobile capture includes the footer.
9. Headless Chrome screenshot of the CalendarBug URL (`--headless=new --virtual-time-budget=20000`, window 1100×1600), saved as `calendarbug-event.png`. Visible text: "Free introductory call", "with Hossain Consulting", "20 minutes", location "Discovery Call", and the description beginning "A free introductory call about published website, marketing, CRM and workflow packages for your business. This is not a paid service booking". A "Your timezone" control was visible. Chrome was then stopped by the 40-second `timeout` (exit 124) after the file had been written. No time slot was selected and no booking was submitted.
10. The agency homepage HTML at https://hossainconsulting.com/ contained the same CalendarBug URL on "Book a free 20-min call". The personal site's CalendarBug event was not used.

Observed result and exit status: The local booking page and the privacy page no longer name Calendly. The button destination is the existing agency CalendarBug event. Checks in steps 2–6 exited 0. The CalendarBug HTTP check returned 200. Screenshot commands were stopped by `timeout` with exit 124 after writing the image files.

Supporting files:

- `book-desktop.png`
- `book-mobile.png`
- `calendarbug-event.png`

Limitations / checks not run:

- No booking was submitted, so a confirmation email and a reminder were not observed for this event. The page still says those messages are sent, which was the previous Calendly sentence with the product name changed. CalendarBug's public page shows a timezone control. Whether email notifications are turned on for this event was not checked inside a CalendarBug account.
- `curl` of https://portfolio.hossainconsulting.com/book returned HTTP 403 from this environment, so the deployed page was not re-read here. This change is not deployed. `npx wrangler deploy` was not run. No local Wrangler binary was installed, so `/book` was checked as `/book.html` on Python's static server. Python does not apply Cloudflare routing or `public/_headers`.
- `prompt-sync` was skipped because the private authored prompt source was not in this environment.
- Terms and unsubscribe pages were not changed. Historical evidence files were not rewritten.

Related issue/PR: Pull request for branch `cursor/calendarbug-booking-8ecf`. Not merged.
