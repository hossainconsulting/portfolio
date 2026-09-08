# Trading lab

The research, data, risk and personal-development foundation for a trading
product that will one day be sold through `../platform`. Python, no broker
keys, no live orders. Start with `docs/RESEARCH.md`; it explains why the
plan looks the way it does.

## The honest summary

- Fewer than 1% of day traders are profitable after costs over the long run
  (Taiwan, 15 years; Brazil, 97% of persistent day traders lost). AI does not
  change that base rate for the person clicking the button.
- "$100 to $100 a minute" is a capital question. `tradelab ladder` shows that
  $100/month needs about $15,000 at index returns and $100/minute about $123M.
  Deposits and protected returns climb the ladder; no app does.
- In Australia, selling trading signals needs an AFS licence. Tools, data,
  education and a published personal record do not. That is what gets built.

## What is here

```
tradelab/markets.py    60 headline series across 50+ exchanges, plus the ISO 10383 registry downloader
tradelab/data.py       collectors: Yahoo (daily, max history), Stooq, Shiller 1871, JST Macrohistory 1870
tradelab/analysis.py   drawdowns, crash episodes, rise/fall/steady/collapse regimes, forward base rates
tradelab/backtest.py   next-bar execution, costs, walk-forward optimisation vs buy-and-hold
tradelab/sizing.py     fixed-fractional sizing, capped Kelly, risk limits, the income ladder
tradelab/journal.py    trade + emotional-state journal, tilt detection, weekly review
tradelab/cli.py        the `tradelab` command
docs/                  RESEARCH, PLAN, COMPLIANCE, MARKETS, MINDSET
tests/                 28 tests on synthetic data (real data hosts are blocked from the build container)
```

## Setup

```bash
cd trading
python3 -m venv .venv && source .venv/bin/activate
pip install -e ".[dev]"
pytest
```

## Use

```bash
tradelab markets                    # the universe
tradelab markets --mic              # every venue on earth (ISO 10383) -> data/markets_iso10383.json
tradelab collect --source all       # Yahoo + Stooq + Shiller + JST into data/raw (needs internet, ~5 min)
tradelab coverage                   # how far back each series goes
tradelab report                     # crashes, regimes and base rates for every series -> reports/
tradelab backtest --ticker ^GSPC    # walk-forward SMA and momentum vs buy-and-hold, after costs
tradelab ladder --contrib 500       # the $100 ladder with $500/month deposits
tradelab journal checklist          # read aloud before every trade
tradelab journal check              # tilt flags from journal/trades.csv
tradelab journal review             # win rate, expectancy in R, plan adherence, pnl hot vs cool
```

The data directory is git-ignored. Commit the generated `reports/world_summary.csv`
after a collection run so the numbers travel with the repo.

## Rules that do not change

1. Every backtest carries costs, an out-of-sample split and the buy-and-hold benchmark.
2. Risk per trade is fixed and small; the daily, weekly and drawdown halts are enforced, not suggested.
3. Emotional state is logged before entry, every time. The journal is the product.
4. No signals to anyone else without the licensing answer in `docs/COMPLIANCE.md`.
