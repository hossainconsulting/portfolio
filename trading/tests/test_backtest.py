import numpy as np
import pandas as pd
import pytest

from tradelab import backtest


def test_buy_and_hold_equity_tracks_price_after_entry_cost(synthetic_close):
    res = backtest.run(synthetic_close, backtest.buy_and_hold, cost_bps=0, slippage_bps=0)
    # Decided at bar 0's close, held from bar 1, so equity equals the full price ratio.
    expected = synthetic_close.iloc[-1] / synthetic_close.iloc[0]
    assert res.equity.iloc[-1] == pytest.approx(expected, rel=1e-9)
    assert res.trades == 1


def test_costs_reduce_returns_and_scale_with_turnover(synthetic_close):
    strat = backtest.sma_cross(20, 100)
    free = backtest.run(synthetic_close, strat, 0, 0)
    paid = backtest.run(synthetic_close, strat, 10, 5)
    assert paid.equity.iloc[-1] < free.equity.iloc[-1]
    assert paid.turnover == free.turnover and paid.trades > 1
    expected_drag = free.equity.iloc[-1] * (1 - 0.0015) ** paid.trades
    assert paid.equity.iloc[-1] == pytest.approx(expected_drag, rel=0.05)


def test_positions_lag_signals_by_one_bar(synthetic_close):
    """The engine never lets today's signal earn today's return."""
    strat = backtest.momentum(20)
    res = backtest.run(synthetic_close, strat, 0, 0)
    target = strat(synthetic_close).fillna(0.0)
    assert (res.positions.values == target.shift(1).fillna(0.0).values).all()
    assert res.positions.iloc[0] == 0.0


def test_metrics_shape(synthetic_close):
    m = backtest.metrics(synthetic_close / synthetic_close.iloc[0])
    assert set(m) == {"total_return", "cagr", "annual_volatility", "sharpe_rf0", "max_drawdown", "calmar", "years"}
    assert m["max_drawdown"] < 0


def test_walk_forward_reports_in_and_out_of_sample(synthetic_close):
    grid = [{"fast": 20, "slow": 100}, {"fast": 50, "slow": 200}]
    wf = backtest.walk_forward(synthetic_close, backtest.sma_cross, grid, train_years=5, test_years=2)
    assert len(wf.folds) >= 5
    assert {"is_sharpe", "oos_sharpe", "params"} <= set(wf.folds.columns)
    assert wf.oos_equity.index.is_monotonic_increasing and wf.oos_equity.iloc[0] == pytest.approx(1.0)
    assert "cagr" in wf.oos_metrics and "cagr" in wf.benchmark_metrics


def test_walk_forward_rejects_short_history():
    close = pd.Series(np.linspace(1, 2, 100), index=pd.bdate_range("2020-01-01", periods=100))
    with pytest.raises(ValueError):
        backtest.walk_forward(close, backtest.momentum, [{"lookback": 5}], 5, 1)
