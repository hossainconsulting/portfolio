from pathlib import Path

from tradelab.journal import Journal, Trade, tilt_check, weekly_review


def make(i: int, pnl_sign: float, **kw) -> Trade:
    base = dict(opened_at=f"2026-09-0{1 + i // 4}T10:0{i % 4}:00", market="XASX", ticker="STW", direction="long", quantity=10,
                entry=100.0, stop=99.0, target=102.0, exit=100.0 + pnl_sign, closed_at="2026-09-01T11:00:00",
                setup="breakout", followed_plan=True, calm=4, fatigue=1, urgency=1, revenge=1, fomo=1)
    base.update(kw)
    return Trade(**base)


def test_journal_round_trip(tmp_path: Path):
    j = Journal(tmp_path / "trades.csv")
    j.append(make(0, 1.0))
    j.append(make(1, -1.0, target=None, exit=None, closed_at=None))
    trades = j.read()
    assert len(trades) == 2
    assert trades[0].pnl == 10.0 and trades[0].r_multiple == 1.0
    assert trades[1].pnl is None and trades[1].target is None and trades[1].paper is True


def test_tilt_rules_fire():
    trades = [make(i, -1.0) for i in range(3)]
    rules = {f.rule for f in tilt_check(trades)}
    assert "three losses in a row" in rules

    trades = [make(0, 1.0), make(1, 1.0), make(2, -1.0), make(3, -1.0, quantity=40)]
    assert "size-up after a loss" in {f.rule for f in tilt_check(trades)}

    trades = [make(0, 1.0, revenge=5), make(1, 1.0, followed_plan=False), make(2, 1.0, followed_plan=False)]
    rules = {f.rule for f in tilt_check(trades)}
    assert {"hot state at entry", "off-plan trades"} <= rules

    trades = [make(0, 1.0, opened_at=f"2026-09-01T10:{i:02d}:00") for i in range(7)]
    assert "overtrading" in {f.rule for f in tilt_check(trades)}


def test_calm_disciplined_trader_has_no_flags():
    trades = [make(i, 1.0 if i % 2 else -1.0) for i in range(4)]
    assert tilt_check(trades) == []


def test_weekly_review_numbers():
    trades = [make(0, 2.0), make(1, -1.0), make(2, 2.0, urgency=5), make(3, -1.0, revenge=5)]
    r = weekly_review(trades)
    assert r["closed_trades"] == 4 and r["win_rate"] == 0.5
    assert r["expectancy_r"] == 0.5 and r["profit_factor"] == 2.0
    assert r["pnl_when_hot"] == 5.0 and r["pnl_when_cool"] == 5.0
    assert weekly_review([]) == {"closed_trades": 0}
