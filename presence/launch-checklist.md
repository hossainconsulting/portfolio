# Launch checklist — the first 30 days

In order. Each line is one sitting. Tick as you go and commit the ticks.

## Week 1 — claim, fix the foundations

- [ ] Paste the real personal LinkedIn URL and Trailblazer URL into `profiles.md`. Set the LinkedIn custom URL to `hossainconsulting` (or `hemayethossain`).
- [ ] Register `hossainconsulting` on: X, YouTube, TikTok, Facebook Page, Reddit, Pinterest, Threads (auto via Instagram), Bluesky. Bio = brand kit. Link = `/links` with UTM. Photo = the headshot. Nothing else yet.
- [ ] Update `profiles.md` statuses from CLAIM to VERIFIED with the final URLs.
- [ ] Update the `sameAs` array in `public/index.html` and the buttons in `public/links.html` to match. Run `/presence-check`.
- [ ] Cloudflare: **Always Use HTTPS** on. Apex and `www.` 301 to `portfolio.` (see `../README.md`).
- [ ] `npx wrangler deploy`. Verify with the commands in `../README.md`. Ping IndexNow (`seo.md` §5).
- [ ] Google Search Console: domain property, DNS TXT, submit sitemap, request indexing.
- [ ] Bing Webmaster Tools: import from Search Console.
- [ ] Cloudflare Web Analytics on for the zone.

## Week 2 — the profiles that decide

- [ ] LinkedIn personal: run `linkedin-profile-audit.md`. Headline, About, Experience (XYZ formula, 3 bullets per role), Skills (top 3 pinned: Salesforce Administration, Salesforce Implementation, Agentforce), Featured (hub, best repo, a certification), Licenses & certifications (all four, with Trailblazer credential URLs), Contact info websites (hub, GitHub, company site), Open to work (recruiters only).
- [ ] LinkedIn company page: logo, banner, tagline = positioning sentence, website = company site, specialties = keyword list, first post = the hub.
- [ ] GitHub: profile README from `github-profile-README.md` (create the `hossainconsulting/hossainconsulting` repo), bio, location, website, social accounts (LinkedIn, X, Instagram, YouTube). Pin the six strongest repos.
- [ ] Trailblazer profile: public, certifications shown, about = LinkedIn About first paragraph, link to hub.
- [ ] Google Business Profile: claim, service-area business, verify, fill every field, add services from the keyword list, add 5 photos (headshot, logo, 3 diagram images), first update post, link social profiles.
- [ ] Bing Places: import from GBP.

## Week 3 — content foundations

- [ ] Banner and avatar produced from `assets/og.html` at every size in `brand-kit.md`. Upload everywhere.
- [ ] YouTube: channel art, description, verified website link, channel trailer = 60-second version of "what this portfolio is".
- [ ] First long-form piece from the backlog (`content-engine.md`), published on LinkedIn as an article and cut nine ways per the pipeline.
- [ ] Reddit: join r/salesforce, r/SalesforceDeveloper, r/sysadmin, r/smallbusiness, r/AusFinance-adjacent trades subs. Answer only, for 90 days.
- [ ] Facebook: join three Sydney trades / small-business groups. Answer only.
- [ ] Pinterest: 3 boards (Salesforce diagrams, Implementation checklists, Agentforce patterns). 8 pins from the first carousel.

## Week 4 — rhythm

- [ ] Run the weekly cadence in `content-engine.md` once, fully, and note what took longer than budgeted.
- [ ] First `/presence-calendar` from real repo activity.
- [ ] Test OG previews on LinkedIn Post Inspector, Facebook Debugger, X Card Validator.
- [ ] Validate JSON-LD on validator.schema.org and Rich Results Test.
- [ ] Directory listings once: ABN lookup details match GBP; Yellow Pages AU; True Local; Hotfrog; Clutch.
- [ ] Set a calendar reminder for the monthly review (`measurement.md`).

## After 30 days

- [ ] First monthly review. Create `presence/reviews/2026-10.md`.
- [ ] Decide whether Medium / dev.to canonical reposts are worth it (only if LinkedIn articles get search impressions).
- [ ] Apple Business Connect if GBP is producing anything.
