"""A small, honest, vectorised backtester.

Honest means: trades execute on the *next* bar's close (no look-ahead), every
change in position pays commission plus slippage, and the walk-forward
function reports out-of-sample results separately from in-sample ones. A
strategy that only looks good in-sample is the default outcome, not a surprise.
"""
from __future__ import annotations

from dataclasses import dataclass
from typing import Callable

import numpy as np
import pandas as pd

from .analysis import TRADING_DAYS, drawdown

Strategy = Callable[[pd.Series], pd.Series]  # close -> target position in [-1, 1]


# ---- strategies --------------------------------------------------------------

def buy_and_hold(close: pd.Series) -> pd.Series:
    return pd.Series(1.0, index=close.index)


def sma_cross(fast: int = 50, slow: int = 200) -> Strategy:
    def strategy(close: pd.Series) -> pd.Series:
        f, s = close.rolling(fast).mean(), close.rolling(slow).mean()
        return (f > s).astype(float).where(s.notna(), 0.0)
    strategy.__name__ = f"sma_cross_{fast}_{slow}"
    return strategy


def momentum(lookback: int = 126) -> Strategy:
    """Long when trailing return is positive, flat otherwise (time-series momentum)."""
    def strategy(close: pd.Series) -> pd.Series:
        return (close.pct_change(lookback) > 0).astype(float)
    strategy.__name__ = f"momentum_{lookback}"
    return strategy


# ---- engine ------------------------------------------------------------------

@dataclass
class BacktestResult:
    name: str
    equity: pd.Series
    positions: pd.Series
    metrics: dict
    turnover: float
    trades: int


def metrics(equity: pd.Series) -> dict:
    equity = equity.dropna()
    r = equity.pct_change().dropna()
    years = (equity.index[-1] - equity.index[0]).days / 365.25
    total = equity.iloc[-1] / equity.iloc[0] - 1.0
    cagr = (1.0 + total) ** (1.0 / years) - 1.0 if years > 0 else float("nan")
    vol = r.std() * np.sqrt(TRADING_DAYS) if len(r) > 1 else float("nan")
    mdd = drawdown(equity).min()
    return {
        "total_return": round(total, 4), "cagr": round(cagr, 4), "annual_volatility": round(vol, 4),
        "sharpe_rf0": round(cagr / vol, 3) if vol and vol > 0 else float("nan"),
        "max_drawdown": round(mdd, 4), "calmar": round(cagr / abs(mdd), 3) if mdd < 0 else float("nan"),
        "years": round(years, 2),
    }


def run(close: pd.Series, strategy: Strategy, cost_bps: float = 10.0, slippage_bps: float = 5.0, name: str | None = None) -> BacktestResult:
    """Applies ``strategy`` to ``close`` with next-bar execution and per-turnover costs.

    ``cost_bps`` is commission per unit of turnover; ``slippage_bps`` the price
    you lose crossing the spread. 15 bps round-trip total is generous for
    liquid index ETFs and optimistic for anything else."""
    close = close.dropna()
    target = strategy(close).reindex(close.index).fillna(0.0).clip(-1.0, 1.0)
    position = target.shift(1).fillna(0.0)  # decided today, held from tomorrow
    ret = close.pct_change().fillna(0.0)
    turnover = position.diff().abs().fillna(position.abs())
    cost = turnover * (cost_bps + slippage_bps) / 10_000.0
    strat_ret = position * ret - cost
    equity = (1.0 + strat_ret).cumprod()
    equity.iloc[0] = 1.0
    trades = int((turnover > 0).sum())
    return BacktestResult(
        name=name or getattr(strategy, "__name__", "strategy"), equity=equity, positions=position,
        metrics=metrics(equity), turnover=round(float(turnover.sum()), 2), trades=trades,
    )


# ---- walk-forward ----------------------------------------------------------------

@dataclass
class WalkForwardResult:
    folds: pd.DataFrame          # one row per fold: chosen params, in-sample and out-of-sample sharpe
    oos_equity: pd.Series        # stitched out-of-sample equity curve
    oos_metrics: dict
    benchmark_metrics: dict      # buy and hold over the same out-of-sample span


def walk_forward(close: pd.Series, factory: Callable[..., Strategy], grid: list[dict], train_years: int = 5,
                 test_years: int = 1, cost_bps: float = 10.0, slippage_bps: float = 5.0) -> WalkForwardResult:
    """Rolling optimise-then-test. Picks the grid point with the best in-sample
    Sharpe, applies it to the following unseen ``test_years``, rolls forward.

    The gap between the ``is_sharpe`` and ``oos_sharpe`` columns is the size of
    your overfitting. If out-of-sample does not beat buy-and-hold after costs,
    the strategy is not real. That sentence is the whole point of this file."""
    close = close.dropna()
    start = close.index[0]
    rows = []
    oos_parts: list[pd.Series] = []
    while True:
        train_end = start + pd.DateOffset(years=train_years)
        test_end = train_end + pd.DateOffset(years=test_years)
        if test_end > close.index[-1]:
            break
        train = close[(close.index >= start) & (close.index < train_end)]
        # Warm-up: give the test window the training tail so indicators are defined on day one.
        test_with_warmup = close[(close.index >= start) & (close.index < test_end)]
        best, best_sharpe = None, -np.inf
        for params in grid:
            res = run(train, factory(**params), cost_bps, slippage_bps)
            s = res.metrics["sharpe_rf0"]
            if np.isfinite(s) and s > best_sharpe:
                best, best_sharpe = params, s
        best = best or grid[0]
        full = run(test_with_warmup, factory(**best), cost_bps, slippage_bps)
        oos = full.equity[full.equity.index >= train_end]
        oos = oos / oos.iloc[0]
        oos_parts.append(oos)
        rows.append({"train_start": start.date(), "test_start": train_end.date(), "test_end": test_end.date(),
                     "params": best, "is_sharpe": round(best_sharpe, 3) if np.isfinite(best_sharpe) else float("nan"),
                     "oos_sharpe": metrics(oos)["sharpe_rf0"], "oos_return": metrics(oos)["total_return"]})
        start = start + pd.DateOffset(years=test_years)
    if not oos_parts:
        raise ValueError("not enough history for one train/test fold")
    stitched = pd.concat([p.pct_change().fillna(0.0) for p in oos_parts])
    stitched = stitched[~stitched.index.duplicated(keep="first")]
    oos_equity = (1.0 + stitched).cumprod()
    bench = close[close.index >= oos_equity.index[0]]
    bench = bench / bench.iloc[0]
    return WalkForwardResult(pd.DataFrame(rows), oos_equity, metrics(oos_equity), metrics(bench))
