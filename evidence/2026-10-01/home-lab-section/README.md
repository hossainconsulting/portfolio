# Add Home lab section
Date/time and timezone: 2026-10-01 (UTC)
Requirement or issue: Hemayet approved a public Home lab section on portfolio.hossainconsulting.com with one card per VM.
Environment/target: public/index.html in hossainconsulting/portfolio, branch claude/home-lab-section.
Starting state: Page had Projects, AI engineering and credentials sections; no home lab.
Changes made: New `#home-lab` section after AI engineering with an intro and six cards (salesforce-dev, paperclip-dev, agency-dev, rhce-dev, fde-dev, oscp-dev), reusing the existing `.proj` and `.status` styles. No new CSS, scripts or images, so the Content-Security-Policy is unchanged.
Content sources: hossainconsulting/vm-lab evidence (24 Sep baselines, 28 Sep role names and Fedora install, 29 Sep agent runtime test, production readiness audit and deploy-key verification) and brain resources/career/skills-inventory.md. vm-lab is private, so the page states the records are private and available on request rather than linking to them. No IP addresses, ports, UUIDs or key fingerprints are published.
Validation procedure/command:
- HTML tag-balance check with Python html.parser: balanced.
- Served public/ with `python3 -m http.server` and loaded it in Chromium (Playwright) at 1280px light and 390px dark: 6 cards rendered, no horizontal scroll. Screenshots: homelab-desktop.png, homelab-mobile.png.
Observed result and exit status: All checks passed (exit 0).
Limitations / checks not run: Python's server does not apply `_headers`; the CSP was not exercised. Not deployed from this branch at time of writing (see PR).
Related issue/PR: see PR for branch claude/home-lab-section.
