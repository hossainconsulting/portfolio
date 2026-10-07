# 8. One story, seven platform-native pieces

**Source:** the write-up below, drawn from the SunRise Solar simulation (merge log, exposure check, and the "when an approved rule breaks" SOP). It is the original post that everything else is adapted from.

---

## Original post

> **The business thought it had 301 customers. It had 41.**
>
> I'm the incoming admin at a 47-person solar installer, in a simulated
> engagement: fictional company, real Salesforce org, real records. The
> dashboard the owner looks at every Monday said 301 customers. It had said
> something close to that for a year.
>
> 301 was a record count. Amelia Martin existed eight times. "Andrew Anderson
> Residence" and "Andrew J. Anderson Residence" were two accounts with the same
> roof. Every time a customer rang from a different phone, a rep made a new
> record.
>
> The owner approved a merge rule at 10am: match on phone number, keep the
> record with the most recent won opportunity. By 11 it had failed both ways.
> 127 duplicates had no phone number at all, and half the pairs had no won
> opportunity to choose between. I told him before proceeding, in one line,
> and we rewrote it. That became a one-page SOP.
>
> Before correcting the number I searched every report, dashboard, email
> template and file in the org for where "301" had been quoted. Nowhere. So the
> fix was a cleanup, not a restatement. Outside the org I couldn't say, and I
> said so.
>
> Fifty merge groups. 250 records absorbed. 51 accounts left, 41 of them
> households. Every merge logged as it happened, except the first seven, which
> I reconstructed afterwards because I hadn't started the log yet. Salesforce
> keeps no history of the fields a merge overwrites. That is the mistake I
> would not make again.
>
> The number on the Monday dashboard is now one the owner can say out loud.

---

## 1. Instagram carousel (8 slides, square)

| Slide | Headline | Supporting text | Visual |
|---|---|---|---|
| 1 | **301 customers. Actually 41.** | How a solar business's dashboard was wrong for a year, and what fixing it took. | Big "301" struck through, "41" beneath. |
| 2 | **Records are not customers** | One person rang from three phones. A rep made three records. Do that for a year. | Three phone icons pointing at one house. |
| 3 | **The rule that broke in an hour** | "Match on phone." 127 duplicates had no phone. "Keep the latest won deal." Half had none. | Two crossed-out rule lines. |
| 4 | **Tell the approver first** | When a signed-off rule fails on real data, one line to the person who approved it. Before you continue. | A single chat bubble: "The rule failed. Here's why. Pausing." |
| 5 | **Check where the wrong number went** | 31 reports, 2 dashboards, 28 email templates, 3 files searched. "301" quoted nowhere. Cleanup, not restatement. | Four counters, all showing 0 references. |
| 6 | **Log every merge before you make it** | Salesforce keeps no history of overwritten fields. 50 groups logged. The first 7 reconstructed after. Don't be me. | A notebook with the first seven lines greyed out. |
| 7 | **The result** | 250 records absorbed. 51 accounts. 41 households. One number the owner can say out loud. | Three big numbers stacked. |
| 8 | **Simulated, disclosed, public** | Fictional company, real org, every query in the repo. Link in bio. | Portfolio URL. |

## 2. Instagram caption

Your CRM says 301 customers. It's counting records, not people.

In a simulated engagement (fictional solar company, real Salesforce org) I found the same woman eight times and "Andrew Anderson Residence" living next door to "Andrew J. Anderson Residence". After 250 merges the honest number was 41 households.

Three things I'd tell any trades owner:

1. Count distinct addresses, not records.
2. Before you fix a wrong number, find out where it's been quoted.
3. Log every merge. Salesforce won't remember what you overwrote.

Swipe for the whole story. Repo link in bio.

#tradesbusiness #salesforce #smallbusinessaustralia #solarbusiness #crm #sydneybusiness

## 3. LinkedIn post

The dashboard said 301 customers. The true number was 41.

Simulated engagement, fictional solar installer, real org. I'm the incoming admin and the owner has been quoting 301 in his Monday meeting for a year.

It was a record count. One customer with three phone numbers is three records. One roof with "Andrew Anderson" and "Andrew J. Anderson" is two. Nobody had ever counted households.

Three things from the cleanup that apply to any business on a CRM:

**The approved rule failed within the hour.** "Match on phone number" missed 127 records with no phone. When a rule someone signed off breaks on real data, that is one line to the approver before you proceed, not a paragraph in the write-up after.

**Find out where the wrong number has been quoted before you fix it.** I searched every report, dashboard, template and file. Nowhere. So this was a cleanup, not a restatement. Outside the org, I couldn't say, and said so.

**Log every merge before you make it.** Salesforce keeps no history of the fields a merge overwrites. I logged fifty groups as they happened. The first seven I had to reconstruct afterwards, because I started the log on group eight. That one is on me.

250 records absorbed. 51 accounts. 41 households. A number the owner can say out loud.

What number does your business quote every Monday that nobody has checked?

The merge log, the exposure check and the one-page SOP are in the first comment.

## 4. X thread

**1/** A solar business's dashboard said 301 customers. The real number was 41. Here's how a CRM lies to you for a year and what it took to fix. (Simulated engagement, fictional company, real Salesforce org.)

**2/** 301 was a record count. One customer, three phone numbers, three records. "Andrew Anderson Residence" and "Andrew J. Anderson Residence" were the same roof. Nobody had ever counted households.

**3/** The owner approved a merge rule at 10am: match on phone, keep the record with the latest won deal. By 11 it had failed twice. 127 duplicates had no phone. Half the pairs had no won deal.

**4/** Rule: when a signed-off rule breaks on real data, one line to the approver before you proceed. Not a paragraph afterwards. That became a one-page SOP.

**5/** Before touching the number I searched 31 reports, 2 dashboards, 28 email templates and 3 files for "301". Nowhere. So: cleanup, not restatement. Outside the org, unknown, and I said so.

**6/** 50 merge groups. 250 records absorbed. 51 accounts left, 41 households. Every merge logged as it happened. Except the first seven, reconstructed after, because I hadn't started the log. Salesforce keeps no history of what a merge overwrites.

**7/** What number does your business quote every week that nobody has checked? Merge log, exposure check and SOP are public: portfolio.hossainconsulting.com

## 5. 45-second video script

| Time | Spoken | On-screen |
|---|---|---|
| 0 to 3s | This business thought it had 301 customers. It had 41. | *301 → 41* |
| 3 to 10s | Simulated engagement, real Salesforce org. The owner's Monday dashboard said 301. For a year. It was counting records, not people. | *Records ≠ customers* |
| 10 to 17s | Same woman, eight times. Same roof, two spellings. Every new phone number, a new record. | Screen: the merge log, scrolling. |
| 17 to 20s | [cut, lean in] Then the merge rule he approved broke in under an hour. | *Broke by 11am* |
| 20 to 30s | "Match on phone." 127 had no phone. "Keep the latest won deal." Half had none. So I told him in one line, before doing anything else, and we rewrote it. | Screen: the SOP heading. |
| 30 to 38s | Then the bit people skip: I checked every report, dashboard and template for where "301" had been quoted. Nowhere. So it's a cleanup, not a restatement. | Screen: the exposure table, four zeros. |
| 38 to 43s | 250 merges, all logged. Except the first seven. Salesforce doesn't remember what a merge overwrites. Start the log on merge one. | *Log first. Merge second.* |
| 43 to 45s | Everything's in the repo. Link in bio. | *portfolio.hossainconsulting.com* |

**Caption:** 301 customers on the dashboard. 41 in reality. Count households, not records. Log before you merge. Check where the wrong number went before you fix it. Simulated engagement, real org, repo in bio.
#salesforce #tradesbusiness #crm #smallbusinessaustralia #dataquality

## 6. Email newsletter

**Subject:** The dashboard said 301. The answer was 41.

Hi,

One story this week, from the solar installer simulation, and one thing to do with it.

**The story.** The owner's Monday dashboard had said "301 customers" for about a year. It was a record count. The same woman existed eight times. Two spellings of one address were two accounts. Every time someone rang from a new number, a rep made a new record.

**What went wrong first.** He approved a merge rule at 10am. By 11 it had failed both ways: 127 duplicates had no phone number to match on, and half the pairs had no won opportunity to pick a survivor with. I sent him one line, paused, and we rewrote it. That is now a one-page SOP: when an approved rule fails on real data, the approver hears about it before you proceed.

**What I did before fixing the number.** Searched every report, dashboard, email template and file for where "301" had been quoted. Nowhere. That makes it a cleanup rather than a restatement. Outside the org I could not say, and told him so.

**The result.** Fifty merge groups. 250 records absorbed. 51 accounts, 41 households. Every merge logged as it happened, except the first seven, which I had to reconstruct because I started the log late. Salesforce keeps no history of what a merge overwrites. That is the mistake I would not repeat.

**The one thing to do.** Ask your business how many customers it has. Then count distinct addresses in whatever system holds them. If the two numbers are more than 10% apart, you have a duplicate problem, and you should find out where the bigger number has been quoted before you correct it.

The merge log, the exposure check and the SOP are here: [repo link]. Fictional company, real org, all of it public.

Reply with your two numbers if you want a second opinion. I read every reply.

Hemayet

## 7. Five quote posts

Each is one line on a plain card, the portfolio green on off-white, name and URL small at the bottom.

1. **"Your CRM counts records. You wanted customers. Those are different numbers."**
2. **"When an approved rule fails on real data, that is a message to the approver. Before you proceed, not in the write-up afterwards."**
3. **"Before you correct a wrong number, find out where it has been quoted. Cleanup is fine. Restatement needs a conversation."**
4. **"Salesforce keeps no history of the fields a merge overwrites. Start the log on merge one."**
5. **"301 on the dashboard. 41 in reality. The gap was a year of nobody asking."**

---

## What changed between versions, and why

| Version | Hook | Length | Tone | Structure | Call to action |
|---|---|---|---|---|---|
| Instagram carousel | Visual number contrast | 8 slides, under 30 words each | Punchy, imperative | One idea per slide, checklist-like | Link in bio |
| Instagram caption | Second person, "your CRM" | About 110 words | Direct, listy | Three numbered takeaways | Swipe, link in bio |
| LinkedIn | The number, then the disclosure | About 300 words | Reflective, professional, first person | Story, three bolded lessons, result, question | A question, link in first comment |
| X thread | Same number, compressed | 7 posts, under 280 characters each | Clipped, numbered | One fact per post, lesson mid-thread | Question plus URL in the last post |
| Video | Spoken number contrast | 45 seconds | Conversational, fast | Story, cut, lesson, result | Link in bio |
| Newsletter | Subject line as the hook | About 350 words | Warm, personal, one reader | Story, mistake, method, result, one action | Reply with two numbers |
| Quote posts | The line is the hook | One sentence | Aphoristic | None | None; the URL is on the card |

The disclosure appears in every version that names the company. The "first seven merges" mistake appears in every long version, because the admission is what makes the rest believable.
