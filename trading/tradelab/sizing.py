"""Position sizing, risk limits, and the income ladder calculator.

The ladder answers the question behind the goal "start with $100, then make
$100 a month, a fortnight, a week, a day, an hour, a minute": how much capital
each rung needs at a stated return, and how long it takes to get there.
"""
from __future__ import annotations

from dataclasses import dataclass

import math

TRADING_DAYS_PER_YEAR = 252
TRADING_HOURS_PER_DAY = 6.5
TRADING_MINUTES_PER_DAY = 390

LADDER = (
    ("month", 12.0),
    ("fortnight", 26.0),
    ("week", 52.0),
    ("day", float(TRADING_DAYS_PER_YEAR)),
    ("hour", TRADING_DAYS_PER_YEAR * TRADING_HOURS_PER_DAY),
    ("minute", TRADING_DAYS_PER_YEAR * TRADING_MINUTES_PER_DAY),
)

# Reference annual returns. "index" is roughly the long-run nominal return of
# broad equity indices; "elite" is what the best long-track-record managers
# have compounded at; "fantasy" is what many ads imply. None is guaranteed.
RETURN_SCENARIOS = {"index": 0.08, "elite": 0.20, "fantasy": 0.50}


@dataclass
class Rung:
    period: str
    income_per_period: float
    income_per_year: float
    capital_needed: dict          # scenario -> capital
    years_from_start: dict        # scenario -> years (with contributions), None if never


def years_to_target(start: float, monthly_contribution: float, annual_return: float, target: float, max_years: int = 100) -> float | None:
    """Months of compounding (with monthly deposits) until ``target``; None if not within ``max_years``."""
    if start >= target:
        return 0.0
    r = (1.0 + annual_return) ** (1.0 / 12.0) - 1.0
    bal = start
    for month in range(1, max_years * 12 + 1):
        bal = bal * (1.0 + r) + monthly_contribution
        if bal >= target:
            return round(month / 12.0, 1)
    return None


def ladder(income_per_period: float = 100.0, start: float = 100.0, monthly_contribution: float = 0.0,
           scenarios: dict | None = None) -> list[Rung]:
    scenarios = scenarios or RETURN_SCENARIOS
    rungs: list[Rung] = []
    for period, per_year in LADDER:
        annual = income_per_period * per_year
        capital = {name: annual / rate for name, rate in scenarios.items()}
        years = {name: years_to_target(start, monthly_contribution, rate, cap) for name, (rate, cap) in
                 ((n, (scenarios[n], capital[n])) for n in scenarios)}
        rungs.append(Rung(period, income_per_period, annual, capital, years))
    return rungs


def required_monthly_return(income_per_month: float, capital: float) -> float:
    """The return you would need every month to draw ``income_per_month`` from ``capital`` without shrinking it."""
    return income_per_month / capital


# ---- per-trade sizing -------------------------------------------------------------

def fixed_fractional(equity: float, risk_fraction: float, entry: float, stop: float) -> float:
    """Units to buy so that hitting the stop loses ``risk_fraction`` of equity.

    The one sizing rule that survives every book: risk a fixed small fraction
    (0.5%-1% for a beginner) per trade, defined by where you are wrong."""
    per_unit_risk = abs(entry - stop)
    if per_unit_risk <= 0:
        raise ValueError("stop must differ from entry")
    return math.floor(equity * risk_fraction / per_unit_risk)


def kelly_fraction(win_rate: float, win_loss_ratio: float) -> float:
    """Full Kelly for a binary bet. Negative means the edge is negative: do not bet."""
    if win_loss_ratio <= 0:
        raise ValueError("win_loss_ratio must be positive")
    return win_rate - (1.0 - win_rate) / win_loss_ratio


def capped_kelly(win_rate: float, win_loss_ratio: float, fraction_of_kelly: float = 0.25, cap: float = 0.02) -> float:
    """Practitioners bet a quarter Kelly at most, and cap it. Never negative."""
    return max(0.0, min(cap, kelly_fraction(win_rate, win_loss_ratio) * fraction_of_kelly))


@dataclass
class RiskLimits:
    max_risk_per_trade: float = 0.01      # 1% of equity
    max_daily_loss: float = 0.03          # stop for the day at -3%
    max_weekly_loss: float = 0.06
    max_open_positions: int = 5
    max_drawdown_halt: float = 0.15       # at -15% from peak, stop trading and review

    def check(self, equity: float, peak_equity: float, day_pnl: float, week_pnl: float, open_positions: int) -> list[str]:
        breaches: list[str] = []
        if equity > 0 and day_pnl / equity <= -self.max_daily_loss:
            breaches.append(f"daily loss limit hit ({day_pnl / equity:.1%}); no more trades today")
        if equity > 0 and week_pnl / equity <= -self.max_weekly_loss:
            breaches.append(f"weekly loss limit hit ({week_pnl / equity:.1%}); stop for the week")
        if open_positions >= self.max_open_positions:
            breaches.append(f"{open_positions} open positions; limit is {self.max_open_positions}")
        if peak_equity > 0 and equity / peak_equity - 1.0 <= -self.max_drawdown_halt:
            breaches.append(f"drawdown {equity / peak_equity - 1.0:.1%} from peak; halt and review the plan")
        return breaches
