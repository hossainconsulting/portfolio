# Research: what a "state of the art" AI trading app actually is in 2026

Written 8 September 2026. Every claim below has a source at the end. Where the
evidence contradicts the goal, the evidence wins and the plan adapts.

## 1. The three findings that shape everything

**Finding 1: almost everyone who day trades loses, and persistence does not fix it.**
The two cleanest datasets in existence are the whole Taiwan stock market over
15 years, where fewer than 1% of day traders earned persistent positive returns
after fees, and Brazil's equity futures market 2013-2015, where 97% of people
who kept day trading for 300+ days lost money and 0.4% earned more than a bank
teller. Retail-loss figures of 70-90% over the long run recur across every
serious study. Nothing about AI changes this base rate for the person pressing
the button.

**Finding 2: the AI systems that work are not prediction machines; they are
process machines.** The current research and practitioner consensus is that
machine learning helps most with (a) regime detection, (b) sentiment filtering,
(c) execution and cost control, and (d) discipline enforcement. Backtests that
show 100%+ returns almost always ignore costs, slippage and regime change; the
same papers say so. AI works as a tool that strengthens analysis and process,
not as a shortcut.

**Finding 3: in Australia, selling trading signals is a licensed activity.**
Signals, automated recommendations and copy-trading are "financial product
advice" under s766B of the Corporations Act. Providing them to retail clients
needs an Australian Financial Services Licence or authorisation under one
(s911A). Factual information and education, presented without recommending a
specific trade to a person, sit outside that line. This decides what the
subscription product can be (see `COMPLIANCE.md`).

## 2. What "best of the world" looks like, honestly

The firms that make money from trading with AI (Renaissance, Jane Street,
Citadel, Two Sigma, Jump) share four things a $100 account cannot buy: data
nobody else has, execution measured in microseconds, hundreds of researchers,
and capital measured in billions. Copying their *method* is the realistic
ambition. Their method is:

1. Collect more and better history than anyone, and clean it obsessively.
2. Test every idea out-of-sample, after costs, across regimes and markets.
3. Size positions so that being wrong is survivable, always.
4. Automate the boring parts and the discipline; keep humans on judgement.
5. Measure everything, including the humans.

That is exactly the shape of `tradelab/`: data, analysis, walk-forward
backtesting, sizing and risk limits, and a journal that measures the trader.

## 3. The money ladder, quantified

The goal "start with $100, make $100 a month, then a fortnight, a week, a day,
an hour, a minute" is a capital question, not a skill question. `tradelab ladder`
prints it. At a long-run index return of 8%/yr and an elite 20%/yr:

| rung | income/yr | capital at 8% | capital at 20% |
|---|---|---|---|
| $100/month | $1,200 | $15,000 | $6,000 |
| $100/fortnight | $2,600 | $32,500 | $13,000 |
| $100/week | $5,200 | $65,000 | $26,000 |
| $100/day | $25,200 | $315,000 | $126,000 |
| $100/hour | $163,800 | $2.0M | $819,000 |
| $100/minute | $9.8M | $123M | $49M |

From $100 with no further deposits, the first rung takes about 65 years at
index returns (28 at elite returns); the hourly rung is never reached in a
century. With $500/month of deposits the first rung arrives in under three
years and $100/day in about 21. **The ladder is climbed by income you save and
returns you protect, not by a system that turns $100 into $100 a minute.** Any
app claiming otherwise is either a scam or a lottery ticket, and the studies in
section 1 are its victims. The plan therefore treats the app as the product and
the trading account as the laboratory.

## 4. Data: from the start of trading history to today

| Source | Coverage | Cost | Used for |
|---|---|---|---|
| Yahoo Finance (yfinance) | Daily OHLCV, S&P 500 from 1927, most world indices from 1980s-1990s, crypto, FX, futures | Free, rate-limited | The main collector (`tradelab collect`) |
| Stooq | Daily EOD for many global indices | Free | Cross-check and fallback |
| Shiller (Yale) | Monthly S&P composite, dividends, earnings, CPI, rates from 1871 | Free | The longest US series; CAPE |
| Jordà-Schularick-Taylor Macrohistory R6 | Annual equity, housing, bond returns, credit, crises for 17 economies from 1870 | Free (CC-BY) | Crash and crisis base rates across countries and 150 years |
| EODHD | 30+ years EOD, 60+ exchanges, 150k tickers | Paid (~$20-80/mo) | Single-stock universe when the product needs it |
| Databento | Tick and order-book data, US | Paid ($125 credit) | Only if intraday strategies ever prove out |
| ISO 10383 MIC registry | Every trading venue on earth (~2,600 codes) | Free | `tradelab markets --mic` |

Yahoo is fine for research at index level and wrong for a production product:
rate limits, silent symbol changes, no SLA. The plan moves to EODHD or
similar when there is revenue to pay for it.

## 5. Tooling landscape

* **Backtesting:** vectorbt (fast, research-first), NautilusTrader (execution-
  faithful, production-grade), zipline-reloaded (US cross-sectional factor
  work). Backtrader is frozen; do not start on it. `tradelab.backtest` is a
  deliberately small engine so the mechanics are understood before adopting one
  of these.
* **Paper trading:** Alpaca gives a free, keyless-signup paper account with live
  US prices and a clean Python API; it is the fastest route from research to a
  simulated order. Interactive Brokers covers ASX and everything else but needs
  a funded Pro account for its paper account. Paper first, for months.
* **Journaling:** TradeZella and Edgewonk are the commercial references; the
  `tradelab.journal` module implements the same core (emotional state at entry,
  plan adherence, R-multiples, tilt rules) in a CSV you own.
* **AI in the loop:** Claude for regime narrative, news and filing summarisation,
  journal review and coaching; never for placing orders. Structured outputs and
  retrieved facts only, the same rule as the Agentforce work.

## 6. Psychology and emotional intelligence

Mark Douglas ("Trading in the Zone", "The Disciplined Trader") and Brett
Steenbarger ("The Psychology of Trading", "The Daily Trading Coach") are the
canon, and both land on the same practical core: a written plan, a journal
that records state as well as outcome, a recovery protocol for bad days, and
process goals rather than money goals. `MINDSET.md` turns that into a 12-week
curriculum with the journal as the measuring instrument.

## Sources

- [Day trading studies reviewed (Taiwan, Brazil)](https://medium.com/@faisal_haroon/i-reviewed-every-major-day-trading-study-from-the-last-25-years-the-data-is-devastating-4b116273b956), [Quant GT summary](https://quantgt.io/research/why-only-1-percent-of-day-traders-are-profitable), [Curved Trading statistics](https://curvedtrading.com/articles/en/trading/day-trading-statistics/)
- [Best AI trading agents 2026, DEV](https://dev.to/lightningdev123/best-ai-trading-agents-in-2026-can-they-really-deliver-consistent-returns-2fgl), [Lambda Finance: is AI trading profitable](https://www.lambdafin.com/articles/is-ai-trading-profitable), [ScienceDirect: AI in algorithmic trading](https://www.sciencedirect.com/science/article/pii/S3050700626000368), [arXiv: hybrid regime-adaptive system](https://arxiv.org/html/2601.19504v1), [Wharton: (Deep) Learning to Trade](https://wffi.wharton.upenn.edu/wp-content/uploads/2025/09/Sangiorgi_Deep__Learning_to_Trade.pdf)
- [Comparing financial data APIs](https://medium.com/@trading.dude/beyond-yfinance-comparing-the-best-financial-data-apis-for-traders-and-developers-06a3b8bc07e2), [EODHD](https://eodhd.com/financial-apis/api-for-historical-data-and-volumes), [Databento](https://databento.com/stocks), [free stock API comparison](https://qveris.ai/guides/stock-api-free-comparison)
- [Shiller data usage](https://bellavia.app/insights/how-to-use-shiller-data-in-bellavia/), [JST Macrohistory at NBER](https://www.nber.org/research/data/jorda-schularick-taylor-macrohistory), [macrohistory.net download](https://www.macrohistory.net/database/)
- [Python backtesting landscape 2026](https://python.financial/), [Hasan Javed's comparison](https://hasanjaved.me/blog/best-python-backtesting-libraries-2026/), [BullAlert engines comparison](https://bullalert.ai/blog/best-python-backtest-engines-2026/)
- [Alpaca paper trading](https://alpaca.markets/learn/start-paper-trading), [IBKR paper accounts](https://www.interactivebrokers.com/docs/web-api/authentication/paper), [Alpaca vs IBKR for Australia](https://www.bitget.com/amp/academy/how-does-alpacas-trading-api-compare-to-interactive-brokers-and-binance-2026-comprehensive-guide-for-australia)
- [ASIC: requirements to hold an AFS licence](https://www.asic.gov.au/regulatory-resources/financial-services/financial-advice/running-a-financial-advice-business/requirements-to-hold-an-afs-licence), [AFSL for trading platforms](https://terms.law/Trading-Legal/guides/australia-asic-afsl.html), [Whirlpool: AFSL for signal subscriptions](https://forums.whirlpool.net.au/archive/3vw4nnjr)
- [Trading psychology books](https://ninjatrader.com/futures/blogs/4-key-trading-psychology-books-all-traders-need-to-read/), [Steenbarger review](https://vivadifferences.com/the-psychology-of-trading-by-brett-n-steenbarger-a-detailed-review/), [Mark Douglas](https://www.ebc.com/forex/mark-douglas)
