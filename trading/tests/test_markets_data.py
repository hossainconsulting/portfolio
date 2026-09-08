import pandas as pd

from tradelab import data, markets
from tradelab.cli import main


def test_universe_integrity():
    yahoo = [m.yahoo for m in markets.UNIVERSE]
    assert len(yahoo) == len(set(yahoo)), "duplicate Yahoo tickers"
    regions = {m.region for m in markets.UNIVERSE}
    assert regions <= {"Americas", "Europe", "Asia-Pacific", "Middle East & Africa", "Global"}
    assert len(markets.exchanges()) >= 50
    assert all(len(m.mic) == 4 for m in markets.UNIVERSE)
    assert len(markets.universe("Asia-Pacific")) > 10


def test_parse_mic_registry_filters_operating_active():
    csv_text = (
        "MIC,OPERATING MIC,OPRT/SGMT,MARKET NAME-INSTITUTION DESCRIPTION,LEGAL ENTITY NAME,LEI,MARKET CATEGORY CODE,ACRONYM,ISO COUNTRY CODE (ISO 3166),CITY,WEBSITE,STATUS,CREATION DATE,LAST UPDATE DATE,LAST VALIDATION DATE,EXPIRY DATE,COMMENTS\n"
        "XASX,XASX,OPRT,ASX - ALL MARKETS,ASX LIMITED,,RMKT,ASX,AU,SYDNEY,WWW.ASX.COM.AU,ACTIVE,20050627,20230424,20230424,,\n"
        "ASXP,XASX,SGMT,ASX - PUREMATCH,,,RMKT,,AU,SYDNEY,,ACTIVE,20110228,20230424,20230424,,\n"
        "XOLD,XOLD,OPRT,OLD EXCHANGE,,,RMKT,,AU,SYDNEY,,EXPIRED,20050627,20100101,,20100101,\n"
    )
    rows = markets.parse_mic_registry(csv_text)
    assert [r["mic"] for r in rows] == ["XASX"]
    assert rows[0]["name"] == "ASX - ALL MARKETS" and rows[0]["country"] == "AU"
    assert len(markets.parse_mic_registry(csv_text, operating_only=False, active_only=False)) == 3


def test_normalise_ohlcv_handles_multiindex_and_dupes():
    idx = pd.to_datetime(["2020-01-02", "2020-01-02", "2020-01-03"])
    cols = pd.MultiIndex.from_tuples([("Open", "^X"), ("High", "^X"), ("Low", "^X"), ("Close", "^X"), ("Volume", "^X")])
    df = pd.DataFrame([[1, 2, 0.5, 1.5, 10], [1, 2, 0.5, 1.6, 11], [1.6, 2, 1, 1.8, 12]], index=idx, columns=cols)
    out = data.normalise_ohlcv(df)
    assert list(out.columns) == ["open", "high", "low", "close", "volume"]
    assert len(out) == 2 and out["close"].iloc[0] == 1.6 and out.index.name == "date"


def test_coverage_empty_without_data(tmp_path):
    assert data.coverage(tmp_path).empty


def test_cli_ladder_and_markets_and_checklist(capsys, tmp_path):
    assert main(["ladder", "--contrib", "500"]) == 0
    out = capsys.readouterr().out
    assert "minute" in out and "fantasy" in out
    assert main(["markets"]) == 0
    assert "Australian Securities Exchange" in capsys.readouterr().out
    assert main(["journal", "checklist", "--file", str(tmp_path / "t.csv")]) == 0
    assert main(["journal", "check", "--file", str(tmp_path / "t.csv")]) == 0
    assert main(["--root", str(tmp_path), "coverage"]) == 1


def test_cli_report_and_backtest_on_synthetic_data(tmp_path, synthetic_close):
    df = pd.DataFrame({"open": synthetic_close, "high": synthetic_close, "low": synthetic_close, "close": synthetic_close, "volume": 0})
    (tmp_path / "raw" / "yahoo").mkdir(parents=True)
    df.to_parquet(tmp_path / "raw" / "yahoo" / "GSPC.parquet")
    assert main(["--root", str(tmp_path), "report", "--ticker", "^GSPC", "--out", str(tmp_path / "reports")]) == 0
    text = (tmp_path / "reports" / "GSPC.md").read_text()
    assert "Bear markets and collapses" in text and "Regime base rates" in text
    assert (tmp_path / "reports" / "world_summary.csv").exists()
    assert main(["--root", str(tmp_path), "backtest", "--ticker", "^GSPC", "--train-years", "4", "--test-years", "2"]) == 0
