# Learning course prompt templates

Ten reusable prompts for turning an AI assistant into a course designer, tutor,
examiner, or coach. Fill the bracketed placeholders before use.

Placeholders that recur across the set:

| Placeholder | Meaning |
|---|---|
| `[TOPIC]` | The subject to learn |
| `[GOAL]` | The outcome the learning should serve |
| `[LEVEL]` | Current level: beginner, intermediate, or advanced |
| `[X hours/week]`, `[X days/week]`, `[X minutes/session]` | Available study time |
| `[PROJECTS/EXAMPLES/STEP-BY-STEP]` | Preferred learning style |

---

## 1. Build My Personalized Course

> Act as an expert course designer and tutor. Create a personalized [X-week] course on [TOPIC] for my [BEGINNER/INTERMEDIATE] level. My goal is [GOAL], I can study [X hours/week], and I prefer [PROJECTS/EXAMPLES/STEP-BY-STEP] learning. Divide it into weekly modules with objectives, key concepts, exercises, mini-projects, quizzes, and clear completion criteria. Prioritize practical skills and gradually increase difficulty.

## 2. Test My Level First

> I want to learn [TOPIC] for [GOAL]. Create a 15-question diagnostic assessment covering the most important skills, and ask me one question at a time. After I answer, identify what I already know, my weak areas, knowledge gaps, what I can skip, and what I should prioritize. Then build a personalized learning roadmap based on my results.

## 3. Create My Daily Lesson

> Teach me [SPECIFIC CONCEPT] from [TOPIC] in a [20/30/45]-minute lesson for my [LEVEL]. Include a simple explanation, why it matters, a real-world example, step-by-step demonstration, guided exercise, independent challenge, 5-question knowledge check, and one practical task. Avoid unexplained jargon and keep the lesson focused on usable skills.

## 4. Build a Project-Based Course

> Design a project-based learning path for [TOPIC] that helps me achieve [GOAL]. Create 5 projects that gradually increase in difficulty. For each, include what I'll build, skills learned, prerequisites, tools needed, milestones, common mistakes, completion criteria, and an optional advanced challenge. Don't give full solutions immediately; guide me with hints when I'm stuck.

## 5. Become My AI Tutor

> Act as my one-on-one tutor for [TOPIC]. My current level is [LEVEL] and my goal is [GOAL]. Teach one concept at a time, explain it simply, then ask me a question before continuing. If I'm wrong, identify the misunderstanding, give me a hint, and let me retry instead of immediately revealing the answer. Adjust difficulty based on my responses and revisit concepts I struggle with.

## 6. Create My Study Schedule

> Create a realistic [4/8/12]-week study plan for mastering [TOPIC] and reaching [GOAL]. I can study [X days/week] for [X minutes/session]. For every session, specify exactly what to learn, practice, or build, how long each activity should take, and what outcome I should complete. Include weekly reviews, catch-up time, and a manageable workload around [WORK/SCHOOL/FAMILY].

## 7. Give Me Practice + Feedback

> Create 10 practice problems on [SKILL/CONCEPT], progressing from easy to difficult, and give them to me one at a time. After every answer, score it, explain what I did well, identify specific mistakes, show a better approach, and give me another problem targeting my weakness. Track repeated mistakes and summarize my biggest improvement areas at the end.

## 8. Create My Personal Exam

> Create a [20-question] exam on [TOPIC] at [BEGINNER/INTERMEDIATE/ADVANCED] level based on my goal of [GOAL]. Mix multiple-choice, short-answer, scenarios, practical tasks, and explain-in-your-own-words questions. Don't show answers until I finish. Then grade me 0–100 and report my strengths, weaknesses, incorrect answers, correct explanations, and topics I should review next.

## 9. Build My Memory System

> Create a spaced-repetition system to help me remember [TOPIC] long-term. Generate 30 active-recall flashcards covering fundamentals, important concepts, common mistakes, and practical applications. Format each as 'Front: question' and 'Back: concise answer + example.' Then create a review schedule for Day 1, 3, 7, 14, and 30, and quiz me before revealing answers during future reviews.

## 10. Create My Final Capstone

> Design a realistic capstone project to test whether I can actually use [TOPIC] at [TARGET LEVEL]. Make it similar to work done by a [JOB ROLE/CREATOR/BUSINESS OWNER] and include the scenario, objective, requirements, constraints, deliverables, evaluation rubric, and bonus challenges. Don't solve it for me. After I submit my work, grade it using the rubric and create a personalized improvement plan.

---

A sensible order for a new subject: 2 (diagnose), 1 or 4 (design the course),
6 (schedule it), 3 and 5 (daily lessons and tutoring), 7 (practice), 9
(retention), 8 (exam), 10 (capstone).

---

# AI tutor prompt templates

Seven prompts for one-on-one tutoring sessions: assessment first, then teaching
one concept at a time. Same placeholder conventions as above.

## 1. Build your personal AI tutor

> Act as an expert tutor in [SUBJECT]. I'm a [BEGINNER/INTERMEDIATE/ADVANCED] learner studying [TOPIC] for [GOAL]. First, ask me 5 short questions to assess what I already understand. Then create a personalized lesson using simple explanations, practical examples, and short exercises. Teach one concept at a time, check my understanding before continuing, and adjust the difficulty based on my answers. Don't reveal exercise answers until I attempt them.

## 2. Learn a difficult concept from zero

> Teach me [DIFFICULT CONCEPT] as if I have no previous knowledge of it. Begin with the simplest possible explanation, then explain it using an everyday analogy and one real-world example. Break the concept into small steps and define every technical term in plain language. After each step, ask me one quick question. Finish with a concise summary and 3 practice questions at increasing difficulty.

## 3. Use the Socratic tutoring method

> Help me understand [TOPIC/QUESTION] using the Socratic method. Don't give me the final answer immediately. Ask one guiding question at a time so I can reason toward the answer myself. If I make a mistake, identify the specific gap in my thinking and give me a small hint, not the solution. Continue until I can explain the answer correctly in my own words.

## 4. Turn course material into a lesson

> I'll paste my notes, textbook section, or lecture transcript below. Turn it into a structured tutoring session. Identify the most important ideas, explain them in beginner-friendly language, and show how they connect. Include one example for each major idea, highlight common mistakes, and quiz me after every section. End with a one-page revision guide.
>
> Material:
> [PASTE YOUR MATERIAL HERE]

## 5. Master a topic through worked examples

> Teach me how to solve [TYPE OF PROBLEM]. First, show one fully worked example and explain the reason behind every step. Then give me a similar problem to solve independently. Review my attempt line by line, identify exactly where my reasoning succeeds or fails, and give one targeted hint at a time. Continue with harder problems only after I demonstrate understanding.

## 6. Find and repair knowledge gaps

> I'm studying [SUBJECT/TOPIC], but I'm unsure what I don't understand. Test me with 10 diagnostic questions covering the essential skills, one question at a time. Based on my responses, create a 'knowledge-gap report' showing: what I understand, what I partially understand, what I misunderstand, and what I should study next. Then teach my weakest area with examples and practice.

## 7. Create an exam rescue plan

> My [EXAM NAME] is on [DATE]. I have [TIME AVAILABLE] per day, and the exam covers [TOPICS]. My strongest areas are [STRENGTHS], and my weakest are [WEAKNESSES]. Create a realistic daily study plan that prioritizes high-impact topics, active recall, practice questions, and spaced review. Include specific tasks, time blocks, progress checks, and a lighter final review day.

---

Every template above is also available as a fill-in-the-blanks form at
[`/study/`](public/study/index.html) on the portfolio site. The form data in
`public/study/templates.js` is generated from this file by
`scripts/build-study-templates.py`; edit here, then re-run the script.
