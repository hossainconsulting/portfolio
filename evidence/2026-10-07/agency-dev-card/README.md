# agency-dev card: mention the Home Services AI working copy

Date/time and timezone: 2026-10-07, Australia/Sydney.

Requirement or issue: Hemayet stated that `home-services-ai` is maintained on
`agency-dev`. The portfolio's `agency-dev` card said "No agency project is
published from it yet" and did not mention it.

Environment/target: `public/index.html` in this repository, edited locally.
Not deployed. The Cloudflare Worker was not touched.

Starting state: the card read "Workspace for agency demos, with its own scoped
GitHub deploy key. No agency project is published from it yet."

Changes made: one sentence added to the card (status stays "Set up"):
"Also holds the working copy of Home Services AI, which is still at the
planning and scaffold stage. No agency project is published from it yet."
The wording keeps the project's own stage (planning and scaffold) so the card
does not imply delivered work.

Validation procedure/command:
- `git diff --check`: exit 0.
- Served `public/` locally with `python3 -m http.server 8765 --bind 127.0.0.1`
  and fetched `/`: HTTP 200, and the new sentence was present once.
- A tag-balance check of `public/index.html` with Python's `html.parser`: no
  unclosed tags and no mismatched end tags.

Observed result and exit status: all three checks passed as described above.

Supporting files: none (no screenshot taken).

Limitations / checks not run:
- Not deployed. The release process is a manual `npx wrangler deploy`, so the
  live site shows the old text until Hemayet deploys.
- No visual or mobile-layout check; the card's existing markup was reused and
  only its paragraph text changed.
- That `home-services-ai` is maintained on `agency-dev` is as stated by
  Hemayet, not verified on the VM.

Related issue/PR: README lab lines in `home-services-ai` PR #11 and the
`vm-lab` PR #7 evidence note.

## Addendum: README lab line (2026-10-07)

On Hemayet's statement that this repository is maintained on `paperclip-dev`,
one `**Lab:**` line was added to `README.md` under the `**GitHub:**` line:
`paperclip-dev` is the Fedora Server 44 VirtualBox VM. Fedora Server 44 is the
string recorded in the `vm-lab` paperclip-dev evidence. `git diff --check`:
exit 0. README-only; this does not change the deployed site, and no deploy is
needed for it. That the portfolio is maintained on `paperclip-dev` is as
stated by Hemayet and was not verified on the VM.

## Addendum: paperclip-dev card (2026-10-07)

On Hemayet's "yes", one sentence was added to the `paperclip-dev` card in
`public/index.html`: "This portfolio site's source is also maintained from this
lab." The rest of the card (Paperclip as a systemd service, agent paused, no
business tasks run) is unchanged. Validation: `git diff --check` exit 0; local
`python3 -m http.server` fetch returned HTTP 200 with the sentence present once;
Python `html.parser` tag-balance check found no unclosed or mismatched tags.
Not deployed: the live site changes only after a manual `npx wrangler deploy`.
No screenshot taken. The statement that the portfolio is maintained on
`paperclip-dev` is as stated by Hemayet and was not verified on the VM.
