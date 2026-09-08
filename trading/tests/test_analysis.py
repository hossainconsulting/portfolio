import pandas as pd

from tradelab import analysis


def test_drawdown_is_zero_at_highs_and_negative_below(synthetic_close):
    dd = analysis.drawdown(synthetic_close)
    assert dd.iloc[0] == 0.0
    assert dd.max() == 0.0
    assert dd.min() < -0.40


def test_crash_episodes_finds_the_planted_crash_and_not_the_dip(synthetic_close):
    crashes = analysis.crash_episodes(synthetic_close, threshold=-0.20)
    assert len(crashes) == 1
    c = crashes[0]
    assert -0.50 < c.depth < -0.40
    assert c.peak_date.year == 2008 or c.peak_date.year == 2009
    assert c.recovery_date is not None and c.recovery_date > c.trough_date
    assert c.days_to_recover > c.days_to_trough > 0
    d = c.as_dict()
    assert set(d) == {"peak", "trough", "recovered", "depth_pct", "days_to_trough", "days_to_recover"}


def test_crash_episodes_reports_unrecovered_drawdown():
    idx = pd.bdate_range("2020-01-01", periods=300)
    vals = [100 + i for i in range(150)] + [249 - i for i in range(150)]
    close = pd.Series(vals, index=idx, dtype=float)
    crashes = analysis.crash_episodes(close)
    assert len(crashes) == 1 and crashes[0].recovery_date is None and crashes[0].days_to_recover is None


def test_regimes_cover_every_day_with_known_labels(synthetic_close):
    reg = analysis.regimes(synthetic_close)
    assert set(reg.unique()) <= {"rise", "fall", "steady", "collapse"}
    assert (reg == "collapse").any()
    assert len(reg) == len(synthetic_close)


def test_regime_stats_has_base_rates(synthetic_close):
    st = analysis.regime_stats(synthetic_close)
    assert "collapse" in st.index
    assert 0 <= st.loc["collapse", "fwd_positive_rate"] <= 1
    assert abs(st["share_of_days"].sum() - 1.0) < 0.01


def test_summary_fields(synthetic_close):
    s = analysis.summary(synthetic_close)
    assert s["years"] > 19
    assert s["crashes_20pct"] == 1
    assert s["max_drawdown"] < -0.4
    assert -1 < s["worst_day"] < 0 < s["best_day"]


def test_rolling_cagr_and_yearly_returns(synthetic_close):
    assert len(analysis.yearly_returns(synthetic_close)) == 19
    rc = analysis.rolling_cagr(synthetic_close, 10)
    assert len(rc) == len(synthetic_close) - 2520
