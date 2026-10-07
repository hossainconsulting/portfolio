---
name: presence-audit
description: Audit a social or professional profile (a LinkedIn "Save to PDF" export, a GitHub profile, a YouTube About page, a Google Business Profile, or pasted bio text) against presence/brand-kit.md and presence/profiles.md, then rewrite each section for pasting. Use when the user says "audit my profile", "review my LinkedIn", "improve my bio", "is my profile consistent", or attaches a profile export.
---

# presence-audit

The 15-minute audit from `presence/linkedin-profile-audit.md`, run here.

## Inputs

- `$ARGUMENTS`: a path to the export (PDF or text) or the platform name. If a
  PDF, read it with the pdf skill or `pdftotext`.

## Procedure

1. Read `presence/brand-kit.md`, `presence/profiles.md`, and the matching
   `presence/platforms/<platform>.md`. The platform file's field table is the
   checklist.
2. Read the export. Extract every field the platform file lists. Mark each
   **missing**, **present but off-brand**, or **present and on-brand**.
3. Ask up to five clarifying questions **only** for facts the rewrite needs
   and the repositories cannot supply (dates, employers, real metrics for real
   roles). Stop and wait for answers. If the user has said "just do it",
   proceed with clearly marked `[CONFIRM]` placeholders instead.
4. For each field, in the order the platform shows them:
   - What is stopping a recruiter from messaging (one sentence).
   - What is stopping a client from trusting (one sentence).
   - The rewritten field, in a fenced block, within the character limit in
     the brand kit. Count characters and state the count.
5. Experience bullets: XYZ formula ("Accomplished X, as measured by Y, by
   doing Z"), three per role maximum, numbers from actual work. Simulated
   engagements go under Projects, never Experience, each with the disclosure
   line.
6. Skills: top three to pin, ≤ 20 to keep, list to remove.
7. Featured / pinned: three items in order.
8. Consistency check against `profiles.md`: handle, name, location, hub URL,
   headline sentence. List every mismatch.
9. End with a numbered paste order.

## Rules

- Positioning sentence is cut, never paraphrased.
- ATS keywords from the brand kit appear naturally, never as a list.
- Nothing on the profile may claim what the hub cannot back.
- Do not modify files or profiles. Output only.
