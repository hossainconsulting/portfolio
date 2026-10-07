---
name: presence-humanize
description: Pre-publish review that strips the tells of machine-written copy and puts the author's voice back - runs the checklist in presence/writing-checklist.md over a draft post, article, bio, caption or video script, reports every hit with the fix, then rewrites the draft in the brand-kit voice with a genuine opinion and sourced claims. Use when the user says "humanize", "does this sound like AI", "review before I post", "make this sound like me", or as the final pass of /presence-post.
---

# presence-humanize

Draft, audit, rewrite. Runs on anything about to be published under the
author's name.

## Inputs

- `$ARGUMENTS`: a path to the draft, or the draft pasted inline. Optional
  `--report-only` to audit without rewriting.

## Procedure

1. Read `presence/writing-checklist.md` (the tells and the fixes) and the
   voice section of `presence/brand-kit.md`. Read three samples of the
   author's real voice so the rewrite matches it, not a generic "human"
   register: the header and "What this is" copy in `public/index.html`,
   the opening of `README.md`, and one incident or retro document from a
   project repository's `deliverables/` folder.
2. Audit the draft against every item in the checklist, in order:
   word-level, sentence-level, post-level, then the brand-kit "never"
   list. Report each hit as: the quoted line, the rule it breaks, the fix.
   Count them. Zero hits is a valid result; say so and stop unless the
   opinion or evidence checks below fail.
3. Check for the two things a clean draft can still lack:
   - **A genuine opinion.** Something the author would defend and someone
     could disagree with. If absent, say so and propose one drawn from the
     source material (the decision made, the alternative rejected, what
     went wrong).
   - **Evidence for every claim.** A number, a link, a named source, or the
     repo document it comes from. Vague claims ("most businesses",
     "studies show") get a source or get deleted.
4. Rewrite the whole draft unless `--report-only`. Keep the structure the
   platform needs (hook line, line breaks, hashtags, disclosure). Plain
   words, first person, specific numbers, one idea per sentence, no em
   dashes, no three-beat closers, no rhetorical openers. Keep the length
   within the platform limit from `presence/brand-kit.md`.
5. Output the audit table, then the rewrite in a fenced block, then one
   line naming the opinion the rewrite now carries and the sources it
   cites.

## Rules

- Never add a claim the source does not support to make the draft sound
  confident.
- Never remove the disclosure line.
- Never change the facts, numbers or the decision described. Voice only.
- Do not publish. Output only.
