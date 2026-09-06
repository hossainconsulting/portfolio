# Content engine

One person cannot write nine platforms' worth of original content. One person
can write one thing a week and cut it nine ways. That is the whole system.

## Pillars

Every piece of content belongs to exactly one pillar. If it does not fit, it
does not go out.

| # | Pillar | Source in the repos | Who it is for |
|---|---|---|---|
| 1 | **Build logs** — how a real requirement became config | `deliverables/`, `week*-build-brief.md`, `build-log.md` in each engagement repo | Recruiters (proof of craft), clients (what working with me looks like) |
| 2 | **Certification topics** — one exam objective explained with the project as the example | The certification track on the hub; exam guides | Recruiters, other admins (reach) |
| 3 | **Agentforce and AI for small business** — agents, guardrails, evals, MCP | `agentforce-meridian-care`, `home-services-ai` | Clients (trades owners), industry |
| 4 | **Consulting craft** — discovery, stakeholders who disagree, decision records, incident reviews | `deliverables/` in every repo, especially incident and retro documents | Recruiters (seniority signal), clients (trust) |
| 5 | **For Sydney trades businesses** — plain-language answers to "should we get a CRM" questions | The scenarios themselves | Clients, Facebook groups, GBP, Reddit |

## The pipeline: make once, cut nine ways

```
   Source (a deliverable, build log, incident review in GitHub)
      │
      ▼
   1. Long-form post on the hub / LinkedIn article (600–1,200 words)  ─── Pillar owner
      │
      ├─▶ 2. LinkedIn post (150–250 words, hook in the first line, no link in body)
      │        └─▶ 3. Facebook Page post (same text, link allowed)
      │        └─▶ 4. Company page reshare with one-line framing
      │
      ├─▶ 5. X thread (5–8 posts, one idea each) ──▶ Threads / Bluesky mirror
      │
      ├─▶ 6. Carousel (6–10 slides, 1080×1350) ──▶ Instagram, LinkedIn document post
      │        └─▶ 7. Pinterest pins (each slide is a pin, 2:3 crop, keyword title)
      │
      ├─▶ 8. Vertical video, 45–90 s, screen recording + voice ──▶ TikTok, Reels, Shorts
      │        └─▶ 9. YouTube long-form (8–15 min walkthrough) every second week
      │
      └─▶ 10. Reddit: not a post. Find the thread where someone asked this
              question and answer it properly. Link only if asked.
```

Order matters: the long-form goes out first so every cut can point to it.

Every cut goes through `writing-checklist.md` (`/presence-humanize`) before
it is scheduled. No exceptions for "it is only a caption".

## Weekly cadence (about 4 hours)

| Day | Action | Time |
|---|---|---|
| Sun | Pick the week's source from the repos (`/presence-calendar` does this). Draft the long-form. | 60 min |
| Mon | Publish long-form (LinkedIn article or hub). Post LinkedIn #1 (hook + takeaway). | 30 min |
| Tue | X thread from the long-form. Record the vertical video. | 45 min |
| Wed | LinkedIn #2 (the diagram or a screenshot with two sentences). Publish video to TikTok, Reels, Shorts. Carousel to Instagram. | 30 min |
| Thu | Reddit: answer two threads. Facebook Page mirror. GBP update. | 30 min |
| Fri | LinkedIn #3 (a decision or a lesson, plain text). Company page reshare. | 15 min |
| Sat | Off. Or batch pins once a month. | 0 |

YouTube long-form every second week replaces Tuesday's recording.

## Format rules per platform

| Platform | Shape | Never |
|---|---|---|
| LinkedIn | First line is the whole point. Line breaks every 1–2 sentences. Link in the first comment. 3–5 hashtags at the end. | External link in the body, engagement bait, "I'm humbled to announce" |
| X | One idea per post. Thread numbered. Final post links the hub. | Threads over 8, screenshots of text |
| Instagram | Carousel slide 1 is the headline, slide 2 is the problem, last slide is "full write-up at link in bio". | Text-heavy single images |
| TikTok / Reels / Shorts | Screen recording, talking over it, caption burned in, first 2 seconds state the problem. | Intros, logos, "hey guys" |
| YouTube | Chaptered walkthrough. Title starts with the outcome. Description links the repo and the hub. | Unedited 40-minute recordings |
| Pinterest | Diagram or checklist. Keyword-first title. Description with the pillar keywords. Link to the exact hub section. | Selfies, quotes |
| Reddit | Answer the question fully. Mention your own write-up only if it is the direct answer and only once. | Posting your own content as a submission in the first 90 days |
| Facebook | Mirror of LinkedIn, plus answers in Sydney trades and small-business groups. | Ads before the page has 20 organic posts |
| GBP | "Update" post: one photo, 100 words, a call to action button pointing at the hub. | Leaving it empty; Google demotes stale profiles |

## Voice

The hub already has the voice. Keep it:

- Plain, specific, first person. "I built" not "we leveraged".
- Numbers from the scenarios (35 seats, 12,400 cases a month, 0% deflection).
- Say what went wrong. The incident reviews are the best content in the repos.
- The disclosure line whenever a company is named. Not buried, not apologetic.

## Backlog starters (pull from the repos)

1. Warranty entitlement vs. service entitlement: the two things called
   "entitlement" that must not be conflated (`agentforce-meridian-care`).
2. Why the agent's coverage answer is a retrieved action and never a
   generated sentence.
3. Counting deflection before go-live, not after.
4. 340 duplicate accounts: a de-duplication plan that survives the sales team.
5. A lead assignment rule that stopped matching reality when territories moved.
6. An acquisition data migration with a rehearsed rollback.
7. A customer who exists three times: identity resolution in Data Cloud.
8. Regulated response deadlines: giving an SLA milestone a consequence.
9. Notes-to-invoice without letting the model do arithmetic.
10. One guarded write path: how the Jobs MCP server decides what Claude may change.

From `research/2026-09-faceless-video-topics.md`, validated first:

11. When a trades business outgrows ServiceM8 or Tradify, and what Salesforce costs at 20 staff.
12. The security questions people fail on the Admin exam, shown live in an org.
13. The coverage answer an agent must never generate, and the incident when it did.
