# PR 13 Weekend Reset conflict resolution

Date: 2026-10-07, Australia/Sydney.
Target: portfolio PR #13, claude/burnout-recovery-prompts-na18g1.
Local Windows clone. Original head 9b47442; merged main 3a3ee54.

Resolved README and header conflicts. Preserved main documentation and added
app/disclaimer pointers and publication checks. Kept main's site-wide CSP,
which already permits same-origin scripts; removed the redundant older
burnout-specific override. App and draft disclaimer unchanged from PR head;
no homepage link added.

Actual checks, exit 0:
- Node assertions: index/disclaimer targets exist; both HTML tag stacks valid
  after excluding comments/style/script content.
- node --check public/burnout-recovery/app.js: passed.
- git diff --exit-code HEAD -- public/burnout-recovery: empty.
- git diff --exit-code origin/main -- public/_headers public/index.html: empty.
- git diff --cached --check passed; unresolved file list empty.
- Reviewed conflict edits and evidence for secrets/private data; none introduced.

Limitations: no current browser interaction, gate, clipboard, localStorage,
responsive-layout or Cloudflare verification. Historical PR browser results
not replayed. No medical/legal content validation or disclaimer approval.
No deployment, third-party prompt submission, GitHub merge or draft change by
the agent. Existing dated evidence preserved.
