import { env, SELF } from "cloudflare:test";
import catalogue from "../seed/catalogue.json";
import { Db, type User } from "../src/db";
import { createLoginToken, createApiKey } from "../src/auth";
import { nowIso } from "../src/util";

export const ORIGIN = "https://platform.hossainconsulting.com";

export async function seedCatalogue(): Promise<void> {
  const db = env.DB;
  for (const o of catalogue.offerings) {
    await db.prepare(
      `INSERT OR REPLACE INTO offerings (slug, kind, name, tagline, description, price_cents, currency, interval, stripe_lookup_key, monthly_call_quota, agent_slugs, repo_url, sort, active)
       VALUES (?, ?, ?, ?, ?, ?, 'aud', ?, ?, ?, ?, ?, ?, 1)`,
    ).bind(o.slug, o.kind, o.name, o.tagline, o.description, o.price_cents ?? 0, o.interval,
      o.interval === "quote" ? null : `${o.slug}_${o.interval}`, o.monthly_call_quota ?? null,
      o.agent_slugs ? JSON.stringify(o.agent_slugs) : null, o.repo_url ?? null, o.sort ?? 100).run();
  }
}

/** Signs a user in through the real magic-link path and returns the session cookie. */
export async function signIn(email: string): Promise<{ user: User; cookie: string }> {
  const db = new Db(env.DB);
  const token = await createLoginToken(db, email);
  const res = await SELF.fetch(`${ORIGIN}/auth/${token}`, { redirect: "manual" });
  if (res.status !== 303) throw new Error(`auth redirect expected, got ${res.status}`);
  const setCookie = res.headers.get("set-cookie") ?? "";
  const cookie = setCookie.split(";")[0]!;
  const user = (await db.getUserByEmail(email))!;
  return { user, cookie };
}

export async function apiKeyFor(user: User): Promise<string> {
  return (await createApiKey(new Db(env.DB), user, "test")).raw;
}

export async function grant(user: User, offeringSlug: string, status = "active"): Promise<void> {
  await new Db(env.DB).upsertSubscription({ id: `sub_${crypto.randomUUID()}`, user_id: user.id, offering_slug: offeringSlug, status, stripe_checkout_session_id: null, current_period_end: null });
}

export async function burnCalls(user: User, offeringSlug: string, agentSlug: string, n: number): Promise<void> {
  const db = new Db(env.DB);
  for (let i = 0; i < n; i++) {
    await db.insertUsage({ id: `use_${crypto.randomUUID()}`, user_id: user.id, offering_slug: offeringSlug, agent_slug: agentSlug, model: "claude-opus-5",
      input_tokens: 10, output_tokens: 10, cache_read_tokens: 0, cost_micros: 1, stop_reason: "end_turn", created_at: nowIso() });
  }
}
