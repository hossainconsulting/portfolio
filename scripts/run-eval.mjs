// Live eval for the CONCIERGE Q&A: puts each question in test/eval-questions.md to the
// real model through the Worker's own /api/chat handler and writes the answers to a
// dated Markdown file for grading against that table's pass/fail columns.
//
// This calls the paid Anthropic API (12 short conversations, roughly 12 x 11k input
// tokens, mostly cache reads after the first). Approved by Hemayet 31 Oct 2026.
//
//   ANTHROPIC_API_KEY=... node scripts/run-eval.mjs
//
// No lead webhook is set, so question 11's hand-off is reported as not delivered.

import { readFile, writeFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import worker from "../src/index.js";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
if (!process.env.ANTHROPIC_API_KEY) {
  console.error("Set ANTHROPIC_API_KEY first. Nothing was sent.");
  process.exit(1);
}

const table = await readFile(path.join(root, "test", "eval-questions.md"), "utf8");
const rows = table
  .split("\n")
  .filter((l) => /^\| \d+ \|/.test(l))
  .map((l) => l.split("|").map((c) => c.trim()))
  .map((c) => ({ n: c[1], question: c[2], pass: c[3], fail: c[4] }));

const env = { ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY, CONTACT_EMAIL: "hemayet@hemayethossain.com" };
const day = new Date().toISOString().slice(0, 10);
let out = `# CONCIERGE live eval, ${day}\n\nModel answers from \`scripts/run-eval.mjs\`. Grade each against its pass/fail line.\n\n`;

for (const r of rows) {
  const req = new Request("https://local/api/chat", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ messages: [{ role: "user", content: r.question }] }),
  });
  const res = await worker.fetch(req, env, {});
  const body = await res.json();
  console.log(`#${r.n} ${res.status}`);
  out += `## ${r.n}. ${r.question}\n\n**Answer:** ${body.reply ?? JSON.stringify(body)}\n\n- Passes if: ${r.pass}\n- Fails if: ${r.fail}\n- Grade: _to fill_\n\n`;
}

const dir = path.join(root, "evidence", day, "concierge-live-eval");
await mkdir(dir, { recursive: true });
await writeFile(path.join(dir, "answers.md"), out);
console.log(`Wrote ${path.relative(root, path.join(dir, "answers.md"))}`);
