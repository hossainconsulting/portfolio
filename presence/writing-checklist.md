# Writing checklist: the tells, and the fix

Everything published under the author's name gets this pass. It exists
because drafts produced quickly, by a person or a model, converge on the
same fillers, and a reader who has seen them a hundred times stops reading.
`/presence-humanize` runs it; this is the manual version.

## 1. Word-level tells

- Remove "boasts", "stands as", "serves as". Say what the thing does.
- Cut "crucial", "pivotal", "intricate", "robust", "seamless" when they add
  nothing. They almost always add nothing.
- Do not repeat "tool", "platform", "solution". Name the actual thing.
- Replace weak participles: "highlighting", "underscoring", "reflecting",
  "showcasing". Use a verb with a subject.
- No "leverage", "utilise", "empower", "elevate", "unlock", "delve".
- No "humbled", "thrilled", "excited to announce".

## 2. Sentence-level tells

- Delete any line shaped "It's not just X, it's Y."
- Skip "Let's dive in", "Without further ado", "In today's fast-paced
  world", "In the ever-evolving landscape".
- Remove generic closers: "I hope this helps", "Let me know your
  thoughts", "Thoughts?", "Agree?"
- Do not stack three-beat fragments: "No guessing. No hesitation. No
  confusion."
- One idea per sentence. If a sentence has a semicolon, it is two.
- No em dashes. A full stop or a comma does the job.

## 3. Post-level tells

- Remove predictable pivots: "Despite these challenges", "That said",
  "However, it's important to note".
- Drop rhetorical openers: "The real question is", "At its core", "Here's
  the thing", "Let that sink in".
- Stop ending every post with three short statements.
- Watch overused hyphenated terms: "data-driven", "decision-making",
  "game-changing", "cutting-edge".
- No exaggerated comparisons: "from ancient rituals to modern
  skyscrapers".
- No numbered lists where the numbers carry no order.
- The hook is the first line and it is the point, not a question.

## 4. What a clean draft can still lack

- **A genuine opinion.** Something the author would defend and a reader
  could disagree with. In this presence it is usually the decision made
  and the alternative rejected. Without one the draft is a summary.
- **Evidence.** A number from the scenario, a link, the repo document.
  "Most businesses" and "studies show" get a source or get cut.
- **The author's voice.** Plain, first person, specific, says what went
  wrong. Samples: the header copy on the hub, the opening of the portfolio
  README, any incident review in `deliverables/`.
- **The disclosure line** wherever a project company is named.

## 5. The fix

1. Draft from the source document, not from nothing (`/presence-post`).
2. Audit against sections 1 to 3. Fix every hit.
3. Check section 4. Add the opinion. Source or cut the claims.
4. Rewrite once in the voice, within the platform's character limit.
5. Read it aloud. Anything you would not say to a colleague goes.

Run `/presence-humanize <draft>` to do steps 2 to 4 in one pass.
