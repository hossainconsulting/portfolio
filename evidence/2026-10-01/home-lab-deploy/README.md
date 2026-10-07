# Deploy Home lab section
Date/time and timezone: 2026-10-01 (UTC)
Requirement or issue: Publish the Home lab section merged in PR #19 to https://portfolio.hossainconsulting.com.
Environment/target: Cloudflare Worker `portfolio` (static assets), deployed by Hemayet from HEMAYET-LAPTOP using a fresh clone of main at C:\Users\himu_\Documents\portfolio.
Starting state: PR #19 merged into main; site still served the previous version. Claude's cloud session had no Cloudflare credentials, so Hemayet ran the deploy with Claude guiding.
Steps (run by Hemayet):
1. `git clone https://github.com/hossainconsulting/portfolio.git`; `Select-String -Path public\index.html -Pattern 'id="home-lab"'` matched line 402.
2. `npx wrangler login` (first attempt's localhost callback was refused because the login process had already exited; the second attempt succeeded: "Successfully logged in").
3. `npx wrangler deploy` (wrangler 4.145.0) from the repository root.
Observed result:
- "Read 3 files from the assets directory ... public"; "Found 2 new or modified static assets to upload" (/404.html, /index.html); "Success! Uploaded 2 files".
- "Uploaded portfolio"; "No targets deployed for portfolio" (expected: no routes in wrangler.jsonc, workers_dev false; the custom domain is attached outside this config).
- Current Version ID: 1d4c6baf-673e-45cc-9a3d-a3fb645e1fc4
- Hemayet opened https://portfolio.hossainconsulting.com/#home-lab with a hard refresh and confirmed the Home lab heading and six cards are live.
Validation note: Live confirmation is Hemayet's visual check; the cloud session cannot reach the domain (egress proxy 403). `npx wrangler whoami` was not run; the custom domain serving the new section is the evidence that the correct account was used.
Correction: evidence/2026-10-01/home-lab-section/README.md said the section was not deployed at the time of writing; this record supersedes that status.
Limitations / checks not run: No screenshot of the live page captured; response headers (CSP/HSTS) on the live domain were not rechecked.
Related issue/PR: https://github.com/hossainconsulting/portfolio/pull/19
