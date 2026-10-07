"""``tradelab`` command line.

  tradelab markets [--mic]            list the universe, or download the ISO 10383 registry
  tradelab collect [--source ...]     download history into data/raw
  tradelab coverage                   what has been collected, oldest first
  tradelab report [--ticker ^GSPC]    crashes, regimes, base rates -> reports/
  tradelab backtest --ticker ^GSPC    walk-forward SMA and momentum vs buy-and-hold
  tradelab ladder [--contrib 500]     the $100 ladder, honestly
  tradelab journal check|review       tilt flags and the weekly review
"""
from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path

import pandas as pd

from . import analysis, backtest, data, markets, sizing
from .journal import Journal, PRE_TRADE_CHECKLIST, tilt_check, weekly_review


def _root(args) -> Path:
    return Path(args.root)


def cmd_markets(args) -> int:
    if args.mic:
        rows = markets.fetch_mic_registry()
        out = Path(args.root) / "markets_iso10383.json"
        out.parent.mkdir(parents=True, exist_ok=True)
        out.write_text(json.dumps(rows, indent=1))
        print(f"{len(rows)} active operating MICs written to {out}")
        return 0
    df = pd.DataFrame(markets.to_records(markets.UNIVERSE))
    print(df[["region", "country", "exchange", "index_name", "yahoo", "currency"]].to_string(index=False))
    print(f"\n{len(df)} series across {len(markets.exchanges())} venues")
    return 0


def cmd_collect(args) -> int:
    root = _root(args)
    sources = ["yahoo", "stooq", "shiller", "jst"] if args.source == "all" else [args.source]
    rc = 0
    for s in sources:
        try:
            if s == "yahoo":
                r = data.collect_yahoo(root, pause=args.pause)
                print(f"yahoo: {len(r.ok)} ok, {len(r.failed)} failed")
                for k, v in r.failed.items():
                    print(f"  FAILED {k}: {v}")
            elif s == "stooq":
                r = data.collect_stooq(root, pause=args.pause)
                print(f"stooq: {len(r.ok)} ok, {len(r.failed)} failed")
            elif s == "shiller":
                print(f"shiller: {data.collect_shiller(root)}")
            elif s == "jst":
                print(f"jst: {data.collect_jst(root)}")
        except Exception as e:  # noqa: BLE001
            print(f"{s}: FAILED {type(e).__name__}: {e}")
            rc = 1
    return rc


def cmd_coverage(args) -> int:
    df = data.coverage(_root(args))
    if df.empty:
        print("nothing collected yet: run `tradelab collect`")
        return 1
    print(df.to_string(index=False))
    return 0


def _series(root: Path, ticker: str) -> pd.Series:
    df = data.load(root, ticker)
    if df is None:
        sys.exit(f"no data for {ticker}; run `tradelab collect`")
    return df["close"].astype(float)


def report_markdown(name: str, close: pd.Series) -> str:
    s = analysis.summary(close)
    lines = [f"# {name}", "", f"Data: {s['first']} to {s['last']} ({s['years']} years)", "",
             "## Summary", "", "| metric | value |", "|---|---|"]
    for k in ("cagr", "annual_volatility", "sharpe_rf0", "max_drawdown", "max_drawdown_date", "calmar", "best_day", "worst_day", "positive_days", "crashes_20pct"):
        lines.append(f"| {k} | {s[k]} |")
    lines += ["", "## Bear markets and collapses (peak-to-trough of 20% or more)", "",
              "| peak | trough | depth | days to trough | recovered | days to recover |", "|---|---|---|---|---|---|"]
    for c in analysis.crash_episodes(close):
        d = c.as_dict()
        lines.append(f"| {d['peak']} | {d['trough']} | {d['depth_pct']}% | {d['days_to_trough']} | {d['recovered'] or 'not yet'} | {d['days_to_recover'] or '-'} |")
    lines += ["", "## Regime base rates (what the next 12 months did, historically)", "",
              analysis.regime_stats(close).to_markdown() if _has_tabulate() else analysis.regime_stats(close).to_string(), "",
              "## Rolling 10-year CAGR", ""]
    rc = analysis.rolling_cagr(close, 10)
    if not rc.empty:
        lines.append(f"worst 10-year stretch: {rc.min():.2%} (ending {rc.idxmin().date()}); best: {rc.max():.2%} (ending {rc.idxmax().date()}); median: {rc.median():.2%}")
    return "\n".join(lines) + "\n"


def _has_tabulate() -> bool:
    try:
        import tabulate  # noqa: F401
        return True
    except ImportError:
        return False


def cmd_report(args) -> int:
    root = _root(args)
    out_dir = Path(args.out)
    out_dir.mkdir(parents=True, exist_ok=True)
    tickers = [args.ticker] if args.ticker else [m.yahoo for m in markets.UNIVERSE if data.load(root, m.yahoo) is not None]
    if not tickers:
        print("nothing collected yet: run `tradelab collect`")
        return 1
    world = []
    for t in tickers:
        close = _series(root, t)
        name = next((m.index_name for m in markets.UNIVERSE if m.yahoo == t), t)
        (out_dir / f"{data._safe_name(t)}.md").write_text(report_markdown(name, close))
        world.append({"ticker": t, "index": name, **analysis.summary(close)})
    pd.DataFrame(world).sort_values("first").to_csv(out_dir / "world_summary.csv", index=False)
    print(f"wrote {len(tickers)} reports and world_summary.csv to {out_dir}")
    return 0


def cmd_backtest(args) -> int:
    close = _series(_root(args), args.ticker)
    bh = backtest.run(close, backtest.buy_and_hold, args.cost, args.slippage)
    print(f"buy and hold      {bh.metrics}")
    grid_sma = [{"fast": f, "slow": s} for f in (20, 50, 100) for s in (100, 200, 300) if f < s]
    grid_mom = [{"lookback": n} for n in (63, 126, 189, 252)]
    for label, factory, grid in (("sma_cross", backtest.sma_cross, grid_sma), ("momentum", backtest.momentum, grid_mom)):
        wf = backtest.walk_forward(close, factory, grid, args.train_years, args.test_years, args.cost, args.slippage)
        print(f"\n{label} walk-forward, {len(wf.folds)} folds")
        print(wf.folds.to_string(index=False))
        print(f"out-of-sample     {wf.oos_metrics}")
        print(f"buy-and-hold same {wf.benchmark_metrics}")
    return 0


def cmd_ladder(args) -> int:
    rungs = sizing.ladder(args.income, args.start, args.contrib)
    print(f"Income ladder: ${args.income:.0f} per period, starting ${args.start:.0f}, adding ${args.contrib:.0f}/month\n")
    print(f"{'per':<10}{'per year':>14}" + "".join(f"{'capital@'+k:>16}{'years':>8}" for k in sizing.RETURN_SCENARIOS))
    for r in rungs:
        row = f"{r.period:<10}{r.income_per_year:>14,.0f}"
        for k in sizing.RETURN_SCENARIOS:
            y = r.years_from_start[k]
            row += f"{r.capital_needed[k]:>16,.0f}{(str(y) if y is not None else '>100'):>8}"
        print(row)
    print("\nReturn scenarios: index 8%/yr (broad equities, long run), elite 20%/yr (best managers, decades), fantasy 50%/yr (nobody, sustained).")
    print("Read the 'years' column with contributions. Trading skill changes the rate; it does not remove the capital requirement.")
    return 0


def cmd_journal(args) -> int:
    j = Journal(Path(args.file))
    trades = j.read()
    if args.action == "checklist":
        for i, q in enumerate(PRE_TRADE_CHECKLIST, 1):
            print(f"{i}. {q}")
        return 0
    if args.action == "check":
        flags = tilt_check(trades)
        if not flags:
            print(f"{len(trades)} trades logged, no tilt flags. Run the checklist, then trade the plan.")
            return 0
        for f in flags:
            print(f"[{f.rule}] {f.detail}\n   -> {f.advice}")
        return 2
    print(json.dumps(weekly_review(trades), indent=2))
    return 0


def main(argv: list[str] | None = None) -> int:
    p = argparse.ArgumentParser(prog="tradelab", description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    p.add_argument("--root", default="data", help="data directory (default: data)")
    sub = p.add_subparsers(dest="cmd", required=True)

    s = sub.add_parser("markets"); s.add_argument("--mic", action="store_true", help="download ISO 10383 registry"); s.set_defaults(fn=cmd_markets)
    s = sub.add_parser("collect"); s.add_argument("--source", default="yahoo", choices=["yahoo", "stooq", "shiller", "jst", "all"]); s.add_argument("--pause", type=float, default=1.0); s.set_defaults(fn=cmd_collect)
    s = sub.add_parser("coverage"); s.set_defaults(fn=cmd_coverage)
    s = sub.add_parser("report"); s.add_argument("--ticker"); s.add_argument("--out", default="reports"); s.set_defaults(fn=cmd_report)
    s = sub.add_parser("backtest"); s.add_argument("--ticker", default="^GSPC"); s.add_argument("--cost", type=float, default=10.0); s.add_argument("--slippage", type=float, default=5.0)
    s.add_argument("--train-years", type=int, default=5); s.add_argument("--test-years", type=int, default=1); s.set_defaults(fn=cmd_backtest)
    s = sub.add_parser("ladder"); s.add_argument("--income", type=float, default=100.0); s.add_argument("--start", type=float, default=100.0); s.add_argument("--contrib", type=float, default=0.0); s.set_defaults(fn=cmd_ladder)
    s = sub.add_parser("journal"); s.add_argument("action", choices=["checklist", "check", "review"]); s.add_argument("--file", default="journal/trades.csv"); s.set_defaults(fn=cmd_journal)

    args = p.parse_args(argv)
    return args.fn(args)


if __name__ == "__main__":
    sys.exit(main())
