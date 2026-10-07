# Portfolio PR #1 README conflict resolution

Date: 7 October 2026 (Australia/Sydney).
Target: hossainconsulting/portfolio, draft PR #1, claude/new-session-ky3slc.
Environment: fresh Windows clone at .codex/portfolio-pr1-conflict; no live service operations.

## Starting state and change

GitHub CLI reported draft true, CONFLICTING and head 78d917d94165d84cd45ffaba4ba1209ca6c693f2. Clone was clean. Read AGENTS.md, CLAUDE.md, EVIDENCE.md and both README versions. Merged origin/main at 3f9ec0fdfb95dc76c33a4c3bdefa57854324d4e7 into the PR branch without rewriting history. README.md was the sole conflict; public/index.html auto-merged.

Preserved main's portfolio positioning, later domain observations, manual release process, simulation disclosure and contributor credits. Added a draft widget section describing the existing source, Worker secret names, lead/transcript logging and delivery, local checks and unresolved launch requirements. Corrected the static-only technology description. Did not carry forward older domain observations or unsupported model-behaviour claims. Runtime widget code remains the original PR implementation; main's homepage updates are inherited through the merge.

## Actual validation

- npm run check: exit 0; syntax checks for src/index.js and public/widget.js passed. Prompt-sync explicitly SKIPPED because the private authored source is absent; no successful comparison is claimed.
- PowerShell Markdown destination extraction and Test-Path: the one relative README link exists.
- git diff --name-only --diff-filter=U: empty after resolution, exit 0.
- git diff --cached --check: passed, exit 0.
- Reviewed resolved README and net diff scope against main. Reviewed new evidence and README for secrets and personal/customer records: no actual keys, webhook credentials or visitor data introduced. Existing public author links remain.

## Limitations

Draft state retained. No deployment, secret configuration, Cloudflare rule changes, live model calls, webhook contact, browser tests or replay of historical mock tests. API/model compatibility and working delivery are unverified. Rate limiting, required secrets, privacy publication and live verification remain launch prerequisites from the PR; their current external state was not checked. Documentation-only conflict resolution does not establish production readiness.

Related PR: https://github.com/hossainconsulting/portfolio/pull/1