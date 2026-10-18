---
name: commit-push-pr
description: Review authorised repository changes for errors, fix them, run appropriate checks, save evidence, commit, push and create or update a pull request. Use when the user says "Commit, Push and PR", "commit push PR", or asks to find errors and publish fixes through a PR.
---

# Commit, Push and PR

Carry authorised work through error review, validation, a remote commit and a reviewable pull request.

## 1. Inspect and establish scope

- Read applicable AGENTS.md, EVIDENCE.md and project instructions.
- Confirm the repository, established remote, base branch and working branch.
- With a shell, inspect git status, git remote -v and the current diff before editing. Preserve unrelated changes and stage explicit paths.
- With only a GitHub connector, inspect the repository and exact branch head remotely. State that local status and local checks are unavailable.
- Find any existing PR for this work. Update an open PR rather than creating a duplicate. If it is merged or closed, create a new task branch and PR from the appropriate current base.

## 2. Find errors and fix them

- Review the complete changed files and diff, relevant callers/configuration, PR comments and available checks.
- Look for correctness, broken links or anchors, accessibility, configuration errors, inaccurate claims and exposed credentials.
- Make task-related fixes. Preserve existing content when requested.
- Separate confirmed defects from suggestions and unverified risks. Do not claim a clean result from checks that did not run.
- For website changes, check keyboard access to horizontal scrolling regions and use accessible labels where needed.

## 3. Verify and save evidence

- Run the repository-required checks and focused validation appropriate to the change.
- For UI changes, inspect browser rendering, responsive behaviour and keyboard access when a browser is available.
- If a check fails, diagnose and fix it, then rerun affected checks.
- If tools or access are unavailable, record the precise limitation. Source review is not a browser test, and no CI runs is not passing CI.
- Save dated evidence following repository conventions, including actual procedures/results and checks not run.
- Review staged files and evidence for secrets and personal/customer data.

## 4. Commit and push

- Commit only reviewed, task-related changes with a descriptive message.
- Push to the established task branch. Never force-push or bypass protection.
- If using the GitHub Git-data API, build on the inspected parent tree, create the commit, and fast-forward the branch with an expected-head check.
- If the branch moved, inspect the new head and reconcile changes before retrying; never overwrite concurrent work.
- Verify the remote head equals the intended commit and read back the changed files/evidence.

## 5. Create or update the PR

- Create a PR if none is open; otherwise update the existing PR.
- Describe the final problem, resulting behaviour, validation and material limitations.
- Ensure title/body reflect any scope changes. Keep a documentation skill separate from unrelated work.
- Check mergeability and required checks when available; report conflicts or unknown status accurately.
- Do not merge or deploy merely because this skill was invoked. Those actions need existing user authorisation for that action.
- Do not send email, chat messages, applications or unrelated comments.

## Completion

Return the commit link, PR link, main fixes, actual verification and outstanding blockers. Distinguish repository publication from a live deployment.

## Portable shell sequence

Adapt to the inspected repository; these are examples, not executed evidence:

1. git status --short
2. git remote -v
3. git diff
4. Run required and focused checks.
5. git add <explicit-task-paths>
6. git diff --cached --check
7. git diff --cached
8. git commit -m "<descriptive message>"
9. git push -u origin <task-branch>
10. Inspect an existing PR or create one with a structured body or gh pr create --body-file <file>.
11. Verify the remote commit, PR and evidence.
