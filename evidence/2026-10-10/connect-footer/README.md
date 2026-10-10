# Connect footer added to README (2026-10-10)

**Task:** make the README "Connect" footer consistent across the eight project repositories, using the home-services-ai footer as the standard (Hemayet approved the footer fix in chat on 2026-10-10).

**Target:** `README.md` in `portfolio`. Documentation only.

**Change:** appended a `## Connect` section with the same text and links as home-services-ai. Only the `utm_campaign` value on the Portfolio link differs (`portfolio`).

**Validation (actual):**
- Content review: footer text and links match the home-services-ai footer.
- `git diff --check`: run before commit, no whitespace errors.
- Link reachability: **not run** (no live link check from the cloud session). Treat the links as unverified until a presence check is run.

**Limitations:** no deployment, no live-site change, no tests apply. Whether the other seven repos now match is checked by comparing README footers, not by an automated test.
