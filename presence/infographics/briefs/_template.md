# Brief: <board name>

Written before any HTML. Locked once the metaphor line is agreed. Rendered
boards reference this file by name.

## 1. The pain (one sentence, from the audience's mouth)

> "<what they say when they are stuck>"

Source in the vault: `<repo>/<path>` or `presence/research/<file>.md` topic N.
Pillar: <1–5 from content-engine.md>. Audience: <admins | trades | both>.

## 2. The visual metaphor (one sentence, locked)

> <e.g. "A fork: one word, two roads, and they must not merge.">

Format: <grid | two-column | pipeline | map | single diagram>.
One-glance takeaway: <the sentence someone gets from the poster frame alone>.

## 3. The spec (numbers, not adjectives)

- Canvas 1080 × 1350, rendered at 2x. Padding 72. Gap 24. Radius 12.
- Tokens: `presence/infographics/system.css` only. No new colours.
- Type: kicker 20 / title 60 / lede 24 / card title 30 / body 22 / mono 18.
- Elements, in reveal order (beat = 180 ms):
  0. kicker: <text>
  1. title: <text, ≤ 12 words, one word in key colour>
  2. lede: <text, ≤ 30 words>
  3. …
  N. footer: disclosure + hub URL
- Motion ends at N × 180 + 600 ms. `data-duration` = <ms>, ≤ 16000.
- Avoid: gradients, drop shadows, icons from third-party sets, more than two
  columns, any line or rule that crosses text, text under 15 px, more than
  one accent colour, a title that is a question.

## 4. Approved boards to match

`boards/<name>.html` (for spacing) · `boards/<name>.html` (for the card style)

## 5. Review (tick before shipping)

- [ ] Poster frame reads alone: pain, answer, takeaway, hub.
- [ ] No line crosses text in any frame (scrub at 0.5 s steps).
- [ ] Under 16 s; motion finishes with ≥ 3 s hold.
- [ ] Disclosure present if a project company is named.
- [ ] Writing checklist passed (`/presence-humanize` on all copy).
- [ ] PNG, MP4, GIF exported; PNG opened at 100% on a phone-width crop.
