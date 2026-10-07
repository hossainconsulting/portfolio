# Portfolio PR #2 guidance conflict resolution

Date: 7 October 2026 (Australia/Sydney).
Target: hossainconsulting/portfolio, draft PR #2, claude/environment-layers-ykadkb.
Environment: local Windows checkout .codex/portfolio-pr1-conflict; no live service operations.

## Starting state and resolution

Working tree clean. GitHub CLI reported draft true, CONFLICTING and head 672dbe80102ce1e8d2ada5ad1ffa68f884250fba. Fetched main 205b34d99fa0adfc2e4021b23e3bfcd223eec14b, then merged it into the existing PR branch without rewriting history. CLAUDE.md was the only conflict (add/add).

Kept main's @AGENTS.md directive and incorporated useful original PR guidance: manual release, verification before live claims, simple frontend and simulation disclosure. Updated structure to reflect merged Worker/widget source and SDK dependency. Replaced superseded domain assertions with references to README's dated September observations and explicit current-state uncertainty. Kept original read-only settings JSON unchanged. Main history is inherited, not implementation work performed here.

## Actual verification

- .claude/settings.json parsed using Get-Content -Raw | ConvertFrom-Json: success.
- Test-Path verified all nine referenced instruction/source/config paths exist.
- git diff --name-only --diff-filter=U: no output after resolution, exit 0.
- git diff --cached --check: passed, exit 0.
- Reviewed resolved guidance against current README, source/config paths and original guidance; final net changes before evidence were only CLAUDE.md and .claude/settings.json.
- Reviewed new guidance/evidence for secrets and personal/customer data: none introduced.

## Limitations

PR remains draft; no deployment, secret or dashboard changes, external calls, browser tests or runtime permission-enforcement tests. No source code changed, so application tests were not rerun. Domain observations are historical repository records, not current network checks. Widget launch prerequisites and live status remain unverified.

Related PR: https://github.com/hossainconsulting/portfolio/pull/2
