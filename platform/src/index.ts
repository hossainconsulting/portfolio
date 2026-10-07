import { Hono } from "hono";
import type { Context, Next } from "hono";
import type { Env } from "./env";
import { Db, agentSlugsOf, type User } from "./db";
import { createApiKey, createLoginToken, endSession, redeemLoginToken, resolveUser, startSession } from "./auth";
import { sendEmail } from "./email";
import { createCheckout, createPortal, getStripe, handleStripeWebhook } from "./stripe";
import { getAgent } from "./agents/registry";
import { MAX_INPUT_CHARS, runAgent } from "./agents/run";
import { estimateCostMicros } from "./pricing";
import { isEntitled, quotaStatus } from "./quota";
import { addDays, isValidEmail, newId, nowIso } from "./util";
import { layout } from "./pages/layout";
import { landingPage } from "./pages/landing";
import { loginPage, loginSentPage } from "./pages/login";
import { dashboardPage, type DashboardData } from "./pages/dashboard";
import { adminPage } from "./pages/admin";
import { nextRoadmapItems, renderRemindersEmail, renderWeeklyDigest } from "./digest";
import ROADMAP from "../ROADMAP.md";

type Vars = { db: Db; user: User | null };
type App = { Bindings: Env; Variables: Vars };
type Ctx = Context<App>;

export const app = new Hono<App>();

// ---- middleware -----------------------------------------------------------

app.use("*", async (c, next) => {
  c.set("db", new Db(c.env.DB));
  c.set("user", await resolveUser(c, c.get("db")));
  await next();
  // Same posture as the portfolio's _headers: no scripts, no framing, HTTPS only.
  c.header("Content-Security-Policy", "default-src 'self'; style-src 'unsafe-inline'; script-src 'none'; img-src 'self' data:; form-action 'self' https://checkout.stripe.com https://billing.stripe.com; base-uri 'self'; frame-ancestors 'none'; upgrade-insecure-requests");
  c.header("Strict-Transport-Security", "max-age=63072000; includeSubDomains; preload");
  c.header("X-Content-Type-Options", "nosniff");
  c.header("X-Frame-Options", "DENY");
  c.header("Referrer-Policy", "strict-origin-when-cross-origin");
  c.header("Permissions-Policy", "camera=(), geolocation=(), microphone=(), payment=()");
});

/** Browser form posts must come from this origin. API calls with a Bearer key skip this. */
async function sameOrigin(c: Ctx, next: Next) {
  if (c.req.header("authorization")) return next();
  const origin = c.req.header("origin");
  const expected = new URL(c.env.APP_URL).origin;
  const devOrigin = new URL(c.req.url).origin;
  if (origin && origin !== expected && origin !== devOrigin) return c.text("cross-origin form post rejected", 403);
  return next();
}

async function requireUser(c: Ctx, next: Next) {
  if (!c.get("user")) {
    if (c.req.header("authorization") || c.req.path.startsWith("/api/")) return c.json({ error: "unauthorized" }, 401);
    return c.redirect(`/login?next=${encodeURIComponent(c.req.path)}`, 303);
  }
  return next();
}

async function requireOwner(c: Ctx, next: Next) {
  if (c.get("user")?.role !== "owner") return c.text("owner only", 403);
  return next();
}

const page = (c: Ctx, title: string, body: Parameters<typeof layout>[0]["body"], description?: string) =>
  c.html(layout({ title, appName: c.env.APP_NAME, user: c.get("user"), body, description }));

/** Only allow redirects back into this site. */
function safeNext(next: string | undefined | null): string {
  return next && next.startsWith("/") && !next.startsWith("//") ? next : "/dashboard";
}

// ---- public pages ---------------------------------------------------------

app.get("/", async (c) => page(c, "Agents, projects and services", landingPage(await c.get("db").listOfferings(), c.env.OWNER_EMAIL),
  "AI agents for trades businesses, fixed-scope Salesforce projects and a Salesforce administrator on retainer."));

app.get("/healthz", (c) => c.json({ ok: true, time: nowIso() }));

// ---- auth -----------------------------------------------------------------

app.get("/login", (c) => {
  if (c.get("user")) return c.redirect(safeNext(c.req.query("next")), 303);
  return page(c, "Sign in", loginPage(c.req.query("next") ?? null));
});

app.post("/login", sameOrigin, async (c) => {
  const form = await c.req.parseBody();
  const email = String(form["email"] ?? "").trim().toLowerCase();
  const next = safeNext(typeof form["next"] === "string" ? form["next"] : null);
  if (!isValidEmail(email)) return page(c, "Sign in", loginPage(next, "That does not look like an email address."));
  const token = await createLoginToken(c.get("db"), email);
  const link = `${c.env.APP_URL}/auth/${token}?next=${encodeURIComponent(next)}`;
  const result = await sendEmail(c.env, {
    to: email,
    subject: `Sign in to ${c.env.APP_NAME}`,
    text: `Click to sign in (valid 15 minutes, works once):\n\n${link}\n\nIf you did not request this, ignore it.`,
  });
  return page(c, "Check your email", loginSentPage(email, result.delivered));
});

app.get("/auth/:token", async (c) => {
  const user = await redeemLoginToken(c.env, c.get("db"), c.req.param("token") ?? "");
  if (!user) return page(c, "Sign in", loginPage(null, "That link has expired or was already used. Request a new one."));
  await startSession(c, c.get("db"), user);
  return c.redirect(safeNext(c.req.query("next")), 303);
});

app.post("/logout", sameOrigin, async (c) => {
  await endSession(c, c.get("db"));
  return c.redirect("/", 303);
});

// ---- commerce -------------------------------------------------------------

app.get("/buy/:slug", requireUser, async (c) => {
  const db = c.get("db");
  const offering = await db.getOffering(c.req.param("slug") ?? "");
  if (!offering) return c.notFound();
  const stripe = getStripe(c.env);
  if (!stripe) return page(c, "Not available", layoutNotice("Payments are not configured on this deployment yet. Email the owner instead."));
  const r = await createCheckout(c.env, stripe, db, c.get("user")!, offering);
  if ("error" in r) return page(c, "Checkout", layoutNotice(r.error, "bad"));
  return c.redirect(r.url, 303);
});

app.get("/checkout/success", requireUser, (c) =>
  page(c, "Thank you", layoutNotice("Payment received. Your subscription appears on the dashboard as soon as Stripe confirms it, usually within a few seconds. Refresh if it is not there yet.")));

app.post("/billing/portal", sameOrigin, requireUser, async (c) => {
  const user = c.get("user")!;
  const stripe = getStripe(c.env);
  if (!stripe || !user.stripe_customer_id) return c.redirect("/dashboard", 303);
  return c.redirect(await createPortal(c.env, stripe, user.stripe_customer_id), 303);
});

app.post("/webhooks/stripe", async (c) => {
  const stripe = getStripe(c.env);
  if (!stripe) return c.text("stripe not configured", 500);
  const out = await handleStripeWebhook(c.env, stripe, c.get("db"), await c.req.text(), c.req.header("stripe-signature"));
  return c.text(out.body, out.status as 200);
});

// ---- dashboard --------------------------------------------------------------

async function dashboardData(c: Ctx, flash?: DashboardData["flash"]): Promise<DashboardData> {
  const db = c.get("db");
  const user = c.get("user")!;
  const subs = await db.listSubscriptions(user.id);
  const withOfferings = [];
  for (const sub of subs) withOfferings.push({ sub, offering: await db.getOffering(sub.offering_slug) });
  return {
    user, appUrl: c.env.APP_URL, subs: withOfferings,
    usage: await db.usageForUserThisMonth(user.id), keys: await db.listApiKeys(user.id), reminders: await db.listOpenReminders(user.id), flash,
  };
}

app.get("/dashboard", requireUser, async (c) => page(c, "Dashboard", dashboardPage(await dashboardData(c))));

app.post("/api/keys", sameOrigin, requireUser, async (c) => {
  const form = await c.req.parseBody();
  const label = String(form["label"] ?? "").trim().slice(0, 60) || "default";
  const { raw } = await createApiKey(c.get("db"), c.get("user")!, label);
  return page(c, "Dashboard", dashboardPage(await dashboardData(c, { kind: "ok", text: `Key "${label}" created.`, secret: raw })));
});

app.post("/api/keys/:id/revoke", sameOrigin, requireUser, async (c) => {
  await c.get("db").revokeApiKey(c.get("user")!.id, c.req.param("id") ?? "");
  return c.redirect("/dashboard#keys", 303);
});

app.post("/reminders", sameOrigin, requireUser, async (c) => {
  const form = await c.req.parseBody();
  const title = String(form["title"] ?? "").trim().slice(0, 200);
  const notes = String(form["notes"] ?? "").trim().slice(0, 2000) || null;
  const due = sydneyLocalToIso(String(form["due_at"] ?? ""));
  if (!title || !due) return page(c, "Dashboard", dashboardPage(await dashboardData(c, { kind: "bad", text: "A reminder needs a title and a valid due time." })));
  await c.get("db").insertReminder({ id: newId("rem"), user_id: c.get("user")!.id, title, notes, due_at: due, done_at: null, created_at: nowIso() });
  return c.redirect("/dashboard#reminders", 303);
});

app.post("/reminders/:id/done", sameOrigin, requireUser, async (c) => {
  await c.get("db").markReminderDone(c.get("user")!.id, c.req.param("id") ?? "");
  return c.redirect("/dashboard#reminders", 303);
});

// ---- agent API --------------------------------------------------------------

app.get("/api/agents", requireUser, async (c) => {
  const db = c.get("db");
  const user = c.get("user")!;
  const out = [];
  for (const { offering } of await db.entitlements(user.id)) {
    const used = await db.countUsageThisMonth(user.id, offering.slug);
    for (const slug of agentSlugsOf(offering)) {
      const agent = getAgent(slug);
      if (agent) out.push({ slug, name: agent.name, description: agent.description, via: offering.slug, quota: quotaStatus(offering.monthly_call_quota, used) });
    }
  }
  return c.json({ agents: out });
});

app.post("/api/agents/:slug/run", requireUser, async (c) => {
  const db = c.get("db");
  const user = c.get("user")!;
  const agent = getAgent(c.req.param("slug") ?? "");
  if (!agent) return c.json({ error: "unknown agent" }, 404);

  // Which entitled offering unlocks this agent? Prefer the one with quota left.
  let chosen: { slug: string; quota: number | null; used: number } | null = null;
  for (const { offering } of await db.entitlements(user.id)) {
    if (!agentSlugsOf(offering).includes(agent.slug)) continue;
    const used = await db.countUsageThisMonth(user.id, offering.slug);
    const q = quotaStatus(offering.monthly_call_quota, used);
    if (!chosen || (!q.exceeded && quotaStatus(chosen.quota, chosen.used).exceeded)) chosen = { slug: offering.slug, quota: offering.monthly_call_quota, used };
  }
  if (!chosen) return c.json({ error: "no active subscription includes this agent", agent: agent.slug }, 403);
  const q = quotaStatus(chosen.quota, chosen.used);
  if (q.exceeded) return c.json({ error: "monthly call quota exceeded", quota: q }, 429);

  let body: { input?: unknown };
  try { body = await c.req.json(); } catch { return c.json({ error: "body must be JSON: {\"input\": \"...\"}" }, 400); }
  const input = typeof body.input === "string" ? body.input.trim() : "";
  if (!input) return c.json({ error: "input is required" }, 400);
  if (input.length > MAX_INPUT_CHARS) return c.json({ error: `input longer than ${MAX_INPUT_CHARS} characters` }, 413);
  if (!c.env.ANTHROPIC_API_KEY) return c.json({ error: "agent runtime not configured" }, 503);

  const result = await runAgent(c.env.ANTHROPIC_API_KEY, agent, input);
  await db.insertUsage({
    id: newId("use"), user_id: user.id, offering_slug: chosen.slug, agent_slug: agent.slug, model: result.model,
    input_tokens: result.usage.input_tokens, output_tokens: result.usage.output_tokens, cache_read_tokens: result.usage.cache_read_input_tokens,
    cost_micros: estimateCostMicros(result.model, result.usage), stop_reason: result.stop_reason, created_at: nowIso(),
  });
  const quota = quotaStatus(chosen.quota, chosen.used + 1);
  if (!result.ok) return c.json({ error: result.error, detail: result.detail, model: result.model, quota }, 422);
  return c.json({ agent: agent.slug, output: result.output, model: result.model, usage: result.usage, quota });
});

// ---- admin ------------------------------------------------------------------

app.get("/admin", requireUser, requireOwner, async (c) => {
  const db = c.get("db");
  const stats = await db.adminStats();
  return page(c, "Admin", adminPage({
    currency: c.env.CURRENCY, users: stats.users, active: stats.active, oneOff: stats.oneOff,
    usage7d: await db.usageSummary(addDays(new Date(), -7).toISOString()), roadmap: nextRoadmapItems(ROADMAP),
    stripeConfigured: Boolean(c.env.STRIPE_SECRET_KEY && c.env.STRIPE_WEBHOOK_SECRET),
    anthropicConfigured: Boolean(c.env.ANTHROPIC_API_KEY), emailConfigured: Boolean(c.env.RESEND_API_KEY),
  }));
});

app.notFound(async (c) => {
  const r = await page(c, "Not found", layoutNotice("There is nothing at that address.", "bad"));
  return new Response(r.body, { status: 404, headers: r.headers });
});

app.onError((err, c) => {
  console.error(err);
  return c.text("Something went wrong on our side. It has been logged.", 500);
});

// ---- helpers ------------------------------------------------------------------

import { html } from "hono/html";
function layoutNotice(text: string, kind: "ok" | "bad" = "ok") {
  return html`<section><div class="notice ${kind === "bad" ? "bad" : ""}">${text}</div><p><a href="/dashboard">Back to the dashboard</a></p></section>`;
}

/**
 * The reminder form submits a naive "YYYY-MM-DDTHH:MM" that the user typed in
 * Sydney time. Convert it to UTC ISO without a timezone library by finding the
 * offset Sydney has at that instant.
 */
export function sydneyLocalToIso(local: string): string | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/.exec(local);
  if (!m) return null;
  const [y, mo, d, h, mi] = m.slice(1).map(Number) as [number, number, number, number, number];
  const guess = Date.UTC(y, mo - 1, d, h, mi);
  const offsetAt = (t: number) => {
    const parts = new Intl.DateTimeFormat("en-AU", { timeZone: "Australia/Sydney", hourCycle: "h23", year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" }).formatToParts(new Date(t));
    const get = (type: string) => Number(parts.find((p) => p.type === type)?.value);
    return Date.UTC(get("year"), get("month") - 1, get("day"), get("hour"), get("minute")) - t;
  };
  // Two passes handle the DST boundary correctly enough for reminders.
  let utc = guess - offsetAt(guess);
  utc = guess - offsetAt(utc);
  return Number.isFinite(utc) ? new Date(utc).toISOString() : null;
}

// ---- scheduled ----------------------------------------------------------------

export async function runScheduled(env: Env, cron: string): Promise<void> {
  const db = new Db(env.DB);
  if (cron === "0 22 * * 0") {
    const stats = await db.adminStats();
    const owner = await db.getUserByEmail(env.OWNER_EMAIL);
    const digest = renderWeeklyDigest({
      appUrl: env.APP_URL, weekEnding: nowIso(), users: stats.users, active: stats.active, oneOff: stats.oneOff,
      usage: await db.usageSummary(addDays(new Date(), -7).toISOString()),
      reminders: owner ? await db.listOpenReminders(owner.id) : [], roadmap: nextRoadmapItems(ROADMAP), currency: env.CURRENCY,
    });
    await sendEmail(env, { to: env.OWNER_EMAIL, ...digest });
    return;
  }
  // Daily: anything due by end of today (Sydney), grouped per user.
  const due = await db.dueReminders(addDays(new Date(), 1).toISOString());
  const byEmail = new Map<string, typeof due>();
  for (const r of due) byEmail.set(r.email, [...(byEmail.get(r.email) ?? []), r]);
  for (const [email, rs] of byEmail) await sendEmail(env, { to: email, ...renderRemindersEmail(env.APP_URL, rs) });
}

export default {
  fetch: app.fetch,
  scheduled: (controller: ScheduledController, env: Env, ctx: ExecutionContext) => { ctx.waitUntil(runScheduled(env, controller.cron)); },
} satisfies ExportedHandler<Env>;
