# AI resource triage
Date/time and timezone: 2026-10-05 (Australia/Sydney)
Requirement or issue: Hemayet supplied 16, then 15, then 14 more social-media screenshots (a repeat upload of the second batch was not re-recorded), then a fourth batch of 16 (4 repeats), then a fifth batch of 15 (2 repeats), then a sixth batch of 15 (1 repeat), then a seventh batch of 15, then an eighth batch of 15 (1 repeat) of Claude/AI prompts and asked to sort them and keep anything needed for current projects.
Environment/target: portfolio repository (documentation only); no Salesforce org, deployment or other repository touched.
Starting state: docs/ai-assisted-project-workflow.md existed as the single prompt guide.
Changes made:
- docs/ai-resource-triage-2026-10-05.md: keep/drop decision for each screenshot with reasons; five adapted prompts kept (certification gap check, scenario drill, explain-back check, LinkedIn profile review, headshot retouch); correction-log idea recorded as a proposal only.
- Second batch (same doc): added a decision table for 15 screenshots; kept four AGENTS.md working-rule ideas as a proposal with draft wording, three session habits and an agent concept map; checked that no repository AGENTS.md has a Lessons section, PLAN.md convention, retry limit or backup rule (`grep` over all eight repos).
- Third batch (same doc): decision table for 14 screenshots; one portfolio page review prompt kept (merged from two website prompts); confirmed `public/index.html` has a viewport meta tag and home-services-ai `02-notes-to-invoice` is not started.
- Fourth batch (same doc): decision table for 16 screenshots; kept a triage scoring pattern for home-services-ai `01-quote-triage` (confirmed status "Not started") and a self-review loop idea for `05-evals`; no other repository changed.
- Fifth batch (same doc): decision table for 15 screenshots; kept one segment hypothesis prompt for coastline-retail-group.
- Sixth batch (same doc): decision table for 15 screenshots; added one results-analysis step to the Coastline segment prompt; everything else dropped.
- Seventh batch (same doc): decision table for 15 screenshots; kept the nine agent terms as a design checklist for the agent projects; everything else dropped.
- Eighth batch (same doc): decision table for 15 screenshots; added a cross-profile consistency check to the LinkedIn prompt; everything else dropped.
- README.md: one sentence linking the triage record.
Validation procedure/command: Content read-through against each screenshot and the existing workflow doc; `git diff --check`.
Observed result and exit status: See commit; diff check run before commit.
Supporting files: none. Screenshots deliberately not committed (third-party names and photos, Hemayet's Facebook account).
- Scope correction: dated note added at the top of the doc; agency and branding prompts now kept in the private brain prompt-kit skill.
Limitations / checks not run: Claims in the posts (NVIDIA benchmark figures, attributions, "10x") were not verified. Kept prompts have not been executed. Documentation-only; no build or tests.
Related issue/PR: see PR for branch claude/project-dependencies-review-fgsxe5
