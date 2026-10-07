---
name: presence-check
description: Verify the omnichannel presence is live and consistent - every URL in presence/profiles.md resolves, the JSON-LD sameAs in public/index.html and the buttons in public/links.html match profiles.md, the Connect footer is identical across the eight project repositories, sitemap and robots are valid, and bios match the brand kit. Reports drift as a checklist. Use when the user says "check my links", "is everything consistent", "presence check", after editing profiles.md, or as step 4 of the monthly review.
---

# presence-check

Drift detector. Read-only unless the user asks for fixes.

## Procedure

1. **Source of truth.** Parse every URL and its status from
   `presence/profiles.md`. Also read the canonical handle, name, hub and
   location strings.

2. **Liveness.** Run `presence/scripts/check-links.sh`. In a sandbox where
   egress is blocked the script reports `000`/`ERR`; say so plainly and fall
   back to `WebFetch`/`WebSearch` for each URL. A VERIFIED URL that does not
   resolve is a **red** finding. A CLAIM URL that now resolves means the
   status should be promoted; report it.

3. **Site wiring.** In `public/index.html`:
   - every `sameAs` entry must be a VERIFIED (or CONFIRM with a real slug)
     URL from profiles.md, and every VERIFIED URL must appear in `sameAs`;
   - `<link rel="canonical">`, `og:url`, and the `WebSite.url` in JSON-LD
     must all equal the hub;
   - `og:image` must point at a file that exists in `public/`;
   - the header `.links` row must contain only VERIFIED URLs.
   In `public/links.html`: every button URL must be in profiles.md or be a
   GitHub repo URL; UTM parameters must follow `presence/measurement.md`.
   Validate the JSON-LD parses (`python3 -c 'import json,re,sys; ...'`).

4. **Crawl files.** `public/robots.txt` names the sitemap. `public/sitemap.xml`
   is well-formed XML (`xmllint --noout` or Python) and lists `/` and
   `/links`. Exactly one `public/<32-hex>.txt` IndexNow key exists and its
   content equals its filename.

5. **Repository footers.** For each of the eight project repos under
   `/home/user` (all except `portfolio`), extract the section starting at
   `## Connect` to end of README. All eight must be byte-identical apart from
   the `utm_campaign=<repo>` value, and every URL in them must be VERIFIED.

6. **Bios.** For each bio in `presence/brand-kit.md`, count characters and
   confirm it is within its stated limit. Confirm the positioning sentence in
   the brand kit matches `header.top .sub` in `public/index.html` word for
   word.

7. **Report.** A checklist grouped Red (broken or contradictory), Amber
   (CLAIM/CONFIRM still outstanding), Green. For each Red item, the file and
   line and the one-line fix. Offer to apply the fixes; do not apply them
   unasked.
