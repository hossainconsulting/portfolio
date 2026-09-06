---
name: presence-research
description: Market research for faceless video content - find 15 real problems, questions and interests the target audience (Salesforce admins and recruiters; Sydney trades and service business owners) cares enough about to watch and act on, score each on urgency, frequency, willingness to act, competition, ease of creating and overall potential, rank them, and pick the top 3 with a validation plan. Use when the user says "video ideas", "what should I make videos about", "topic research", "find problems in my niche", or asks which content to create first.
---

# presence-research

The research prompt in `presence/video-topic-research.md`, run here with
the brand kit already filled in. Problems first, videos second.

## Inputs

- `$ARGUMENTS`: optional audience focus (`admins`, `trades`, `both` is
  default), a platform (`youtube`, `tiktok`, `shorts`), or a pillar from
  `presence/content-engine.md`. Optionally a count other than 15.

## Procedure

1. Read `presence/video-topic-research.md` (the prompt and the pre-filled
   "My details"), `presence/brand-kit.md` (voice, disclosure) and
   `presence/content-engine.md` (pillars, backlog starters). Read the most
   recent file in `presence/research/` so you do not repeat topics already
   scored; prefer new ones or re-score old ones with new evidence.
2. Gather signals. Use `WebSearch` for each audience: what they ask
   (Reddit r/salesforce, r/SalesforceDeveloper, Trailblazer Community,
   Salesforce Ben, Sydney trades and small-business groups), what ranks on
   YouTube for the same questions, what the certification exam guides call
   hard, what tradie CRM comparison articles cover and miss. Pull the
   scenario numbers from the nine repositories (they are the evidence for
   "why it matters"). If search is blocked, say so and use the repo
   evidence alone, marking external claims as assumptions.
3. Identify the topics. For each: the specific problem or question, who
   experiences it, why it matters, what people currently do, why existing
   content is inadequate, evidence it gets views or engagement (link or
   "assumption"), and a faceless angle (screen recording with voice,
   diagram walkthrough, text-on-screen, narrated checklist).
4. Score each 1–10 on urgency, frequency, willingness to take action,
   competition (10 = low), ease of creating as a faceless video, and
   overall potential (the sum, out of 60). Rank by total.
5. Pick the top 3. For each: why it is the best opportunity, and how to
   validate it before investing more than one video (a Reddit answer, a
   LinkedIn poll, a 60-second Short, search-volume check in Search
   Console once live).
6. Output: a scored table, the 15 topic cards, the top 3 with validation,
   and a "not chosen and why" line for anything obvious that was left out.
   If asked to save, write to `presence/research/YYYY-MM-<slug>.md`.

## Rules

- Painful, recurring, specific, commercially relevant. Complaints people
  act on, not complaints people enjoy.
- Evergreen first; trending only when it maps to a pillar.
- Every topic that names a project company carries the disclosure line.
- Label any willingness-to-act score without evidence as an assumption
  and say how to test it.
- Do not invent view counts or statistics. Link or label.
