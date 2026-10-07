import { html } from "hono/html";
import type { Page } from "./layout";
import { formatMoney } from "../util";
import { microsToUsd } from "../pricing";
import { monthlyRecurringCents } from "../digest";

export type AdminData = {
  currency: string;
  users: number;
  active: Array<{ offering_slug: string; name: string; price_cents: number; interval: string; n: number }>;
  oneOff: { n: number; cents: number };
  usage7d: Array<{ agent_slug: string; calls: number; cost_micros: number }>;
  roadmap: string[];
  stripeConfigured: boolean;
  anthropicConfigured: boolean;
  emailConfigured: boolean;
};

const yesno = (b: boolean) => html`<span class="tag ${b ? "ok" : "warn"}">${b ? "configured" : "missing"}</span>`;

export function adminPage(d: AdminData): Page {
  const mrr = monthlyRecurringCents(d.active);
  return html`<section>
  <p class="eyebrow">Owner only</p>
  <h1>Admin</h1>
  <div class="card"><div class="row"><h3>Configuration</h3></div>
    <table><tbody>
      <tr><td>Stripe (STRIPE_SECRET_KEY + STRIPE_WEBHOOK_SECRET)</td><td>${yesno(d.stripeConfigured)}</td></tr>
      <tr><td>Anthropic (ANTHROPIC_API_KEY)</td><td>${yesno(d.anthropicConfigured)}</td></tr>
      <tr><td>Email (RESEND_API_KEY)</td><td>${yesno(d.emailConfigured)}</td></tr>
    </tbody></table></div>
  <div class="card"><div class="row"><h3>Revenue</h3><span class="price">${formatMoney(mrr, d.currency)} MRR</span></div>
    <p class="muted">${d.users} users · ${d.oneOff.n} one-off purchases (${formatMoney(d.oneOff.cents, d.currency)})</p>
    ${d.active.length > 0 ? html`<table><thead><tr><th>Offering</th><th>Active</th><th>Price</th></tr></thead><tbody>
    ${d.active.map((a) => html`<tr><td>${a.name}</td><td>${a.n}</td><td>${formatMoney(a.price_cents, d.currency)}/${a.interval}</td></tr>`)}</tbody></table>` : html`<p class="muted">No active subscriptions.</p>`}
  </div>
  <div class="card"><div class="row"><h3>Agent usage, last 7 days</h3></div>
    ${d.usage7d.length > 0 ? html`<table><thead><tr><th>Agent</th><th>Calls</th><th>Est. model cost (USD)</th></tr></thead><tbody>
    ${d.usage7d.map((u) => html`<tr><td>${u.agent_slug}</td><td>${u.calls}</td><td>${microsToUsd(u.cost_micros)}</td></tr>`)}</tbody></table>` : html`<p class="muted">No calls this week.</p>`}
  </div>
  <div class="card"><div class="row"><h3>Next on the roadmap</h3></div>
    ${d.roadmap.length > 0 ? html`<ol>${d.roadmap.slice(0, 5).map((r) => html`<li>${r}</li>`)}</ol>` : html`<p class="muted">ROADMAP.md has no open items.</p>`}
  </div>
</section>`;
}
