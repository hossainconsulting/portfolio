/* Finance dashboard calculation library. Pure functions, no DOM.
   Loaded by index.html as a classic script (window.Fin) and by Node tests (module.exports). */
(function (root, factory) {
  if (typeof module === "object" && module.exports) module.exports = factory();
  else root.Fin = factory();
})(typeof self !== "undefined" ? self : this, function () {
  "use strict";

  // ---- category taxonomy --------------------------------------------------------
  // Every category maps to a group. Income groups: revenue, other_income.
  // Expense groups: cogs, opex, debt, investment, tax, other. Unknown categories
  // fall back to revenue (income) or opex (expense), so any CSV works out of the box.
  const DEFAULT_GROUPS = {
    "Service revenue": "revenue", "Installation revenue": "revenue", "Maintenance contracts": "revenue",
    "Other income": "other_income", "Interest income": "other_income",
    "Materials": "cogs", "Subcontractors": "cogs", "Equipment hire": "cogs",
    "Payroll": "opex", "Rent": "opex", "Insurance": "opex", "Software": "opex", "Marketing": "opex",
    "Vehicle & fuel": "opex", "Utilities": "opex", "Professional fees": "opex", "Office & admin": "opex", "Training": "opex",
    "Loan repayment": "debt", "Interest expense": "debt",
    "Equipment purchase": "investment", "Vehicle purchase": "investment",
    "GST/BAS": "tax", "Income tax": "tax",
    "Owner drawings": "other",
  };
  const GROUP_LABELS = { revenue: "Revenue", other_income: "Other income", cogs: "Cost of goods sold", opex: "Operating expenses", debt: "Debt", investment: "Investments", tax: "Taxes", other: "Other outflows" };

  // ---- parsing ----------------------------------------------------------------------
  function parseCSV(text) {
    const rows = []; let row = [], field = "", q = false;
    const s = String(text).replace(/^﻿/, "");
    for (let i = 0; i < s.length; i++) {
      const c = s[i];
      if (q) {
        if (c === '"') { if (s[i + 1] === '"') { field += '"'; i++; } else q = false; }
        else field += c;
      } else if (c === '"') q = true;
      else if (c === ",") { row.push(field); field = ""; }
      else if (c === "\n" || c === "\r") {
        if (c === "\r" && s[i + 1] === "\n") i++;
        row.push(field); rows.push(row); row = []; field = "";
      } else field += c;
    }
    if (field.length || row.length) { row.push(field); rows.push(row); }
    return rows.filter((r) => r.some((v) => v.trim() !== ""));
  }

  function toNumber(v) {
    if (v === null || v === undefined) return 0;
    const s = String(v).trim().replace(/[$,\s]/g, "").replace(/^\((.*)\)$/, "-$1");
    const n = parseFloat(s);
    return Number.isFinite(n) ? n : 0;
  }

  function toISODate(v) {
    const s = String(v).trim();
    let m = /^(\d{4})-(\d{1,2})-(\d{1,2})/.exec(s);
    if (m) return `${m[1]}-${m[2].padStart(2, "0")}-${m[3].padStart(2, "0")}`;
    m = /^(\d{1,2})\/(\d{1,2})\/(\d{4})/.exec(s);           // d/m/yyyy (Australian)
    if (m) return `${m[3]}-${m[2].padStart(2, "0")}-${m[1].padStart(2, "0")}`;
    const d = new Date(s);
    return isNaN(d) ? null : d.toISOString().slice(0, 10);
  }

  /** Header-driven: DATE, DESCRIPTION, CATEGORY, INCOME, EXPENSE, ACCOUNT, BALANCE.
      Also accepts AMOUNT (+/-) with optional TYPE. Case-insensitive. */
  function normaliseTransactions(rows) {
    if (!rows.length) return [];
    const header = rows[0].map((h) => h.trim().toLowerCase());
    const col = (names) => { for (const n of names) { const i = header.indexOf(n); if (i >= 0) return i; } return -1; };
    const iDate = col(["date"]), iDesc = col(["description", "memo", "payee", "details"]), iCat = col(["category"]);
    const iInc = col(["income", "credit", "deposit"]), iExp = col(["expense", "debit", "withdrawal"]);
    const iAmt = col(["amount"]), iType = col(["type"]), iAcc = col(["account"]), iBal = col(["balance"]);
    if (iDate < 0) throw new Error("CSV needs a DATE column");
    const out = [];
    for (const r of rows.slice(1)) {
      const date = toISODate(r[iDate]);
      if (!date) continue;
      let income = iInc >= 0 ? Math.abs(toNumber(r[iInc])) : 0;
      let expense = iExp >= 0 ? Math.abs(toNumber(r[iExp])) : 0;
      if (iInc < 0 && iExp < 0 && iAmt >= 0) {
        const a = toNumber(r[iAmt]);
        const t = iType >= 0 ? String(r[iType]).toLowerCase() : "";
        if (t.startsWith("inc") || t.startsWith("cred") || (!t && a > 0)) income = Math.abs(a); else expense = Math.abs(a);
      }
      if (!income && !expense) continue;
      out.push({
        date, description: iDesc >= 0 ? r[iDesc].trim() : "", category: iCat >= 0 && r[iCat].trim() ? r[iCat].trim() : "Uncategorised",
        income, expense, type: income > 0 ? "income" : "expense", account: iAcc >= 0 && r[iAcc].trim() ? r[iAcc].trim() : "Main",
        balance: iBal >= 0 && String(r[iBal]).trim() !== "" ? toNumber(r[iBal]) : null,
      });
    }
    return out.sort((a, b) => a.date.localeCompare(b.date));
  }

  function toCSV(txs) {
    const esc = (v) => { const s = v === null || v === undefined ? "" : String(v); return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s; };
    const lines = ["DATE,DESCRIPTION,CATEGORY,INCOME,EXPENSE,ACCOUNT,BALANCE"];
    for (const t of txs) lines.push([t.date, t.description, t.category, t.income || "", t.expense || "", t.account, t.balance ?? ""].map(esc).join(","));
    return lines.join("\n") + "\n";
  }

  // ---- helpers ------------------------------------------------------------------------
  const monthOf = (date) => date.slice(0, 7);
  function addMonths(month, n) { const [y, m] = month.split("-").map(Number); const d = new Date(Date.UTC(y, m - 1 + n, 1)); return d.toISOString().slice(0, 7); }
  function monthRange(from, to) { const out = []; let m = from; while (m <= to) { out.push(m); m = addMonths(m, 1); } return out; }
  function daysInMonth(month) { const [y, m] = month.split("-").map(Number); return new Date(Date.UTC(y, m, 0)).getUTCDate(); }
  function monthLabel(month) { const [y, m] = month.split("-").map(Number); return new Date(Date.UTC(y, m - 1, 1)).toLocaleDateString("en-AU", { month: "short", year: "2-digit", timeZone: "UTC" }); }
  const pct = (cur, prev) => (prev ? (cur - prev) / Math.abs(prev) : (cur ? null : 0));
  const sum = (arr, f) => arr.reduce((s, x) => s + (f ? f(x) : x), 0);
  const round2 = (n) => Math.round(n * 100) / 100;
  const groupOf = (t, groups) => (groups || DEFAULT_GROUPS)[t.category] || (t.type === "income" ? "revenue" : "opex");

  function filterTransactions(txs, f) {
    f = f || {};
    const q = (f.search || "").trim().toLowerCase();
    return txs.filter((t) =>
      (!f.from || t.date >= f.from) && (!f.to || t.date <= f.to) &&
      (!f.category || t.category === f.category) && (!f.account || t.account === f.account) &&
      (!f.type || t.type === f.type) &&
      (!q || t.description.toLowerCase().includes(q) || t.category.toLowerCase().includes(q) || t.account.toLowerCase().includes(q)));
  }

  /** Complete monthly series over the span of the data (or given range). */
  function monthlySeries(txs, range) {
    if (!txs.length) return [];
    const from = range?.from || monthOf(txs[0].date), to = range?.to || monthOf(txs[txs.length - 1].date);
    const byMonth = new Map(monthRange(from, to).map((m) => [m, { month: m, income: 0, expense: 0, net: 0, byCategory: {}, count: 0 }]));
    for (const t of txs) {
      const row = byMonth.get(monthOf(t.date)); if (!row) continue;
      row.income += t.income; row.expense += t.expense; row.net += t.income - t.expense; row.count++;
      row.byCategory[t.category] = (row.byCategory[t.category] || 0) + (t.income - t.expense);
    }
    return [...byMonth.values()].map((r) => ({ ...r, income: round2(r.income), expense: round2(r.expense), net: round2(r.net) }));
  }

  function categoryTotals(txs, type) {
    const m = new Map();
    for (const t of txs) if (!type || t.type === type) m.set(t.category, (m.get(t.category) || 0) + (type === "income" ? t.income : t.expense));
    return [...m.entries()].map(([category, total]) => ({ category, total: round2(total) })).sort((a, b) => b.total - a.total);
  }

  /** Running balance. Uses the CSV's BALANCE column when present, else opening + cumulative net. */
  function withBalances(txs, openingCash) {
    let bal = openingCash || 0; const out = [];
    for (const t of txs) { bal = t.balance !== null && t.balance !== undefined ? t.balance : round2(bal + t.income - t.expense); out.push({ ...t, balance: bal }); }
    return out;
  }

  // ---- 1 & 2: overview / CSV dashboard -----------------------------------------------------
  function overview(txs, openingCash) {
    const series = monthlySeries(txs);
    const withBal = withBalances(txs, openingCash);
    const income = round2(sum(txs, (t) => t.income)), expense = round2(sum(txs, (t) => t.expense));
    const months = series.length || 1;
    const best = series.length ? series.reduce((a, b) => (b.net > a.net ? b : a)) : null;
    const worst = series.length ? series.reduce((a, b) => (b.net < a.net ? b : a)) : null;
    return {
      income, expense, net: round2(income - expense), months,
      avgIncome: round2(income / months), avgExpense: round2(expense / months), avgNet: round2((income - expense) / months),
      bestMonth: best, worstMonth: worst, series,
      expenseByCategory: categoryTotals(txs, "expense"), incomeByCategory: categoryTotals(txs, "income"),
      balance: withBal.length ? withBal[withBal.length - 1].balance : openingCash || 0,
      recent: withBal.slice(-10).reverse(), count: txs.length,
    };
  }

  // ---- 3: P&L ----------------------------------------------------------------------------------
  function pnlForMonth(txs, month, groups) {
    const g = { revenue: 0, other_income: 0, cogs: 0, opex: 0, debt: 0, investment: 0, tax: 0, other: 0 };
    for (const t of txs) if (monthOf(t.date) === month) g[groupOf(t, groups)] += t.income || t.expense;
    const revenue = g.revenue + g.other_income, grossProfit = revenue - g.cogs, operatingProfit = grossProfit - g.opex;
    const netProfit = operatingProfit - g.tax - g.debt;  // interest and tax below the line; investments and drawings are cash, not P&L
    return {
      month, revenue: round2(revenue), cogs: round2(g.cogs), grossProfit: round2(grossProfit), opex: round2(g.opex),
      operatingProfit: round2(operatingProfit), belowLine: round2(g.tax + g.debt), netProfit: round2(netProfit),
      grossMargin: revenue ? grossProfit / revenue : 0, netMargin: revenue ? netProfit / revenue : 0,
    };
  }

  function pnl(txs, month, groups, budget) {
    const cur = pnlForMonth(txs, month, groups), prev = pnlForMonth(txs, addMonths(month, -1), groups);
    const series = monthRange(addMonths(month, -11), month).map((m) => pnlForMonth(txs, m, groups));
    const b = budget || {};
    const lines = ["revenue", "cogs", "grossProfit", "opex", "operatingProfit", "netProfit"].map((k) => {
      const costLine = k === "cogs" || k === "opex";
      const vsPrev = cur[k] - prev[k], vsBudget = b[k] !== undefined ? cur[k] - b[k] : null;
      return { key: k, current: cur[k], previous: prev[k], vsPrev, vsPrevPct: pct(cur[k], prev[k]), budget: b[k] ?? null, vsBudget,
               vsBudgetPct: b[k] ? vsBudget / Math.abs(b[k]) : null, favourable: costLine ? vsPrev <= 0 : vsPrev >= 0,
               favourableVsBudget: vsBudget === null ? null : costLine ? vsBudget <= 0 : vsBudget >= 0 };
    });
    return { current: cur, previous: prev, lines, series, marginDelta: { gross: cur.grossMargin - prev.grossMargin, net: cur.netMargin - prev.netMargin } };
  }

  // ---- 4: cash flow -----------------------------------------------------------------------------
  function cashflowForMonth(txs, month, groups) {
    const g = { inflows: 0, opex: 0, cogs: 0, debt: 0, investment: 0, tax: 0, other: 0 };
    for (const t of txs) {
      if (monthOf(t.date) !== month) continue;
      if (t.type === "income") g.inflows += t.income; else g[groupOf(t, groups)] = (g[groupOf(t, groups)] || 0) + t.expense;
    }
    const outflows = g.opex + g.cogs + g.debt + g.investment + g.tax + g.other;
    return { month, inflows: round2(g.inflows), operating: round2(g.opex + g.cogs), debt: round2(g.debt), investments: round2(g.investment),
             taxes: round2(g.tax), other: round2(g.other), outflows: round2(outflows), net: round2(g.inflows - outflows) };
  }

  function cashflow(txs, month, groups, openingCash, minCash) {
    const first = txs.length ? monthOf(txs[0].date) : month;
    const months = monthRange(first, month);
    let cash = openingCash || 0; const series = [];
    for (const m of months) { const cf = cashflowForMonth(txs, m, groups); cf.opening = round2(cash); cash = round2(cash + cf.net); cf.ending = cash; series.push(cf); }
    const current = series[series.length - 1];
    const last12 = series.slice(-12);
    const drains = ["operating", "debt", "investments", "taxes", "other"].map((k) => ({ key: k, total: round2(sum(last12, (r) => r[k])) })).sort((a, b) => b.total - a.total);
    const drainCats = categoryTotals(txs.filter((t) => monthOf(t.date) >= addMonths(month, -11) && monthOf(t.date) <= month), "expense").slice(0, 8);
    // Forecast: average of the last three months, with the linear trend of the last six applied to inflows.
    const last3 = series.slice(-3), last6 = series.slice(-6);
    const avgIn = sum(last3, (r) => r.inflows) / last3.length, avgOut = sum(last3, (r) => r.outflows) / last3.length;
    const trend = last6.length >= 2 ? (last6[last6.length - 1].inflows - last6[0].inflows) / (last6.length - 1) : 0;
    const forecast = []; let fc = current.ending;
    for (let i = 1; i <= 3; i++) {
      const inflows = Math.max(0, avgIn + trend * i), net = inflows - avgOut; fc = round2(fc + net);
      forecast.push({ month: addMonths(month, i), inflows: round2(inflows), outflows: round2(avgOut), net: round2(net), ending: fc, belowMinimum: minCash !== undefined && fc < minCash });
    }
    return { current, series: last12, drains, drainCategories: drainCats, forecast, minCash: minCash ?? null, flagged: forecast.filter((f) => f.belowMinimum) };
  }

  // ---- 5: budget vs actual -----------------------------------------------------------------------
  function budgetVsActual(txs, month, budgets, asOfDate) {
    const inMonth = txs.filter((t) => monthOf(t.date) === month && t.type === "expense");
    const actualBy = new Map(); for (const t of inMonth) actualBy.set(t.category, (actualBy.get(t.category) || 0) + t.expense);
    const dim = daysInMonth(month);
    const asOf = asOfDate && monthOf(asOfDate) === month ? Number(asOfDate.slice(8, 10)) : (asOfDate && asOfDate < `${month}-01` ? 0 : dim);
    const elapsed = Math.max(1, Math.min(dim, asOf));
    const cats = new Set([...Object.keys(budgets || {}), ...actualBy.keys()]);
    const rows = [...cats].map((category) => {
      const budget = budgets?.[category] ?? 0, actual = round2(actualBy.get(category) || 0);
      const variance = round2(actual - budget), variancePct = budget ? variance / budget : (actual ? 1 : 0);
      const util = budget ? actual / budget : (actual ? Infinity : 0);
      const status = !budget && actual ? "red" : util > 1 ? "red" : util > 0.85 ? "amber" : "green";
      return { category, budget, actual, variance, variancePct, remaining: round2(budget - actual), utilisation: util, status, forecast: round2((actual / elapsed) * dim) };
    }).sort((a, b) => b.variance - a.variance);
    const totalBudget = round2(sum(rows, (r) => r.budget)), totalActual = round2(sum(rows, (r) => r.actual));
    const trend = monthRange(addMonths(month, -11), month).map((m) => ({ month: m, actual: round2(sum(txs.filter((t) => monthOf(t.date) === m && t.type === "expense"), (t) => t.expense)), budget: totalBudget }));
    return { month, rows, totalBudget, totalActual, utilisation: totalBudget ? totalActual / totalBudget : 0, overspends: rows.filter((r) => r.variance > 0).slice(0, 5),
             forecastTotal: round2((totalActual / elapsed) * dim), elapsedDays: elapsed, daysInMonth: dim, trend };
  }

  // ---- 6: CFO one-pager ----------------------------------------------------------------------------
  function cfo(txs, month, groups, openingCash, targets) {
    const p = pnl(txs, month, groups), cf = cashflow(txs, month, groups, openingCash);
    const cur = p.current, prev = p.previous;
    const quarter = monthRange(addMonths(month, -3), addMonths(month, -1)).map((m) => pnlForMonth(txs, m, groups));
    const qAvg = (k) => sum(quarter, (r) => r[k]) / quarter.length;
    const last3 = cf.series.slice(-3);
    const burn = Math.max(0, -sum(last3, (r) => r.net) / last3.length);   // average net cash out per month, 0 when cash-positive
    const grossBurn = sum(last3, (r) => r.outflows) / last3.length;
    const t = targets || {};
    const metric = (key, value, prevValue, quarterValue, target, lowerIsBetter) => ({
      key, value, vsPrev: value - prevValue, vsPrevPct: pct(value, prevValue), vsQuarter: value - quarterValue, vsQuarterPct: pct(value, quarterValue),
      target: target ?? null, vsTarget: target !== undefined && target !== null ? value - target : null,
      good: lowerIsBetter ? value <= prevValue : value >= prevValue,
    });
    const metrics = [
      metric("revenue", cur.revenue, prev.revenue, qAvg("revenue"), t.revenue),
      metric("growth", pct(cur.revenue, prev.revenue) ?? 0, pct(prev.revenue, pnlForMonth(txs, addMonths(month, -2), groups).revenue) ?? 0, 0, t.growth),
      metric("grossProfit", cur.grossProfit, prev.grossProfit, qAvg("grossProfit"), t.grossProfit),
      metric("grossMargin", cur.grossMargin, prev.grossMargin, qAvg("grossProfit") / (qAvg("revenue") || 1), t.grossMargin),
      metric("opex", cur.opex, prev.opex, qAvg("opex"), t.opex, true),
      metric("netProfit", cur.netProfit, prev.netProfit, qAvg("netProfit"), t.netProfit),
      metric("netMargin", cur.netMargin, prev.netMargin, qAvg("netProfit") / (qAvg("revenue") || 1), t.netMargin),
      metric("cash", cf.current.ending, cf.current.opening, cf.series.length >= 4 ? cf.series[cf.series.length - 4].ending : cf.current.opening, t.cash),
      metric("burn", burn, Math.max(0, -(cf.series.length >= 2 ? cf.series[cf.series.length - 2].net : 0)), 0, t.burn, true),
      metric("runway", burn > 0 ? cf.current.ending / burn : Infinity, Infinity, Infinity, t.runway),
    ];
    const improved = [], worsened = [];
    for (const m of metrics) if (["revenue", "grossMargin", "netProfit", "opex", "cash"].includes(m.key) && m.vsPrevPct !== null && Math.abs(m.vsPrevPct) >= 0.02) (m.good ? improved : worsened).push(m);
    const attention = [];
    if (burn > 0 && cf.current.ending / burn < 6) attention.push({ key: "runway", text: `Runway is ${(cf.current.ending / burn).toFixed(1)} months at the current net burn of ${fmtMoney(burn)}/month.` });
    if (cur.netMargin < 0) attention.push({ key: "netMargin", text: `Net margin is negative (${fmtPct(cur.netMargin)}): expenses exceeded revenue by ${fmtMoney(-cur.netProfit)}.` });
    if (t.revenue && cur.revenue < t.revenue) attention.push({ key: "revenueTarget", text: `Revenue missed target by ${fmtMoney(t.revenue - cur.revenue)} (${fmtPct((cur.revenue - t.revenue) / t.revenue)}).` });
    if (cur.opex > prev.opex * 1.1) attention.push({ key: "opex", text: `Operating expenses rose ${fmtPct(pct(cur.opex, prev.opex))} month on month, to ${fmtMoney(cur.opex)}.` });
    return { month, metrics, improved: improved.sort((a, b) => Math.abs(b.vsPrevPct) - Math.abs(a.vsPrevPct)).slice(0, 3), worsened: worsened.sort((a, b) => Math.abs(b.vsPrevPct) - Math.abs(a.vsPrevPct)).slice(0, 3), attention: attention.slice(0, 3), burn, grossBurn, pnl: p, cashflow: cf };
  }

  // ---- 7: startup runway -----------------------------------------------------------------------------
  function runway(inp, startMonth) {
    const cash = +inp.cash || 0, revenue = +inp.revenue || 0, expenses = +inp.expenses || 0, payroll = +inp.payroll || 0, other = +inp.other || 0, growth = +inp.growth || 0;
    const burn = expenses + payroll + other, netBurn = burn - revenue;
    const project = (g, costMult) => {
      const rows = []; let c = cash, rev = revenue, zero = null;
      for (let i = 1; i <= 12; i++) {
        rev = rev * (1 + g); const cost = burn * costMult; const net = rev - cost; c = c + net;
        if (zero === null && c < 0) zero = addMonths(startMonth, i);
        rows.push({ month: addMonths(startMonth, i), revenue: round2(rev), costs: round2(cost), net: round2(net), cash: round2(c) });
      }
      return { rows, zeroCashMonth: zero, endingCash: round2(c) };
    };
    const base = project(growth, 1), best = project(growth + 0.05, 0.9), worst = project(Math.max(-0.5, growth - 0.05), 1.15);
    const runwayMonths = netBurn > 0 ? cash / netBurn : Infinity;
    return {
      burn: round2(burn), netBurn: round2(netBurn), runwayMonths: Number.isFinite(runwayMonths) ? round2(runwayMonths) : Infinity,
      zeroCashMonth: Number.isFinite(runwayMonths) ? addMonths(startMonth, Math.floor(runwayMonths)) : null,
      breakEvenRevenue: round2(burn), monthsToBreakEven: growth > 0 && revenue > 0 && revenue < burn ? Math.ceil(Math.log(burn / revenue) / Math.log(1 + growth)) : (revenue >= burn ? 0 : null),
      scenarios: { base, best, worst },
    };
  }

  // ---- 8: insights (rule-based, exact numbers) ------------------------------------------------------------
  function insights(txs, groups, minCash) {
    const out = []; if (!txs.length) return out;
    const series = monthlySeries(txs);
    const complete = series.length > 1 ? series.slice(0, -1) : series;   // the last month is usually partial
    const push = (severity, title, detail, numbers) => out.push({ severity, title, detail, numbers });

    // Unusual single expenses: > mean + 2.5 sd of that category (min 5 samples), or > 3x median.
    const byCat = new Map();
    for (const t of txs) if (t.type === "expense") { if (!byCat.has(t.category)) byCat.set(t.category, []); byCat.get(t.category).push(t); }
    for (const [cat, list] of byCat) {
      if (list.length < 5) continue;
      const vals = list.map((t) => t.expense), mean = sum(vals) / vals.length, sd = Math.sqrt(sum(vals, (v) => (v - mean) ** 2) / vals.length);
      const sorted = [...vals].sort((a, b) => a - b), median = sorted[Math.floor(sorted.length / 2)];
      for (const t of list) if (t.expense > mean + 2.5 * sd && t.expense > 3 * median)
        push("warning", `Unusual ${cat} expense`, `${t.description || cat} on ${t.date}: ${fmtMoney(t.expense)}, ${(t.expense / median).toFixed(1)}x the category median of ${fmtMoney(median)}.`, { amount: t.expense, median, ratio: t.expense / median });
    }
    // Falling revenue: last complete month vs previous, and three consecutive declines.
    if (complete.length >= 2) {
      const a = complete[complete.length - 1], b = complete[complete.length - 2], change = pct(a.income, b.income);
      if (change !== null && change <= -0.1) push("serious", "Revenue fell month on month", `${monthLabel(a.month)} income ${fmtMoney(a.income)} vs ${fmtMoney(b.income)} in ${monthLabel(b.month)}: ${fmtPct(change)}.`, { current: a.income, previous: b.income, change });
      if (complete.length >= 4) { const l = complete.slice(-4); if (l[3].income < l[2].income && l[2].income < l[1].income && l[1].income < l[0].income) push("serious", "Revenue has declined three months running", `${monthLabel(l[0].month)} ${fmtMoney(l[0].income)} → ${monthLabel(l[3].month)} ${fmtMoney(l[3].income)} (${fmtPct(pct(l[3].income, l[0].income))}).`, { from: l[0].income, to: l[3].income }); }
    }
    // Fast-growing costs: category in the last complete month vs its prior 3-month average, +25% and > $500.
    if (complete.length >= 4) {
      const last = complete[complete.length - 1], prior = complete.slice(-4, -1);
      const cats = new Set(); for (const m of complete.slice(-4)) for (const c of Object.keys(m.byCategory)) cats.add(c);
      for (const c of cats) {
        const cur = -(last.byCategory[c] || 0); if (cur <= 0) continue;
        const avg = -sum(prior, (m) => m.byCategory[c] || 0) / prior.length; if (avg <= 0) continue;
        const ch = pct(cur, avg);
        if (ch >= 0.25 && cur - avg > 500) push("warning", `${c} is growing fast`, `${monthLabel(last.month)}: ${fmtMoney(cur)} vs a 3-month average of ${fmtMoney(avg)} (${fmtPct(ch)}, +${fmtMoney(cur - avg)}).`, { current: cur, average: avg, change: ch });
      }
    }
    // Best and worst profit months.
    if (complete.length >= 3) {
      const best = complete.reduce((x, y) => (y.net > x.net ? y : x)), worst = complete.reduce((x, y) => (y.net < x.net ? y : x));
      push("good", "Highest-profit month", `${monthLabel(best.month)}: net ${fmtMoney(best.net)} on income ${fmtMoney(best.income)} and expenses ${fmtMoney(best.expense)}.`, { net: best.net });
      push("info", "Lowest-profit month", `${monthLabel(worst.month)}: net ${fmtMoney(worst.net)} on income ${fmtMoney(worst.income)} and expenses ${fmtMoney(worst.expense)}.`, { net: worst.net });
    }
    // Cash-flow risk: two or more negative months in the last three, or forecast below minimum.
    const last3 = complete.slice(-3), neg = last3.filter((m) => m.net < 0);
    if (neg.length >= 2) push("critical", "Cash flow negative in " + neg.length + " of the last 3 months", neg.map((m) => `${monthLabel(m.month)} ${fmtMoney(m.net)}`).join(", ") + ".", { months: neg.length });
    if (minCash !== undefined && minCash !== null) {
      const cf = cashflow(txs, series[series.length - 1].month, groups, 0, minCash);
      for (const f of cf.flagged) push("critical", "Projected cash below minimum", `${monthLabel(f.month)} projected ending cash ${fmtMoney(f.ending)} is under the ${fmtMoney(minCash)} floor by ${fmtMoney(minCash - f.ending)}.`, { ending: f.ending, minCash });
    }
    const rank = { critical: 0, serious: 1, warning: 2, good: 3, info: 4 };
    return out.sort((a, b) => rank[a.severity] - rank[b.severity]);
  }

  // ---- 9: net worth ------------------------------------------------------------------------------------
  function netWorth(assets, liabilities, monthlyIncome, monthlyExpenses, history) {
    const a = sum(Object.values(assets || {}), Number), l = sum(Object.values(liabilities || {}), Number);
    const nw = a - l, savings = (monthlyIncome || 0) - (monthlyExpenses || 0);
    return {
      totalAssets: round2(a), totalLiabilities: round2(l), netWorth: round2(nw), debtRatio: a ? l / a : 0,
      monthlyIncome: monthlyIncome || 0, monthlyExpenses: monthlyExpenses || 0, savings: round2(savings), savingsRate: monthlyIncome ? savings / monthlyIncome : 0,
      allocation: Object.entries(assets || {}).map(([k, v]) => ({ name: k, value: +v, share: a ? v / a : 0 })).sort((x, y) => y.value - x.value),
      debts: Object.entries(liabilities || {}).map(([k, v]) => ({ name: k, value: +v, share: l ? v / l : 0 })).sort((x, y) => y.value - x.value),
      trend: history || [],
    };
  }

  // ---- formatting ---------------------------------------------------------------------------------------
  function fmtMoney(n, opts) {
    if (n === null || n === undefined || !Number.isFinite(n)) return "–";
    const compact = opts?.compact; const abs = Math.abs(n); const sign = n < 0 ? "-" : "";
    if (compact && abs >= 1e6) return `${sign}$${(abs / 1e6).toFixed(abs >= 1e7 ? 0 : 1)}M`;
    if (compact && abs >= 1e4) return `${sign}$${(abs / 1e3).toFixed(abs >= 1e5 ? 0 : 1)}K`;
    return `${sign}$${abs.toLocaleString("en-AU", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
  }
  function fmtPct(p, digits) { if (p === null || p === undefined || !Number.isFinite(p)) return "–"; return `${p > 0 ? "+" : ""}${(p * 100).toFixed(digits ?? 1)}%`; }

  // ---- sample data -----------------------------------------------------------------------------------------
  function mulberry32(seed) { return function () { let t = (seed += 0x6d2b79f5); t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }

  /** 24 months of a fictional Sydney trades business (Meridian Field Services): plumbing, electrical, HVAC. */
  function generateSample(endMonth, seed) {
    const rnd = mulberry32(seed || 42);
    const months = monthRange(addMonths(endMonth, -23), endMonth);
    const txs = [];
    const add = (date, description, category, income, expense, account) => txs.push({ date, description, category, income: round2(income), expense: round2(expense), type: income > 0 ? "income" : "expense", account: account || "Business transaction", balance: null });
    const day = (m, d) => `${m}-${String(Math.max(1, Math.min(daysInMonth(m), d))).padStart(2, "0")}`;
    const customers = ["Wattle St body corporate", "Harbourview Apartments", "Dunbar Family Trust", "Northshore Dental", "Parramatta Bakehouse", "St Leonards Physio", "Ryde Council", "Kings Cross Hotel", "Marrickville Brewery", "Chatswood Childcare"];
    months.forEach((m, i) => {
      const season = 1 + 0.12 * Math.sin(((i + 4) / 12) * 2 * Math.PI);           // summer HVAC peak
      const growth = 1 + 0.012 * i;
      const dip = i === 14 ? 0.72 : 1;                                             // one bad month (a storm halted installs)
      const base = 82000 * growth * season * dip;
      const jobs = 22 + Math.floor(rnd() * 8);
      for (let j = 0; j < jobs; j++) {
        const kind = rnd(); const cat = kind < 0.5 ? "Service revenue" : kind < 0.85 ? "Installation revenue" : "Maintenance contracts";
        const size = 1.65 * (cat === "Installation revenue" ? base * 0.045 * (0.5 + rnd()) : cat === "Service revenue" ? base * 0.02 * (0.4 + rnd()) : base * 0.03);
        add(day(m, 1 + Math.floor(rnd() * 28)), `${customers[Math.floor(rnd() * customers.length)]} - ${cat === "Maintenance contracts" ? "monthly retainer" : "invoice " + (1000 + i * 40 + j)}`, cat, size, 0);
      }
      if (i % 6 === 5) add(day(m, 20), "Term deposit interest", "Interest income", 640 + rnd() * 100, 0);
      // costs
      const materialsSpike = i === 18 ? 1.9 : 1;
      for (let k = 0; k < 6; k++) add(day(m, 2 + k * 4), ["Reece Plumbing", "Middy's Electrical", "Bunnings Trade", "Tradelink", "Lawrence & Hanson", "Actrol HVAC"][k], "Materials", 0, base * 0.055 * materialsSpike * (0.6 + rnd() * 0.8));
      add(day(m, 15), "Subcontractor - refrigeration", "Subcontractors", 0, base * 0.06 * (0.7 + rnd() * 0.6));
      add(day(m, 14), "Payroll fortnight A", "Payroll", 0, 15800 * (1 + 0.004 * i));
      add(day(m, 28), "Payroll fortnight B", "Payroll", 0, 15800 * (1 + 0.004 * i));
      add(day(m, 1), "Workshop rent - Artarmon", "Rent", 0, 6200);
      add(day(m, 3), "Public liability & fleet insurance", "Insurance", 0, 1850);
      add(day(m, 5), "ServiceM8 + Xero + Google Workspace", "Software", 0, 480 + (i > 15 ? 320 : 0));   // software creeps up
      add(day(m, 8), "Google Ads", "Marketing", 0, 1400 * (i >= 20 ? 1.6 : 1) * (0.8 + rnd() * 0.4));
      for (let f = 0; f < 3; f++) add(day(m, 6 + f * 9), "Ampol fleet fuel", "Vehicle & fuel", 0, 900 * (0.8 + rnd() * 0.4));
      add(day(m, 10), "Vehicle servicing", "Vehicle & fuel", 0, i % 3 === 0 ? 1450 : 260);
      add(day(m, 12), "Electricity & water", "Utilities", 0, 620 * season);
      add(day(m, 22), "Bookkeeper", "Professional fees", 0, 900);
      if (i % 12 === 7) add(day(m, 25), "Annual accounts & tax return", "Professional fees", 0, 4800);
      add(day(m, 17), "Office supplies & phone", "Office & admin", 0, 380 + rnd() * 200);
      add(day(m, 27), "Equipment finance - Ute loan", "Loan repayment", 0, 1320);
      if (i % 3 === 2) add(day(m, 28), "BAS payment (GST net)", "GST/BAS", 0, base * 0.041);
      if (i % 12 === 10) add(day(m, 15), "Income tax instalment", "Income tax", 0, 9800);
      add(day(m, 30), "Owner drawings", "Owner drawings", 0, 7000);
      if (i === 9) add(day(m, 11), "Refrigerant recovery unit", "Equipment purchase", 0, 14200);
      if (i === 21) add(day(m, 4), "Thermal imaging camera", "Equipment purchase", 0, 5600);
      if (i === 16) add(day(m, 19), "Ute repair after collision", "Vehicle & fuel", 0, 8900);      // the anomaly the insights should catch
    });
    txs.sort((a, b) => a.date.localeCompare(b.date));
    return withBalances(txs, 118000);
  }

  const SAMPLE_BUDGETS = { Materials: 27000, Subcontractors: 5500, Payroll: 33500, Rent: 6200, Insurance: 1900, Software: 600, Marketing: 1600, "Vehicle & fuel": 3400, Utilities: 700, "Professional fees": 1200, "Office & admin": 500, "Loan repayment": 1320, "GST/BAS": 4000, "Income tax": 900, "Owner drawings": 7000, "Equipment purchase": 1000 };
  const SAMPLE_PNL_BUDGET = { revenue: 100000, cogs: 33000, grossProfit: 67000, opex: 49000, operatingProfit: 18000, netProfit: 15000 };
  const SAMPLE_TARGETS = { revenue: 100000, growth: 0.015, grossMargin: 0.66, netMargin: 0.14, cash: 150000, runway: 6 };
  const SAMPLE_NET_WORTH = { assets: { Cash: 42000, Investments: 68000, Property: 910000, Retirement: 164000, Other: 22000 }, liabilities: { Mortgage: 612000, "Credit cards": 3400, Loans: 18500, "Other debt": 0 }, monthlyIncome: 11800, monthlyExpenses: 8350 };

  return { DEFAULT_GROUPS, GROUP_LABELS, parseCSV, normaliseTransactions, toCSV, toISODate, toNumber, monthOf, addMonths, monthRange, daysInMonth, monthLabel, pct, groupOf,
           filterTransactions, monthlySeries, categoryTotals, withBalances, overview, pnlForMonth, pnl, cashflowForMonth, cashflow, budgetVsActual, cfo, runway, insights, netWorth,
           fmtMoney, fmtPct, generateSample, SAMPLE_BUDGETS, SAMPLE_PNL_BUDGET, SAMPLE_TARGETS, SAMPLE_NET_WORTH };
});
