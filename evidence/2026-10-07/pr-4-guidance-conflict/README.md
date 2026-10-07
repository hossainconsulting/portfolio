# Portfolio PR #4 guidance conflict resolution

Date: 7 October 2026 (Australia/Sydney).
Target: hossainconsulting/portfolio draft PR #4, claude/superpowers-agent-workflow-vlvacj.
Environment: local Windows checkout .codex/portfolio-pr1-conflict.

## Starting state and resolution

Working tree clean. GitHub CLI reported head a7c125669b30087f2a9463414acb350a1b99f73b, draft true and CONFLICTING. Merged origin/main 9a963c96ca48d6f07b0b5c3c9ae7a5bf08e77248 into the existing branch without rewriting history. Only conflict: CLAUDE.md (add/add).

Preserved current main's AGENTS.md directive and updated guidance covering manual publication, source/live distinctions, newer domain observations, widget structure, secrets and evidence requirements. Added the original PR's recruiter-facing claim discipline and user-level tooling convention, qualified without claiming plugin installation. Did not restore superseded no-server/no-dependency/no-tests or August domain assertions. Net change against main before evidence: six added guidance lines only.

## Actual validation

- Reviewed original branch guidance against main CLAUDE.md and current README/source structure.
- PowerShell Test-Path: all nine referenced instruction, source and configuration paths exist.
- git diff --name-only --diff-filter=U: empty after resolution, exit 0.
- git diff --cached --check: passed, exit 0.
- Reviewed net diff and new evidence for secrets and personal/customer records: none introduced.

## Limitations

PR kept draft by this agent; no readiness or merge action performed. No deployment, plugin installation, live domain/service checks or application tests ran. Application source is unchanged relative to main; this task is guidance-only. Main history is inherited through the merge.

Related PR: https://github.com/hossainconsulting/portfolio/pull/4
