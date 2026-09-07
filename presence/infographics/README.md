# LinkedIn infographics

A locked system for turning one audience pain into a graphic that reads in
a glance, moves for two seconds, and ships as three files. Every board looks
like every other board because they all use `system.css` and nothing else.
`/presence-infographic` runs the whole workflow.

## The seven steps

| # | Step | What it means here |
|---|---|---|
| 1 | Pain, not topic | Check the vault first: `../research/`, the backlog in `../content-engine.md`, `briefs/`. One specific thing the audience is stuck on, in their words. |
| 2 | One visual metaphor | One sentence, written in the brief before any HTML, so the graphic does not drift. This is the step people skip. |
| 3 | Spec, not wish | `briefs/_template.md`: exact size, tokens, type scale, every element in reveal order with its beat, the avoid list. "Clean" is not a spec. |
| 4 | One locked system | `system.css`. Same canvas, same cards, same spacing, same type. A new look is a new version of the file, never a one-off board. |
| 5 | Motion | Each element reveals on its own beat, 180 ms apart, eased, and the final frame is static. It has to look right frozen, because that is the frame people screenshot. |
| 6 | Review | Render, open the PNG, scrub. No line crosses text. Under 16 s. Fix, re-render, look again. |
| 7 | Ship | PNG for sharpness, MP4 as the master, GIF for the loop. Post native. Keep the ones that worked. |

## Files

| Path | What |
|---|---|
| `system.css` | The design system: palette from the brand kit, 1080 × 1350 canvas, 8 px spacing scale, type scale, card styles, the `.r` reveal with `--i` beats. |
| `briefs/_template.md` | The brief. Copy per board. |
| `briefs/<date>-<slug>.md` | One brief per board, with the review ticked. |
| `boards/<date>-<slug>.html` | One board per brief. Links `../system.css`. |
| `out/<slug>.{png,mp4,gif}` | The shipped files. PNG is the poster at 2x (2160 × 2700). MP4 is 1080 × 1350 H.264 CRF 18. GIF is 720 wide, 12 fps, 128 colours. |
| `scripts/render.mjs` | Playwright + ffmpeg renderer. Scrubs every CSS animation frame by frame so the capture is deterministic. |
| `scripts/render.sh` | Wrapper that finds `node_modules`. |

## Render

```bash
npm i playwright-core          # once, in the repo root (node_modules is ignored)
presence/infographics/scripts/render.sh presence/infographics/boards/2026-09-two-entitlements.html
```

Environment: `PLAYWRIGHT_BROWSERS_PATH` (default `/opt/pw-browsers`) or
`CHROME=/path/to/chrome`. For ffmpeg the script tries `FFMPEG`, then
`ffmpeg` on the path, then the static build from `pip install imageio-ffmpeg`,
then Playwright's bundled copy. The Playwright copy has no H.264 or GIF
encoder, so on a fresh machine run `pip install imageio-ffmpeg` once.

## Sizes

The board is 4:5, which LinkedIn, Instagram and Facebook all show at full
height in the feed. For a carousel, one board per slide, same system.
For X or the OG card, the 1200 × 630 source is `../assets/og.html`.

## The first board

`2026-09-two-entitlements`: the two objects both called "entitlement" in a
warranty data model, from the Meridian Appliance Care engagement. Two
columns as the fork. It is the reference board for spacing and card style.
