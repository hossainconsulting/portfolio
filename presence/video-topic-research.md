# Faceless video topic research: the prompt

A market-research prompt for finding problems worth making videos about,
with the "My details" block already filled from `brand-kit.md`. Run it in
claude.ai with extended thinking on, or use `/presence-research` in Claude
Code, which does the same thing with web search and the repositories as
evidence. Results are saved in `research/` so the next run does not repeat
them.

Faceless fits this presence: every video is a screen recording of a real
org with voice over it. No face required, no studio, and the org is the
proof.

## The prompt

```
Act as a market research strategist, content strategist and audience psychology expert for faceless videos.

Your job is to help me discover real problems, questions and interests in my niche that people care enough about to watch, engage with, and take action on through faceless video content. Do not give me generic ideas. Analyse the specific audience, their frustrations, unmet needs, current content, and what performs well on YouTube, TikTok, Instagram Reels and Shorts.

MY DETAILS

- My niche/industry: Salesforce implementation for small and mid-sized Australian trades and service businesses (plumbing, electrical, HVAC, solar, appliance repair, home services, small contact centres), plus Agentforce and Claude-based AI tooling for the same businesses.
- Target audience, two segments:
  1. Salesforce administrators, aspiring admins and consultants, mostly Australia and remote, studying for or holding Administrator, Platform App Builder, Advanced Administrator, Agentforce Specialist, Sales Cloud, Service Cloud and Data Cloud certifications. Recruiters for those roles watch the same content.
  2. Owners and office managers of trades and service businesses with 5 to 50 staff, currently running on spreadsheets, a shared inbox, a group text thread, or a job-management app they have outgrown.
- Type of faceless content: screen recordings of a real Salesforce Developer org with voice over; diagram walkthroughs; narrated checklists; text-on-screen explainers cut from written build logs.
- Problems I already know about: 340 duplicate accounts nobody will merge; a lead assignment rule that stopped matching reality when territories moved; a quarter that missed quota with no explanation anyone can produce; 12,400 support cases a month with 0% self-service deflection; customers who exist three times across POS, e-commerce and loyalty; regulated response deadlines missed because the SLA lives in a spreadsheet; enquiries never quoted and jobs never invoiced; after-hours calls going to voicemail; the two different things both called "entitlement".
- My skills/resources: four Salesforce certifications passed, five in progress; seven end-to-end simulated implementations published in full with configuration, seed data and deliverables; a Claude-based toolset (quote triage, notes-to-invoice, an MCP server, an after-hours agent, an eval harness); a Developer org per project to record in; Claude Code for research and drafting.
- Market/location: Sydney and Australia first; English-speaking remote second.
- Goal with faceless videos: build authority that gets recruiters to message and trades businesses to enquire; long-term, a channel that ranks for the questions both audiences search.

YOUR TASK

Identify 15 high-potential video topics or problems my audience is currently experiencing. For each topic, provide:
- The specific problem or question
- Who experiences it
- Why it matters
- What people currently do for it
- Why existing content or solutions may be inadequate
- Evidence or signals that it gets views or engagement
- A potential faceless video angle or format to cover it

Then score each topic from 1 to 10 for:
- Urgency: how pressing the problem is
- Frequency: how often it happens
- Willingness to take action: likelihood to watch, click or buy
- Competition: how saturated the topic is (10 = low competition)
- Ease of creating: how easy it is to produce as a faceless video
- Overall potential: total opportunity score

Rank the topics from strongest to weakest by total potential.

Finally, identify the top 3 faceless video topics worth creating first and explain why they are the best opportunities and what I should do to validate each one before investing significant time or money.

IMPORTANT
- Look for topics that are painful, recurring, specific and commercially relevant.
- Distinguish between what people complain about and what they actually take action on.
- If there is not enough information to determine willingness to take action, label it as an assumption and suggest how to validate it.
- Focus on finding valuable problems first, videos second.
- Prefer evergreen topics but include trending opportunities where relevant.
- Consider platform-specific opportunities (YouTube, TikTok, Reels, Shorts).
- Every project company I mention is fictional. Any topic that uses one must carry the line: "Simulated engagement: fictional company, real config, no real customer data."
```

## After a run

1. Save the output to `research/YYYY-MM-<slug>.md`.
2. Move the top 3 into the backlog in `content-engine.md`.
3. Validate before building: one Reddit answer, one LinkedIn poll or a
   60-second Short per topic. Only the ones that get a response become a
   long-form video.
4. Re-run quarterly, or when a certification track changes.
