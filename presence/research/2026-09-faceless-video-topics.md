# Faceless video topic research, September 2026

First run of `video-topic-research.md`. Audience: both segments. Signals
gathered 06/09/2026 from web search and the nine repositories. Anything
without a link is marked as an assumption.

**Disclosure for every topic that names a project company:** Simulated
engagement: fictional company, real config, no real customer data.

## What the signals say

- **Admin interview and exam content clusters on five things:** profiles
  versus roles versus permission sets, Flow versus Apex, data quality,
  security model, performance at volume. The scenario-based interview
  guides for 2026 all lead with those (4dayweek.io, S2 Labs, KORE1,
  Hirist, sfapps.info, Srijan Institute). Exam guides name security as
  the most heavily weighted section and analytics as the one beginners
  underestimate (Salesforce Ben, S2 Labs, CertifHub, Cloud Analysts).
- **The tradie CRM conversation in Australia is a product comparison:**
  ServiceM8, Tradify, Fergus, sometimes GoHighLevel on top (SellStack,
  LUNA Systems, ServiceScale, all 2026). None of that content answers
  "when do you outgrow those and what does Salesforce cost a 20-person
  business", which is the question a consultant actually gets asked.
- **Agentforce content is mostly Salesforce's own** (admin.salesforce.com
  "Agentforce Decoded", Trailhead) plus generic tutorial channels. Almost
  none of it shows a guardrail failing on screen. The Meridian Appliance
  Care incident with two seeded root causes is unusual material.
- **Faceless tutorial channels in technology and education** are the
  segment guides point at for RPM and for evergreen search
  (EarnifyHub, 2026). Screen-recorded org walkthroughs fit that exactly.

## Scored table

Scores 1 to 10. Competition: 10 means low. Total out of 60.

| # | Topic | Aud. | Urg | Freq | Act | Comp | Ease | Total |
|---|---|---|---|---|---|---|---|---|
| 1 | When a trades business outgrows ServiceM8 or Tradify, and what Salesforce actually costs at 20 staff | T | 8 | 8 | 8 | 8 | 8 | **48** |
| 2 | The security questions people fail on the Admin exam, shown in a real org | A | 8 | 9 | 8 | 5 | 8 | **47** |
| 3 | An Agentforce agent that must never generate a coverage answer: the retrieved-action pattern and the incident when it broke | A | 7 | 6 | 7 | 9 | 7 | **46** |
| 4 | After-hours calls: what an AI agent may book, and the one thing it must escalate | T | 8 | 8 | 7 | 8 | 7 | **45** |
| 5 | Profiles, permission sets, roles: the one diagram, then the org | A | 6 | 10 | 7 | 3 | 9 | **44** |
| 6 | 340 duplicate accounts: a de-duplication plan the sales team will not sabotage | A | 7 | 8 | 6 | 7 | 7 | **44** |
| 7 | The lead assignment rule that stopped matching reality when territories moved | A | 7 | 7 | 6 | 8 | 7 | **43** |
| 8 | Two things called "entitlement": warranty cover versus SLA clock | A | 6 | 5 | 6 | 9 | 8 | **43** |
| 9 | Counting self-service deflection before go-live, not after | A | 7 | 5 | 6 | 9 | 7 | **42** |
| 10 | Enquiries never quoted, jobs never invoiced: where a 12-person plumber leaks money | T | 8 | 8 | 7 | 6 | 6 | **42** |
| 11 | Regulated response deadlines: a milestone with a consequence beyond a red dashboard | A | 7 | 5 | 6 | 9 | 7 | **41** |
| 12 | Data migration with a rehearsed rollback (an acquisition, 6 years of organic growth) | A | 6 | 5 | 6 | 8 | 6 | **40** |
| 13 | A customer who exists three times: identity resolution in Data Cloud | A | 6 | 5 | 5 | 8 | 6 | **39** |
| 14 | Discovery with stakeholders who disagree: the 20-minute method | A | 6 | 7 | 5 | 6 | 8 | **39** |
| 15 | Notes to invoice without letting the model do arithmetic | T | 5 | 6 | 5 | 9 | 6 | **38** |

Willingness-to-act scores for topics 1, 4, 10 and 15 are **assumptions**:
there is comparison-article traffic but no direct evidence trades owners
click through to a consultant. Validation is in the top-3 section.

## Topic cards

### 1. When a trades business outgrows ServiceM8 or Tradify
- **Problem:** the job-management app that was perfect at 5 staff is now three apps, a spreadsheet and a group chat at 20. Owners ask "is Salesforce for us, and what would it cost?"
- **Who:** owners and office managers, 10 to 50 staff, Sydney and regional NSW.
- **Why it matters:** a wrong platform decision at this size costs a year.
- **Current answer:** comparison articles that stop at the apps built for 1 to 20 staff. Nobody on the Salesforce side writes for this reader.
- **Inadequate because:** the honest answer is often "not yet", and only someone with nothing to sell in that moment can say it.
- **Signals:** 2026 comparison pages from SellStack, LUNA and ServiceScale exist and rank; none mention the outgrowing question. Assumption on click-through.
- **Faceless angle:** a narrated decision tree over a diagram, then a 60-second Short: "three signs you have outgrown your job app".

### 2. The security questions people fail
- **Problem:** the Admin exam weights security heavily and candidates learn it as definitions, not behaviour.
- **Who:** exam candidates, new admins, and the recruiters who screen them with scenario questions.
- **Why it matters:** it is the section that decides passes, and the interview question that decides offers.
- **Current answer:** written study guides and definition videos.
- **Inadequate because:** none show a record becoming visible or invisible as a setting changes.
- **Signals:** Salesforce Ben, S2 Labs and CertifHub all single out security; every 2026 interview-question list opens with profiles versus roles.
- **Faceless angle:** screen recording, one user, one record, change one setting, watch what happens. Series of five.

### 3. The coverage answer that must never be generated
- **Problem:** an agent that "knows" whether an appliance is covered will eventually say yes when the answer is no.
- **Who:** admins building their first Agentforce agent; Agentforce Specialist candidates.
- **Why it matters:** the design rule (retrieved action, never generated) is the difference between a demo and a deployable agent.
- **Current answer:** Salesforce's own tutorials show the happy path.
- **Inadequate because:** nobody shows the failure. The Meridian incident with two seeded root causes does.
- **Signals:** Agentforce Decoded series and Trailhead dominate; the incident angle has no competition. Assumption on volume.
- **Faceless angle:** the transcript of the agent getting it wrong, then the action that fixes it, on screen.

### 4. After-hours calls and the one thing the agent must escalate
- **Problem:** the phone rings at 7pm, nobody answers, the job goes to the next plumber.
- **Who:** trades owners; the after-hours agent in `home-services-ai` is built for exactly this.
- **Why it matters:** missed calls are lost revenue, and a gas leak booked as a routine job is a liability.
- **Current answer:** voicemail, an answering service, or a generic chatbot.
- **Inadequate because:** generic bots do not know when to stop.
- **Signals:** every tradie CRM article lists "missed enquiries" as the first pain. Assumption on action.
- **Faceless angle:** a text-on-screen replay of the agent handling a booking, then refusing to handle a gas leak and escalating.

### 5. Profiles, permission sets, roles
- **Problem:** the most-asked admin question, still answered badly.
- **Who:** everyone in segment 1.
- **Signals:** first question in every 2026 interview list.
- **Why still worth it:** competition is high but frequency is the highest of any topic; one clear diagram video ranks for years.
- **Faceless angle:** one diagram, then the org proving it.

### 6. 340 duplicate accounts
- **Problem:** duplicates nobody will merge because every rep owns some.
- **Signals:** data quality is one of the five interview clusters. Source: `sunrise-solar-internship`.
- **Faceless angle:** the matching rule, the duplicate rule, and the report that makes ownership visible.

### 7. The lead assignment rule that stopped matching reality
- **Problem:** territories moved, the rule did not, and a quarter was missed with no explanation.
- **Signals:** troubleshooting is an interview cluster. Source: `sunrise-solar-internship`.
- **Faceless angle:** debugging on screen, from the report that shows the symptom to the rule that causes it.

### 8. Two things called entitlement
- **Problem:** warranty cover and SLA clock share a word and get conflated in the data model.
- **Signals:** low competition; a real exam-topic confusion. Source: `agentforce-meridian-care`.
- **Faceless angle:** the ERD, then the two objects side by side.

### 9. Counting deflection before go-live
- **Problem:** "deflection" gets reported after launch with no agreed definition.
- **Signals:** low competition, board-level relevance. Source: `agentforce-meridian-care`.
- **Faceless angle:** the definition, the report, then the launch.

### 10. Where a 12-person plumber leaks money
- **Problem:** enquiries never quoted, jobs never invoiced, calls missed.
- **Signals:** the top three pains in every tradie CRM article. Source: `home-services-ai`.
- **Faceless angle:** narrated checklist with the three numbers to look up this week.

### 11. A milestone with a consequence
- **Problem:** regulated response deadlines tracked in a spreadsheet.
- **Signals:** low competition. Source: `kurrajong-energy`.
- **Faceless angle:** entitlement process, milestone, the escalation firing on screen.

### 12. Migration with a rehearsed rollback
- **Source:** `tradelink-group`. Low competition, moderate frequency. Faceless angle: the rehearsal, then the rollback, timed.

### 13. A customer who exists three times
- **Source:** `coastline-retail-group`. Data Cloud candidates only; niche but uncontested. Faceless angle: identity resolution rules and the unified profile.

### 14. Discovery with stakeholders who disagree
- **Source:** every `deliverables/` folder. Craft pillar. Faceless angle: narrated method over a stakeholder map.

### 15. Notes to invoice without arithmetic
- **Source:** `home-services-ai`. Strong for the AI audience, weaker for trades owners. Faceless angle: the model's output next to the rates table.

## Top 3 to create first

1. **Outgrowing ServiceM8 or Tradify (topic 1).** Highest total, lowest competition among client-facing topics, and the only one where the honest answer builds trust with a client audience. Validate: answer two threads in Sydney trades Facebook groups and r/smallbusiness with the decision tree in text, and post it as a LinkedIn poll ("what are you running your jobs on?"). If either gets replies from trades owners within a week, record the long-form. If not, keep it as a Short only.
2. **Security questions people fail (topic 2).** Highest frequency with strong evidence, and the format (change a setting, watch a record) is unique on screen. Validate: publish one 60-second Short of a single setting change and watch YouTube search traffic for seven days. Search impressions from "salesforce admin exam" terms confirm the series.
3. **The coverage answer that must never be generated (topic 3).** Uncontested, and it demonstrates the exact rule the Agentforce Specialist exam tests. Validate: post the incident write-up as a LinkedIn document post and a Reddit answer in r/salesforce when someone asks about agent hallucination. Comments from admins building agents confirm the video.

## Not chosen, and why

- Certification "I passed" posts: high frequency, zero opinion, no problem solved.
- Generic "what is Agentforce" explainers: fully owned by Salesforce's own channels.
- Claude and MCP tutorials for developers: strong AI-pillar content but neither target audience; keep for the AI section of the hub, not the channel.

## Sources

- 4dayweek.io, S2 Labs, KORE1, Hirist, sfapps.info, Srijan Institute: 2026 Salesforce admin interview question lists.
- Salesforce Ben, S2 Labs, CertifHub, Cloud Analysts, TrailblazePrep: 2026 Administrator exam guides.
- SellStack AI, LUNA Systems, ServiceScale: 2026 "best CRM for tradies Australia" comparisons.
- admin.salesforce.com "Agentforce Decoded" (2026); EarnifyHub faceless channel guide (2026).
