# 6. Carousel: the first week in an unmaintained Salesforce org

**Slides:** 10
**Topic:** the seven checks to run in the first week of inheriting a Salesforce org nobody has maintained
**Audience:** owners and operations managers of trades and service businesses who have just lost their admin, or never had one, and the new admin walking in
**Outcome:** find the three or four problems that cost money before touching anything
**Platform:** LinkedIn PDF carousel, square, one Canva template
**Source:** the first fortnight of the SunRise Solar simulation (dormant user review, licence table, duplicate merge, lead assignment rule, interim custodianship)

**Layout rules for the whole deck:** one headline per slide, at most 35 words of supporting text, a large slide number bottom-left, the site URL small bottom-right. Off-white background, dark ink, one accent colour (the portfolio green, `#1B4D3E`). No stock photos. Where a slide shows data, it is a screenshot of the actual deliverable table.

---

| Slide | Headline | Supporting text | Visual / layout |
|---|---|---|---|
| **1** | **Nobody has touched your Salesforce org in six months. Here's the first week.** | Seven checks. No changes. Each one finds money or risk. From a simulated engagement at a 47-person solar installer. | Headline fills the slide. Small line at the bottom: "Simulation, disclosed. Real org, real queries." |
| **2** | **Why check before you change** | An unmaintained org has been quietly making decisions: who gets leads, who has access, how many customers exist. Change any of it blind and you break something nobody documented. | Two columns: "What you think you have" / "What the org is actually doing". Three short mismatched pairs. |
| **3** | **1. Who can log in, and who never has** | Sort Users by Last Login. Blank is louder than stale. Two of four paid licences here were held by people who had never signed in. | Screenshot of the licence table from the dormant user review. Circle the two "Never" rows. |
| **4** | **2. What you're paying for versus using** | Company Information shows every licence type. Salesforce: 4 of 4 used. Platform: 0 of 6. The seats for the next two hires were already bought. | Two big fractions side by side: 4/4 and 0/6. |
| **5** | **3. How many customers you actually have** | Count Accounts. Then count distinct phone numbers and addresses. Dashboard said 301. Real households: 41. Every metric on top of that number was wrong. | Large "301" crossed through, "41" beside it. Caption: "250 duplicate records absorbed, all logged". |
| **6** | **4. Where leads go when they arrive** | Read the lead assignment rules against a map. Territory boundaries moved; the rule did not. Leads were landing with a rep who had left the region. | Simple map outline of NSW with two regions, an arrow going to the wrong one. |
| **7** | **5. Who owns the admin login** | If the last admin left, who holds the keys? Write down the answer. If it is "nobody" or "the old admin's personal email", that is the first fix, and it is reversible. | A single key icon. Text: "Interim custodian: ________". |
| **8** | **6. What has been promised outside the org** | Before correcting a wrong number, search reports, dashboards, email templates and files for where it has been quoted. Cleanup is fine. Restatement needs a conversation. | Screenshot of the exposure-check table: Reports 31, Dashboards 2, Templates 28, references: none. |
| **9** | **The week-one checklist** | ☐ Blank last logins ☐ Licence table ☐ Real customer count ☐ Assignment rules vs reality ☐ Admin custodian named ☐ Where wrong numbers were quoted ☐ Nothing changed yet | Seven checkboxes, large, one per line. This is the slide people screenshot. |
| **10** | **Want this run on your org?** | Thirty minutes, together, on a screen share. No changes made, no pitch. You leave with the list. Every check above is documented in the repo, with the queries. | Portfolio URL large. "Comment 'week one' or DM." Small: "portfolio.hossainconsulting.com". |

---

## Notes on each slide

- **Slide 1** promises "seven" and the deck delivers seven: six numbered checks plus the rule "change nothing", which is check zero and appears on slides 2 and 9. If that reads as a cheat, retitle to "six checks and one rule".
- **Slides 3 to 8** each stand alone. A reader who stops on slide 5 has a complete, useful idea.
- **Slide 9** is the save-and-share slide. Keep the checkboxes literal so it works as a printed sheet.
- **Slide 10** offers the smallest possible next step and repeats the disclosure once more in the caption, not on the slide.

## Caption for the LinkedIn post that carries the carousel

Seven checks for the first week in a Salesforce org nobody has maintained. No changes, just finding out what it has been doing on its own.

From a simulated engagement (fictional company, real org): two of four licences held by users who never logged in, a customer count of 301 that was really 41, and a lead rule pointing at a region a rep had left.

Swipe. Slide 9 is the checklist. The write-ups and queries behind every slide are in the repo, linked in the first comment.

If your org has been sitting since your last admin left, comment "week one" and I'll run the list with you.
