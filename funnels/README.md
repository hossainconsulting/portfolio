# Inbound funnel: checklist, booking, email follow-up

Built 2026-10-14. Everything here is a draft for Hemayet to approve. Nothing is deployed.

## The funnel

```
Social / Google / links hub / video
        |  (UTM-tagged link)
        v
/workflow-snapshot  --opt-in + consent tick-->  POST /api/optin --> LEAD_WEBHOOK_URL (email platform)
        |                                                   |
        v                                                   v
/thanks (PDF download + book CTA)                  Sequence 1: six emails over 14 days
        |                                                   |
        +----------------> /book --> Calendly "20-minute intro call"
                                         |
                       Sequence 2 (Calendly confirmation + reminders)
                                         |
                       Sequence 3 (after call: snapshot, no-show, quote follow-up)
```

Two entry doors: cold visitors take the checklist (low commitment), warm visitors go straight to `/book`.

## What was built

| Path | File | Purpose |
|---|---|---|
| `/workflow-snapshot` | `public/workflow-snapshot.html` | Landing page and opt-in with consent box |
| `/thanks` | `public/thanks.html`, `thanks.js` | Confirmation, PDF link, book CTA (noindex) |
| `/book` | `public/book.html` | Booking page linking to the existing active Calendly event |
| `/privacy`, `/terms` | `public/privacy.html`, `terms.html` | Privacy Policy and Terms/Acceptance (email consent, acceptable use) |
| PDF | `public/downloads/enquiry-leak-checklist.pdf` (source in `funnels/source/`) | The lead magnet, 2 pages |
| API | `src/index.js` `handleOptin` | Validates, honeypot, consent required, forwards to webhook |
| Emails | `funnels/emails/01..03` | 3 sequences, copy ready to paste |
| `/audit-score` | `public/audit-score.html`, `audit-score.js` | 2-minute self-scoring quiz across six areas. Runs in the browser, collects nothing |
| Policy | `funnels/client-tools-and-payments-policy.md` | Clients own and pay for all third-party tools; they pay Hossain Consulting only its own fees |
| Audit kit | `funnels/audits/` | Six scored audit rubrics, one-page client report template, delivery rules |

The offer matches your active Calendly event text: free 20-minute call, free one-page snapshot with up to 3 quick wins within 3 business days, written scope and fixed quote (+GST) before any project.

## You must do before this goes live

1. **Pick the email platform** (see options below) and create a webhook or automation that receives the `optin` JSON, adds the contact with a "consented" tag and starts Sequence 1. Then `npx wrangler secret put LEAD_WEBHOOK_URL`. Until it is set, the form shows an error and tells people to email you. It never pretends to subscribe them.
2. **Confirm the delivery promises.** "Reply within a business day" and "snapshot in 3 business days" are the numbers in your Calendly text. Only keep them if you can meet them.
3. **Have the Privacy Policy and Terms reviewed** by a lawyer or a reliable template service. They are plain-language drafts written for Australian law (Privacy Act, Spam Act, Australian Consumer Law). They are not legal advice.
4. **Name the email provider and its data location** in the Privacy Policy once chosen (it currently says "an email delivery provider").
5. **Rate limiting.** `/api/optin` caps payload size and uses a honeypot, but has no per-IP limit. Add a Cloudflare rate-limiting rule on `/api/optin` before paid traffic.
6. **Deploy** manually with `npx wrangler deploy` after review (repository policy). Then verify: submit a test with your own address, check the webhook record, check the email arrives, check unsubscribe works.
7. **Turn on Calendly workflows** for Sequence 2 and add the call-notes question "business owner or recruiter".
8. **Postal or contact details.** Spam Act needs accurate sender identity. The emails use name, business, Sydney and your email. Add your ABN line if you prefer.

## Email platform options

| Option | Fit |
|---|---|
| Brevo (free tier) | Simplest start, webhooks and automations, AU-friendly |
| MailerLite / Kit | Good visual automations, free tiers |
| Salesforce Marketing Cloud Account Engagement | Strongest portfolio story but heavier setup, and paid |
| Make or Zapier into Gmail | Works for a handful of leads a week, weak unsubscribe handling. Not recommended past 30 contacts |

Recommendation: Brevo now. Mirror each lead into a Salesforce org later for the portfolio story.

## Metrics (measure from day one)

| Step | Healthy starting range for a cold-ish audience (assumption, not a measured result) |
|---|---|
| Landing page visit to opt-in | 20-35% |
| Opt-in to open on email 1 | 50%+ |
| Opt-in to booked call | 3-8% |
| Booked to showed up | 70%+ |
| Showed up to quote sent | 30-50% |

Track by `utm_source`. Fix the biggest drop first. Record real numbers in `evidence/` monthly. Do not publish a figure you have not measured.

## UTM convention

`?utm_source=linkedin|instagram|tiktok|youtube|facebook|google|email|video&utm_medium=bio|post|reel|short|description|nurture&utm_campaign=leak-checklist&utm_content=<post-id>`

Put the checklist link in every bio and video description. Put `/book` in the "contact" button.

## Ideas

**Lead magnets, ranked for your situation**
1. **Enquiry-Leak Checklist (built).** Low effort, fits trades, no service delivery cost.
2. **Free workflow snapshot (built as the upgrade).** Highest conversion to a call. Also your best source of real evidence and first case studies, with permission.
3. **Public-facing "enquiry path" audit.** You look at their website form, Google Business Profile and socials as a customer would, and score response paths. Fast to do, hard to fake. Offer as a Loom/video walkthrough. Add once the snapshot flow works.
4. **Quote follow-up templates pack.** Cheap to produce, good for ads.
5. **Salesforce-for-tradies one-page buyer guide.** For later, when you have a real case study.

**Hooks (first line of every post and video)**
- "Your next job went to whoever replied first."
- "20 enquiries a week, a quarter answered late. That's about $1,300 gone."
- "The quote you sent last week. Has anyone followed up?"

**Short-form video plan.** Three 30-45 second videos from one checklist section each: slow reply, silent quotes, messy handover. End with "link in bio for the free checklist". Reuse as Reels, Shorts, TikTok, LinkedIn.

**AI clone video and images: how to use them safely**
- Use an AI version of yourself only for repeatable explainers: the three hook videos, a 45-second welcome on `/thanks`, and the Day 5 email video thumbnail. Record real video for anything about your experience or opinions.
- Label it. Say "AI-generated video of me" in the caption or on-screen text. Meta, TikTok and YouTube have AI-label requirements and viewers punish hidden clones.
- Use only your own likeness and voice, from a tool whose terms allow commercial use. Check the tool's terms on voice cloning.
- Never use AI to invent testimonials, clients, results or screenshots of results. Your credibility rests on the fact that your simulations are labelled honestly.
- Images: AI is fine for abstract illustrations and thumbnails. Use real screenshots of your own builds as proof.
- Suggested tools: HeyGen or Synthesia for the avatar, ElevenLabs for voice, Canva for thumbnails and carousels. Pick one avatar tool, not three.

**Paid ads, later.** The growth roadmap on the agency site keeps paid ads, pixels and retargeting off unless Hemayet explicitly approves them, so treat this as not planned. If it is ever approved: it runs only in the client's own ad account on their card (see `client-tools-and-payments-policy.md`), or in Hossain Consulting's own account for its own marketing, with a written budget. Update the Privacy Policy and add consent before any pixel.

**Other ideas**
- Add the checklist link to the CONCIERGE chat widget's closing message.
- Add a Google Business Profile post and "Book" link pointing at `/book`.
- Add a "How I work" page with the snapshot, scope and fixed quote steps, once you have one real case study.
- Quarterly: send the list one useful email, not a pitch.

## Compliance summary (check each time you add a channel)

- Email only people who ticked the box. Keep the consent record (the webhook payload has version, page and time).
- Every marketing email: sender identity, unsubscribe link, honoured within 5 business days (aim for instantly).
- Booking an appointment is not marketing consent. Do not add bookers to the nurture list automatically.
- Keep the simulation disclosure wherever you describe your experience.
- SMS and cold outreach have separate rules. Do not use this list for either.
