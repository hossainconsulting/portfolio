import pytest

from tradelab import sizing


def test_ladder_is_brutally_honest():
    rungs = sizing.ladder(100.0, start=100.0, monthly_contribution=0.0)
    by = {r.period: r for r in rungs}
    assert by["month"].income_per_year == 1200
    assert by["minute"].income_per_year == pytest.approx(100 * 252 * 390)
    assert by["month"].capital_needed["index"] == pytest.approx(15_000)
    assert by["minute"].capital_needed["index"] > 100_000_000
    # From $100 with no contributions, the first rung takes a working lifetime at index returns.
    assert by["month"].years_from_start["index"] > 60
    assert by["hour"].years_from_start["index"] is None


def test_contributions_change_everything():
    rungs = sizing.ladder(100.0, start=100.0, monthly_contribution=500.0)
    by = {r.period: r for r in rungs}
    assert by["month"].years_from_start["index"] is not None and by["month"].years_from_start["index"] < 4
    assert by["day"].years_from_start["index"] is not None and by["day"].years_from_start["index"] > 15


def test_years_to_target_edge_cases():
    assert sizing.years_to_target(1000, 0, 0.08, 500) == 0.0
    assert sizing.years_to_target(100, 0, 0.0, 200) is None


def test_fixed_fractional_and_kelly():
    assert sizing.fixed_fractional(10_000, 0.01, entry=50, stop=48) == 50
    with pytest.raises(ValueError):
        sizing.fixed_fractional(10_000, 0.01, entry=50, stop=50)
    assert sizing.kelly_fraction(0.5, 1.0) == 0.0
    assert sizing.kelly_fraction(0.55, 1.5) == pytest.approx(0.25)
    assert sizing.kelly_fraction(0.3, 1.0) < 0
    assert sizing.capped_kelly(0.3, 1.0) == 0.0
    assert sizing.capped_kelly(0.9, 5.0) == 0.02


def test_risk_limits():
    lim = sizing.RiskLimits()
    assert lim.check(10_000, 10_000, day_pnl=-100, week_pnl=-100, open_positions=1) == []
    breaches = lim.check(8_000, 10_000, day_pnl=-400, week_pnl=-700, open_positions=5)
    assert len(breaches) == 4
