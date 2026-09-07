import { html } from "hono/html";
import type { ApiKey, Offering, Reminder, Subscription, User } from "../db";
import { agentSlugsOf } from "../db";
import { AGENTS } from "../agents/registry";
import { formatMoney, formatSydney } from "../util";
import type { Page } from "./layout";
import { isEntitled, quotaStatus } from "../quota";

export type DashboardData = {
  user: User;
  appUrl: string;
  subs: Array<{ sub: Subscription; offering: Offering | null }>;
  usage: Array<{ offering_slug: string; agent_slug: string; calls: number }>;
  keys: ApiKey[];
  reminders: Reminder[];
  flash?: { kind: "ok" | "bad"; text: string; secret?: string };
};

function statusTag(status: string): Page {
  const cls = isEntitled(status) ? "ok" : status === "canceled" ? "plain" : "warn";
  return html`<span class="tag ${cls}">${status}</span>`;
}

export function dashboardPage(d: DashboardData): Page {
  const entitled = d.subs.filter((s) => s.offering && isEntitled(s.sub.status));
  const agentAccess = new Map<string, { offering: Offering; used: number }>();
  for (const { sub, offering } of entitled) {
    if (!offering) continue;
    const used = d.usage.filter((u) => u.offering_slug === offering.slug).reduce((s, u) => s + u.calls, 0);
    for (const slug of agentSlugsOf(offering)) if (!agentAccess.has(slug)) agentAccess.set(slug, { offering, used });
  }
  const hasCustomer = Boolean(d.user.stripe_customer_id);

  return html`<section>
  <p class="eyebrow">Signed in as ${d.user.email}</p>
  <h1>Dashboard</h1>
  ${d.flash ? html`<div class="notice ${d.flash.kind === "bad" ? "bad" : ""}">${d.flash.text}${d.flash.secret ? html`<pre>${d.flash.secret}</pre><span class="muted">Copy it now. It is shown once and only its hash is stored.</span>` : ""}</div>` : ""}
</section>

<section id="subscriptions">
  <h2>Subscriptions and purchases</h2>
  ${d.subs.length === 0 ? html`<p class="sub">Nothing yet. <a href="/#agents">Pick an agent</a> to get started.</p>` : ""}
  ${d.subs.map(({ sub, offering }) => html`<div class="card">
    <div class="row"><h3>${offering?.name ?? sub.offering_slug}</h3>${statusTag(sub.status)}
      <span class="price">${offering ? (offering.interval === "once" ? formatMoney(offering.price_cents, offering.currency) : `${formatMoney(offering.price_cents, offering.currency)}/${offering.interval}`) : ""}</span></div>
    <p class="muted">${sub.current_period_end ? `Renews ${formatSydney(sub.current_period_end)}` : `Started ${formatSydney(sub.created_at)}`}</p>
  </div>`)}
  ${hasCustomer ? html`<form method="post" action="/billing/portal"><button class="btn secondary" type="submit">Manage billing</button></form>` : ""}
</section>

<section id="agents">
  <h2>Your agents</h2>
  ${agentAccess.size === 0 ? html`<p class="sub">No agent subscription is active. Agents unlock the moment Stripe confirms payment.</p>` : ""}
  ${[...agentAccess.entries()].map(([slug, { offering, used }]) => {
    const agent = AGENTS[slug];
    const q = quotaStatus(offering.monthly_call_quota, used);
    return html`<div class="card">
    <div class="row"><h3>${agent?.name ?? slug}</h3><span class="tag ${q.exceeded ? "bad" : "ok"}">${q.quota === null ? "unmetered" : `${q.used} / ${q.quota} this month`}</span></div>
    <p>${agent?.description ?? ""}</p>
    <pre>curl -X POST ${d.appUrl}/api/agents/${slug}/run \\
  -H "Authorization: Bearer hcp_..." \\
  -H "Content-Type: application/json" \\
  -d ${JSON.stringify(JSON.stringify({ input: agent?.exampleInput ?? "..." }))}</pre>
  </div>`;
  })}
</section>

<section id="keys">
  <h2>API keys</h2>
  <form method="post" action="/api/keys">
    <label for="label">Label</label>
    <input id="label" type="text" name="label" maxlength="60" placeholder="e.g. Zapier, production, laptop" required>
    <button class="btn" type="submit">Create key</button>
  </form>
  ${d.keys.length > 0 ? html`<table><thead><tr><th>Key</th><th>Label</th><th>Created</th><th></th></tr></thead><tbody>
  ${d.keys.map((k) => html`<tr><td class="mono">${k.prefix}…</td><td>${k.label}</td><td>${formatSydney(k.created_at)}</td>
    <td>${k.revoked_at ? html`<span class="tag plain">revoked</span>` : html`<form class="inline" method="post" action="/api/keys/${k.id}/revoke"><button class="btn secondary small" type="submit">Revoke</button></form>`}</td></tr>`)}
  </tbody></table>` : ""}
</section>

<section id="reminders">
  <h2>Reminders</h2>
  <p class="sub">Due reminders are emailed to you at 7am Sydney time.</p>
  <form method="post" action="/reminders">
    <label for="title">What</label>
    <input id="title" type="text" name="title" maxlength="200" required>
    <label for="due_at">When (Sydney time)</label>
    <input id="due_at" type="datetime-local" name="due_at" required>
    <label for="notes">Notes (optional)</label>
    <textarea id="notes" name="notes" rows="2" maxlength="2000"></textarea>
    <button class="btn" type="submit">Add reminder</button>
  </form>
  ${d.reminders.length === 0 ? html`<p class="muted">No open reminders.</p>` : html`<table><thead><tr><th>Due</th><th>Reminder</th><th></th></tr></thead><tbody>
  ${d.reminders.map((r) => html`<tr><td>${formatSydney(r.due_at)}</td><td>${r.title}${r.notes ? html`<br><span class="muted">${r.notes}</span>` : ""}</td>
    <td><form class="inline" method="post" action="/reminders/${r.id}/done"><button class="btn secondary small" type="submit">Done</button></form></td></tr>`)}
  </tbody></table>`}
</section>`;
}
