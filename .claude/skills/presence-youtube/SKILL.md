---
name: presence-youtube
description: Run any of the eight YouTube strategy prompts (niche analysis, channel identity, 90-day roadmap, full video script, SEO and thumbnails, retention and editing blueprint, monetisation roadmap, viral ideation) with the brand kit, research and repositories already filled in, and save the result under presence/youtube/. Use when the user says "YouTube", "write the script for video N", "thumbnail for", "retention plan", "monetise the channel", "video ideas", or names one of the eight steps.
---

# presence-youtube

The eight prompts in `presence/youtube/README.md`, with every "ask me for
my niche" step answered from the vault. Output goes to the numbered file
for that step, or to a per-video file for steps 4 to 6.

## Inputs

- `$ARGUMENTS`: the step number (1–8) or its name, then any specifics: a
  video number from `03-roadmap.md`, a title, a competitor list, the
  current subscriber count or average view duration. Missing inputs are
  taken from `presence/brand-kit.md`, `presence/research/`,
  `presence/youtube/03-roadmap.md` and the repositories, and the
  assumption is stated at the top of the output.

## Procedure

1. Read `presence/youtube/README.md` (the MrBeast principles table and the
   input answers), `presence/brand-kit.md`, `presence/writing-checklist.md`
   and the existing file for the requested step so a re-run improves it
   rather than restarting.
2. Run the step exactly as its prompt specifies (role, steps, rules,
   output shape), using the repositories as evidence: the scenario numbers,
   the incident documents, the exam objectives in the certification
   deliverables.
   - **1 Niche:** score this channel's niche against nine others; CPM as
     labelled estimates; two non-AdSense paths each; explicit ranking.
   - **2 Identity:** five names, tagline that passes "so what", persona
     with specific frustrations, four non-overlapping pillars, a
     defensible mechanism.
   - **3 Roadmap:** twelve titles, schedule, SEO or virality label with a
     searched keyword or a hook concept, authority progression.
   - **4 Script:** hook with an open loop inside 10 seconds, agitation
     that is personal, solution with on-screen actions, three insights,
     one CTA, next-video tease. Save as `04-script-video-NN.md`.
   - **5 SEO:** title under 60 characters keyword-first, three thumbnails
     each with a different trigger and a text overlay, description with
     timestamps and UTM links, ten tags (head and long tail), A/B rounds.
     Save as `05-seo-thumbnails-video-NN.md`.
   - **6 Retention:** interrupt every 60–90 s changing visual or audio
     format, re-engagement lines at 30/50/70% that point forward, B-roll
     per section, end screen teasing one specific video. Save as
     `06-retention-video-NN.md`.
   - **7 Monetisation:** five streams by speed with AdSense never first,
     milestones each reachable before 100K, a pitch leading with audience
     value, a product that fits the pillars.
   - **8 Viral ideas:** trigger behind each competitor's best content,
     ten original ideas using the trigger not the angle, label each
     (curiosity, controversy, aspiration, fear), a hook under ten words,
     at least three with series potential.
3. Run the copy through `/presence-humanize` rules: no fillers, one
   opinion per script, every claim on screen or sourced.
4. Add the disclosure line wherever a project company is named.
5. Write the file, then update `03-roadmap.md` if a title or slot changed.

## Rules

- The three numbers that matter are CTR, AVD and first-48-hour views. Any
  recommendation must say which of them it moves.
- Title and thumbnail exist before a script is written. If a title cannot
  be made clickable honestly, say so and pick another video.
- No faces, no stunts, no paid reach. The mechanism is "published in full".
- Do not upload or post. Output files only.
