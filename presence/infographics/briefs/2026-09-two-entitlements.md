# Brief: 2026-09-two-entitlements

## 1. The pain

> "We already have entitlements set up. Why is the agent telling customers
> their warranty is expired when the SLA is what actually lapsed?"

Source in the vault: `agentforce-meridian-care/CLAUDE.md`, "The distinction
that shapes the data model"; `presence/research/2026-09-faceless-video-topics.md`
topic 8. Pillar 2 (certification topics). Audience: admins, with recruiters
reading over their shoulder.

## 2. The visual metaphor (locked)

> A fork: one word, two roads, and they must not merge.

Format: two-column. One-glance takeaway: "the coverage check reads the custom
object; the SLA clock runs on the standard one."

## 3. The spec

- Canvas 1080 × 1350 at 2x. Padding 72. Gap 24. Radius 12. `system.css` only.
- Elements, reveal order:
  0. kicker: Service Cloud · Agentforce Specialist
  1. title: Two different things are both called "entitlement". ("entitlement" in key)
  2. lede: Conflating them is the classic error in a warranty data model. One is a commercial promise. The other is a clock.
  3. left card: 01 · Custom object · Warranty_Entitlement__c · four bullets
  4. right card: 02 · Standard object · Entitlement + Process + Milestones · four bullets
  5. rule card (soft): the rule, two sentences
  6. takeaway: the opinion, one sentence with "I have seen both"
  7. footer: disclosure (Meridian Appliance Care fictional) + hub URL
- Motion ends 1,860 ms. `data-duration` 6000. Hold 4.1 s.
- Avoid: the standard "avoid" list; also avoid drawing an actual fork icon.
  The two columns are the fork.

## 4. Approved boards to match

First board; this one becomes the reference for spacing and card style.

## 5. Review

- [x] Poster frame reads alone.
- [x] No line crosses text (the only rules are card borders and the footer rule; scrubbed at 0.5 s).
- [x] 6 s total, motion done at 1.86 s.
- [x] Disclosure present.
- [x] Copy passed the writing checklist (no fillers, one opinion, numbers from the scenario).
- [x] PNG, MP4, GIF in `out/`.
