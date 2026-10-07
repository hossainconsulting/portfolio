import { test } from "node:test";
import assert from "node:assert/strict";
import { createRequire } from "node:module";
const Fin = createRequire(import.meta.url)("../lib.js");

const END = "2026-08";
const sample = Fin.generateSample(END, 42);

test("csv parse handles quotes, commas, CRLF and BOM", () => {
  const rows = Fin.parseCSV('﻿DATE,DESCRIPTION,CATEGORY,INCOME,EXPENSE,ACCOUNT,BALANCE\r\n2026-01-05,"Smith, J - invoice ""12""",Service revenue,"1,250.50",,Main,5000\r\n05/02/2026,Reece,Materials,,($430.00),Main,\n');
  assert.equal(rows.length, 3);
  const txs = Fin.normaliseTransactions(rows);
  assert.equal(txs.length, 2);
  assert.deepEqual([txs[0].date, txs[0].income, txs[0].description, txs[0].balance], ["2026-01-05", 1250.5, 'Smith, J - invoice "12"', 5000]);
  assert.deepEqual([txs[1].date, txs[1].expense, txs[1].type, txs[1].balance], ["2026-02-05", 430, "expense", null]);
});

test("amount+type CSVs and missing headers", () => {
  const txs = Fin.normaliseTransactions(Fin.parseCSV("Date,Payee,Amount,Type\n2026-03-01,Client,900,income\n2026-03-02,Rent,-600,\n"));
  assert.equal(txs[0].income, 900); assert.equal(txs[1].expense, 600); assert.equal(txs[1].category, "Uncategorised");
  assert.throws(() => Fin.normaliseTransactions(Fin.parseCSV("a,b\n1,2")), /DATE/);
});

test("toCSV round-trips", () => {
  const txs = sample.slice(0, 50);
  const back = Fin.normaliseTransactions(Fin.parseCSV(Fin.toCSV(txs)));
  assert.equal(back.length, 50);
  assert.equal(back[0].balance, txs[0].balance);
});

test("sample data is 24 complete months with realistic totals", () => {
  const s = Fin.monthlySeries(sample);
  assert.equal(s.length, 24);
  assert.equal(s[0].month, "2024-09"); assert.equal(s[23].month, END);
  for (const m of s) { assert.ok(m.income > 70000 && m.income < 200000, m.month); assert.ok(m.expense > 40000, m.month); }
  const total = s.reduce((a, m) => a + m.net, 0);
  assert.ok(total > 0, "the business is profitable over two years");
  assert.ok(sample[sample.length - 1].balance > 0);
});

test("overview KPIs agree with the series", () => {
  const o = Fin.overview(sample, 118000);
  assert.equal(o.months, 24);
  assert.equal(Math.round(o.income), Math.round(o.series.reduce((a, m) => a + m.income, 0)));
  assert.equal(o.net, Math.round((o.income - o.expense) * 100) / 100);
  assert.equal(o.recent.length, 10);
  assert.equal(o.expenseByCategory[0].category, "Payroll");
  assert.ok(o.worstMonth.net < o.bestMonth.net);
  const storm = o.series.find((m) => m.month === "2025-11"), before = o.series.find((m) => m.month === "2025-10"), after = o.series.find((m) => m.month === "2025-12");
  assert.ok(storm.income < before.income && storm.income < after.income, "the storm month dips");
});

test("filters", () => {
  const f = Fin.filterTransactions(sample, { from: "2026-01-01", to: "2026-01-31", type: "expense", search: "payroll" });
  assert.equal(f.length, 2);
  assert.ok(f.every((t) => t.category === "Payroll" && t.date.startsWith("2026-01")));
});

test("P&L arithmetic and comparisons", () => {
  const p = Fin.pnl(sample, END, undefined, Fin.SAMPLE_PNL_BUDGET);
  const c = p.current;
  assert.equal(c.grossProfit, Math.round((c.revenue - c.cogs) * 100) / 100);
  assert.equal(c.operatingProfit, Math.round((c.grossProfit - c.opex) * 100) / 100);
  assert.equal(c.netProfit, Math.round((c.operatingProfit - c.belowLine) * 100) / 100);
  assert.ok(c.grossMargin > 0.5 && c.grossMargin < 0.8);
  assert.equal(p.series.length, 12);
  const opex = p.lines.find((l) => l.key === "opex");
  assert.equal(opex.favourable, opex.vsPrev <= 0);
  assert.equal(opex.budget, 49000);
});

test("cash flow reconciles opening + net = ending, forecast flags the floor", () => {
  const cf = Fin.cashflow(sample, END, undefined, 118000, 10_000_000);
  for (const r of cf.series) assert.equal(Math.round(r.opening + r.net), Math.round(r.ending));
  assert.equal(cf.series.length, 12);
  assert.equal(cf.forecast.length, 3);
  assert.equal(cf.flagged.length, 3);
  assert.equal(cf.current.ending, sample[sample.length - 1].balance);
  assert.equal(cf.drains[0].key, "operating");
});

test("budget vs actual statuses, utilisation and forecast", () => {
  const b = Fin.budgetVsActual(sample, "2026-07", Fin.SAMPLE_BUDGETS, "2026-08-15");
  assert.equal(b.elapsedDays, 31);
  const rent = b.rows.find((r) => r.category === "Rent");
  assert.equal(rent.actual, 6200); assert.equal(rent.status, "amber"); assert.equal(rent.remaining, 0);   // exactly on budget
  const mk = b.rows.find((r) => r.category === "Marketing");
  assert.ok(mk.status === "red" && mk.variance > 0, "marketing overspends after the ads ramp");
  assert.ok(b.utilisation > 0.8);
  const partial = Fin.budgetVsActual(sample, "2026-08", Fin.SAMPLE_BUDGETS, "2026-08-10");
  assert.equal(partial.elapsedDays, 10);
  assert.ok(partial.forecastTotal > partial.totalActual);
});

test("CFO one-pager has ten metrics and a three-point summary", () => {
  const c = Fin.cfo(sample, END, undefined, 118000, Fin.SAMPLE_TARGETS);
  assert.equal(c.metrics.length, 10);
  const rev = c.metrics.find((m) => m.key === "revenue");
  assert.equal(rev.target, 100000);
  assert.ok(c.improved.length + c.worsened.length >= 1);
  assert.ok(c.attention.length <= 3);
  assert.ok(Number.isFinite(c.burn));
});

test("runway maths", () => {
  const r = Fin.runway({ cash: 120000, revenue: 8000, expenses: 6000, payroll: 20000, other: 2000, growth: 0.1 }, "2026-08");
  assert.equal(r.burn, 28000); assert.equal(r.netBurn, 20000); assert.equal(r.runwayMonths, 6);
  assert.equal(r.zeroCashMonth, "2027-02"); assert.equal(r.breakEvenRevenue, 28000);
  assert.equal(r.monthsToBreakEven, 14);
  assert.equal(r.scenarios.base.rows.length, 12);
  assert.ok(r.scenarios.worst.endingCash < r.scenarios.base.endingCash && r.scenarios.base.endingCash < r.scenarios.best.endingCash);
  assert.ok(r.scenarios.base.zeroCashMonth);
  const profitable = Fin.runway({ cash: 10000, revenue: 50000, expenses: 10000, payroll: 10000, other: 0, growth: 0 }, "2026-08");
  assert.equal(profitable.runwayMonths, Infinity); assert.equal(profitable.zeroCashMonth, null); assert.equal(profitable.monthsToBreakEven, 0);
});

test("insights find the planted anomalies with exact numbers", () => {
  const ins = Fin.insights(sample, undefined, 10_000_000);
  const titles = ins.map((i) => i.title);
  assert.ok(titles.some((t) => t.includes("Unusual Vehicle & fuel")), titles.join(" | "));
  assert.ok(titles.includes("Highest-profit month") && titles.includes("Lowest-profit month"));
  assert.ok(titles.some((t) => t.startsWith("Projected cash below minimum")));
  const ute = ins.find((i) => i.title.includes("Unusual Vehicle & fuel"));
  assert.match(ute.detail, /\$8,900/);
  assert.equal(ins[0].severity, "critical");
  // A revenue drop is detected when the storm month is the last complete month.
  const upTo = sample.filter((t) => t.date <= "2025-12-31");
  assert.ok(Fin.insights(upTo).some((i) => i.title === "Revenue fell month on month"));
});

test("net worth", () => {
  const n = Fin.netWorth(Fin.SAMPLE_NET_WORTH.assets, Fin.SAMPLE_NET_WORTH.liabilities, 11800, 8350);
  assert.equal(n.totalAssets, 1206000); assert.equal(n.totalLiabilities, 633900); assert.equal(n.netWorth, 572100);
  assert.ok(Math.abs(n.savingsRate - 0.2924) < 0.001);
  assert.equal(n.allocation[0].name, "Property");
});

test("formatting", () => {
  assert.equal(Fin.fmtMoney(1234567, { compact: true }), "$1.2M");
  assert.equal(Fin.fmtMoney(-15234, { compact: true }), "-$15.2K");
  assert.equal(Fin.fmtMoney(999), "$999");
  assert.equal(Fin.fmtPct(0.1234), "+12.3%"); assert.equal(Fin.fmtPct(null), "–");
  assert.equal(Fin.monthLabel("2026-08"), "Aug 26");
  assert.equal(Fin.addMonths("2026-12", 1), "2027-01");
});
