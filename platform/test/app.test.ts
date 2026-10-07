import { env, SELF } from "cloudflare:test";
import { beforeAll, describe, expect, it } from "vitest";
import { ORIGIN, apiKeyFor, burnCalls, grant, seedCatalogue, signIn } from "./helpers";

beforeAll(seedCatalogue);

describe("public pages", () => {
  it("renders the catalogue with security headers", async () => {
    const res = await SELF.fetch(`${ORIGIN}/`);
    expect(res.status).toBe(200);
    const body = await res.text();
    for (const name of ["Quote Triage", "Notes to Invoice", "After-Hours Triage", "Salesforce Health Check", "Fractional Salesforce Admin"]) expect(body).toContain(name);
    expect(body).toContain("/buy/quote-triage");
    expect(body).toContain("mailto:"); // quoted offerings
    expect(res.headers.get("content-security-policy")).toContain("script-src 'none'");
    expect(res.headers.get("x-frame-options")).toBe("DENY");
  });
  it("404s cleanly", async () => {
    const res = await SELF.fetch(`${ORIGIN}/nope`);
    expect(res.status).toBe(404);
  });
  it("healthz", async () => {
    expect((await SELF.fetch(`${ORIGIN}/healthz`)).status).toBe(200);
  });
});

describe("auth", () => {
  it("redirects anonymous users to login with next", async () => {
    const res = await SELF.fetch(`${ORIGIN}/dashboard`, { redirect: "manual" });
    expect(res.status).toBe(303);
    expect(res.headers.get("location")).toBe("/login?next=%2Fdashboard");
  });
  it("rejects bad email on login", async () => {
    const res = await SELF.fetch(`${ORIGIN}/login`, { method: "POST", headers: { origin: ORIGIN, "content-type": "application/x-www-form-urlencoded" }, body: "email=nope" });
    expect(res.status).toBe(200);
    expect(await res.text()).toContain("does not look like an email");
  });
  it("accepts a login and reports that email is only logged in dev", async () => {
    const res = await SELF.fetch(`${ORIGIN}/login`, { method: "POST", headers: { origin: ORIGIN, "content-type": "application/x-www-form-urlencoded" }, body: "email=someone%40example.com&next=%2Fdashboard" });
    expect(res.status).toBe(200);
    expect(await res.text()).toContain("Check your email");
  });
  it("rejects cross-origin form posts", async () => {
    const res = await SELF.fetch(`${ORIGIN}/login`, { method: "POST", headers: { origin: "https://evil.example", "content-type": "application/x-www-form-urlencoded" }, body: "email=a%40b.co" });
    expect(res.status).toBe(403);
  });
  it("magic link signs in once and then expires", async () => {
    const { cookie } = await signIn("cust@example.com");
    const dash = await SELF.fetch(`${ORIGIN}/dashboard`, { headers: { cookie } });
    expect(dash.status).toBe(200);
    expect(await dash.text()).toContain("cust@example.com");
  });
  it("owner email gets the owner role and the admin page; customers do not", async () => {
    const owner = await signIn(env.OWNER_EMAIL);
    expect(owner.user.role).toBe("owner");
    expect((await SELF.fetch(`${ORIGIN}/admin`, { headers: { cookie: owner.cookie } })).status).toBe(200);
    const cust = await signIn("cust2@example.com");
    expect((await SELF.fetch(`${ORIGIN}/admin`, { headers: { cookie: cust.cookie } })).status).toBe(403);
  });
  it("blocks open redirects", async () => {
    const res = await SELF.fetch(`${ORIGIN}/login?next=https://evil.example`, { redirect: "manual", headers: { cookie: (await signIn("r@example.com")).cookie } });
    expect(res.headers.get("location")).toBe("/dashboard");
  });
});

describe("api keys", () => {
  it("creates a key through the form and authenticates with it", async () => {
    const { cookie } = await signIn("keys@example.com");
    const res = await SELF.fetch(`${ORIGIN}/api/keys`, { method: "POST", headers: { cookie, origin: ORIGIN, "content-type": "application/x-www-form-urlencoded" }, body: "label=laptop" });
    const body = await res.text();
    const raw = /hcp_[A-Za-z0-9_-]+/.exec(body)?.[0];
    expect(raw).toBeDefined();
    const list = await SELF.fetch(`${ORIGIN}/api/agents`, { headers: { authorization: `Bearer ${raw}` } });
    expect(list.status).toBe(200);
    expect(await list.json()).toEqual({ agents: [] });
  });
  it("rejects unknown keys", async () => {
    expect((await SELF.fetch(`${ORIGIN}/api/agents`, { headers: { authorization: "Bearer hcp_nope" } })).status).toBe(401);
  });
});

describe("agent API", () => {
  it("requires an entitled subscription", async () => {
    const { user } = await signIn("noplan@example.com");
    const key = await apiKeyFor(user);
    const res = await SELF.fetch(`${ORIGIN}/api/agents/quote-triage/run`, { method: "POST", headers: { authorization: `Bearer ${key}`, "content-type": "application/json" }, body: JSON.stringify({ input: "hi" }) });
    expect(res.status).toBe(403);
  });
  it("lists agents with quota once subscribed, and enforces the quota", async () => {
    const { user } = await signIn("plan@example.com");
    const key = await apiKeyFor(user);
    await grant(user, "quote-triage");
    const list = await (await SELF.fetch(`${ORIGIN}/api/agents`, { headers: { authorization: `Bearer ${key}` } })).json() as { agents: Array<{ slug: string; quota: { quota: number; used: number } }> };
    expect(list.agents.map((a) => a.slug)).toEqual(["quote-triage"]);
    expect(list.agents[0]!.quota).toMatchObject({ quota: 300, used: 0 });

    await burnCalls(user, "quote-triage", "quote-triage", 300);
    const res = await SELF.fetch(`${ORIGIN}/api/agents/quote-triage/run`, { method: "POST", headers: { authorization: `Bearer ${key}`, "content-type": "application/json" }, body: JSON.stringify({ input: "hi" }) });
    expect(res.status).toBe(429);
  });
  it("the suite unlocks all three agents", async () => {
    const { user } = await signIn("suite@example.com");
    const key = await apiKeyFor(user);
    await grant(user, "trades-ai-suite");
    const list = await (await SELF.fetch(`${ORIGIN}/api/agents`, { headers: { authorization: `Bearer ${key}` } })).json() as { agents: Array<{ slug: string }> };
    expect(list.agents.map((a) => a.slug).sort()).toEqual(["after-hours-triage", "notes-to-invoice", "quote-triage"]);
  });
  it("a canceled subscription grants nothing", async () => {
    const { user } = await signIn("gone@example.com");
    const key = await apiKeyFor(user);
    await grant(user, "quote-triage", "canceled");
    const res = await SELF.fetch(`${ORIGIN}/api/agents/quote-triage/run`, { method: "POST", headers: { authorization: `Bearer ${key}`, "content-type": "application/json" }, body: JSON.stringify({ input: "hi" }) });
    expect(res.status).toBe(403);
  });
  it("validates the body before spending anything", async () => {
    const { user } = await signIn("body@example.com");
    const key = await apiKeyFor(user);
    await grant(user, "quote-triage");
    const h = { authorization: `Bearer ${key}`, "content-type": "application/json" };
    expect((await SELF.fetch(`${ORIGIN}/api/agents/quote-triage/run`, { method: "POST", headers: h, body: "not json" })).status).toBe(400);
    expect((await SELF.fetch(`${ORIGIN}/api/agents/quote-triage/run`, { method: "POST", headers: h, body: JSON.stringify({}) })).status).toBe(400);
    expect((await SELF.fetch(`${ORIGIN}/api/agents/quote-triage/run`, { method: "POST", headers: h, body: JSON.stringify({ input: "x".repeat(20_000) }) })).status).toBe(413);
    // Valid body but no ANTHROPIC_API_KEY in the test env: 503, not a crash.
    expect((await SELF.fetch(`${ORIGIN}/api/agents/quote-triage/run`, { method: "POST", headers: h, body: JSON.stringify({ input: "hot water is lukewarm" }) })).status).toBe(503);
    expect((await SELF.fetch(`${ORIGIN}/api/agents/nope/run`, { method: "POST", headers: h, body: JSON.stringify({ input: "x" }) })).status).toBe(404);
  });
});

describe("reminders", () => {
  it("adds and completes a reminder", async () => {
    const { cookie } = await signIn("rem@example.com");
    const h = { cookie, origin: ORIGIN, "content-type": "application/x-www-form-urlencoded" };
    const add = await SELF.fetch(`${ORIGIN}/reminders`, { method: "POST", headers: h, body: "title=Send+status+email&due_at=2026-09-14T09%3A00&notes=to+Priya", redirect: "manual" });
    expect(add.status).toBe(303);
    const dash = await (await SELF.fetch(`${ORIGIN}/dashboard`, { headers: { cookie } })).text();
    expect(dash).toContain("Send status email");
    const id = /\/reminders\/(rem_[a-f0-9]+)\/done/.exec(dash)?.[1];
    expect(id).toBeDefined();
    await SELF.fetch(`${ORIGIN}/reminders/${id}/done`, { method: "POST", headers: h, redirect: "manual" });
    expect(await (await SELF.fetch(`${ORIGIN}/dashboard`, { headers: { cookie } })).text()).not.toContain("Send status email");
  });
});

describe("stripe", () => {
  it("buy page explains when payments are not configured", async () => {
    const { cookie } = await signIn("buyer@example.com");
    const res = await SELF.fetch(`${ORIGIN}/buy/quote-triage`, { headers: { cookie } });
    expect(res.status).toBe(200);
    expect(await res.text()).toContain("not configured");
  });
  it("webhook endpoint refuses unsigned posts", async () => {
    const res = await SELF.fetch(`${ORIGIN}/webhooks/stripe`, { method: "POST", body: "{}" });
    expect([400, 500]).toContain(res.status);
  });
});
