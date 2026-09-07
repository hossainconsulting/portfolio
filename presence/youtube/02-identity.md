# 2. Channel identity

Niche (from the vault): Salesforce implementation and AI tooling for
Australian trades and service businesses, and the admins who build it.

## Five channel names

| Name | Why | Handle fit |
|---|---|---|
| **Hemayet Hossain · Salesforce** (recommended) | The person is the brand; matches every other profile and the schema.org entity; recruiters search the name | `@hossainconsulting`, as in `presence/profiles.md` |
| Hossain Consulting | The business name; better for the client audience, weaker for recruiters | `@hossainconsulting` |
| The Working Org | The promise in three words: a Salesforce org that works, shown working | `@theworkingorg` (would break the one-handle rule) |
| Built In Full | The mechanism as a name | `@builtinfull` (same problem) |
| Org Under Load | Signals the incident-first format | `@orgunderload` (same problem) |

Decision: use the first. One handle everywhere is worth more than a clever
name, and the entity work in `presence/seo.md` depends on it. The
alternatives become series names inside the channel ("Org Under Load" is
the incident series).

## Tagline

> Complete Salesforce builds for trades businesses, shown in full, including
> the parts that broke.

"So what?" test: a viewer knows in one sentence that they will see whole
implementations (not feature demos), for a specific kind of business (not
enterprise), and that failures are shown (not hidden). Each clause excludes
a competitor.

## Target audience persona

**Primary: Priya, 29, Salesforce administrator, Parramatta.** Passed the
Administrator exam eleven months ago and is the only admin at a 60-person
company. Frustrations: every tutorial shows a feature in an empty org, and
her org has six years of somebody else's decisions in it; she cannot tell
whether a Flow is safe to change; the security model interview question
still scares her; she wants the Advanced Administrator and Agentforce
certifications but does not know which topics actually matter in a job.
She watches at lunch on a laptop and on the train on a phone. She will
watch a 12-minute video if the first minute proves it is about a real org.

**Secondary: Dave, 46, owns a 14-person plumbing and gas business in
Penrith.** Runs jobs on ServiceM8, quotes in a spreadsheet, invoices late,
misses after-hours calls. Frustrations: every CRM video is a sales pitch;
he does not know whether he has outgrown his job app or just stopped
using it properly; he does not trust anyone who will not say "not yet".
He watches Shorts, and a long video only if a mate sends it.

Priya drives subscribers and search. Dave drives enquiries. Every video
is for Priya; every third video is made so Dave can follow it too.

## Four content pillars (no overlap)

| Pillar | What it is | What it is not |
|---|---|---|
| **1. Full builds** | One engagement, one requirement, built end to end in the org: discovery, model, config, test | Not a feature tour; always traced to a client requirement |
| **2. Exam topics in a real org** | One exam objective, demonstrated on the project org, showing the behaviour not the definition | Not a study guide; not a dump of questions |
| **3. Agents with guardrails** | Agentforce and Claude tooling: what the agent may do, what it must refuse, the eval that proves it | Not "what is AI"; not tool reviews |
| **4. Should a trades business do this** | Plain-language decisions for owners: outgrowing the job app, what it costs, what it will not fix | Not a sales pitch; the honest answer is often "not yet" |

Pillar 1 is the source; pillars 2 to 4 are cut from it. That is what keeps
them from overlapping: they are the same build seen by three audiences.

## Unique mechanism

**Published in full.** Every video's org, configuration, seed data and
decision record are in a public repository the viewer can open. The video
is the walkthrough; the repo is the proof. And the format is incident
first: the broken report, the wrong agent answer, the missed milestone
appears on screen before the fix does.

Why it is defensible and not just tone: it requires having built seven
complete engagements with documented deliverables, which took months, and
it requires being willing to show the failures. A feature-tutorial channel
cannot copy it without becoming a different channel, and a consultancy
cannot copy it without exposing client work. The disclosure that the
companies are fictional is part of the mechanism: it is what makes
publishing everything possible.
