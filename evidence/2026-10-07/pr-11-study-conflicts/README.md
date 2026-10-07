# PR 11 study-builder conflict resolution

Date: 2026-10-07, Australia/Sydney.
Target: portfolio PR #11, claude/learning-course-templates-wh8bol.
Local Windows clone; original head 8586174, main 2ec499b.

Merged main and resolved README/header conflicts. Preserved current README and
added builder/source/regeneration documentation. Kept main's site-wide CSP:
script-src self already supports external study scripts, so removed the older
redundant study-specific detach/override. Homepage card auto-merged.

Actual validation, all exit 0:
- python scripts/build-study-templates.py: generated 17 templates.
- git diff HEAD -- public/study/templates.js: empty; regeneration matches source.
- node --check public/study/app.js and templates.js: passed.
- Node tag-stack assertions after excluding script/style/comment content:
  homepage and study HTML nesting passed; homepage /study/ link present.
- git diff --exit-code origin/main -- public/_headers: unchanged.
- git diff --cached --check passed; no unresolved files.
- Reviewed conflict edits/evidence for secrets/private data; none introduced.

Limitations: no current browser interaction/clipboard/localStorage testing,
Cloudflare response-header/routing verification or deployment. Historical PR
browser tests were not repeated. No external model interaction, draft change
or GitHub merge performed by the agent. Existing evidence preserved.
