# Website handover to Codex — 2026-10-16

Prepared by Claude Code at 12:52 AEDT on 16 October 2026, at Hemayet's request.
This is a status check. It changes no website files.

## Claude's editing status

Claude Code has finished editing both website repositories and releases the
website files to Codex for the remaining copy corrections.

| Repository | `main` head checked | Claude branches not yet in `main` |
| --- | --- | --- |
| hossainconsulting/portfolio | `91739c5` (PR #30) | `claude/burnout-recovery-prompts-na18g1` (draft PR #13, 7 Oct). It touches only `public/burnout-recovery/`, one evidence file and `README.md`, so it should not affect the hub booking page. |
| hossainconsulting/hossainconsulting-portfolio | `19bbf35` (PR #22) | None. Every `claude/*` branch is an ancestor of `main`. |

The only Claude branch still in use is `claude/portfolio-codex-handover-0102y3`,
in `portfolio`, and only for this note.

These branches are not Claude's, are not merged and were not touched:
`codex/fix-personal-x-link`, `docs/footer-verification-20261008` and
`fix/agency-legacy-redirects` in `hossainconsulting-portfolio`.

## Agreed pricing

All prices include GST. No free services are offered.

- Founding client 1: A$660.
- Founding client 2: A$1,320.
- Founding client 3: A$1,980.
- Standard price after three completed projects: A$2,640.

`hossainconsulting-portfolio` `src/app/services/page.tsx` on `main` shows these
four prices. The `portfolio` public pages contain no A$ price figures.

## Codex corrections and conflicts

- **Agency blog.** Leftover free-summary wording is in
  `hossainconsulting-portfolio` `src/lib/blog.ts:191`: "You’ll get a one-page
  summary afterwards, whether or not we work together." No Claude work is
  pending on this file.
- **Hub booking page.** `portfolio` `public/book.html` has no Claude work
  pending. Its "free" wording refers only to the 20-minute call and the
  checklist.
- **For Hemayet to decide.** `platform/seed/catalogue.*` lists a paid A$180
  "Advisory Hour", which includes a written summary. It is not part of the
  four founding prices, so whether to keep it is Hemayet's call. Claude has
  not changed it.

## Outstanding items and limits

- Stripe testing is outstanding.
- Lawyer review is outstanding.
- No merge or deployment may happen without Hemayet's approval.
- Branch state comes from `git fetch` and `git merge-base --is-ancestor` at
  12:50 AEDT. No build, test or live site check was run.
