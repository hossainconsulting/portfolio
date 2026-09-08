/* Finance dashboard UI. Reads everything from lib.js (window.Fin); no dependencies. */
(function () {
  "use strict";
  const $ = (sel, el) => (el || document).querySelector(sel);
  const el = (tag, attrs, ...children) => {
    const n = document.createElement(tag);
    for (const [k, v] of Object.entries(attrs || {})) {
      if (k === "class") n.className = v; else if (k === "html") n.innerHTML = v; else if (k.startsWith("on")) n.addEventListener(k.slice(2), v); else n.setAttribute(k, v);
    }
    for (const c of children.flat()) if (c !== null && c !== undefined) n.append(c.nodeType ? c : document.createTextNode(String(c)));
    return n;
  };
  const money = (n, o) => Fin.fmtMoney(n, o), pctf = (p, d) => Fin.fmtPct(p, d);
  const SERIES = ["--s1", "--s2", "--s3", "--s4", "--s5", "--s6", "--s7", "--s8"].map((v) => `var(${v})`);
  const STORE = "finance-dashboard-v1";

  // ---- state -------------------------------------------------------------------------------
  const today = new Date().toISOString().slice(0, 10), thisMonth = today.slice(0, 7);
  const defaults = () => ({
    entity: "Sample data · Meridian Field Services (fictional)", sample: true, openingCash: 118000, txs: Fin.generateSample(thisMonth, 42).filter((t) => t.date <= today),
    budgets: { ...Fin.SAMPLE_BUDGETS }, pnlBudget: { ...Fin.SAMPLE_PNL_BUDGET }, targets: { ...Fin.SAMPLE_TARGETS }, minCash: 60000,
    runway: { cash: 120000, revenue: 18000, expenses: 9000, payroll: 26000, other: 3000, growth: 0.08 },
    netWorth: { ...Fin.SAMPLE_NET_WORTH, goal: 750000 },
    filters: { from: "", to: "", category: "", account: "", type: "", search: "", month: "" }, tab: "overview", preset: "12m",
  });
  let S = defaults();
  try {
    const saved = JSON.parse(localStorage.getItem(STORE) || "null");
    if (saved && saved.txs) S = { ...defaults(), ...saved, filters: { ...defaults().filters, ...(saved.filters || {}) } };
    const theme = localStorage.getItem(STORE + ":theme"); if (theme) document.documentElement.dataset.theme = theme;
  } catch { /* storage unavailable: run from memory */ }
  const save = () => { try { localStorage.setItem(STORE, JSON.stringify(S)); } catch { /* ignore */ } };

  const allMonths = () => Fin.monthlySeries(S.txs).map((m) => m.month);
  const lastMonth = () => { const ms = allMonths(); if (!ms.length) return thisMonth; const last = ms[ms.length - 1]; return last === thisMonth && ms.length > 1 ? ms[ms.length - 2] : last; };
  const month = () => (S.filters.month && allMonths().includes(S.filters.month) ? S.filters.month : lastMonth());
  const scoped = () => Fin.filterTransactions(S.txs, { account: S.filters.account });   // month-based views: account scope only
  const filtered = () => Fin.filterTransactions(S.txs, S.filters);

  function applyPreset(p) {
    S.preset = p; const last = S.txs.length ? S.txs[S.txs.length - 1].date : today;
    const m = last.slice(0, 7); const f = S.filters;
    const set = (from) => { f.from = from; f.to = last; };
    if (p === "all") { f.from = ""; f.to = ""; }
    else if (p === "12m") set(Fin.addMonths(m, -11) + "-01");
    else if (p === "6m") set(Fin.addMonths(m, -5) + "-01");
    else if (p === "3m") set(Fin.addMonths(m, -2) + "-01");
    else if (p === "ytd") set(m.slice(0, 4) + "-01-01");
    else if (p === "mtd") set(m + "-01");
  }
  if (!S.filters.from && S.preset !== "all") applyPreset(S.preset);

  // ---- charts (inline SVG) ---------------------------------------------------------------------
  function niceTicks(lo, hi, n) {
    if (lo === hi) { lo -= 1; hi += 1; }
    const span = hi - lo, raw = span / (n || 4), mag = Math.pow(10, Math.floor(Math.log10(raw)));
    const step = [1, 2, 2.5, 5, 10].map((s) => s * mag).find((s) => span / s <= (n || 4) + 1) || mag * 10;
    const start = Math.floor(lo / step) * step, end = Math.ceil(hi / step) * step, ticks = [];
    for (let v = start; v <= end + 1e-9; v += step) ticks.push(Math.round(v * 1e6) / 1e6);
    return { ticks, lo: start, hi: end };
  }
  const CW = () => (window.innerWidth < 640 ? 400 : 720);   // narrower viewBox on phones keeps axis text legible
  const tipAttr = (title, rows) => ` data-tip="${escapeAttr(JSON.stringify({ title, rows }))}" tabindex="0"`;
  const escapeAttr = (s) => s.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");
  const escapeText = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

  /** Grouped or stacked bars. series: [{name, color, values}]. Negative values grow down from the baseline. */
  function bars(opts) {
    const { labels, series, stacked = false, height = 220, format = (v) => money(v, { compact: true }), colorFn } = opts;
    const W = CW(), H = height, padL = 54, padR = 12, padT = 12, padB = 26, pw = W - padL - padR, ph = H - padT - padB;
    let lo = 0, hi = 0;
    labels.forEach((_, i) => {
      if (stacked) { let p = 0, ng = 0; for (const s of series) { const v = s.values[i] || 0; if (v >= 0) p += v; else ng += v; } hi = Math.max(hi, p); lo = Math.min(lo, ng); }
      else for (const s of series) { const v = s.values[i] || 0; hi = Math.max(hi, v); lo = Math.min(lo, v); }
    });
    const t = niceTicks(lo, hi, 4); const y = (v) => padT + ph - ((v - t.lo) / (t.hi - t.lo || 1)) * ph;
    const band = pw / labels.length, groupN = stacked ? 1 : series.length, gap = 2;
    const barW = Math.min(24, (band * 0.7 - gap * (groupN - 1)) / groupN);
    let g = `<g class="grid">${t.ticks.map((v) => `<line x1="${padL}" x2="${W - padR}" y1="${y(v)}" y2="${y(v)}"/>`).join("")}</g>`;
    g += `<g class="axis">${t.ticks.map((v) => `<text x="${padL - 6}" y="${y(v) + 4}" text-anchor="end">${format(v)}</text>`).join("")}`;
    const every = Math.ceil(labels.length / (W < 500 ? 6 : 12));
    g += labels.map((l, i) => (i % every === 0 ? `<text x="${padL + band * i + band / 2}" y="${H - 8}" text-anchor="middle">${escapeText(l)}</text>` : "")).join("") + "</g>";
    g += `<line class="baseline" x1="${padL}" x2="${W - padR}" y1="${y(0)}" y2="${y(0)}"/>`;
    labels.forEach((l, i) => {
      const x0 = padL + band * i + (band - (barW * groupN + gap * (groupN - 1))) / 2;
      let posTop = 0, negTop = 0;
      const rows = series.map((s) => ({ k: s.name, c: s.color, v: format(s.values[i] || 0) }));
      series.forEach((s, si) => {
        const v = s.values[i] || 0; if (!v && !stacked) { return; }
        let y0, y1;
        if (stacked) { if (v >= 0) { y0 = y(posTop + v); y1 = y(posTop); posTop += v; } else { y0 = y(negTop); y1 = y(negTop + v); negTop += v; } if (y1 - y0 > gap) y1 -= gap; }
        else { y0 = Math.min(y(0), y(v)); y1 = Math.max(y(0), y(v)); }
        const x = stacked ? x0 : x0 + si * (barW + gap), h = Math.max(0, y1 - y0);
        const fill = colorFn ? colorFn(v, i) : s.color, r = Math.min(4, h / 2);
        const rx = v >= 0 ? `M${x},${y1} v${-(h - r)} a${r},${r} 0 0 1 ${r},${-r} h${barW - 2 * r} a${r},${r} 0 0 1 ${r},${r} v${h - r} z` : `M${x},${y0} v${h - r} a${r},${r} 0 0 0 ${r},${r} h${barW - 2 * r} a${r},${r} 0 0 0 ${r},${-r} v${-(h - r)} z`;
        g += `<path class="mark" d="${h > 0 ? rx : ""}" fill="${fill}"${tipAttr(l, rows)}/>`;
      });
      g += `<rect class="mark" x="${padL + band * i}" y="${padT}" width="${band}" height="${ph}" fill="transparent"${tipAttr(l, rows)}/>`;
    });
    return `<svg viewBox="0 0 ${W} ${H}" role="img">${g}</svg>`;
  }

  /** Lines with crosshair hover. series: [{name, color, values}]; nulls break the line. */
  function lines(opts) {
    const { labels, series, height = 220, format = (v) => money(v, { compact: true }), area = false, zeroLine = true, endLabels = true } = opts;
    const W = CW(), H = height, padL = 54, padR = endLabels ? 64 : 12, padT = 12, padB = 26, pw = W - padL - padR, ph = H - padT - padB;
    const all = series.flatMap((s) => s.values.filter((v) => v !== null && v !== undefined && Number.isFinite(v)));
    let lo = Math.min(0, ...all), hi = Math.max(0, ...all); if (!zeroLine) { lo = Math.min(...all); hi = Math.max(...all); }
    const t = niceTicks(lo, hi, 4), y = (v) => padT + ph - ((v - t.lo) / (t.hi - t.lo || 1)) * ph, x = (i) => padL + (labels.length > 1 ? (i / (labels.length - 1)) * pw : pw / 2);
    let g = `<g class="grid">${t.ticks.map((v) => `<line x1="${padL}" x2="${W - padR}" y1="${y(v)}" y2="${y(v)}"/>`).join("")}</g>`;
    g += `<g class="axis">${t.ticks.map((v) => `<text x="${padL - 6}" y="${y(v) + 4}" text-anchor="end">${format(v)}</text>`).join("")}`;
    const every = Math.ceil(labels.length / (W < 500 ? 6 : 12));
    g += labels.map((l, i) => (i % every === 0 ? `<text x="${x(i)}" y="${H - 8}" text-anchor="middle">${escapeText(l)}</text>` : "")).join("") + "</g>";
    if (zeroLine && t.lo <= 0 && t.hi >= 0) g += `<line class="baseline" x1="${padL}" x2="${W - padR}" y1="${y(0)}" y2="${y(0)}"/>`;
    series.forEach((s) => {
      let d = "", pen = false;
      s.values.forEach((v, i) => { if (v === null || v === undefined || !Number.isFinite(v)) { pen = false; return; } d += `${pen ? "L" : "M"}${x(i)},${y(v)} `; pen = true; });
      if (area) g += `<path d="${d} L${x(s.values.length - 1)},${y(Math.max(0, t.lo))} L${x(0)},${y(Math.max(0, t.lo))} Z" fill="${s.color}" opacity=".1"/>`;
      g += `<path d="${d}" fill="none" stroke="${s.color}" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"/>`;
      const li = s.values.length - 1, lv = s.values[li];
      if (lv !== null && Number.isFinite(lv)) {
        g += `<circle cx="${x(li)}" cy="${y(lv)}" r="4" fill="${s.color}" stroke="var(--surface)" stroke-width="2"/>`;
        if (endLabels) g += `<text class="lbl" x="${x(li) + 8}" y="${y(lv) + 4}">${format(lv)}</text>`;
      }
    });
    // crosshair hit zones
    labels.forEach((l, i) => {
      const rows = series.map((s) => ({ k: s.name, c: s.color, v: format(s.values[i]) }));
      const w = labels.length > 1 ? pw / (labels.length - 1) : pw;
      g += `<rect class="mark" x="${x(i) - w / 2}" y="${padT}" width="${w}" height="${ph}" fill="transparent" data-x="${x(i)}"${tipAttr(l, rows)}/>`;
    });
    g += `<line class="xhair baseline" x1="0" x2="0" y1="${padT}" y2="${padT + ph}" style="display:none"/>`;
    return `<svg viewBox="0 0 ${W} ${H}" role="img">${g}</svg>`;
  }

  function donut(slices, opts) {
    const total = slices.reduce((a, s) => a + s.value, 0) || 1, R = 70, r = 46, cx = 90, cy = 90; let a0 = -Math.PI / 2, g = "";
    slices.forEach((s) => {
      const a1 = a0 + (s.value / total) * 2 * Math.PI, large = a1 - a0 > Math.PI ? 1 : 0;
      const p = (a, rad) => `${cx + rad * Math.cos(a)},${cy + rad * Math.sin(a)}`;
      g += `<path class="mark" d="M${p(a0, R)} A${R},${R} 0 ${large} 1 ${p(a1, R)} L${p(a1, r)} A${r},${r} 0 ${large} 0 ${p(a0, r)} Z" fill="${s.color}" stroke="var(--surface)" stroke-width="2"${tipAttr(s.name, [{ k: "share", c: s.color, v: pctf(s.value / total, 1).replace("+", "") }, { k: "amount", c: s.color, v: money(s.value) }])}/>`;
      a0 = a1;
    });
    g += `<text x="${cx}" y="${cy - 4}" text-anchor="middle" class="lbl" style="font-size:11px">${escapeText(opts?.label || "total")}</text><text x="${cx}" y="${cy + 14}" text-anchor="middle" style="fill:var(--ink);font-size:15px;font-weight:600">${money(total, { compact: true })}</text>`;
    return `<svg viewBox="0 0 180 180" style="max-width:180px" role="img">${g}</svg>`;
  }

  function spark(values, color) {
    const W = 120, H = 34, lo = Math.min(...values), hi = Math.max(...values), y = (v) => H - 3 - ((v - lo) / (hi - lo || 1)) * (H - 6), x = (i) => (i / Math.max(1, values.length - 1)) * W;
    const d = values.map((v, i) => `${i ? "L" : "M"}${x(i)},${y(v)}`).join(" ");
    return `<svg class="spark" viewBox="0 0 ${W} ${H}" preserveAspectRatio="none"><path d="${d}" fill="none" stroke="var(--muted)" stroke-width="1.5"/><circle cx="${x(values.length - 1)}" cy="${y(values[values.length - 1])}" r="3" fill="${color || "var(--s1)"}"/></svg>`;
  }

  const legend = (series, kind) => el("div", { class: "legend" }, ...series.map((s) => el("span", {}, el("i", { class: `key ${kind === "line" ? "line" : ""}`, style: `background:${s.color}` }), s.name)));
  const chartCard = (title, sub, svg, series, kind, span) => {
    const c = el("div", { class: `card ${span || "span-6"}` }, el("h2", {}, title), sub ? el("p", { class: "sub" }, sub) : null);
    if (series && series.length >= 2) c.append(legend(series, kind));
    c.append(el("div", { class: "chart", html: svg })); return c;
  };

  // tooltip
  const tip = $("#tooltip");
  function showTip(data, ev) {
    tip.replaceChildren(el("div", { class: "t" }, data.title), ...data.rows.map((r) => el("div", { class: "r" }, el("span", {}, el("i", { class: "k", style: `background:${r.c || "transparent"}` }), r.k), el("b", {}, r.v))));
    tip.hidden = false;
    const w = tip.offsetWidth, h = tip.offsetHeight, x = Math.min(ev.clientX + 14, window.innerWidth - w - 8), y = ev.clientY + 14 + h > window.innerHeight ? ev.clientY - h - 8 : ev.clientY + 14;
    tip.style.left = x + "px"; tip.style.top = y + "px";
  }
  document.addEventListener("pointermove", (ev) => {
    const m = ev.target.closest && ev.target.closest("[data-tip]");
    if (!m) { tip.hidden = true; document.querySelectorAll(".xhair").forEach((l) => (l.style.display = "none")); return; }
    showTip(JSON.parse(m.dataset.tip), ev);
    const svg = m.closest("svg"), xh = svg && svg.querySelector(".xhair");
    if (xh && m.dataset.x) { xh.setAttribute("x1", m.dataset.x); xh.setAttribute("x2", m.dataset.x); xh.style.display = ""; }
  });
  document.addEventListener("focusin", (ev) => { const m = ev.target.closest && ev.target.closest("[data-tip]"); if (m) { const r = m.getBoundingClientRect(); showTip(JSON.parse(m.dataset.tip), { clientX: r.left + r.width / 2, clientY: r.top }); } });
  document.addEventListener("focusout", () => (tip.hidden = true));

  // ---- shared pieces ------------------------------------------------------------------------------
  function tile(label, value, opts) {
    opts = opts || {};
    const t = el("div", { class: `card tile ${opts.span || "span-3"}` }, el("div", { class: "label" }, label), el("div", { class: `value ${opts.hero ? "hero" : ""}` }, value));
    if (opts.delta !== undefined && opts.delta !== null) {
      const good = opts.lowerIsBetter ? opts.delta <= 0 : opts.delta >= 0;
      t.append(el("div", { class: "delta" }, el("span", { class: good ? "up" : "down" }, `${opts.delta > 0 ? "▲" : opts.delta < 0 ? "▼" : "•"} ${opts.deltaText || pctf(opts.delta)}`), el("span", {}, opts.vs || "vs previous period")));
    } else if (opts.note) t.append(el("div", { class: "delta" }, opts.note));
    if (opts.spark) t.insertAdjacentHTML("beforeend", spark(opts.spark, opts.sparkColor));
    return t;
  }
  const signed = (v, f) => el("span", { class: v > 0 ? "pos" : v < 0 ? "neg" : "" }, (v > 0 ? "+" : "") + (f || money)(v));
  const arrow = (fav, v) => el("span", { class: fav === null ? "" : fav ? "pos" : "neg" }, v > 0 ? "▲" : v < 0 ? "▼" : "•");
  function table(headers, rows, opts) {
    const wrap = el("div", { class: "table-wrap" });
    const t = el("table"), thead = el("thead"), tr = el("tr");
    headers.forEach((h, i) => tr.append(el("th", { class: h.num ? "num" : "", onclick: opts?.onSort ? () => opts.onSort(i) : null }, h.label + (opts?.sortCol === i ? (opts.sortDir > 0 ? " ▲" : " ▼") : ""))));
    thead.append(tr); t.append(thead);
    const tb = el("tbody");
    if (!rows.length) tb.append(el("tr", {}, el("td", { colspan: String(headers.length), class: "empty" }, "Nothing to show for this filter.")));
    for (const r of rows) tb.append(el("tr", { class: r.total ? "total" : "" }, ...r.cells.map((c, i) => el("td", { class: `${headers[i].num ? "num" : ""} ${headers[i].desc ? "desc" : ""}` }, c))));
    t.append(tb); wrap.append(t); return wrap;
  }
  const catColor = (() => { const map = new Map(); return (cat) => { if (!map.has(cat)) map.set(cat, SERIES[map.size % SERIES.length]); return map.get(cat); }; })();  // color follows the entity
  const topN = (list, n, key) => { const head = list.slice(0, n), rest = list.slice(n); if (rest.length) head.push({ [key]: "Other", total: rest.reduce((a, r) => a + r.total, 0) }); return head; };
  const monthLabels = (ms) => ms.map(Fin.monthLabel);

  // ---- views ----------------------------------------------------------------------------------------
  const V = {};

  V.overview = (view) => {
    const txs = filtered(), o = Fin.overview(txs, S.openingCash);
    // previous period of equal length for deltas
    let prevO = null;
    if (S.filters.from && S.filters.to) {
      const days = (new Date(S.filters.to) - new Date(S.filters.from)) / 864e5 + 1;
      const pf = new Date(new Date(S.filters.from) - days * 864e5).toISOString().slice(0, 10), pt = new Date(new Date(S.filters.from) - 864e5).toISOString().slice(0, 10);
      const ptx = Fin.filterTransactions(S.txs, { ...S.filters, from: pf, to: pt }); if (ptx.length) prevO = Fin.overview(ptx, S.openingCash);
    }
    const profit = txs.reduce((a, t) => { const g = Fin.groupOf(t); return a + (t.type === "income" ? t.income : ["investment", "other"].includes(g) ? 0 : -t.expense); }, 0);
    const bud = Fin.budgetVsActual(scoped(), month(), S.budgets, today);
    const nets = o.series.map((m) => m.net);
    view.append(
      tile("Revenue", money(o.income, { compact: true }), { delta: prevO ? Fin.pct(o.income, prevO.income) : null, spark: o.series.map((m) => m.income) }),
      tile("Expenses", money(o.expense, { compact: true }), { delta: prevO ? Fin.pct(o.expense, prevO.expense) : null, lowerIsBetter: true, spark: o.series.map((m) => m.expense), sparkColor: "var(--s2)" }),
      tile("Profit (P&L basis)", money(profit, { compact: true }), { note: "excludes investments and drawings" }),
      tile("Net cash flow", money(o.net, { compact: true }), { delta: prevO ? Fin.pct(o.net, prevO.net) : null, spark: nets }),
      tile("Cash balance", money(o.balance, { compact: true }), { note: `after ${o.count} transactions` }),
      tile(`Budget used, ${Fin.monthLabel(month())}`, pctf(bud.utilisation, 0).replace("+", ""), { note: `${money(bud.totalActual, { compact: true })} of ${money(bud.totalBudget, { compact: true })}` }),
      tile("Best month", o.bestMonth ? `${Fin.monthLabel(o.bestMonth.month)}` : "–", { note: o.bestMonth ? `net ${money(o.bestMonth.net)}` : "" }),
      tile("Worst month", o.worstMonth ? `${Fin.monthLabel(o.worstMonth.month)}` : "–", { note: o.worstMonth ? `net ${money(o.worstMonth.net)}` : "" }),
    );
    const L = monthLabels(o.series.map((m) => m.month));
    const s2 = [{ name: "Income", color: SERIES[0], values: o.series.map((m) => m.income) }, { name: "Expenses", color: SERIES[1], values: o.series.map((m) => m.expense) }];
    view.append(chartCard("Monthly income and expenses", "Cash basis, all categories in the filter", bars({ labels: L, series: s2 }), s2, "bar", "span-8"));
    const cats = topN(o.expenseByCategory, 6, "category");
    const dn = el("div", { class: "card span-4" }, el("h2", {}, "Expense breakdown"), el("p", { class: "sub" }, "Top six categories, the rest as Other"));
    const row = el("div", { style: "display:flex;gap:14px;align-items:center;flex-wrap:wrap" });
    row.insertAdjacentHTML("beforeend", donut(cats.map((c) => ({ name: c.category, value: c.total, color: catColor(c.category) })), { label: "expenses" }));
    row.append(el("div", { class: "legend", style: "flex-direction:column;gap:4px" }, ...cats.map((c) => el("span", {}, el("i", { class: "key", style: `background:${catColor(c.category)}` }), `${c.category} `, el("b", { class: "muted" }, money(c.total, { compact: true }))))));
    dn.append(row); view.append(dn);
    view.append(chartCard("Net cash flow by month", "Blue above the line, red below", bars({ labels: L, series: [{ name: "Net", color: SERIES[0], values: nets }], colorFn: (v) => (v < 0 ? "var(--div-neg)" : "var(--div-pos)") }), null, null, "span-6"));
    const rc = el("div", { class: "card span-6" }, el("h2", {}, "Recent transactions"), el("p", { class: "sub" }, "Latest ten in the filter"));
    rc.append(table([{ label: "Date" }, { label: "Description", desc: true }, { label: "Category" }, { label: "Amount", num: true }, { label: "Balance", num: true }],
      o.recent.map((t) => ({ cells: [t.date, t.description, t.category, signed(t.income - t.expense), money(t.balance)] }))));
    view.append(rc);
  };

  let sortState = { col: 0, dir: -1 }, page = 0;
  V.transactions = (view) => {
    const txs = filtered(), o = Fin.overview(txs, S.openingCash);
    view.append(
      tile("Total income", money(o.income, { compact: true }), { note: `${money(o.avgIncome, { compact: true })} monthly average` }),
      tile("Total expenses", money(o.expense, { compact: true }), { note: `${money(o.avgExpense, { compact: true })} monthly average` }),
      tile("Net cash flow", money(o.net, { compact: true }), { note: `${money(o.avgNet, { compact: true })} monthly average` }),
      tile("Balance", money(o.balance, { compact: true }), { note: `${o.count} transactions over ${o.months} month${o.months === 1 ? "" : "s"}` }),
    );
    const cats = o.expenseByCategory.slice(0, 10);
    view.append(chartCard("Biggest expense categories", "Total in the filter", bars({ labels: cats.map((c) => c.category), series: [{ name: "Expense", color: SERIES[1], values: cats.map((c) => c.total) }], height: 200 }), null, null, "span-6"));
    const inc = o.incomeByCategory.slice(0, 8);
    view.append(chartCard("Income by category", "Total in the filter", bars({ labels: inc.map((c) => c.category), series: [{ name: "Income", color: SERIES[0], values: inc.map((c) => c.total) }], height: 200 }), null, null, "span-6"));
    const cols = [{ label: "Date", key: "date" }, { label: "Description", key: "description", desc: true }, { label: "Category", key: "category" }, { label: "Account", key: "account" }, { label: "Income", key: "income", num: true }, { label: "Expense", key: "expense", num: true }, { label: "Balance", key: "balance", num: true }];
    const withBal = Fin.withBalances(txs, S.openingCash);
    const sorted = [...withBal].sort((a, b) => { const k = cols[sortState.col].key, x = a[k], y = b[k]; return (typeof x === "number" ? x - y : String(x).localeCompare(String(y))) * sortState.dir; });
    const PAGE = 50, pages = Math.max(1, Math.ceil(sorted.length / PAGE)); page = Math.min(page, pages - 1);
    const card = el("div", { class: "card span-12" }, el("h2", {}, `All transactions (${sorted.length})`), el("p", { class: "sub" }, "Click a column to sort. Search and filters above scope this table."));
    card.append(table(cols, sorted.slice(page * PAGE, (page + 1) * PAGE).map((t) => ({ cells: [t.date, t.description, t.category, t.account, t.income ? money(t.income) : "", t.expense ? money(t.expense) : "", money(t.balance)] })),
      { sortCol: sortState.col, sortDir: sortState.dir, onSort: (i) => { sortState = { col: i, dir: sortState.col === i ? -sortState.dir : 1 }; render(); } }));
    if (pages > 1) card.append(el("div", { style: "display:flex;gap:8px;align-items:center;margin-top:10px" }, el("button", { class: "btn small", onclick: () => { page = Math.max(0, page - 1); render(); } }, "‹ Prev"), el("span", { class: "small muted" }, `Page ${page + 1} of ${pages}`), el("button", { class: "btn small", onclick: () => { page = Math.min(pages - 1, page + 1); render(); } }, "Next ›")));
    view.append(card);
  };

  V.pnl = (view) => {
    const p = Fin.pnl(scoped(), month(), undefined, S.pnlBudget), c = p.current, pv = p.previous;
    view.append(
      tile("Revenue", money(c.revenue, { compact: true }), { delta: Fin.pct(c.revenue, pv.revenue), vs: "vs last month" }),
      tile("Gross profit", money(c.grossProfit, { compact: true }), { delta: Fin.pct(c.grossProfit, pv.grossProfit), vs: `margin ${pctf(c.grossMargin, 1).replace("+", "")}` }),
      tile("Operating profit", money(c.operatingProfit, { compact: true }), { delta: Fin.pct(c.operatingProfit, pv.operatingProfit), vs: "vs last month" }),
      tile("Net profit", money(c.netProfit, { compact: true }), { delta: Fin.pct(c.netProfit, pv.netProfit), vs: `margin ${pctf(c.netMargin, 1).replace("+", "")}` }),
    );
    const names = { revenue: "Revenue", cogs: "Cost of goods sold", grossProfit: "Gross profit", opex: "Operating expenses", operatingProfit: "Operating profit", netProfit: "Net profit" };
    const card = el("div", { class: "card span-12" }, el("h2", {}, `Profit and loss, ${Fin.monthLabel(month())}`), el("p", { class: "sub" }, "Green: favourable (costs down or profit up). Red: unfavourable. Taxes and loan interest sit below operating profit; investments and drawings are cash, not P&L."));
    const rows = p.lines.map((l) => ({ cells: [names[l.key], money(l.current), money(l.previous), el("span", {}, arrow(l.favourable, l.vsPrev), " ", signed(l.vsPrev)), el("span", { class: l.favourable ? "pos" : "neg" }, pctf(l.vsPrevPct)), l.budget === null ? "–" : money(l.budget), l.vsBudget === null ? "–" : el("span", {}, arrow(l.favourableVsBudget, l.vsBudget), " ", signed(l.vsBudget)), l.vsBudgetPct === null ? "–" : el("span", { class: l.favourableVsBudget ? "pos" : "neg" }, pctf(l.vsBudgetPct))] }));
    rows.push({ cells: ["Gross margin", pctf(c.grossMargin, 1).replace("+", ""), pctf(pv.grossMargin, 1).replace("+", ""), el("span", { class: p.marginDelta.gross >= 0 ? "pos" : "neg" }, `${(p.marginDelta.gross * 100).toFixed(1)} pts`), "", "", "", ""] });
    rows.push({ cells: ["Net margin", pctf(c.netMargin, 1).replace("+", ""), pctf(pv.netMargin, 1).replace("+", ""), el("span", { class: p.marginDelta.net >= 0 ? "pos" : "neg" }, `${(p.marginDelta.net * 100).toFixed(1)} pts`), "", "", "", ""] });
    card.append(table([{ label: "Line" }, { label: "Current", num: true }, { label: "Previous", num: true }, { label: "Δ $", num: true }, { label: "Δ %", num: true }, { label: "Budget", num: true }, { label: "vs budget", num: true }, { label: "vs budget %", num: true }], rows));
    view.append(card);
    const L = monthLabels(p.series.map((m) => m.month));
    const s3 = [{ name: "Revenue", color: SERIES[0], values: p.series.map((m) => m.revenue) }, { name: "Gross profit", color: SERIES[2], values: p.series.map((m) => m.grossProfit) }, { name: "Net profit", color: SERIES[6], values: p.series.map((m) => m.netProfit) }];
    view.append(chartCard("12-month trend", "Revenue, gross profit and net profit", lines({ labels: L, series: s3 }), s3, "line"));
    const sm = [{ name: "Gross margin", color: SERIES[2], values: p.series.map((m) => m.grossMargin) }, { name: "Net margin", color: SERIES[6], values: p.series.map((m) => m.netMargin) }];
    view.append(chartCard("Margins", "Gross and net margin, monthly", lines({ labels: L, series: sm, format: (v) => `${(v * 100).toFixed(0)}%` }), sm, "line"));
  };

  V.cashflow = (view) => {
    const cf = Fin.cashflow(scoped(), month(), undefined, S.openingCash, S.minCash), c = cf.current;
    view.append(
      tile("Opening cash", money(c.opening, { compact: true })), tile("Inflows", money(c.inflows, { compact: true })), tile("Outflows", money(c.outflows, { compact: true })),
      tile("Ending cash", money(c.ending, { compact: true }), { delta: Fin.pct(c.ending, c.opening), vs: `net ${money(c.net)}` }),
    );
    const wf = el("div", { class: "card span-4" }, el("h2", {}, `Cash movement, ${Fin.monthLabel(month())}`), el("p", { class: "sub" }, "Opening to ending"));
    wf.append(table([{ label: "Line" }, { label: "Amount", num: true }], [
      { cells: ["Opening cash", money(c.opening)] }, { cells: ["Inflows", signed(c.inflows)] }, { cells: ["Operating expenses (incl. COGS)", signed(-c.operating)] },
      { cells: ["Debt", signed(-c.debt)] }, { cells: ["Investments", signed(-c.investments)] }, { cells: ["Taxes", signed(-c.taxes)] }, { cells: ["Other outflows", signed(-c.other)] },
      { cells: ["Net cash flow", signed(c.net)] }, { cells: ["Ending cash", money(c.ending)], total: true }]));
    view.append(wf);
    const L = monthLabels(cf.series.map((m) => m.month));
    const s2 = [{ name: "Inflows", color: SERIES[0], values: cf.series.map((m) => m.inflows) }, { name: "Outflows", color: SERIES[1], values: cf.series.map((m) => m.outflows) }];
    view.append(chartCard("Inflows and outflows", "Last 12 months", bars({ labels: L, series: s2 }), s2, "bar", "span-8"));
    view.append(chartCard("Ending cash", "Month-end balance", lines({ labels: L, series: [{ name: "Ending cash", color: SERIES[0], values: cf.series.map((m) => m.ending) }], area: true }), null, null, "span-6"));
    const dr = cf.drainCategories;
    view.append(chartCard("Biggest cash drains", "Expense categories, last 12 months", bars({ labels: dr.map((d) => d.category), series: [{ name: "Outflow", color: SERIES[1], values: dr.map((d) => d.total) }], height: 200 }), null, null, "span-6"));
    const fc = el("div", { class: "card span-12" }, el("h2", {}, "3-month cash forecast"), el("p", { class: "sub" }, "Inflows: 3-month average plus the 6-month trend. Outflows: 3-month average. Rows below the minimum are flagged."));
    const minRow = el("div", { class: "form", style: "max-width:260px;margin-bottom:10px" }, el("label", {}, "Minimum cash", el("input", { type: "number", value: S.minCash, onchange: (e) => { S.minCash = +e.target.value || 0; save(); render(); } })));
    fc.append(minRow);
    fc.append(table([{ label: "Month" }, { label: "Inflows", num: true }, { label: "Outflows", num: true }, { label: "Net", num: true }, { label: "Ending cash", num: true }, { label: "Status" }],
      cf.forecast.map((f) => ({ cells: [Fin.monthLabel(f.month), money(f.inflows), money(f.outflows), signed(f.net), money(f.ending), el("span", { class: `status ${f.belowMinimum ? "red" : "green"}` }, el("i", { class: "dot" }), f.belowMinimum ? `below ${money(cf.minCash)} minimum` : "above minimum")] }))));
    view.append(fc);
  };

  V.budget = (view) => {
    const b = Fin.budgetVsActual(scoped(), month(), S.budgets, today);
    view.append(
      tile("Total budget", money(b.totalBudget, { compact: true })), tile("Actual to date", money(b.totalActual, { compact: true }), { note: `day ${b.elapsedDays} of ${b.daysInMonth}` }),
      tile("Utilisation", pctf(b.utilisation, 0).replace("+", ""), { note: b.utilisation > 1 ? "over budget" : b.utilisation > 0.85 ? "approaching budget" : "within budget" }),
      tile("End-of-month forecast", money(b.forecastTotal, { compact: true }), { delta: b.totalBudget ? (b.forecastTotal - b.totalBudget) / b.totalBudget : null, lowerIsBetter: true, vs: "vs budget" }),
    );
    const card = el("div", { class: "card span-8" }, el("h2", {}, `Budget vs actual by category, ${Fin.monthLabel(month())}`), el("p", { class: "sub" }, "Green under 85%, amber 85-100%, red over budget. Edit budgets in the panel to the right."));
    card.append(table([{ label: "Category" }, { label: "Budget", num: true }, { label: "Actual", num: true }, { label: "Variance $", num: true }, { label: "Variance %", num: true }, { label: "Remaining", num: true }, { label: "Used" }, { label: "Status" }],
      b.rows.map((r) => ({ cells: [r.category, money(r.budget), money(r.actual), signed(r.variance), el("span", { class: r.variance > 0 ? "neg" : "pos" }, Number.isFinite(r.variancePct) ? pctf(r.variancePct, 0) : "–"), money(r.remaining),
        el("div", { class: "bar-track" }, el("div", { class: `fill ${r.utilisation > 1 ? "over" : r.utilisation > 0.85 ? "warn" : ""}`, style: `width:${Math.min(100, (Number.isFinite(r.utilisation) ? r.utilisation : 1) * 100)}%` })),
        el("span", { class: `status ${r.status}` }, el("i", { class: "dot" }), r.status === "green" ? "on track" : r.status === "amber" ? "watch" : "over")] }))));
    view.append(card);
    const edit = el("div", { class: "card span-4" }, el("h2", {}, "Monthly budgets"), el("p", { class: "sub" }, "Per category. Saved in this browser."));
    const form = el("div", { class: "form", style: "grid-template-columns:1fr" });
    for (const cat of [...new Set([...Object.keys(S.budgets), ...Fin.categoryTotals(S.txs, "expense").map((c) => c.category)])].sort())
      form.append(el("label", {}, cat, el("input", { type: "number", value: S.budgets[cat] ?? 0, onchange: (e) => { S.budgets[cat] = +e.target.value || 0; save(); render(); } })));
    edit.append(form); view.append(edit);
    const L = monthLabels(b.trend.map((m) => m.month));
    const s2 = [{ name: "Actual", color: SERIES[0], values: b.trend.map((m) => m.actual) }, { name: "Budget", color: SERIES[3], values: b.trend.map((m) => m.budget) }];
    view.append(chartCard("Monthly spending vs budget", "Total expenses, 12 months", bars({ labels: L, series: s2 }), s2, "bar"));
    const ov = b.overspends;
    view.append(chartCard("Biggest overspending areas", "Variance above budget this month", bars({ labels: ov.map((r) => r.category), series: [{ name: "Over budget", color: "var(--div-neg)", values: ov.map((r) => r.variance) }], height: 200 }), null, null));
  };

  V.cfo = (view) => {
    const c = Fin.cfo(scoped(), month(), undefined, S.openingCash, S.targets);
    const fmt = { revenue: money, growth: (v) => pctf(v), grossProfit: money, grossMargin: (v) => pctf(v, 1).replace("+", ""), opex: money, netProfit: money, netMargin: (v) => pctf(v, 1).replace("+", ""), cash: money, burn: money, runway: (v) => (Number.isFinite(v) ? `${v.toFixed(1)} mo` : "∞") };
    const names = { revenue: "Revenue", growth: "Revenue growth", grossProfit: "Gross profit", grossMargin: "Gross margin", opex: "Operating expenses", netProfit: "Net profit", netMargin: "Net margin", cash: "Cash", burn: "Net burn (3-mo avg)", runway: "Runway" };
    const lower = new Set(["opex", "burn"]);
    for (const m of c.metrics) {
      const f = fmt[m.key], t = el("div", { class: "card tile span-3" }, el("div", { class: "label" }, names[m.key]), el("div", { class: "value" }, f(m.value)));
      const line = (label, d, ref) => { if (ref === null || ref === undefined || !Number.isFinite(d)) return null; const good = lower.has(m.key) ? d <= 0 : d >= 0; return el("div", { class: "delta" }, el("span", { class: good ? "up" : "down" }, (d > 0 ? "▲ " : d < 0 ? "▼ " : "• ") + (["growth", "grossMargin", "netMargin"].includes(m.key) ? `${(d * 100).toFixed(1)} pts` : m.key === "runway" ? `${d.toFixed(1)} mo` : money(d))), el("span", {}, label)); };
      const parts = m.key === "runway" && !Number.isFinite(m.value)
        ? [el("div", { class: "delta" }, "cash-flow positive over the last 3 months; no burn to run out")]
        : [line("vs last month", m.vsPrev, m.value), line("vs last quarter avg", m.vsQuarter, m.value), m.target !== null ? line(`vs target ${f(m.target)}`, m.vsTarget, m.target) : el("div", { class: "delta muted" }, "no target set")];
      t.append(...parts.filter(Boolean));
      view.append(t);
    }
    const chg = (m) => (["growth", "grossMargin", "netMargin"].includes(m.key) ? `${m.vsPrev >= 0 ? "+" : ""}${(m.vsPrev * 100).toFixed(1)} pts` : `${pctf(m.vsPrevPct)} (${(m.vsPrev >= 0 ? "+" : "") + money(m.vsPrev)})`);
    const sum3 = el("div", { class: "card span-6" }, el("h2", {}, "CFO summary"), el("p", { class: "sub" }, `${Fin.monthLabel(month())} vs ${Fin.monthLabel(Fin.addMonths(month(), -1))}`));
    const list = (title, items, f) => el("div", { style: "margin-bottom:8px" }, el("b", {}, title), items.length ? el("ul", { class: "plain" }, ...items.map((m) => el("li", {}, f(m)))) : el("div", { class: "muted small" }, "nothing material"));
    sum3.append(
      list("What improved", c.improved, (m) => `${names[m.key]} ${chg(m)} to ${fmt[m.key](m.value)}`),
      list("What worsened", c.worsened, (m) => `${names[m.key]} ${chg(m)} to ${fmt[m.key](m.value)}`),
      list("Needs attention", c.attention, (a) => a.text),
    );
    view.append(sum3);
    const tg = el("div", { class: "card span-6" }, el("h2", {}, "Targets"), el("p", { class: "sub" }, "Monthly. Growth and margins as decimals (0.15 = 15%). Saved in this browser."));
    const form = el("div", { class: "form" });
    for (const k of ["revenue", "growth", "grossProfit", "grossMargin", "opex", "netProfit", "netMargin", "cash", "burn", "runway"]) form.append(el("label", {}, names[k], el("input", { type: "number", step: "any", value: S.targets[k] ?? "", onchange: (e) => { if (e.target.value === "") delete S.targets[k]; else S.targets[k] = +e.target.value; save(); render(); } })));
    tg.append(form); view.append(tg);
    const L = monthLabels(c.pnl.series.map((m) => m.month));
    const s2 = [{ name: "Revenue", color: SERIES[0], values: c.pnl.series.map((m) => m.revenue) }, { name: "Net profit", color: SERIES[6], values: c.pnl.series.map((m) => m.netProfit) }];
    view.append(chartCard("Revenue and net profit", "12 months", lines({ labels: L, series: s2 }), s2, "line", "span-12"));
  };

  V.runway = (view) => {
    const r = Fin.runway(S.runway, month());
    const form = el("div", { class: "card span-12" }, el("h2", {}, "Inputs"), el("p", { class: "sub" }, "Monthly figures. Growth is monthly revenue growth as a decimal (0.08 = 8%). Best case: growth +5 pts and costs −10%. Worst: growth −5 pts and costs +15%."));
    const f = el("div", { class: "form" });
    for (const [k, label] of [["cash", "Cash on hand"], ["revenue", "Monthly revenue"], ["expenses", "Monthly expenses"], ["payroll", "Monthly payroll"], ["other", "Other monthly costs"], ["growth", "Monthly revenue growth"]])
      f.append(el("label", {}, label, el("input", { type: "number", step: "any", value: S.runway[k], onchange: (e) => { S.runway[k] = +e.target.value || 0; save(); render(); } })));
    form.append(f); view.append(form);
    view.append(
      tile("Gross burn", money(r.burn, { compact: true }), { note: "expenses + payroll + other" }),
      tile("Net burn", money(r.netBurn, { compact: true }), { note: r.netBurn <= 0 ? "cash-flow positive" : "burn minus revenue" }),
      tile("Runway", Number.isFinite(r.runwayMonths) ? `${r.runwayMonths.toFixed(1)} months` : "∞", { hero: false, note: r.zeroCashMonth ? `zero cash ${Fin.monthLabel(r.zeroCashMonth)} at flat revenue` : "not burning cash" }),
      tile("Break-even revenue", money(r.breakEvenRevenue, { compact: true }), { note: r.monthsToBreakEven === null ? "never at this growth" : r.monthsToBreakEven === 0 ? "already there" : `in ~${r.monthsToBreakEven} months at ${pctf(S.runway.growth, 1)}/mo` }),
    );
    const sc = r.scenarios, L = monthLabels(sc.base.rows.map((m) => m.month));
    const s3 = [{ name: "Base", color: SERIES[0], values: sc.base.rows.map((m) => m.cash) }, { name: "Best", color: SERIES[2], values: sc.best.rows.map((m) => m.cash) }, { name: "Worst", color: SERIES[7], values: sc.worst.rows.map((m) => m.cash) }];
    view.append(chartCard("12-month cash projection", "Three scenarios; below zero means out of cash", lines({ labels: L, series: s3 }), s3, "line", "span-12"));
    const tb = el("div", { class: "card span-12" }, el("h2", {}, "Base case, month by month"));
    tb.append(table([{ label: "Month" }, { label: "Revenue", num: true }, { label: "Costs", num: true }, { label: "Net", num: true }, { label: "Cash", num: true }], sc.base.rows.map((m) => ({ cells: [Fin.monthLabel(m.month), money(m.revenue), money(m.costs), signed(m.net), el("span", { class: m.cash < 0 ? "neg" : "" }, money(m.cash))] }))));
    const zero = (s) => (s.zeroCashMonth ? Fin.monthLabel(s.zeroCashMonth) : "not within 12 months");
    tb.append(el("p", { class: "small muted", style: "margin:10px 0 0" }, `Zero-cash month: base ${zero(sc.base)}, best ${zero(sc.best)}, worst ${zero(sc.worst)}. Ending cash after 12 months: base ${money(sc.base.endingCash)}, best ${money(sc.best.endingCash)}, worst ${money(sc.worst.endingCash)}.`));
    view.append(tb);
  };

  V.insights = (view) => {
    const ins = Fin.insights(scoped(), undefined, S.minCash);
    const count = (s) => ins.filter((i) => i.severity === s).length;
    view.append(tile("Critical", String(count("critical"))), tile("Serious", String(count("serious"))), tile("Warnings", String(count("warning"))), tile("Positive", String(count("good"))));
    const card = el("div", { class: "card span-12" }, el("h2", {}, "Insights"), el("p", { class: "sub" }, "Rule-based on your data: unusual expenses (2.5 standard deviations and 3x the category median), revenue falls of 10% or more, categories up 25% on their 3-month average, best and worst months, negative cash flow, forecast below the minimum cash set on the Cash flow tab. Every insight states the numbers."));
    if (!ins.length) card.append(el("p", { class: "empty" }, "Nothing unusual found. That is an insight too."));
    const icons = { critical: "!", serious: "!", warning: "△", good: "✓", info: "i" };
    for (const i of ins) card.append(el("div", { class: "insight" }, el("span", { class: `ico ${i.severity}`, title: i.severity }, icons[i.severity]), el("div", {}, el("b", {}, i.title), el("span", {}, i.detail))));
    view.append(card);
  };

  V.networth = (view) => {
    const nw = S.netWorth, n = Fin.netWorth(nw.assets, nw.liabilities, nw.monthlyIncome, nw.monthlyExpenses);
    view.append(
      tile("Net worth", money(n.netWorth, { compact: true }), { hero: true, span: "span-4", note: `${money(n.totalAssets, { compact: true })} assets, ${money(n.totalLiabilities, { compact: true })} liabilities` }),
      tile("Debt ratio", pctf(n.debtRatio, 0).replace("+", ""), { note: "liabilities ÷ assets", span: "span-4" }),
      tile("Savings rate", pctf(n.savingsRate, 0).replace("+", ""), { note: `${money(n.savings)} of ${money(n.monthlyIncome)} income each month`, span: "span-4" }),
    );
    const form = el("div", { class: "card span-4" }, el("h2", {}, "Assets and liabilities"), el("p", { class: "sub" }, "Saved in this browser."));
    const f = el("div", { class: "form", style: "grid-template-columns:1fr 1fr" });
    for (const k of Object.keys(nw.assets)) f.append(el("label", {}, k, el("input", { type: "number", value: nw.assets[k], onchange: (e) => { nw.assets[k] = +e.target.value || 0; save(); render(); } })));
    for (const k of Object.keys(nw.liabilities)) f.append(el("label", {}, k, el("input", { type: "number", value: nw.liabilities[k], onchange: (e) => { nw.liabilities[k] = +e.target.value || 0; save(); render(); } })));
    f.append(el("label", {}, "Monthly income", el("input", { type: "number", value: nw.monthlyIncome, onchange: (e) => { nw.monthlyIncome = +e.target.value || 0; save(); render(); } })));
    f.append(el("label", {}, "Monthly expenses", el("input", { type: "number", value: nw.monthlyExpenses, onchange: (e) => { nw.monthlyExpenses = +e.target.value || 0; save(); render(); } })));
    f.append(el("label", {}, "Net worth goal", el("input", { type: "number", value: nw.goal, onchange: (e) => { nw.goal = +e.target.value || 0; save(); render(); } })));
    form.append(f); view.append(form);
    const al = el("div", { class: "card span-4" }, el("h2", {}, "Asset allocation"));
    const row = el("div", { style: "display:flex;gap:14px;align-items:center;flex-wrap:wrap" });
    row.insertAdjacentHTML("beforeend", donut(n.allocation.filter((a) => a.value > 0).map((a) => ({ name: a.name, value: a.value, color: catColor("nw:" + a.name) })), { label: "assets" }));
    row.append(el("div", { class: "legend", style: "flex-direction:column;gap:4px" }, ...n.allocation.map((a) => el("span", {}, el("i", { class: "key", style: `background:${catColor("nw:" + a.name)}` }), `${a.name} `, el("b", { class: "muted" }, pctf(a.share, 0).replace("+", ""))))));
    al.append(row); view.append(al);
    const debts = n.debts.filter((d) => d.value > 0);
    view.append(chartCard("Debt breakdown", "By liability", bars({ labels: debts.map((d) => d.name), series: [{ name: "Debt", color: SERIES[7], values: debts.map((d) => d.value) }], height: 180 }), null, null, "span-4"));
    const prog = el("div", { class: "card span-6" }, el("h2", {}, "Savings progress"), el("p", { class: "sub" }, `Toward a net worth goal of ${money(nw.goal)}`));
    const share = nw.goal ? Math.min(1, n.netWorth / nw.goal) : 0, monthsLeft = n.savings > 0 && nw.goal > n.netWorth ? Math.ceil((nw.goal - n.netWorth) / n.savings) : null;
    prog.append(el("div", { class: "bar-track", style: "height:12px" }, el("div", { class: "fill", style: `width:${share * 100}%` })), el("p", { class: "small", style: "margin:8px 0 0" }, `${pctf(share, 0).replace("+", "")} of goal. ${monthsLeft === null ? (share >= 1 ? "Goal reached." : "Savings are not positive, so no date.") : `At ${money(n.savings)}/month of savings alone, about ${monthsLeft} months (${(monthsLeft / 12).toFixed(1)} years); investment returns would shorten that.`}`));
    view.append(prog);
    const hist = []; for (let i = 12; i >= 0; i--) hist.push(n.netWorth - n.savings * i);
    const L = []; for (let i = 12; i >= 0; i--) L.push(Fin.monthLabel(Fin.addMonths(thisMonth, -i)));
    view.append(chartCard("Net worth trend", "Implied from the current savings rate; replace with real month-end figures when you have them", lines({ labels: L, series: [{ name: "Net worth", color: SERIES[0], values: hist }], zeroLine: false, area: true }), null, null, "span-6"));
  };

  V.audit = (view) => {
    const o = Fin.overview(S.txs, S.openingCash), p = Fin.pnl(scoped(), month()), cf = Fin.cashflow(scoped(), month(), undefined, S.openingCash, S.minCash), b = Fin.budgetVsActual(scoped(), month(), S.budgets, today), ins = Fin.insights(scoped(), undefined, S.minCash);
    const q = el("div", { class: "card span-6" }, el("h2", {}, "Five questions this dashboard answers, with today's numbers"));
    q.append(el("ol", { class: "plain" },
      el("li", {}, `Did we make money in ${Fin.monthLabel(month())}? Net profit ${money(p.current.netProfit)} on revenue ${money(p.current.revenue)} (${pctf(p.current.netMargin, 1).replace("+", "")} net margin), ${pctf(Fin.pct(p.current.netProfit, p.previous.netProfit))} vs the month before.`),
      el("li", {}, `Where does the money go? Top expense category ${o.expenseByCategory[0]?.category ?? "–"} at ${money(o.expenseByCategory[0]?.total ?? 0, { compact: true })} over ${o.months} months.`),
      el("li", {}, `Are we on budget? ${pctf(b.utilisation, 0).replace("+", "")} used with ${b.daysInMonth - b.elapsedDays} days left; ${b.overspends.length} categor${b.overspends.length === 1 ? "y" : "ies"} over.`),
      el("li", {}, `Will cash hold? Ending cash ${money(cf.current.ending)}; 3-month forecast ${cf.flagged.length ? `dips below the ${money(S.minCash)} floor in ${cf.flagged.length} month${cf.flagged.length === 1 ? "" : "s"}` : `stays above the ${money(S.minCash)} floor`}.`),
      el("li", {}, `What changed that I should look at? ${ins.length} insight${ins.length === 1 ? "" : "s"}, ${ins.filter((i) => i.severity === "critical" || i.severity === "serious").length} of them critical or serious.`),
    ));
    view.append(q);
    const g = el("div", { class: "card span-6" }, el("h2", {}, "Three gaps"), el("ol", { class: "plain" },
      el("li", {}, "Cash basis only: no accounts receivable or payable, so profit and cash can diverge in ways this page cannot see. Import an AR/AP ageing to close it."),
      el("li", {}, "Budgets are flat monthly amounts. Seasonal businesses need a month-by-month budget table, and the P&L budget is a single set of numbers rather than a 12-month plan."),
      el("li", {}, "The net worth trend is implied from the savings rate, not recorded. A monthly snapshot table would turn it into a real time series."),
    ), el("h2", { style: "margin-top:14px" }, "Three recommended upgrades"), el("ol", { class: "plain" },
      el("li", {}, "Bank feed or Xero/QuickBooks export on a schedule, so the CSV import becomes automatic and the Monday digest carries these numbers."),
      el("li", {}, "Drill-through: click any category bar to open the transactions behind it (the filter row already supports this; wire the click)."),
      el("li", {}, "An LLM narrative on top of the rule-based insights: same numbers, written as a two-paragraph monthly note for the owner, with the platform's agent runtime doing the writing."),
    ));
    view.append(g);
    const feats = ["KPI hierarchy: hero and stat tiles first, tables last", "Month-on-month and vs last-quarter comparisons on every P&L and CFO metric", "Variance analysis in dollars and percent, favourable direction aware", "Conditional formatting: green/amber/red status with icon and label, never colour alone", "Filters: date presets and custom range, month, category, account, type, search", "Drill-down: sortable, paginated transactions with search", "Forecasts: 3-month cash forecast, end-of-month budget forecast, 12-month runway scenarios", "Ratios: gross and net margin, debt ratio, savings rate, burn and runway", "Insights: rule-based, every one with exact numbers and percentage change", "CSV export of the filtered transactions; print stylesheet for PDF", "Responsive: 12-column grid collapses to one column under 640px", "Accessible charts: legends for multi-series, hover and keyboard tooltips, table twins for every chart's numbers"];
    view.append(el("div", { class: "card span-12" }, el("h2", {}, "Implemented at analyst level"), el("ul", { class: "plain" }, ...feats.map((f) => el("li", {}, f)))));
  };

  // ---- shell -------------------------------------------------------------------------------------
  const TABS = [["overview", "Overview"], ["transactions", "Transactions"], ["pnl", "P&L"], ["cashflow", "Cash flow"], ["budget", "Budget vs actual"], ["cfo", "CFO one-pager"], ["runway", "Runway"], ["insights", "Insights"], ["networth", "Net worth"], ["audit", "Analyst audit"]];
  const MONTH_VIEWS = new Set(["pnl", "cashflow", "budget", "cfo", "runway", "insights"]);
  function renderTabs() {
    const nav = $("#tabs"); nav.replaceChildren(...TABS.map(([id, label]) => el("button", { role: "tab", "aria-selected": String(S.tab === id), onclick: () => { S.tab = id; save(); render(); } }, label)));
  }
  function renderFilters() {
    const f = S.filters;
    $("#presets").replaceChildren(...[["all", "All"], ["12m", "12M"], ["6m", "6M"], ["3m", "3M"], ["ytd", "YTD"], ["mtd", "MTD"]].map(([p, l]) => el("button", { "aria-pressed": String(S.preset === p), onclick: () => { applyPreset(p); save(); render(); } }, l)));
    $("#f-from").value = f.from; $("#f-to").value = f.to;
    const fill = (id, values, cur) => { const s = $(id); s.replaceChildren(el("option", { value: "" }, "All"), ...values.map((v) => el("option", { value: v }, v))); s.value = cur; };
    fill("#f-category", [...new Set(S.txs.map((t) => t.category))].sort(), f.category);
    fill("#f-account", [...new Set(S.txs.map((t) => t.account))].sort(), f.account);
    $("#f-type").value = f.type; $("#f-search").value = f.search;
    const ms = allMonths(); $("#f-month").replaceChildren(...ms.slice().reverse().map((m) => el("option", { value: m }, Fin.monthLabel(m)))); $("#f-month").value = month();
    const dateScoped = !MONTH_VIEWS.has(S.tab) && S.tab !== "networth" && S.tab !== "audit";
    for (const id of ["#presets", "#f-from", "#f-to"]) $(id).parentElement.style.opacity = dateScoped ? "" : ".45";
    $("#f-month").parentElement.style.opacity = MONTH_VIEWS.has(S.tab) || S.tab === "overview" ? "" : ".45";
    $("#filters").style.display = S.tab === "networth" ? "none" : "";
  }
  function render() {
    renderTabs(); renderFilters(); $("#entity").textContent = S.entity;
    const view = $("#view"); view.replaceChildren();
    try { V[S.tab](view); } catch (e) { console.error(e); view.append(el("div", { class: "card span-12" }, el("h2", {}, "This view hit an error"), el("p", { class: "muted small" }, String(e.message || e)))); }
  }
  const bindFilter = (id, key, transform) => $(id).addEventListener(id === "#f-search" ? "input" : "change", (e) => { S.filters[key] = transform ? transform(e.target.value) : e.target.value; if (key === "from" || key === "to") S.preset = "custom"; page = 0; save(); render(); });
  bindFilter("#f-from", "from"); bindFilter("#f-to", "to"); bindFilter("#f-category", "category"); bindFilter("#f-account", "account"); bindFilter("#f-type", "type"); bindFilter("#f-search", "search"); bindFilter("#f-month", "month");

  // import / export / print / reset / theme
  const dlg = $("#import-dialog");
  $("#btn-import").addEventListener("click", () => { $("#import-error").textContent = ""; $("#import-text").value = ""; $("#import-file").value = ""; dlg.showModal(); });
  $("#import-cancel").addEventListener("click", () => dlg.close());
  $("#import-file").addEventListener("change", (e) => { const f = e.target.files[0]; if (!f) return; const r = new FileReader(); r.onload = () => ($("#import-text").value = r.result); r.readAsText(f); });
  $("#import-ok").addEventListener("click", () => {
    try {
      const txs = Fin.normaliseTransactions(Fin.parseCSV($("#import-text").value));
      if (!txs.length) throw new Error("No transactions found. Check the header row and that INCOME/EXPENSE or AMOUNT have numbers.");
      const hasBalance = txs.some((t) => t.balance !== null);
      S.txs = hasBalance ? txs : Fin.withBalances(txs, +$("#import-opening").value || 0);
      S.openingCash = hasBalance ? 0 : +$("#import-opening").value || 0;
      S.entity = $("#import-entity").value.trim() || "Imported data"; S.sample = false;
      S.filters = { ...defaults().filters }; S.preset = "12m"; applyPreset("12m");
      S.budgets = Object.fromEntries(Fin.categoryTotals(S.txs, "expense").map((c) => [c.category, Math.round(c.total / Math.max(1, Fin.monthlySeries(S.txs).length))]));  // seed budgets at the monthly average; edit on the Budget tab
      save(); dlg.close(); render();
    } catch (err) { $("#import-error").textContent = err.message; }
  });
  $("#btn-export").addEventListener("click", () => {
    const blob = new Blob([Fin.toCSV(Fin.withBalances(filtered(), S.openingCash))], { type: "text/csv" });
    const a = el("a", { href: URL.createObjectURL(blob), download: `transactions-${today}.csv` }); document.body.append(a); a.click(); a.remove();
  });
  $("#btn-print").addEventListener("click", () => window.print());
  $("#btn-reset").addEventListener("click", () => { if (!confirm("Discard imported data and settings and return to the sample?")) return; try { localStorage.removeItem(STORE); } catch { /* ignore */ } S = defaults(); applyPreset("12m"); render(); });
  $("#btn-theme").addEventListener("click", () => { const cur = document.documentElement.dataset.theme; const next = cur === "dark" ? "light" : cur === "light" ? "" : (matchMedia("(prefers-color-scheme: dark)").matches ? "light" : "dark"); if (next) document.documentElement.dataset.theme = next; else delete document.documentElement.dataset.theme; try { localStorage.setItem(STORE + ":theme", next); } catch { /* ignore */ } });

  let lastW = CW(); let resizeTimer;
  window.addEventListener("resize", () => { clearTimeout(resizeTimer); resizeTimer = setTimeout(() => { if (CW() !== lastW) { lastW = CW(); render(); } }, 150); });

  render();
  window.FinanceDashboard = { state: () => S, render };
})();
