/**
 * Pure renderers for the two scheduled emails. No I/O here so the tests can
 * assert on exact text.
 */
import { formatMoney, formatSydney } from "./util";
import { microsToUsd } from "./pricing";

export type DigestInput = {
  appUrl: string;
  weekEnding: string; // ISO
  users: number;
  active: Array<{ name: string; price_cents: number; interval: string; n: number }>;
  oneOff: { n: number; cents: number };
  usage: Array<{ agent_slug: string; calls: number; cost_micros: number }>;
  reminders: Array<{ title: string; due_at: string }>;
  roadmap: string[]; // next roadmap items, in order
  currency: string;
};

export function monthlyRecurringCents(active: DigestInput["active"]): number {
  return active.reduce((sum, a) => {
    if (a.interval === "month") return sum + a.price_cents * a.n;
    if (a.interval === "year") return sum + Math.round((a.price_cents * a.n) / 12);
    return sum;
  }, 0);
}

export function renderWeeklyDigest(d: DigestInput): { subject: string; text: string } {
  const mrr = monthlyRecurringCents(d.active);
  const lines: string[] = [];
  lines.push(`Weekly platform digest, week ending ${formatSydney(d.weekEnding)}`);
  lines.push("");
  lines.push("DONE / STATE");
  lines.push(`- Users: ${d.users}`);
  lines.push(`- MRR: ${formatMoney(mrr, d.currency)} across ${d.active.reduce((s, a) => s + a.n, 0)} active subscriptions`);
  for (const a of d.active) lines.push(`  - ${a.name}: ${a.n} × ${formatMoney(a.price_cents, d.currency)}/${a.interval}`);
  lines.push(`- One-off purchases to date: ${d.oneOff.n} (${formatMoney(d.oneOff.cents, d.currency)})`);
  lines.push("");
  lines.push("AGENT USAGE (last 7 days)");
  if (d.usage.length === 0) lines.push("- No agent calls this week.");
  const totalMicros = d.usage.reduce((s, u) => s + u.cost_micros, 0);
  for (const u of d.usage) lines.push(`- ${u.agent_slug}: ${u.calls} calls, est. ${microsToUsd(u.cost_micros)} USD in model cost`);
  if (d.usage.length > 0) lines.push(`- Total est. model cost: ${microsToUsd(totalMicros)} USD`);
  lines.push("");
  lines.push("NEXT (from ROADMAP.md)");
  if (d.roadmap.length === 0) lines.push("- Roadmap is empty. Add the next milestone.");
  for (const r of d.roadmap.slice(0, 3)) lines.push(`- ${r}`);
  lines.push("");
  lines.push("REMINDERS OPEN");
  if (d.reminders.length === 0) lines.push("- None.");
  for (const r of d.reminders) lines.push(`- ${r.title} (due ${formatSydney(r.due_at)})`);
  lines.push("");
  lines.push("RISKS / DECISIONS NEEDED");
  lines.push("- Reply to this email with anything that should change the roadmap.");
  lines.push("");
  lines.push(`Dashboard: ${d.appUrl}/admin`);
  return { subject: `Platform digest: ${formatMoney(mrr, d.currency)} MRR, ${d.users} users`, text: lines.join("\n") };
}

export function renderRemindersEmail(appUrl: string, reminders: Array<{ title: string; notes: string | null; due_at: string }>): { subject: string; text: string } {
  const lines = [`You have ${reminders.length} reminder${reminders.length === 1 ? "" : "s"} due:`, ""];
  for (const r of reminders) {
    lines.push(`- ${r.title} (due ${formatSydney(r.due_at)})`);
    if (r.notes) lines.push(`  ${r.notes}`);
  }
  lines.push("", `Mark them done: ${appUrl}/dashboard#reminders`);
  return { subject: `${reminders.length} reminder${reminders.length === 1 ? "" : "s"} due`, text: lines.join("\n") };
}

/** Extracts unchecked items ("- [ ] ...") from a markdown roadmap, in order. */
export function nextRoadmapItems(markdown: string): string[] {
  return markdown.split("\n").filter((l) => /^\s*[-*] \[ \] /.test(l)).map((l) => l.replace(/^\s*[-*] \[ \] /, "").trim());
}
