# FDE portfolio roadmap
Date: 2026-10-18 UTC
Target: hossainconsulting/portfolio, public/index.html
Starting commit: 852e2d26f2fc09f8e34ed711b3a6ef76f1ed8835

## Requirement
Preserve existing portfolio content and add skills, tools and projects aligned with becoming a Forward Deployed Engineer across the ten domains discussed. Prioritise Linux, Bash, YAML, Ansible and Python; include PowerShell on Linux as secondary.

## Inspection
Read AGENTS.md, EVIDENCE.md, README.md, package.json and the complete homepage source through the GitHub connector.
The README and canonical URL identify https://portfolio.hossainconsulting.com/ as the portfolio. The user's supplied spelling was portfolio.husseinconsulting.com; no domain configuration was changed.
The source already describes six Linux VMs and existing Salesforce, AI and Ansible projects.
The existing deployment process is manual Cloudflare Wrangler; a GitHub push is not deployment.
No live page was fetched. Vercel lookup of the supplied address returned 404, which does not establish the public site's HTTP status.
Shell execution was unavailable: "No usable execution environment is available."

## Changes
Added one section, #fde-roadmap, immediately after recruiter guidance.
Included ten domain mappings, tools and proposed project contributions.
Included three proposed connected projects, evidence requirements and learning milestones.
Retained the existing job-search focus, project statuses, experience disclosures and credentials.
Did not interpret the ambiguous editor phrase as an established fact; VS Code and Vim appear as optional choices.

## Verification
Executed JavaScript string checks in the orchestration environment:
- Removing the inserted section and its joining newline reproduces the original homepage exactly: PASS.
- Ten domain rows: PASS.
- All homepage IDs remain unique: PASS.
- FDE section anchor exists: PASS.
- Three proposed project cards: PASS.
- Windows administration is explicitly outside the learning plan: PASS.
Reviewed inserted content for secrets, personal/customer records and unsupported proficiency claims: none introduced.
The update is static HTML and uses existing CSS classes; no executable application code or dependencies changed.

## Limitations
npm run check, HTML validator, browser rendering, responsive/accessibility checks, live link checks and deployment were NOT run.
Content is a proposed learning roadmap, not evidence that skills or projects are completed.
No live release claimed. Manual Cloudflare deployment and public verification remain necessary.
