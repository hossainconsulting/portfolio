import numpy as np
import pandas as pd
import pytest


@pytest.fixture
def synthetic_close() -> pd.Series:
    """Twenty years of daily prices with a deliberate 45% crash in year 9 and a
    smaller 15% dip in year 15, so crash detection has a known answer."""
    rng = np.random.default_rng(7)
    idx = pd.bdate_range("2000-01-03", periods=252 * 20)
    daily = rng.normal(0.0005, 0.005, len(idx))  # ~8% vol: random 20% drawdowns are rare
    daily[252 * 9: 252 * 9 + 120] = -0.005     # 120 days of steady decline: ~45%
    daily[252 * 9 + 120: 252 * 9 + 400] = 0.0025  # recovery
    daily[252 * 15: 252 * 15 + 40] = -0.004     # ~15% dip: below the 20% line
    close = pd.Series(100.0 * np.cumprod(1.0 + daily), index=idx, name="close")
    return close
