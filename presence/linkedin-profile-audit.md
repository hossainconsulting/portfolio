# The 15-minute profile audit

A repeatable audit for LinkedIn first, then any other profile. Adapted from the
"Optimize your LinkedIn profile" workflow: export, upload, audit, constrain,
answer, refine, publish. `/presence-audit` runs it inside Claude Code; this
page is the manual version for claude.ai.

## Steps

1. **Export.** LinkedIn on desktop → your profile → **More** → **Save to PDF**.
2. **Open Claude.** Pick the most capable model available and turn on
   extended thinking. Attach the PDF and `brand-kit.md`.
3. **Run the audit** with the prompt below.
4. **Constraints** are in the prompt: clarifying questions first, XYZ formula
   for experience bullets, three bullets per role, applicant-tracking-system
   keywords from the brand kit.
5. **Answer** the questions plainly. Review the headline, About, experience
   bullets and the missing-skills list.
6. **Refine** with one follow-up at a time ("shorten About by a third",
   "make the second bullet about the outcome").
7. **Publish.** Paste into LinkedIn section by section. Set the custom URL.
   Turn on Creator mode only if you will post three times a week.

## The prompt

```
You are auditing my LinkedIn profile against my brand kit (attached). Audience: Salesforce recruiters in Sydney and Australia, and owners of trades and service businesses who might hire me for an implementation.

First, ask me up to five clarifying questions you need answered before rewriting anything. Then stop and wait.

After I answer, review the Headline, About, Experience, Skills, Featured, Licenses & certifications and Contact info sections. For each: what is stopping a recruiter from messaging me, what is stopping a client from trusting me, and the rewritten version.

Rules:
- Headline and About must use the positioning sentence from the brand kit, cut, not paraphrased.
- Experience bullets follow the XYZ formula: "Accomplished X, as measured by Y, by doing Z." Three bullets per role, maximum. Numbers from the actual work.
- Include the ATS keywords from the brand kit's keyword list naturally, never as a list.
- The projects are simulations. Every mention of a project company carries the disclosure line. Do not let a bullet imply a real client.
- Skills: recommend the top three to pin and up to twenty to keep. Name the ones to remove.
- Featured: recommend three items and their order.
- Flag anything on the profile that contradicts the brand kit or the portfolio hub.

Output the rewritten sections in the order LinkedIn shows them, each in a code block, so I can paste.
```

## The same audit for other profiles

Swap the first sentence:

- GitHub: "You are auditing my GitHub profile (README, bio, pinned repos)…"
  Attach `github-profile-README.md` and the repo list.
- YouTube: "You are auditing my YouTube channel About page and the titles and
  descriptions of my last ten videos…"
- Google Business Profile: "You are auditing my Google Business Profile
  (description, services, categories, posts)…" Ask for the audit of the
  categories against the keyword list specifically.

## What "done" looks like

- A recruiter can read the headline and the first three lines of About and
  know the role, the level, the location and the proof, without clicking.
- A client can find one link that shows a complete build.
- Nothing on the profile is a claim the hub cannot back.
