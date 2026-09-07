import { newId, nowIso } from "./util";
import { currentPeriod, isEntitled } from "./quota";

export type User = { id: string; email: string; name: string | null; role: "customer" | "owner"; stripe_customer_id: string | null; created_at: string };
export type Offering = {
  slug: string; kind: "project" | "agent" | "service"; name: string; tagline: string; description: string;
  price_cents: number; currency: string; interval: "month" | "year" | "once" | "quote";
  stripe_lookup_key: string | null; stripe_price_id: string | null; monthly_call_quota: number | null;
  agent_slugs: string | null; repo_url: string | null; sort: number; active: number;
};
export type Subscription = {
  id: string; user_id: string; offering_slug: string; status: string; stripe_checkout_session_id: string | null;
  current_period_end: string | null; created_at: string; updated_at: string;
};
export type ApiKey = { id: string; user_id: string; key_hash: string; prefix: string; label: string; created_at: string; revoked_at: string | null };
export type Reminder = { id: string; user_id: string; title: string; notes: string | null; due_at: string; done_at: string | null; created_at: string };
export type UsageEvent = {
  id: string; user_id: string; offering_slug: string; agent_slug: string; model: string; input_tokens: number;
  output_tokens: number; cache_read_tokens: number; cost_micros: number; stop_reason: string | null; created_at: string;
};

export function agentSlugsOf(o: Pick<Offering, "agent_slugs">): string[] {
  if (!o.agent_slugs) return [];
  try { const v = JSON.parse(o.agent_slugs); return Array.isArray(v) ? v.map(String) : []; } catch { return []; }
}

export class Db {
  constructor(private readonly d1: D1Database) {}

  // ---- users -------------------------------------------------------------
  getUserById(id: string) { return this.d1.prepare("SELECT * FROM users WHERE id = ?").bind(id).first<User>(); }
  getUserByEmail(email: string) { return this.d1.prepare("SELECT * FROM users WHERE email = ?").bind(email).first<User>(); }
  getUserByStripeCustomer(customerId: string) {
    return this.d1.prepare("SELECT * FROM users WHERE stripe_customer_id = ?").bind(customerId).first<User>();
  }
  async ensureUser(email: string, role: "customer" | "owner"): Promise<User> {
    const existing = await this.getUserByEmail(email);
    if (existing) {
      if (role === "owner" && existing.role !== "owner") {
        await this.d1.prepare("UPDATE users SET role = 'owner' WHERE id = ?").bind(existing.id).run();
        existing.role = "owner";
      }
      return existing;
    }
    const user: User = { id: newId("usr"), email, name: null, role, stripe_customer_id: null, created_at: nowIso() };
    await this.d1.prepare("INSERT INTO users (id, email, name, role, stripe_customer_id, created_at) VALUES (?, ?, ?, ?, ?, ?)")
      .bind(user.id, user.email, user.name, user.role, user.stripe_customer_id, user.created_at).run();
    return user;
  }
  setStripeCustomer(userId: string, customerId: string) {
    return this.d1.prepare("UPDATE users SET stripe_customer_id = ? WHERE id = ?").bind(customerId, userId).run();
  }

  // ---- login tokens & sessions ------------------------------------------
  insertLoginToken(tokenHash: string, email: string, expiresAt: string) {
    return this.d1.prepare("INSERT INTO login_tokens (token_hash, email, expires_at) VALUES (?, ?, ?)").bind(tokenHash, email, expiresAt).run();
  }
  /** Atomically marks the token used; returns the email only on the first successful use. */
  async consumeLoginToken(tokenHash: string): Promise<string | null> {
    const now = nowIso();
    const res = await this.d1
      .prepare("UPDATE login_tokens SET used_at = ? WHERE token_hash = ? AND used_at IS NULL AND expires_at > ? RETURNING email")
      .bind(now, tokenHash, now).first<{ email: string }>();
    return res?.email ?? null;
  }
  insertSession(id: string, userId: string, expiresAt: string) {
    return this.d1.prepare("INSERT INTO sessions (id, user_id, expires_at, created_at) VALUES (?, ?, ?, ?)").bind(id, userId, expiresAt, nowIso()).run();
  }
  getSessionUser(sessionId: string) {
    return this.d1.prepare("SELECT u.* FROM sessions s JOIN users u ON u.id = s.user_id WHERE s.id = ? AND s.expires_at > ?")
      .bind(sessionId, nowIso()).first<User>();
  }
  deleteSession(sessionId: string) { return this.d1.prepare("DELETE FROM sessions WHERE id = ?").bind(sessionId).run(); }

  // ---- api keys ----------------------------------------------------------
  insertApiKey(k: ApiKey) {
    return this.d1.prepare("INSERT INTO api_keys (id, user_id, key_hash, prefix, label, created_at) VALUES (?, ?, ?, ?, ?, ?)")
      .bind(k.id, k.user_id, k.key_hash, k.prefix, k.label, k.created_at).run();
  }
  getUserByApiKeyHash(hash: string) {
    return this.d1.prepare("SELECT u.* FROM api_keys k JOIN users u ON u.id = k.user_id WHERE k.key_hash = ? AND k.revoked_at IS NULL")
      .bind(hash).first<User>();
  }
  async listApiKeys(userId: string) {
    const r = await this.d1.prepare("SELECT * FROM api_keys WHERE user_id = ? ORDER BY created_at DESC").bind(userId).all<ApiKey>();
    return r.results;
  }
  revokeApiKey(userId: string, id: string) {
    return this.d1.prepare("UPDATE api_keys SET revoked_at = ? WHERE id = ? AND user_id = ? AND revoked_at IS NULL").bind(nowIso(), id, userId).run();
  }

  // ---- catalogue ---------------------------------------------------------
  async listOfferings() {
    const r = await this.d1.prepare("SELECT * FROM offerings WHERE active = 1 ORDER BY sort, name").all<Offering>();
    return r.results;
  }
  getOffering(slug: string) { return this.d1.prepare("SELECT * FROM offerings WHERE slug = ? AND active = 1").bind(slug).first<Offering>(); }

  // ---- subscriptions -----------------------------------------------------
  async listSubscriptions(userId: string) {
    const r = await this.d1.prepare("SELECT * FROM subscriptions WHERE user_id = ? ORDER BY created_at DESC").bind(userId).all<Subscription>();
    return r.results;
  }
  getSubscription(id: string) { return this.d1.prepare("SELECT * FROM subscriptions WHERE id = ?").bind(id).first<Subscription>(); }
  upsertSubscription(s: Omit<Subscription, "created_at" | "updated_at">) {
    const now = nowIso();
    return this.d1.prepare(
      `INSERT INTO subscriptions (id, user_id, offering_slug, status, stripe_checkout_session_id, current_period_end, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)
       ON CONFLICT(id) DO UPDATE SET status = excluded.status, current_period_end = excluded.current_period_end, updated_at = excluded.updated_at`,
    ).bind(s.id, s.user_id, s.offering_slug, s.status, s.stripe_checkout_session_id, s.current_period_end, now, now).run();
  }
  updateSubscriptionStatus(id: string, status: string, currentPeriodEnd: string | null) {
    return this.d1.prepare("UPDATE subscriptions SET status = ?, current_period_end = COALESCE(?, current_period_end), updated_at = ? WHERE id = ?")
      .bind(status, currentPeriodEnd, nowIso(), id).run();
  }
  /** Entitled (offering, subscription) pairs for a user, joined so callers get quotas and agent slugs in one query. */
  async entitlements(userId: string): Promise<Array<{ sub: Subscription; offering: Offering }>> {
    const subs = await this.listSubscriptions(userId);
    const out: Array<{ sub: Subscription; offering: Offering }> = [];
    for (const sub of subs) {
      if (!isEntitled(sub.status)) continue;
      const offering = await this.getOffering(sub.offering_slug);
      if (offering) out.push({ sub, offering });
    }
    return out;
  }

  // ---- usage -------------------------------------------------------------
  async countUsageThisMonth(userId: string, offeringSlug: string, now = new Date()): Promise<number> {
    const p = currentPeriod(now);
    const r = await this.d1.prepare("SELECT COUNT(*) AS n FROM usage_events WHERE user_id = ? AND offering_slug = ? AND created_at >= ? AND created_at < ?")
      .bind(userId, offeringSlug, p.start, p.end).first<{ n: number }>();
    return r?.n ?? 0;
  }
  insertUsage(e: UsageEvent) {
    return this.d1.prepare(
      `INSERT INTO usage_events (id, user_id, offering_slug, agent_slug, model, input_tokens, output_tokens, cache_read_tokens, cost_micros, stop_reason, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    ).bind(e.id, e.user_id, e.offering_slug, e.agent_slug, e.model, e.input_tokens, e.output_tokens, e.cache_read_tokens, e.cost_micros, e.stop_reason, e.created_at).run();
  }
  async usageSummary(since: string) {
    const r = await this.d1.prepare(
      "SELECT agent_slug, COUNT(*) AS calls, SUM(cost_micros) AS cost_micros FROM usage_events WHERE created_at >= ? GROUP BY agent_slug ORDER BY calls DESC",
    ).bind(since).all<{ agent_slug: string; calls: number; cost_micros: number }>();
    return r.results;
  }
  async usageForUserThisMonth(userId: string, now = new Date()) {
    const p = currentPeriod(now);
    const r = await this.d1.prepare(
      "SELECT offering_slug, agent_slug, COUNT(*) AS calls FROM usage_events WHERE user_id = ? AND created_at >= ? AND created_at < ? GROUP BY offering_slug, agent_slug",
    ).bind(userId, p.start, p.end).all<{ offering_slug: string; agent_slug: string; calls: number }>();
    return r.results;
  }

  // ---- reminders ---------------------------------------------------------
  insertReminder(r: Reminder) {
    return this.d1.prepare("INSERT INTO reminders (id, user_id, title, notes, due_at, created_at) VALUES (?, ?, ?, ?, ?, ?)")
      .bind(r.id, r.user_id, r.title, r.notes, r.due_at, r.created_at).run();
  }
  async listOpenReminders(userId: string) {
    const r = await this.d1.prepare("SELECT * FROM reminders WHERE user_id = ? AND done_at IS NULL ORDER BY due_at").bind(userId).all<Reminder>();
    return r.results;
  }
  markReminderDone(userId: string, id: string) {
    return this.d1.prepare("UPDATE reminders SET done_at = ? WHERE id = ? AND user_id = ? AND done_at IS NULL").bind(nowIso(), id, userId).run();
  }
  /** Open reminders due before `before`, across all users, joined with the owner's email. */
  async dueReminders(before: string) {
    const r = await this.d1.prepare(
      "SELECT r.*, u.email FROM reminders r JOIN users u ON u.id = r.user_id WHERE r.done_at IS NULL AND r.due_at <= ? ORDER BY r.due_at",
    ).bind(before).all<Reminder & { email: string }>();
    return r.results;
  }

  // ---- webhooks & admin --------------------------------------------------
  /** Returns true the first time an event id is seen. */
  async recordWebhookEvent(id: string, type: string): Promise<boolean> {
    const r = await this.d1.prepare("INSERT OR IGNORE INTO webhook_events (id, type, received_at) VALUES (?, ?, ?)").bind(id, type, nowIso()).run();
    return (r.meta.changes ?? 0) > 0;
  }
  async adminStats() {
    const users = await this.d1.prepare("SELECT COUNT(*) AS n FROM users").first<{ n: number }>();
    const active = await this.d1.prepare(
      `SELECT s.offering_slug, o.name, o.price_cents, o.interval, COUNT(*) AS n
       FROM subscriptions s JOIN offerings o ON o.slug = s.offering_slug
       WHERE s.status IN ('active','trialing','past_due') GROUP BY s.offering_slug`,
    ).all<{ offering_slug: string; name: string; price_cents: number; interval: string; n: number }>();
    const oneOff = await this.d1.prepare(
      "SELECT COUNT(*) AS n, COALESCE(SUM(o.price_cents),0) AS cents FROM subscriptions s JOIN offerings o ON o.slug = s.offering_slug WHERE s.status = 'paid'",
    ).first<{ n: number; cents: number }>();
    return { users: users?.n ?? 0, active: active.results, oneOff: oneOff ?? { n: 0, cents: 0 } };
  }
}
