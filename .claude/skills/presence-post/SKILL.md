---
name: presence-post
description: Turn a deliverable, build log, incident review or any document from the hossainconsulting repositories into platform-ready posts (LinkedIn, X thread, Instagram carousel script, TikTok/Shorts script, YouTube title and description, Pinterest pin copy, Facebook, Google Business Profile update, Reddit answer) following presence/brand-kit.md and presence/content-engine.md. Use when the user says "post about", "write a LinkedIn post", "make a thread", "cut this for social", or names a platform and a document.
---

# presence-post

Make once, cut nine ways. The source is always an existing document; never
write a post from nothing.

## Inputs

- `$ARGUMENTS`: a path to the source document (any repo under `/home/user`),
  or a topic that maps to one of the backlog starters in
  `presence/content-engine.md`. Optionally a platform list; default is all.

## Procedure

1. Read `presence/brand-kit.md` (voice, disclosure line, hashtag sets,
   keywords) and the "Format rules per platform" table in
   `presence/content-engine.md`. Read the relevant `presence/platforms/*.md`
   for any platform requested.
2. Read the source document in full. Identify: the requirement in the
   client's words, the decision made, the alternatives rejected, the number
   that proves it, and what went wrong. If any of those five is missing, say
   which and use what exists.
3. Assign exactly one pillar. If none fits, stop and say so.
4. Produce, in this order, each in its own fenced block so it can be pasted:
   1. **Long-form** (600–1,200 words) for a LinkedIn article or the hub.
   2. **LinkedIn post** (150–250 words): first line under 12 words, line
      breaks every 1–2 sentences, no link in body, "link in first comment"
      line, 3–5 hashtags. Then the first-comment text with the UTM link.
   3. **X thread** (5–8 numbered posts, each ≤ 280 chars, last one links the
      hub with UTM).
   4. **Carousel script** (6–10 slides, headline + ≤ 25 words per slide, alt
      text per slide, caption with disclosure and 5 hashtags).
   5. **Vertical video script** (45–90 s: on-screen caption per beat, voice
      line per beat, the first beat states the problem).
   6. **YouTube** title (≤ 70 chars, outcome first), description (summary,
      chapters, repo link, hub link with UTM, disclosure), 8 tags.
   7. **Pinterest** pin title (keyword first) and description.
   8. **Facebook Page** post (LinkedIn text with the link in body).
   9. **Google Business Profile update** (≤ 100 words, CTA "Learn more").
   10. **Reddit**: not a post. A full answer to the question the document
       answers, with the link only if it is the direct answer.
5. Every block that names a project company carries the disclosure line
   (short form in captions). Check this last, explicitly.
6. UTM on every link: `utm_source=<platform>&utm_medium=post&utm_campaign=<pillar>`
   per `presence/measurement.md`.

## Rules

- First person, plain, specific. Numbers from the scenario. Say what went wrong.
- Never "leverage", "humbled", "excited to announce", "thoughts?".
- Never imply a fictional company is a client.
- Never invent a metric the source does not contain.
- Do not post anything. Output only. The user publishes.
