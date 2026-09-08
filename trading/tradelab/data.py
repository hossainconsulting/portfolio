"""Historical data collection.

Free sources, longest history first:

* Yahoo Finance (via yfinance): daily OHLCV for every index/ticker in
  ``markets.UNIVERSE`` with ``period="max"``. S&P 500 back to 1927-12-30.
* Shiller: monthly S&P composite price, dividends, earnings and CPI from 1871.
* Jordà-Schularick-Taylor Macrohistory: annual equity/housing/bond returns,
  credit and crises for 17 economies from 1870 (R6 release, CC-BY).
* Stooq: alternative daily EOD source for many indices (``markets.stooq``).

Everything lands under ``data/raw/<source>/`` as Parquet with a ``manifest.json``
so a later run only fetches what is missing or stale. No secrets required.
"""
from __future__ import annotations

import json
import time
from dataclasses import dataclass
from datetime import datetime, timezone
from pathlib import Path

import pandas as pd

from .markets import UNIVERSE, Market

SHILLER_XLS_URL = "http://www.econ.yale.edu/~shiller/data/ie_data.xls"
JST_URL = "https://www.macrohistory.net/app/download/9834512469/JSTdatasetR6.dta"
STOOQ_URL = "https://stooq.com/q/d/l/?s={symbol}&i=d"

REQUIRED_COLUMNS = ["open", "high", "low", "close", "volume"]


@dataclass
class CollectResult:
    ok: list[str]
    failed: dict[str, str]
    manifest_path: Path


def normalise_ohlcv(df: pd.DataFrame) -> pd.DataFrame:
    """Lower-cases columns, keeps OHLCV, drops empty rows, sorts by date."""
    if isinstance(df.columns, pd.MultiIndex):
        df = df.copy()
        df.columns = [c[0] for c in df.columns]
    out = df.rename(columns={c: str(c).lower().replace(" ", "_") for c in df.columns})
    out.index = pd.to_datetime(out.index).tz_localize(None)
    out.index.name = "date"
    for col in REQUIRED_COLUMNS:
        if col not in out.columns:
            out[col] = pd.NA
    out = out[REQUIRED_COLUMNS].dropna(subset=["close"]).sort_index()
    return out[~out.index.duplicated(keep="last")]


def _write(df: pd.DataFrame, path: Path) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    df.to_parquet(path)


def _safe_name(ticker: str) -> str:
    return ticker.replace("^", "").replace("=", "_").replace(".", "_").replace("-", "_")


def load(root: Path, ticker: str, source: str = "yahoo") -> pd.DataFrame | None:
    path = root / "raw" / source / f"{_safe_name(ticker)}.parquet"
    return pd.read_parquet(path) if path.exists() else None


def collect_yahoo(root: Path, markets: tuple[Market, ...] = UNIVERSE, pause: float = 1.0, max_age_days: int = 1) -> CollectResult:
    """Downloads full daily history for each market's index. Skips fresh files."""
    import yfinance as yf

    manifest_path = root / "raw" / "yahoo" / "manifest.json"
    manifest = json.loads(manifest_path.read_text()) if manifest_path.exists() else {}
    ok: list[str] = []
    failed: dict[str, str] = {}
    now = datetime.now(timezone.utc)

    for m in markets:
        entry = manifest.get(m.yahoo)
        if entry and (now - datetime.fromisoformat(entry["fetched_at"])).days < max_age_days:
            ok.append(m.yahoo)
            continue
        try:
            raw = yf.download(m.yahoo, period="max", interval="1d", auto_adjust=False, progress=False, threads=False)
            if raw is None or raw.empty:
                raise RuntimeError("empty response")
            df = normalise_ohlcv(raw)
            _write(df, root / "raw" / "yahoo" / f"{_safe_name(m.yahoo)}.parquet")
            manifest[m.yahoo] = {
                "index": m.index_name, "exchange": m.exchange, "rows": int(len(df)),
                "first": df.index[0].date().isoformat(), "last": df.index[-1].date().isoformat(),
                "fetched_at": now.isoformat(),
            }
            ok.append(m.yahoo)
        except Exception as e:  # noqa: BLE001 - we want every failure recorded, not raised
            failed[m.yahoo] = f"{type(e).__name__}: {e}"
        time.sleep(pause)  # be polite; Yahoo rate-limits aggressive clients

    manifest_path.parent.mkdir(parents=True, exist_ok=True)
    manifest_path.write_text(json.dumps(manifest, indent=2, sort_keys=True))
    return CollectResult(ok=ok, failed=failed, manifest_path=manifest_path)


def collect_stooq(root: Path, markets: tuple[Market, ...] = UNIVERSE, pause: float = 1.0) -> CollectResult:
    """Alternative EOD source. Stooq serves CSV directly; no key needed."""
    import requests

    ok: list[str] = []
    failed: dict[str, str] = {}
    for m in markets:
        if not m.stooq:
            continue
        try:
            res = requests.get(STOOQ_URL.format(symbol=m.stooq), timeout=60)
            res.raise_for_status()
            df = pd.read_csv(pd.io.common.StringIO(res.text), parse_dates=["Date"]).set_index("Date")
            if df.empty:
                raise RuntimeError("empty response")
            _write(normalise_ohlcv(df), root / "raw" / "stooq" / f"{_safe_name(m.stooq)}.parquet")
            ok.append(m.stooq)
        except Exception as e:  # noqa: BLE001
            failed[m.stooq] = f"{type(e).__name__}: {e}"
        time.sleep(pause)
    manifest = root / "raw" / "stooq" / "manifest.json"
    manifest.parent.mkdir(parents=True, exist_ok=True)
    manifest.write_text(json.dumps({"ok": ok, "failed": failed, "fetched_at": datetime.now(timezone.utc).isoformat()}, indent=2))
    return CollectResult(ok=ok, failed=failed, manifest_path=manifest)


def collect_shiller(root: Path) -> Path:
    """Shiller's monthly US series from 1871: price, dividend, earnings, CPI, rates, CAPE."""
    import requests

    res = requests.get(SHILLER_XLS_URL, timeout=120)
    res.raise_for_status()
    path = root / "raw" / "shiller" / "ie_data.xls"
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_bytes(res.content)
    return path


def collect_jst(root: Path) -> Path:
    """Jordà-Schularick-Taylor Macrohistory R6 (Stata file; read with pandas.read_stata)."""
    import requests

    res = requests.get(JST_URL, timeout=300)
    res.raise_for_status()
    path = root / "raw" / "jst" / "JSTdatasetR6.dta"
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_bytes(res.content)
    return path


def coverage(root: Path) -> pd.DataFrame:
    """One row per collected series: first date, last date, rows, years."""
    manifest_path = root / "raw" / "yahoo" / "manifest.json"
    if not manifest_path.exists():
        return pd.DataFrame(columns=["ticker", "index", "exchange", "first", "last", "rows", "years"])
    manifest = json.loads(manifest_path.read_text())
    rows = []
    for ticker, e in manifest.items():
        first, last = pd.Timestamp(e["first"]), pd.Timestamp(e["last"])
        rows.append({"ticker": ticker, "index": e["index"], "exchange": e["exchange"], "first": first.date(),
                     "last": last.date(), "rows": e["rows"], "years": round((last - first).days / 365.25, 1)})
    return pd.DataFrame(rows).sort_values("first").reset_index(drop=True)
