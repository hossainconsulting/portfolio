import { html } from "hono/html";
import type { Offering } from "../db";
import { formatMoney } from "../util";
import type { Page } from "./layout";

function priceLabel(o: Offering): string {
  if (o.interval === "quote") return "Quoted";
  const amount = formatMoney(o.price_cents, o.currency);
  if (o.interval === "once") return amount;
  return `${amount}/${o.interval}`;
}

function cta(o: Offering, ownerEmail: string): Page {
  if (o.interval === "quote") {
    return html`<a class="btn secondary small" href="mailto:${ownerEmail}?subject=${encodeURIComponent(`Enquiry: ${o.name}`)}">Enquire</a>`;
  }
  const verb = o.interval === "once" ? "Buy" : "Subscribe";
  return html`<a class="btn small" href="/buy/${o.slug}">${verb}</a>`;
}

function group(kind: Offering["kind"], title: string, blurb: string, items: Offering[], ownerEmail: string): Page {
  return html`<section id="${kind}s">
  <h2>${title}</h2>
  <p class="sub">${blurb}</p>
  ${items.map((o) => html`<div class="card">
    <div class="row"><h3>${o.name}</h3><span class="price">${priceLabel(o)}</span></div>
    <p><strong>${o.tagline}</strong></p>
    <p>${o.description}</p>
    <div class="row">
      ${o.monthly_call_quota ? html`<span class="muted">${o.monthly_call_quota} calls/month</span>` : ""}
      ${o.repo_url ? html`<a class="muted" href="${o.repo_url}">source →</a>` : ""}
      <span style="margin-left:auto">${cta(o, ownerEmail)}</span>
    </div>
  </div>`)}
</section>`;
}

export function landingPage(offerings: Offering[], ownerEmail: string): Page {
  const by = (k: Offering["kind"]) => offerings.filter((o) => o.kind === k);
  return html`<section>
  <p class="eyebrow">Salesforce · AI agents · Sydney</p>
  <h1>Working tools and finished implementations, sold plainly.</h1>
  <p class="sub">Three AI agents for trades businesses you can call from your own systems today, fixed-scope Salesforce
  projects, and an administrator on retainer. Subscribe, get an API key, and see every call counted on your dashboard.</p>
</section>
${group("agent", "Agents", "Hosted, metered, structured JSON in and out. Each one is the production edition of a tool in the home-services-ai repository.", by("agent"), ownerEmail)}
${group("project", "Projects", "Fixed scope, written deliverables, the same method as the seven simulated engagements in the portfolio.", by("project"), ownerEmail)}
${group("service", "Agency services", "Ongoing help for businesses that need a Salesforce administrator but not a full-time one.", by("service"), ownerEmail)}`;
}
