"""History of rise, fall, steady and collapse.

Pure pandas. Every function takes a daily close series (DatetimeIndex) and
returns numbers a trader can act on, computed from data rather than recalled.
"""
from __future__ import annotations

from dataclasses import dataclass

import numpy as np
import pandas as pd

TRADING_DAYS = 252


def returns(close: pd.Series) -> pd.Series:
    return close.pct_change().dropna()


def drawdown(close: pd.Series) -> pd.Series:
    """Fraction below the running peak. 0 at new highs, -0.5 halfway down."""
    return close / close.cummax() - 1.0


@dataclass
class Crash:
    peak_date: pd.Timestamp
    trough_date: pd.Timestamp
    recovery_date: pd.Timestamp | None
    depth: float              # negative fraction, e.g. -0.56
    days_to_trough: int
    days_to_recover: int | None   # from peak to full recovery, calendar days

    def as_dict(self) -> dict:
        return {
            "peak": self.peak_date.date().isoformat(), "trough": self.trough_date.date().isoformat(),
            "recovered": self.recovery_date.date().isoformat() if self.recovery_date is not None else None,
            "depth_pct": round(self.depth * 100, 1), "days_to_trough": self.days_to_trough,
            "days_to_recover": self.days_to_recover,
        }


def crash_episodes(close: pd.Series, threshold: float = -0.20) -> list[Crash]:
    """Every peak-to-trough decline of at least ``threshold`` (default 20%, the
    textbook bear-market line). An episode runs from the prior all-time high to
    the day the series regains it; the trough is the lowest close in between."""
    close = close.dropna()
    peak_val = close.iloc[0]
    peak_date = close.index[0]
    in_dd = False
    trough_val, trough_date = peak_val, peak_date
    episodes: list[Crash] = []
    for date, val in close.items():
        if val >= peak_val:
            if in_dd and (trough_val / peak_val - 1.0) <= threshold:
                episodes.append(Crash(peak_date, trough_date, date, trough_val / peak_val - 1.0,
                                      (trough_date - peak_date).days, (date - peak_date).days))
            peak_val, peak_date, in_dd = val, date, False
            trough_val, trough_date = val, date
        else:
            in_dd = True
            if val < trough_val:
                trough_val, trough_date = val, date
    if in_dd and (trough_val / peak_val - 1.0) <= threshold:  # still underwater at the end
        episodes.append(Crash(peak_date, trough_date, None, trough_val / peak_val - 1.0, (trough_date - peak_date).days, None))
    return episodes


def regimes(close: pd.Series, window: int = 126, rise: float = 0.10, fall: float = -0.10, collapse: float = -0.30) -> pd.Series:
    """Labels each day as ``rise``, ``fall``, ``steady`` or ``collapse``.

    * collapse: more than ``collapse`` below the running peak (a crash in progress)
    * rise: trailing ``window``-day return above ``rise``
    * fall: trailing return below ``fall``
    * steady: everything else
    """
    trailing = close.pct_change(window)
    dd = drawdown(close)
    out = pd.Series("steady", index=close.index, dtype="object")
    out[trailing >= rise] = "rise"
    out[trailing <= fall] = "fall"
    out[dd <= collapse] = "collapse"
    out[trailing.isna()] = "steady"
    return out


def regime_stats(close: pd.Series, horizon: int = TRADING_DAYS, **kwargs) -> pd.DataFrame:
    """For each regime: share of days, and what the *next* ``horizon`` days did.

    This is the "confidence" table: not a prediction, a base rate. If the
    market has historically been up 12 months after a collapse 70% of the time,
    that is the number to hold in your head while everyone panics."""
    reg = regimes(close, **kwargs)
    fwd = close.shift(-horizon) / close - 1.0
    df = pd.DataFrame({"regime": reg, "fwd": fwd}).dropna()
    grouped = df.groupby("regime")["fwd"]
    out = pd.DataFrame({
        "share_of_days": reg.value_counts(normalize=True).round(3),
        "fwd_median": grouped.median().round(4),
        "fwd_mean": grouped.mean().round(4),
        "fwd_positive_rate": grouped.apply(lambda s: float((s > 0).mean())).round(3),
        "fwd_worst": grouped.min().round(4),
        "samples": grouped.size(),
    })
    return out.reindex(["rise", "steady", "fall", "collapse"]).dropna(how="all")


def summary(close: pd.Series) -> dict:
    close = close.dropna()
    r = returns(close)
    years = (close.index[-1] - close.index[0]).days / 365.25
    total = close.iloc[-1] / close.iloc[0] - 1.0
    cagr = (1.0 + total) ** (1.0 / years) - 1.0 if years > 0 else float("nan")
    vol = r.std() * np.sqrt(TRADING_DAYS)
    dd = drawdown(close)
    mdd = dd.min()
    return {
        "first": close.index[0].date().isoformat(), "last": close.index[-1].date().isoformat(),
        "years": round(years, 1), "total_return": round(total, 4), "cagr": round(cagr, 4),
        "annual_volatility": round(vol, 4), "sharpe_rf0": round(cagr / vol, 3) if vol > 0 else float("nan"),
        "max_drawdown": round(mdd, 4), "max_drawdown_date": dd.idxmin().date().isoformat(),
        "calmar": round(cagr / abs(mdd), 3) if mdd < 0 else float("nan"),
        "best_day": round(r.max(), 4), "worst_day": round(r.min(), 4),
        "positive_days": round(float((r > 0).mean()), 3), "crashes_20pct": len(crash_episodes(close)),
    }


def yearly_returns(close: pd.Series) -> pd.Series:
    return close.resample("YE").last().pct_change().dropna().round(4)


def rolling_cagr(close: pd.Series, years: int = 10) -> pd.Series:
    """Rolling N-year annualised return: the honest 'what would I have got' series."""
    n = years * TRADING_DAYS
    return ((close / close.shift(n)) ** (1.0 / years) - 1.0).dropna()
