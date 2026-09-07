---
name: presence-infographic
description: Build a LinkedIn infographic (PNG poster, MP4 master, GIF loop) from one audience pain using the locked design system in presence/infographics - write the brief (pain, one visual metaphor, numeric spec), build the board HTML on system.css with staggered reveals, render all three files with scripts/render.sh, review (no line crosses text, under 16 s, poster frame stands alone), and ship. Use when the user says "infographic", "carousel slide", "make a graphic for LinkedIn", "motion graphic", "animate this post", or names a topic and asks for a visual.
---

# presence-infographic

Seven steps, in order. Skipping step 2 is what makes graphics drift.

## Inputs

- `$ARGUMENTS`: a pain, a topic number from `presence/research/*.md`, a
  backlog item from `presence/content-engine.md`, or a path to a source
  document. Optional `--static` for PNG only.

## Procedure

1. **Pain, not topic.** Check the vault before writing anything new:
   `presence/research/`, the backlog in `presence/content-engine.md`,
   `presence/infographics/briefs/` (do not remake a shipped board). Pick
   one specific thing the audience is stuck on and write it in their words.
2. **One visual metaphor, one sentence, locked.** Write it into the brief
   before any HTML. Choose the format (two-column, grid, pipeline, map,
   single diagram) and the one-glance takeaway. Get the user's agreement on
   this line if they are present; if not, state it and proceed.
3. **Spec, not wish.** Copy `presence/infographics/briefs/_template.md` to
   `briefs/YYYY-MM-<slug>.md`. Fill it with numbers: every element in
   reveal order with its beat index, exact copy (≤ 12-word title, ≤ 30-word
   lede, ≤ 4 bullets per card), the `data-duration`, and the avoid list.
   Run `/presence-humanize` on the copy before it goes in the brief.
4. **Locked system.** Create `boards/YYYY-MM-<slug>.html` linking
   `../system.css`. Use only the classes in that file. Every revealed
   element gets `class="r"` and `style="--i:N"`. Reference an approved board
   by name in the brief and match its spacing. Never add inline colours,
   shadows, gradients or fonts. If the system needs something new, change
   `system.css` in its own commit and say why.
5. **Motion.** Beats are 180 ms apart, eased, 600 ms each. The last beat
   plus 600 ms must be at least 3 s before `data-duration`, and
   `data-duration` ≤ 16000. Nothing moves after the last beat: the poster
   frame is the final state.
6. **Review.** Run `presence/infographics/scripts/render.sh boards/<file>`.
   Open the PNG with the Read tool and check: the poster reads alone; no
   line or border crosses text; nothing is clipped at 1080 × 1350; the
   disclosure is present when a project company is named; the hub URL is
   in the footer. For motion, re-render with a short `data-duration` in a
   scratch copy if a mid-motion frame needs inspecting, or screenshot at
   specific `currentTime` values with playwright. Fix, re-render, look
   again. Tick the review list in the brief.
7. **Ship.** Commit the brief, the board and the three outputs in `out/`.
   Post the PNG or MP4 native to the platform (never a link to it). Note
   in the brief which one was posted and, at the monthly review, how it did.

## Rendering prerequisites

`playwright-core` on `NODE_PATH` (`npm i playwright-core` in the repo root,
or point `NODE_PATH` elsewhere), a Playwright Chromium under
`PLAYWRIGHT_BROWSERS_PATH` or `CHROME=/path/to/chrome`, and ffmpeg
(`FFMPEG=` to override). The script fails loudly if motion outruns
`data-duration` or the board is over 16 s.

## Rules

- One board, one pain, one metaphor, one accent colour.
- Copy obeys `presence/writing-checklist.md`; every board carries an
  opinion in the `.take` block.
- Disclosure line whenever a fictional company is named.
- Do not post. Output the files and the paths.
