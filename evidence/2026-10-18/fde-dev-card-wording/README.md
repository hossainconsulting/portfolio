# fde-dev home lab card wording

Date/time and timezone: 18 Oct 2026, Australia/Sydney.
Requirement or issue: Hemayet approved in chat (18 Oct 2026): "Approved, use the Python-only fde-dev wording." Draft and review are in the private `brain` repository, `evidence/2026-10-18/portfolio-fde-alignment/`.
Environment/target: `public/index.html`, fde-dev card in the Home lab section.
Starting state: "CentOS Stream 9 · Contract delivery for recruiters and hiring managers" and "Environment for web, Python and JavaScript work delivered on contract to recruiters and hiring managers, and for forward-deployed engineering practice. No projects are published from it yet."
Changes made: label changed to "CentOS Stream 9 · Forward deployed engineering practice"; body changed to "Practice environment for Python, APIs, integrations and Linux deployment (Bash, PowerShell 7, Ansible), working toward forward deployed engineering. No projects are published from it yet." Removes wording that could read as paid contract work and matches the Python-only, Linux-only FDE roadmap. "Set up" status unchanged.
Validation procedure/command: `git diff --check` (clean); `npm run check` (syntax checks passed; prompt-sync skipped because the private acquisition-system source is not checked out); Python `html.parser` parse of `public/index.html` (no error). Only the intended card lines differ.
Observed result and exit status: as above, exit 0.
Supporting files: none.
Limitations / checks not run: not deployed. Per README.md the release is a manual Wrangler deployment that needs an explicit publication request; the live site still shows the old wording until then. Rendering not checked in a browser. `AGENTS.md` lab pointer still says fde-dev is "for contract delivery to recruiters and hiring managers"; it mirrors the private vm-lab AGENTS.md and was left unchanged.
Related issue/PR: see the pull request for branch `claude/fde-dev-card-wording-2026-10-18`; brain PR #97.
