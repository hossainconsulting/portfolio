# AI resource triage — 5 October 2026

**Status:** Sorting record for 45 social-media screenshots (three batches) Hemayet supplied. It records what was kept for current projects and why the rest was dropped. It is a planning aid, not evidence of completed work. Claims in the posts (benchmarks, "10x", attributions) were not verified.

The screenshots themselves are not committed: they show third-party names, profile photos and Hemayet's Facebook account. Only adapted, project-specific wording is kept here.

This extends the [AI-assisted project workflow](ai-assisted-project-workflow.md). The One Codex Prompt (task, success criteria, context, evidence, approval boundaries, next step) remains the single template.

## Decisions

| Screenshot | Decision | Reason |
| --- | --- | --- |
| Learning prompts — Hidden Gap Detector, Real Error Simulator, Forced Feynman | **Keep, adapted** | Directly useful for the six certification tracks the Salesforce simulations target |
| Learning prompts — Learning Curve Destroyer, Language Translator, 7-day Learning Path | Drop | Already covered by 80/20 learning, Summarizer and 30-day skill plan in the existing workflow |
| LinkedIn profile prompt | **Keep, adapted** | Supports the portfolio's Solutions Engineering / FDE positioning; constrained to verifiable claims |
| Image prompt 1 — Professional retouch | **Keep, adapted** | Only for Hemayet's own headshot on the portfolio or LinkedIn |
| CLAUDE.md "best practices" post | **Keep one idea** (lessons log) | Plan-first, verification-before-done and minimal-impact rules are already in every repo's AGENTS.md / EVIDENCE.md. The correction log is the only new idea; proposed below, not adopted |
| Claude cheat sheet (prompt formula, ecosystem, master prompt) | Drop | Formula duplicates the One Codex Prompt. The "/TLDR, /ELI5…" prefixes are not built-in Claude commands, just words in a prompt |
| "Team of AI agents" (Plan → Research → Build → Review → JEV) | Drop | "DOTS" and "JEV" are undefined marketing terms. The useful part — a separate review step before completion — is already the evidence rule |
| NVIDIA agent skills (`npx skills add nvidia/skills`) | Drop | No NVIDIA/GPU work in any project. Do not install third-party skill packs without reading them first |
| Content-gap prompt | Drop | No content-marketing work in scope |
| "Jarvis OS" (Claude Code + Obsidian + local LLM + voice + n8n) | Drop | Out of scope; adds infrastructure without serving a current project |
| Image prompts 2–10 (remove objects, change outfit/background, 8K, eyes, etc.) | Drop | No project need. Altering photos of people or removing watermarks from others' work is not something to use for portfolio material |

## Kept prompts

Replace bracketed items. Each is a single request inside the One Codex Prompt, not a new standing template.

### Certification gap check (Hidden Gap Detector)

Track mapping: Platform App Builder — meridian-field-services; Agentforce Specialist — agentforce-meridian-care; Administrator / Sales / Service — tradelink-group; Data Cloud Consultant — coastline-retail-group; Sales Cloud Consultant — ironbark-industrial-supply; Service Cloud Consultant — kurrajong-energy.

> I am preparing for [CERTIFICATION] using the [REPO] simulation. Ask me five questions, one at a time, that look simple but expose shallow understanding of [TOPIC, e.g. Entitlement Processes vs custom warranty objects]. After each answer, tell me what it reveals is missing and point me to the official Salesforce documentation or Trailhead module to check. Be direct if I am shallow. Do not mark anything in the repo as complete.

### Scenario drill (Real Error Simulator)

> Put me in a realistic [REPO] situation where I must use [CONCEPT, e.g. Omni-Channel routing] and would probably make a mistake. Use only the fictional scenario data. When I go wrong, ask a question that exposes the broken reasoning instead of giving the answer; give the answer after two attempts. Repeat until I get it right without hesitation, then suggest one hands-on exercise in the Developer Edition org that would produce evidence.

### Explain-back check (Forced Feynman)

> I just studied [TOPIC]. I will explain it as if to a 10-year-old. Stop me when I use jargon I can't define, skip a step, or oversimplify into something wrong. At the end, list what those mistakes show is still weak, and which deliverable in [REPO] would need correcting if I had written it that way.

### LinkedIn profile review

> Act as a reviewer for a Salesforce + AI Solutions Engineering profile aimed at Forward Deployed Engineering roles. Inputs: my current headline, About section, and https://portfolio.hossainconsulting.com. Identify what weakens positioning, credibility and clarity, then propose a headline, About section, Featured-section plan and three positioning options. Every section should answer: who I help, what problem I solve, why they should trust me. Constraints: the Salesforce projects are self-directed simulations with fictional companies and must be described that way; use only certifications, results and dates that are linked to evidence; no invented metrics, buzzwords or exaggerated claims. Drafts only — I publish.

### Headshot retouch

> Retouch this photo of me for a professional profile. Keep my identity, facial features, skin texture, proportions, hairstyle and clothing natural and recognisable. Improve lighting, sharpness, colour balance and exposure; remove only small distractions. Do not make the skin look plastic or obviously edited.

## Second batch (15 screenshots)

| Screenshot | Decision | Reason |
| --- | --- | --- |
| Six-section AGENTS.md post (plan, smallest change, subagents, own the bug, verify, lessons) | **Keep four ideas, proposed** | Repos already route CLAUDE.md to AGENTS.md and require verification and minimal scope. New: a Lessons section, `PLAN.md` for resumable long tasks, stop after two failed tries on one step, back up before overwriting. See the proposal below |
| "16 rules to stop wasting credits" | **Keep three habits** | One session per repository; ask for a handover summary before starting fresh on a long task; share the error and relevant files only. The rest repeats the prompt rules above |
| AI agents cheat sheet (model, tools, orchestration, MCP/A2A) | **Keep as concept map only** | Matches home-services-ai `03-jobs-mcp` (tools over MCP) and `04-after-hours-agent` (orchestration, escalation), and agentforce-meridian-care (actions as tools). Its model table is dated; check current vendor docs before quoting it |
| Seven general prompts (daily planning, thinking clarification, research, learning, decision, problem solving, writing) | Drop | Duplicates Research intern, Expert reasoning, Writing feedback and 80/20 learning in the existing workflow. For decisions, use the repos' `docs/adr` records |
| Image prompts 8–10 | Drop | Already dropped in the first batch |
| Social-media growth prompts, "Money making ChatGPT prompts", "ChatGPT as your marketing agency" | Drop | No content-marketing, side-hustle or ad-copy work in scope. The marketing prompts don't fit coastline-retail-group either, which covers Data Cloud segmentation and activation, not copywriting |

## Third batch (14 screenshots)

| Screenshot | Decision | Reason |
| --- | --- | --- |
| Website prompts 4 (portfolio) and 7 (mobile) | **Keep, merged into one portfolio review prompt** | The portfolio is a live static site (`public/index.html`). "Premium", "$10K" and "persuasive" wording replaced with honest positioning and a testable mobile check |
| Website prompts 1–3, 5, 6, 8 (premium site, hero, conversion copy, service page, About story, full copy) | Drop | Sales copy for a business offer. The portfolio presents self-directed simulations; conversion copy would conflict with the simulation disclosure |
| Personal finance prompts (income streams, debt, expenses, budget, salary script, impulse spending, side hustle) | Drop | Personal finance, not project work |
| Finance spreadsheet prompts (dashboard, budget, cash flow, subscriptions, debt, savings, invoices, creator profit, net worth) | Drop; note one pattern | Not project work, and they ask for bank exports, which must never enter a repository. Their good habit — flag unclear items instead of guessing, never count a payment twice — is already in EVIDENCE.md. The invoice-aging idea can be revisited when home-services-ai `02-notes-to-invoice` (not started) is designed |
| "Claude cheat sheet nobody made" | Drop | Already dropped in the first batch |
| "Complete guide to Claude links" | Drop | Every link is an `lnkd.in` short link that hides its destination. Use docs.claude.com and anthropic.com directly |

### Portfolio page review (kept)

> Review https://portfolio.hossainconsulting.com (source: `public/index.html`) as a hiring manager for Solutions Engineering / Forward Deployed Engineering roles. Within 10 seconds, can they tell who I am, what I build and where the evidence is? Check: project cards link to their repositories and evidence; simulations are clearly labelled; About builds trust with verifiable facts only; one clear contact path. Then check it at 375px width: no horizontal scroll, tap targets at least 44px, readable text, images sized for mobile. List issues by severity with the exact section. Propose edits as a diff for my review — no invented metrics, testimonials or client claims.

## Proposed, not adopted: correction log

Two posts (the CLAUDE.md best-practices post and the six-section AGENTS.md post) suggest the same idea: turn each correction into a one-line rule and review it at session start. Existing AGENTS.md files already require preserving history and adding dated corrections, but none has a Lessons section, `PLAN.md` convention, retry limit or backup rule.

If Hemayet approves, append this to each repo's AGENTS.md:

```markdown
## Working rules (proposed)
- Long task: write the steps and how each will be proved to `PLAN.md`; leave it in place when pausing so the next session can resume.
- Two failed tries on one step: stop, record what failed, re-plan.
- Back up a file before deleting or overwriting it, unless it is tracked and committed.

## Lessons
<!-- One line per correction: "When X, do Y". Newest first. Same mistake twice: rewrite the lesson. -->
```

No repository was changed for this.
