---
name: presence-calendar
description: Build next week's content calendar from what actually shipped - reads git log and changed deliverables across the nine hossainconsulting repositories, maps them to the pillars in presence/content-engine.md, and fills the weekly cadence table with a concrete source document per slot. Use when the user says "what should I post this week", "content calendar", "plan the week", or on the Sunday planning step.
---

# presence-calendar

The Sunday hour, done in five minutes.

## Inputs

- `$ARGUMENTS`: optional lookback in days (default 14) and/or a pillar to
  prioritise.

## Procedure

1. Read `presence/content-engine.md` (pillars, weekly cadence, backlog
   starters) and `presence/brand-kit.md` (hashtag sets).
2. For every repo under `/home/user`, run
   `git log --since="<lookback> days ago" --name-only --pretty=format:'%h %ad %s' --date=short`
   and collect changed files under `deliverables/`, `evidence/`, `*.md` at
   root, and `0*-*/` in `home-services-ai`. Ignore `force-app/`, `seed/`,
   `.claude/`, and `presence/`.
3. Rank candidate sources: incident reviews and retros first, design
   decisions second, build logs third, everything else last. A document
   nobody has posted about yet outranks one that has (check
   `presence/reviews/*.md` if it exists for a "posted" list).
4. Pick **one** primary source for the week and, if the lookback is thin,
   one backlog starter. Assign the pillar.
5. Fill the cadence table from `content-engine.md` with, per slot: platform,
   format, the source path, the working hook line (≤ 12 words), and the
   `/presence-post` invocation that will produce it.
6. Add two Reddit threads to answer: search r/salesforce with `WebSearch`
   for questions the source answers; list the URLs. If search is blocked,
   say so and list the two most likely question phrasings instead.
7. Output the table, then a one-line "why this source" and the disclosure
   reminder.

## Rules

- One source per week. Depth beats breadth.
- Never schedule a platform the user has not registered (check statuses in
  `presence/profiles.md`; CLAIM platforms are skipped with a note).
- Output only; do not create files unless asked. If asked, write to
  `presence/calendar/YYYY-WW.md`.
