# Plan: from $100 to a trading product

Not rushed. Each phase has an exit test; nothing moves on until it passes.
The Monday check-in agent reads this file. Unchecked items are next, in order.

## Principles

1. The trading account is the laboratory. The app, the education and the
   community are the product. Revenue comes from the product; the account
   proves the product is honest.
2. Nothing is real until it has beaten buy-and-hold **out-of-sample, after
   costs, across at least two regimes**. `tradelab backtest` is the judge.
3. Risk per trade is fixed and small. The daily, weekly and drawdown halts in
   `tradelab.sizing.RiskLimits` are not suggestions.
4. No signals to anyone else until the licensing question in `COMPLIANCE.md`
   is answered by a lawyer, not a forum.

## Phase 0: foundation (this commit)

- [x] World market registry with 60 headline series across 50+ venues, plus the ISO 10383 downloader
- [x] Collector for Yahoo (daily, full history), Stooq, Shiller (1871) and JST Macrohistory (1870)
- [x] Crash, drawdown and regime analysis with forward base rates
- [x] Honest backtester: next-bar execution, costs, walk-forward optimisation
- [x] Sizing, Kelly cap, risk limits, and the income ladder calculator
- [x] Journal with emotional-state logging, tilt detection and weekly review
- [x] 28 tests on synthetic data; research, compliance, markets and mindset docs

## Phase 1: data and base rates (weeks 1-4, ~8 hours/week)

- [ ] Run `tradelab collect --source all` on a home machine; commit `reports/world_summary.csv`
- [ ] Run `tradelab report`; read every crash table; write one page: "what every collapse in the data had in common"
- [ ] Load JST and Shiller; add annual cross-country crash base rates to the report
- [ ] Set up the Alpaca paper account and an IBKR paper account (ASX); record the setup in `docs/BROKERS.md`
- [ ] Deposit the first real $100 into a low-cost broker and buy a broad index ETF. Do nothing else with it. It is the control group.

## Phase 2: one strategy, proven or killed (weeks 5-12)

- [ ] Choose one strategy family (trend following on indices is the best-evidenced for a beginner)
- [ ] Walk-forward across all 60 series; keep only what beats buy-and-hold after costs in the majority of markets and both pre- and post-2008 windows
- [ ] Paper trade it for 12 weeks with the journal and the tilt check on every entry
- [ ] Weekly review numbers copied into `docs/JOURNAL-LOG.md`; expectancy in R and plan adherence are the two metrics that matter
- [ ] Exit test: 60+ paper trades, plan adherence above 90%, expectancy positive, no risk-limit breach

## Phase 3: small real money (months 4-9)

- [ ] Trade the proven strategy with real money at 0.5% risk per trade, capital that could go to zero without changing life
- [ ] Monthly comparison against the $100 control ETF, published honestly in the journal log
- [ ] Add the AI layer: Claude summarises regime, news and the journal each week (structured output, no orders)
- [ ] Exit test: 6 months live, drawdown never past the halt line, results within the backtest's expected range

## Phase 4: the product (months 9-18)

- [ ] Get written legal advice on the general-advice line; design the product as education plus tools, not signals, unless an AFSL path is chosen
- [ ] Ship the app: history explorer, crash and regime base rates, backtest sandbox, journal with tilt detection, the 12-week mindset course
- [ ] Sell it through `platform/` as a subscription (it is just another offering in the catalogue)
- [ ] Publish the live control-versus-strategy record on the product page; the honesty is the marketing

## Phase 5: scale (18 months and beyond)

- [ ] Paid data (EODHD) and single-stock universes; a production backtester (NautilusTrader) if intraday ever proves out
- [ ] Community and mentoring tier; weekly review calls; the journal as the shared language
- [ ] Reassess the ladder with real numbers every quarter; move up a rung only when income, not hope, pays for it
