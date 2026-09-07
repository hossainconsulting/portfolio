# 4. Script: video 1

**Title:** Salesforce Admin exam: 5 security questions people fail (real org)
**Audience:** Priya (new admin, exam candidate). Dave can skip this one.
**Length:** about 11 minutes. **Org:** SunRise Solar Solutions (fictional).
**Format:** screen recording with voice. No face. Cursor visible.
Captions burned in.

Passes `presence/writing-checklist.md`: no fillers, one opinion, every
claim shown on screen.

---

## Hook (0:00–0:30)

*[Screen: a Salesforce record. A user called "Priya Test" is logged in.
The Opportunity "Henderson residence, $38,400" is visible.]*

This user can see a thirty-eight thousand dollar opportunity she should
not be able to see. And I am going to change one setting, and it will
disappear, and then I am going to change a different setting and it will
come back, and by the end of this video you will know which one of those
two settings the exam is asking about, because that is the question most
people get wrong.

*[Open loop: which setting. Do not name it yet.]*

Five questions. Real org. Not definitions. Let's find the first one.

## The problem (0:30–1:30)

*[Screen: the exam guide, Security section highlighted.]*

The Administrator exam guide gives the security model its own section, and
every study guide tells you it is the one people fail. I think they fail it
for one reason: they learn it as four words. Profile, permission set, role,
sharing rule. Four definitions. And then the question says "a user in the
Sales role can see a record owned by someone in Support, why?" and the four
definitions do not help, because the question is not about definitions. It
is about what happens.

So this is the same five things, but as things that happen to a record.

*[Screen: back to the org. Priya Test still logged in.]*

## The solution: five questions, five settings (1:30–9:00)

### Question 1: "Why can this user see this record?" (1:30–3:00)

*[Screen: Setup, Sharing Settings, Opportunity organisation-wide default.]*

Organisation-wide default for Opportunity is Public Read Only. That is why.
Not her profile. Not her role. Watch.

*[Change OWD to Private. Save. Switch to Priya Test. Refresh. Record gone.]*

Gone. That is the setting the hook was about, and the exam question that
goes with it: the org-wide default is the floor. Nothing below it can open
access; everything else can only add.

### Question 2: "Why can she still see her own?" (3:00–4:15)

*[Screen: Priya Test's own opportunity, still visible.]*

Because ownership is not sharing. The owner always sees the record, and so
does everyone above them in the role hierarchy, if the hierarchy is turned
on for that object.

*[Sharing Settings: untick "Grant Access Using Hierarchies" for a custom
object; show the manager losing access.]*

The exam asks this as "the manager cannot see the team's records, what
changed?" That box.

### Question 3: "The profile gives Read on Opportunities. Why can't she open one?" (4:15–5:45)

*[Screen: profile, object permission Read ticked. Then a record she is not
shared on. Insufficient privileges.]*

Object permission says what she is allowed to do to records she can see.
Sharing says which records she can see. Two different gates, and the exam
loves putting them in one sentence.

*[Add a sharing rule: role Sales sees Support's opportunities. Record
appears.]*

### Question 4: "We added a permission set. Why did nothing change?" (5:45–7:15)

*[Screen: permission set with Edit on a field. Assign to Priya Test. Field
still read-only on the page.]*

Because the field is read-only on the page layout, and page layout wins
for display. Or the field-level security on the profile says Read and the
permission set says Edit, in which case the permission set wins, because
permissions are additive. Two answers, and the exam asks which.

*[Fix the layout. Field editable.]*

### Question 5: "Who can see the report?" (7:15–9:00)

*[Screen: a report on all opportunities, run as Priya Test. Rows missing.]*

Reports respect sharing. She sees the rows she can see. The folder
controls whether she can open the report at all; the sharing model
controls what is in it. People who fail this one think a shared folder
shares the data.

*[Share folder. Report opens. Rows still missing. OWD back to Public Read
Only. Rows appear.]*

## Three insights worth remembering (9:00–10:15)

*[Screen: the three lines as text on the site palette.]*

One. Org-wide default is the floor. Everything else only adds access.

Two. Object and field permissions are about what you may do. Sharing is
about which records you may see. Different gates.

Three. When a question says "nothing changed", look at the page layout and
the folder before you look at the permission set.

My opinion, and you can disagree in the comments: the exam is not testing
whether you know the four words. It is testing whether you have watched a
record appear and disappear. If you have never done it, do it tonight in a
Developer org. It takes twenty minutes.

## CTA (10:15–10:40)

One thing. The org I just used, the seed data, the security audit document
and every setting I changed are in a public repository, link in the
description. Open it and repeat the five questions yourself. That is the
whole ask.

## Next video tease (10:40–11:00)

Next Tuesday: profiles, permission sets and roles on one record, and the
one diagram that makes the three of them stop overlapping in your head.
Same org, same user.

*[End screen: next video card left, the repository link right. No
subscribe animation.]*

---

**Disclosure line, in the description and in the first pinned comment:**
Simulated engagement: SunRise Solar Solutions is a fictional company.
Real configuration, no real customer data.
