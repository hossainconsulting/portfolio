# PR 8 consolidation conflict resolution

Date: 2026-10-07, Australia/Sydney.
Target: hossainconsulting/portfolio PR #8, claude/salesforce-projects-app-ywt39v.
Local Windows clone; starting head c339fd0, main de602e6.

Merged current main into the older consolidation branch. Resolved CLAUDE.md,
README.md and homepage conflicts. Kept main guidance, current positioning,
verified credential wording, dated SunRise carry-forward summary, SEO, home lab,
Writing and planned Ansible track. Retained recruiter role/engagement tiles and
experience disclosure, added evidence navigation with explicit source/status
boundaries and the pattern-library Writing card. Avoided restoring the older
claims that every project is built or that the Ansible lab is already hardened.
Retained original sitemap additions for the pattern library and article.

Actual validation:
- Node homepage assertions: recruiter/evidence sections and existing features
  present, tag nesting valid after excluding script/style/comment content,
  JSON-LD parses, same-origin href/src file targets exist: passed, exit 0.
- PowerShell XML parse of sitemap: passed; four loc values displayed.
- git diff --exit-code origin/main -- CLAUDE.md public/_headers src
  public/widget.js learning: empty, exit 0.
- git diff --name-only --diff-filter=U: empty, exit 0.
- git diff --cached --check: passed, exit 0.
- Reviewed changes and evidence for secrets/private data; none introduced.

Limitations: no browser rendering, external linked-repository content audit,
credential re-verification, live widget/model/webhook tests, Ansible execution,
indexing checks or deployment. This is conflict reconciliation and source
navigation, not proof of completed projects or paid delivery. No GitHub merge or
draft-status change performed by the agent. Historical main evidence preserved.
