# 5. One idea, one complete post

**Format:** LinkedIn post
**Idea (rough notes):** Client asked for a dormant-user report, "anyone 90+ days". Org was 8 days old so the literal answer is nobody. Real finding: two of the four Salesforce licences were held by users who had never logged in, while six Platform licences sat unused. Same constraint that blocked Monday's new-hire provisioning. Recommendation: check whether the two never-logged-in users need full licences before buying more. Two hires provisioned on Monday for nothing.
**Audience:** owners and operations managers of Australian trades and service businesses
**Tone:** conversational
**Goal:** build trust, and get the reader to run one check on their own org
**Source deliverable:** `sunrise-solar-internship/deliverables/dormant-user-review.md`

---

## The post

Two of the four Salesforce licences at this business were held by people who had never logged in.

Nobody was hiding anything. Nobody had looked.

This is from a simulated engagement I'm running as the incoming admin at a 47-person solar installer. Fictional company, real org, real records. The owner asked me for a standard report: anyone who hasn't logged in for 90 days.

The org was eight days old. Answered literally, that report is empty.

The useful signal wasn't a stale last login. It was a blank one.

Two users, created the week before, had never signed in. Between them they held half the paid Salesforce licences. Meanwhile six Platform licences, the cheaper kind that covers read-mostly staff, sat at zero used.

Same week, a new hire couldn't be set up on Monday because "we're out of licences".

So the answer to "who's dormant" was nobody. The answer to "why can't we onboard Ben" was sitting in the same table.

If you run a business on Salesforce, here's the check. Ten minutes, no admin needed:

1. Setup, then Users. Sort by Last Login.
2. Anyone blank, created more than a week ago, is a question, not a licence.
3. Setup, then Company Information. Look at the licence table. If Platform shows zero used, you may already own the seats you're about to buy.
4. Ask each blank-login person's manager one question: do they work outside standard CRM records? If not, a Platform licence covers them.

Two of the three times I've done this in a small org, the licence purchase went away.

The thing I'd say to any owner: the report you asked for and the question you actually have are not always the same thing. A good admin answers the second one.

Want the exact query I ran against the user and login history tables? Comment "licence" and I'll send it. The full write-up, including the users I recommended not touching and why, is in the first comment.

---

## First comment

The full review, with the licence table and the recommendation as sent:
https://github.com/hossainconsulting/sunrise-solar-internship/blob/main/deliverables/dormant-user-review.md

All names and companies in that document are fictional. The org, the queries and the licence counts are real.

---

## Why it is built this way

| Element | Where it is | Why |
|---|---|---|
| Opening hook | Line 1 | A specific number and a small scandal. Visible before "see more". |
| Relatable problem | "we're out of licences" | The owner has heard this sentence. |
| Clear explanation | Blank versus stale last login | One distinction, stated once. |
| Actionable steps | The four-step check | Doable by an owner without an admin. Names the Setup screens. |
| Memorable takeaway | "The report you asked for and the question you actually have" | The brand position in one sentence. |
| One call to action | Comment "licence" | Costs one word. The reply starts a conversation. The link is in the comment, not the post, so the post is not deprioritised for an external link. |
| Disclosure | Paragraph 3 | In the body, before the story, as the house rule requires. |
| Removed | "leverage", "game-changer", any claim about the reader's org | Nothing the post cannot support. "Two of the three times" is a real ratio from the engagements, and is the only generalisation. |

Word count: about 330. Long for LinkedIn but each paragraph is one or two lines and the steps carry the middle.
