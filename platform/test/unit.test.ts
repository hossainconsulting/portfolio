import { describe, expect, it } from "vitest";
import { currentPeriod, isEntitled, quotaStatus } from "../src/quota";
import { estimateCostMicros, MODEL_PRICES } from "../src/pricing";
import { monthlyRecurringCents, nextRoadmapItems, renderRemindersEmail, renderWeeklyDigest } from "../src/digest";
import { AGENTS } from "../src/agents/registry";
import catalogue from "../seed/catalogue.json";
import { sydneyLocalToIso } from "../src/index";
import { escapeHtml, isValidEmail } from "../src/util";

describe("quota", () => {
  it("uses the UTC calendar month", () => {
    const p = currentPeriod(new Date("2026-09-15T10:00:00Z"));
    expect(p).toEqual({ start: "2026-09-01T00:00:00.000Z", end: "2026-10-01T00:00:00.000Z" });
    expect(currentPeriod(new Date("2026-12-31T23:59:59Z")).end).toBe("2027-01-01T00:00:00.000Z");
  });
  it("reports remaining and exceeded", () => {
    expect(quotaStatus(300, 0)).toEqual({ quota: 300, used: 0, remaining: 300, exceeded: false });
    expect(quotaStatus(300, 299).exceeded).toBe(false);
    expect(quotaStatus(300, 300).exceeded).toBe(true);
    expect(quotaStatus(300, 350).remaining).toBe(0);
    expect(quotaStatus(null, 999)).toEqual({ quota: null, used: 999, remaining: null, exceeded: false });
  });
  it("treats Stripe statuses correctly", () => {
    for (const s of ["active", "trialing", "past_due", "paid"]) expect(isEntitled(s)).toBe(true);
    for (const s of ["canceled", "unpaid", "incomplete", "incomplete_expired", "paused"]) expect(isEntitled(s)).toBe(false);
  });
});

describe("pricing", () => {
  it("estimates cost from list prices", () => {
    // 1M in + 1M out on Opus 5 = $5 + $25 = $30
    expect(estimateCostMicros("claude-opus-5", { input_tokens: 1_000_000, output_tokens: 1_000_000 })).toBe(30_000_000);
    // cache reads are a tenth of input
    expect(estimateCostMicros("claude-opus-5", { input_tokens: 0, output_tokens: 0, cache_read_input_tokens: 1_000_000 })).toBe(500_000);
    // a typical small call is well under a cent
    expect(estimateCostMicros("claude-opus-5", { input_tokens: 650, output_tokens: 250 })).toBeLessThan(10_000);
  });
  it("falls back to Opus pricing for unknown models rather than zero", () => {
    expect(estimateCostMicros("claude-unknown", { input_tokens: 100, output_tokens: 100 })).toBe(estimateCostMicros("claude-opus-5", { input_tokens: 100, output_tokens: 100 }));
    expect(Object.keys(MODEL_PRICES)).toContain("claude-opus-5");
  });
});

describe("catalogue and registry agree", () => {
  const offerings = catalogue.offerings;
  it("has unique slugs and valid kinds/intervals", () => {
    const slugs = offerings.map((o) => o.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
    for (const o of offerings) {
      expect(["project", "agent", "service"]).toContain(o.kind);
      expect(["month", "year", "once", "quote"]).toContain(o.interval);
      if (o.interval !== "quote") expect(o.price_cents).toBeGreaterThan(0);
    }
  });
  it("every agent offering unlocks agents that exist, with a quota", () => {
    for (const o of offerings.filter((o) => o.kind === "agent")) {
      expect(o.monthly_call_quota).toBeGreaterThan(0);
      expect(o.agent_slugs?.length).toBeGreaterThan(0);
      for (const s of o.agent_slugs ?? []) expect(AGENTS[s], `agent ${s} referenced by ${o.slug}`).toBeDefined();
    }
  });
  it("every registered agent is sold by at least one offering", () => {
    const sold = new Set(offerings.flatMap((o) => o.agent_slugs ?? []));
    for (const slug of Object.keys(AGENTS)) expect(sold.has(slug), slug).toBe(true);
  });
  it("agents have frozen prompts, JSON schemas and examples", () => {
    for (const a of Object.values(AGENTS)) {
      expect(a.system.length).toBeGreaterThan(200);
      expect(a.outputSchema).toMatchObject({ type: "object", additionalProperties: false });
      expect(a.exampleInput.length).toBeGreaterThan(10);
      expect(a.model).toBe("claude-opus-5");
    }
  });
});

describe("digest", () => {
  const input = {
    appUrl: "https://platform.example", weekEnding: "2026-09-13T22:00:00Z", users: 12,
    active: [{ name: "Quote Triage", price_cents: 2900, interval: "month", n: 3 }, { name: "Annual thing", price_cents: 120000, interval: "year", n: 1 }],
    oneOff: { n: 2, cents: 36000 }, usage: [{ agent_slug: "quote-triage", calls: 40, cost_micros: 250_000 }],
    reminders: [{ title: "Send Priya the status email", due_at: "2026-09-14T22:00:00Z" }],
    roadmap: ["Ship streaming", "Add rates upload", "Third", "Fourth"], currency: "aud",
  };
  it("computes MRR with annual plans divided by twelve", () => {
    expect(monthlyRecurringCents(input.active)).toBe(2900 * 3 + 10000);
  });
  it("renders the five-line status shape", () => {
    const { subject, text } = renderWeeklyDigest(input);
    expect(subject).toContain("MRR");
    expect(text).toContain("DONE / STATE");
    expect(text).toContain("NEXT (from ROADMAP.md)");
    expect(text).toContain("- Ship streaming");
    expect(text).not.toContain("- Fourth"); // only the next three
    expect(text).toContain("quote-triage: 40 calls");
    expect(text).toContain("Send Priya the status email");
    expect(text).toContain("RISKS / DECISIONS NEEDED");
  });
  it("renders the reminders email", () => {
    const { subject, text } = renderRemindersEmail("https://p", [{ title: "Renew domain", notes: "before 5pm", due_at: "2026-09-14T22:00:00Z" }]);
    expect(subject).toBe("1 reminder due");
    expect(text).toContain("Renew domain");
    expect(text).toContain("before 5pm");
  });
  it("reads unchecked roadmap items in order", () => {
    expect(nextRoadmapItems("- [x] done\n- [ ] first\n  * [ ] second\n- [ ] third\ntext")).toEqual(["first", "second", "third"]);
  });
});

describe("sydney time", () => {
  it("converts AEST (UTC+10) local time to UTC", () => {
    expect(sydneyLocalToIso("2026-07-01T09:00")).toBe("2026-06-30T23:00:00.000Z");
  });
  it("converts AEDT (UTC+11) local time to UTC", () => {
    expect(sydneyLocalToIso("2026-12-01T09:00")).toBe("2026-11-30T22:00:00.000Z");
  });
  it("rejects garbage", () => {
    expect(sydneyLocalToIso("yesterday")).toBeNull();
  });
});

describe("util", () => {
  it("validates emails loosely and escapes html", () => {
    expect(isValidEmail("a@b.co")).toBe(true);
    expect(isValidEmail("not an email")).toBe(false);
    expect(escapeHtml(`<a href="x">&'</a>`)).toBe("&lt;a href=&quot;x&quot;&gt;&amp;&#39;&lt;/a&gt;");
  });
});
