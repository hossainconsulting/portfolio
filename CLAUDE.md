@AGENTS.md

# Portfolio project guidance

Read AGENTS.md, EVIDENCE.md and README.md before changing this repository. Preserve dated evidence and unrelated work. Distinguish source configuration, historical observations and verified live behaviour.

## Structure

The portfolio uses plain HTML and CSS under public/, served by Cloudflare Workers static assets. The merged CONCIERGE source adds public/widget.js, src/index.js for POST /api/chat, src/system-prompt.js and an Anthropic SDK dependency. Keep the frontend simple; do not add a framework or build tooling without a concrete requirement. The older description of no dependencies or server code no longer matches the source.

wrangler.jsonc configures the portfolio Worker, public/ assets and the ASSETS binding. Preserve workers_dev: false and preview_urls: false unless a requested change requires otherwise.

## Publication and verification

The documented release process is manual Wrangler deployment. A Git commit, push or merged PR is not evidence that a change is live. Deployment requires an explicit request covering publication. Follow README.md for account checks, release steps, homepage comparison, 404 responses and headers. Verify the actual public result before reporting a release complete.

README.md records domain observations from 16 September 2026: HTTP redirected to HTTPS, and the apex returned a separate response rather than the older 403. These are dated observations, not a current check or proof of dashboard configuration. Recheck behaviour before proposing domain changes; do not carry forward the superseded 19 August claims as current. Apex hosting is outside this repository.

For CONCIERGE, source checks do not establish a working live model or lead delivery. Verify rate limiting, required secrets, privacy publication and end-to-end behaviour before launch. Do not print keys, webhook credentials, private transcripts or visitor contact data into shared evidence. .dev.vars and authentication material must remain out of Git.

## Claims and disclosure

Preserve visible simulation disclosure. The Salesforce companies listed in README.md are fictional; do not describe their projects as paid client delivery. Home Services AI is a self-directed engineering project. Planned and in-progress work must not be represented as complete.

Preserve dated credential and authorship context; do not invent current status, successful tests or independent verification. Record actual checks, skipped checks and limitations in dated evidence under EVIDENCE.md.

## Local checks

For documentation, review content and relative links and run git diff --check. For widget source, npm run check runs syntax checks and a conditional prompt-source check. Report prompt-sync as skipped when the private authored source is unavailable. Select additional validation for the behaviour changed; avoid live calls or external writes merely to inspect documentation.

.claude/settings.json contains read-only shell permissions and environment-file read restrictions. Parsing the JSON does not establish runtime enforcement. Tool permissions do not authorise deployments or unrelated work.

## Recruiter-facing evidence and agent tooling

For claims about project delivery, inspect the relevant project's dated deliverables and evidence. Do not assign shipped status to unshipped work, publish unmeasured metrics or list an unearned credential. Source documents also need their dates and verification limits; they do not by themselves prove current live behaviour.

If Superpowers is used with Claude Code, keep it as user-level tooling rather than vendoring it into this repository. Installation was not checked during this conflict resolution. Apply workflows to the actual change and available checks; the older assertion that this repository has no tests or server code no longer describes its widget source and npm check command.
