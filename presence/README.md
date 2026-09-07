# Omnichannel presence

One person, one message, every platform a recruiter or a client might look.
This folder is the operating manual for that presence. It is version-controlled
for the same reason the project deliverables are: the thinking should be
inspectable, and a profile that drifts from the record should be a diff.

## The model: one hub, many spokes

```
                         ┌──────────────────────────────────┐
                         │  portfolio.hossainconsulting.com  │  ← canonical hub
                         │  (evidence, schema.org, sitemap)  │
                         └───────────────┬──────────────────┘
                                         │ every profile links here
      ┌──────────┬──────────┬────────────┼────────────┬──────────┬──────────┐
   LinkedIn    GitHub    YouTube      Instagram      X       TikTok    Google
   (recruiters,(proof)   (long-form)  (visual)   (industry) (short   Business
    clients)                                      chatter)   video)   Profile
      │                                                                  │
   Facebook   Pinterest   Reddit   Threads/Bluesky   Trailblazer   Bing Places
   (mirror)   (evergreen  (answer  (overflow)        (Salesforce   (Microsoft
              search)     only)                       credibility)  search)
```

Rules that fall out of the model:

1. **The hub is the only place the full story lives.** Every profile is a
   summary that points back. Never write something on a spoke that the hub
   contradicts.
2. **One handle.** `hossainconsulting` on every platform that allows it.
   Fallbacks are in `profiles.md`. A recruiter who finds one profile should be
   able to guess the rest.
3. **One headline.** The positioning sentence in `brand-kit.md` is pasted, not
   paraphrased, into every bio. Search engines and people both reward
   consistency.
4. **One disclosure.** The projects are simulations. That line travels with
   every piece of content that mentions a project. It is the most credible
   thing on the site and it stays that way.
5. **Make once, publish everywhere.** Content originates in this GitHub
   organisation as a deliverable, a build log or an incident write-up. It is
   cut down per platform, never written fresh per platform. See
   `content-engine.md`.

## What is in here

| File | What it is for |
|---|---|
| `profiles.md` | **Source of truth** for every handle, URL and its status. Edit this first; everything else follows. |
| `brand-kit.md` | Name, headline, bios at every character limit, keywords, colours, image specs. Paste from here. |
| `content-engine.md` | Pillars, the repurposing pipeline, weekly cadence. |
| `seo.md` | Google and Microsoft search: Search Console, Bing Webmaster, IndexNow, schema.org, knowledge panel. |
| `launch-checklist.md` | The first 30 days in order. Tick boxes. |
| `measurement.md` | What to count, UTM convention, the monthly review. |
| `linkedin-profile-audit.md` | The 15-minute Claude audit workflow for LinkedIn (and any other profile). |
| `github-profile-README.md` | Drop-in content for the `hossainconsulting/hossainconsulting` profile repository. |
| `video-topic-research.md` | The faceless-video market-research prompt with "My details" pre-filled. Run quarterly. |
| `writing-checklist.md` | The pre-publish pass: the tells of machine-written copy and the fix. Every post goes through it. |
| `research/` | Saved research runs. `2026-09-faceless-video-topics.md` is the first: 15 scored topics, top 3 with validation. |
| `infographics/` | The LinkedIn infographic system: locked `system.css`, briefs, boards, the renderer that ships PNG, MP4 and GIF. Start at `infographics/README.md`. |
| `platforms/` | One playbook per platform: setup fields, content shape, cadence, what each audience sees. |
| `scripts/check-links.sh` | Curls every URL in `profiles.md` and reports what is not live. |
| `scripts/build-og.sh` | Rebuilds `public/og.png` from `assets/og.html`. |

## What is wired into the site

The hub carries the machine-readable half of the presence, in `../public/`:

- `index.html` — Open Graph and Twitter Card meta, canonical URL, and a
  schema.org `Person` + `ProfessionalService` JSON-LD block whose `sameAs`
  array lists every profile. This is what lets Google tie the profiles into
  one entity.
- `links.html` — the link-in-bio page at `/links`. Instagram, TikTok and
  YouTube allow one URL; that URL is this page.
- `og.png` — the 1200×630 preview card every platform shows when the hub is
  shared.
- `robots.txt`, `sitemap.xml` — for the crawlers.
- `<indexnow-key>.txt` — proves ownership to Bing/Yandex/Naver for instant
  indexing. See `seo.md`.

## Skills

`../.claude/skills/` holds seven Claude Code skills that run this manual:

| Skill | Use it when |
|---|---|
| `/presence-post` | Turning a deliverable or build log into platform-ready posts. |
| `/presence-audit` | Auditing a profile export (LinkedIn PDF, a bio, a channel About page) against the brand kit. |
| `/presence-check` | Checking that every handle, link and bio is live and consistent everywhere. |
| `/presence-calendar` | Building the week's calendar from what actually shipped in the repos. |
| `/presence-research` | Finding and scoring 15 video topics the audience will act on, then picking three to validate. |
| `/presence-humanize` | The last pass before anything is published: strip the tells, put the voice and an opinion back. |
| `/presence-infographic` | One pain, one metaphor, one locked system: a LinkedIn board rendered as PNG, MP4 and GIF. |

## Status

Written 06/09/2026. Verified live on that date: GitHub, Instagram, LinkedIn
company page. Everything else in `profiles.md` is marked **CONFIRM** or
**CLAIM** and is the first job in `launch-checklist.md`.
