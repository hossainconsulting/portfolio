"""Trade journal, emotional-state log, tilt detection and the weekly review.

The journal is the product's personal-development core. Every trade records
the trader's state *before* entry on five 1-5 scales, whether the plan was
followed, and the outcome. Over weeks that becomes evidence about *your own*
patterns, which is the only edge a beginner can actually build.
"""
from __future__ import annotations

import csv
from dataclasses import dataclass, asdict, fields
from datetime import datetime
from pathlib import Path
from statistics import median

EMOTION_SCALES = ("calm", "fatigue", "urgency", "revenge", "fomo")  # 1 = none, 5 = extreme

PRE_TRADE_CHECKLIST = (
    "Is this setup written in my plan, by name?",
    "Where exactly am I wrong (the stop), and is the size such that being wrong costs at most 1%?",
    "What is the reward-to-risk at my planned exit? Below 1.5 means no trade.",
    "Have I had two or more losses today? If yes, size halves or I stop.",
    "Am I entering because of the chart, or because of the last trade, a headline, or someone else's post?",
    "If this trade loses, will I be fine with the process that produced it?",
)


@dataclass
class Trade:
    opened_at: str                # ISO datetime
    market: str                   # e.g. XASX
    ticker: str
    direction: str                # long | short
    quantity: float
    entry: float
    stop: float
    target: float | None
    exit: float | None
    closed_at: str | None
    setup: str                    # the named setup from the plan
    followed_plan: bool
    calm: int
    fatigue: int
    urgency: int
    revenge: int
    fomo: int
    notes: str = ""
    paper: bool = True

    @property
    def planned_risk(self) -> float:
        return abs(self.entry - self.stop) * self.quantity

    @property
    def pnl(self) -> float | None:
        if self.exit is None:
            return None
        sign = 1.0 if self.direction == "long" else -1.0
        return sign * (self.exit - self.entry) * self.quantity

    @property
    def r_multiple(self) -> float | None:
        p = self.pnl
        return None if p is None or self.planned_risk == 0 else p / self.planned_risk


def _coerce(row: dict) -> Trade:
    kwargs: dict = {}
    for f in fields(Trade):
        v = row.get(f.name, "")
        if v in ("", None):
            kwargs[f.name] = None if f.name in ("target", "exit", "closed_at") else (True if f.name == "paper" else "")
        elif f.type in ("float", "float | None"):
            kwargs[f.name] = float(v)
        elif f.type == "int":
            kwargs[f.name] = int(v)
        elif f.type == "bool":
            kwargs[f.name] = str(v).lower() in ("1", "true", "yes")
        else:
            kwargs[f.name] = v
    return Trade(**kwargs)


class Journal:
    def __init__(self, path: Path):
        self.path = path

    def append(self, trade: Trade) -> None:
        new = not self.path.exists()
        self.path.parent.mkdir(parents=True, exist_ok=True)
        with self.path.open("a", newline="") as fh:
            w = csv.DictWriter(fh, fieldnames=[f.name for f in fields(Trade)])
            if new:
                w.writeheader()
            w.writerow(asdict(trade))

    def read(self) -> list[Trade]:
        if not self.path.exists():
            return []
        with self.path.open(newline="") as fh:
            return [_coerce(r) for r in csv.DictReader(fh)]


# ---- tilt detection ----------------------------------------------------------------

@dataclass
class TiltFlag:
    rule: str
    detail: str
    advice: str


def tilt_check(trades: list[Trade], max_trades_per_day: int = 6) -> list[TiltFlag]:
    """Rules that catch the classic ways traders blow up. Run before every entry."""
    flags: list[TiltFlag] = []
    closed = [t for t in trades if t.pnl is not None]
    if len(closed) >= 3 and all(t.pnl < 0 for t in closed[-3:]):
        flags.append(TiltFlag("three losses in a row", "last three closed trades all lost",
                              "Stop for the day. Three losses is variance; the fourth trade after three losses is usually revenge."))
    if len(closed) >= 4:
        prior = [t.planned_risk for t in closed[:-1] if t.planned_risk > 0]
        last = closed[-1]
        if prior and closed[-2].pnl is not None and closed[-2].pnl < 0 and last.planned_risk > 1.5 * median(prior):
            flags.append(TiltFlag("size-up after a loss", f"risk {last.planned_risk:.0f} vs median {median(prior):.0f}",
                                  "Doubling after a loss is the martingale. Return to the fixed fraction."))
    recent = trades[-5:]
    hot = [t for t in recent if t.revenge >= 4 or t.urgency >= 4 or t.fomo >= 4]
    if hot:
        flags.append(TiltFlag("hot state at entry", f"{len(hot)} of last {len(recent)} trades entered with revenge/urgency/fomo >= 4",
                              "Your own log says you were not calm. Walk away for 20 minutes before the next entry."))
    off_plan = [t for t in recent if not t.followed_plan]
    if len(off_plan) >= 2:
        flags.append(TiltFlag("off-plan trades", f"{len(off_plan)} of last {len(recent)} trades were outside the written plan",
                              "Either the plan is wrong (fix it on the weekend) or you are. Neither is fixed by trading more now."))
    if trades:
        today = trades[-1].opened_at[:10]
        n_today = sum(1 for t in trades if t.opened_at[:10] == today)
        if n_today > max_trades_per_day:
            flags.append(TiltFlag("overtrading", f"{n_today} trades today, limit {max_trades_per_day}",
                                  "More trades is not more edge. Close the platform."))
    return flags


# ---- weekly review -----------------------------------------------------------------

def weekly_review(trades: list[Trade]) -> dict:
    closed = [t for t in trades if t.pnl is not None]
    if not closed:
        return {"closed_trades": 0}
    pnls = [t.pnl for t in closed]
    rs = [t.r_multiple for t in closed if t.r_multiple is not None]
    wins = [p for p in pnls if p > 0]
    losses = [p for p in pnls if p <= 0]
    win_rate = len(wins) / len(pnls)
    avg_win = sum(wins) / len(wins) if wins else 0.0
    avg_loss = abs(sum(losses) / len(losses)) if losses else 0.0
    expectancy_r = sum(rs) / len(rs) if rs else float("nan")
    hot = [t.pnl for t in closed if max(t.urgency, t.revenge, t.fomo) >= 4]
    cool = [t.pnl for t in closed if max(t.urgency, t.revenge, t.fomo) < 4]
    return {
        "closed_trades": len(closed), "win_rate": round(win_rate, 3),
        "avg_win": round(avg_win, 2), "avg_loss": round(avg_loss, 2),
        "profit_factor": round(sum(wins) / abs(sum(losses)), 2) if losses and sum(losses) != 0 else float("inf"),
        "expectancy_r": round(expectancy_r, 3),
        "plan_adherence": round(sum(1 for t in closed if t.followed_plan) / len(closed), 3),
        "pnl_when_hot": round(sum(hot) / len(hot), 2) if hot else None,
        "pnl_when_cool": round(sum(cool) / len(cool), 2) if cool else None,
        "net_pnl": round(sum(pnls), 2),
    }
