import type { Context } from "hono";

// Any Hono context whose bindings are our Env; the Variables slot varies per app.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Ctx = Context<any>;
import { getCookie, setCookie, deleteCookie } from "hono/cookie";
import type { Env } from "./env";
import { Db, type User } from "./db";
import { addDays, addMinutes, newId, nowIso, randomToken, sha256Hex } from "./util";

export const SESSION_COOKIE = "hcp_session";
const SESSION_DAYS = 30;
const LOGIN_TOKEN_MINUTES = 15;

export function roleFor(env: Env, email: string): "customer" | "owner" {
  return email.toLowerCase() === env.OWNER_EMAIL.toLowerCase() ? "owner" : "customer";
}

/** Creates a single-use login token and returns the raw value to embed in the email link. */
export async function createLoginToken(db: Db, email: string): Promise<string> {
  const raw = randomToken(32);
  await db.insertLoginToken(await sha256Hex(raw), email, addMinutes(new Date(), LOGIN_TOKEN_MINUTES).toISOString());
  return raw;
}

export async function redeemLoginToken(env: Env, db: Db, raw: string): Promise<User | null> {
  const email = await db.consumeLoginToken(await sha256Hex(raw));
  if (!email) return null;
  return db.ensureUser(email, roleFor(env, email));
}

export async function startSession(c: Ctx, db: Db, user: User): Promise<void> {
  const id = randomToken(32);
  const expires = addDays(new Date(), SESSION_DAYS);
  await db.insertSession(id, user.id, expires.toISOString());
  setCookie(c, SESSION_COOKIE, id, { httpOnly: true, secure: true, sameSite: "Lax", path: "/", expires });
}

export async function endSession(c: Ctx, db: Db): Promise<void> {
  const id = getCookie(c, SESSION_COOKIE);
  if (id) await db.deleteSession(id);
  deleteCookie(c, SESSION_COOKIE, { path: "/" });
}

/** Resolves the caller from the session cookie or an `Authorization: Bearer hcp_...` API key. */
export async function resolveUser(c: Ctx, db: Db): Promise<User | null> {
  const auth = c.req.header("authorization");
  if (auth?.startsWith("Bearer ")) {
    const raw = auth.slice(7).trim();
    if (raw.startsWith("hcp_")) return db.getUserByApiKeyHash(await sha256Hex(raw));
    return null;
  }
  const sid = getCookie(c, SESSION_COOKIE);
  return sid ? db.getSessionUser(sid) : null;
}

export async function createApiKey(db: Db, user: User, label: string): Promise<{ raw: string; prefix: string }> {
  const raw = `hcp_${randomToken(24)}`;
  const prefix = raw.slice(0, 12);
  await db.insertApiKey({ id: newId("key"), user_id: user.id, key_hash: await sha256Hex(raw), prefix, label, created_at: nowIso(), revoked_at: null });
  return { raw, prefix };
}
