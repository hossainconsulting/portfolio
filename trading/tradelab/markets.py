"""World market registry.

Two layers:

1. ``UNIVERSE``: a curated list of the world's major exchanges with the index
   that best represents each, its Yahoo Finance ticker (the free source the
   collector uses), currency and timezone. This is what ``tradelab collect``
   downloads. It is hand-maintained because index tickers are not in any
   machine-readable registry.

2. ``fetch_mic_registry()``: downloads ISO 10383, the official register of
   Market Identifier Codes maintained for ISO by SWIFT. That is the closest
   thing that exists to "every trading venue in the world" (about 2,600 codes:
   exchanges, MTFs, dark pools, crypto venues). Use it to expand the universe.
"""
from __future__ import annotations

import csv
import io
from dataclasses import dataclass, asdict
from typing import Iterable

ISO10383_CSV_URL = "https://www.iso20022.org/sites/default/files/ISO10383_MIC/ISO10383_MIC.csv"


@dataclass(frozen=True)
class Market:
    mic: str            # ISO 10383 operating MIC
    exchange: str
    country: str        # ISO 3166 alpha-2
    city: str
    index_name: str
    yahoo: str          # Yahoo Finance ticker for the headline index
    stooq: str | None   # Stooq symbol where one exists, else None
    currency: str
    tz: str
    region: str         # Americas | Europe | Asia-Pacific | Middle East & Africa
    open_utc: str = ""  # informational; sessions move with DST


# The headline index per exchange. Yahoo's index history typically starts in the
# 1980s-1990s for most non-US markets; the S&P 500 goes back to 1927 on Yahoo
# and to 1871 in Shiller's monthly data (see data.py).
UNIVERSE: tuple[Market, ...] = (
    # Americas
    Market("XNYS", "New York Stock Exchange", "US", "New York", "S&P 500", "^GSPC", "^spx", "USD", "America/New_York", "Americas"),
    Market("XNYS", "New York Stock Exchange", "US", "New York", "Dow Jones Industrial Average", "^DJI", "^dji", "USD", "America/New_York", "Americas"),
    Market("XNAS", "Nasdaq", "US", "New York", "Nasdaq Composite", "^IXIC", "^ndq", "USD", "America/New_York", "Americas"),
    Market("XNAS", "Nasdaq", "US", "New York", "Russell 2000", "^RUT", None, "USD", "America/New_York", "Americas"),
    Market("XCBO", "Cboe", "US", "Chicago", "CBOE Volatility Index (VIX)", "^VIX", None, "USD", "America/Chicago", "Americas"),
    Market("XTSE", "Toronto Stock Exchange", "CA", "Toronto", "S&P/TSX Composite", "^GSPTSE", None, "CAD", "America/Toronto", "Americas"),
    Market("XMEX", "Bolsa Mexicana de Valores", "MX", "Mexico City", "IPC", "^MXX", None, "MXN", "America/Mexico_City", "Americas"),
    Market("BVMF", "B3 (Brasil Bolsa Balcão)", "BR", "São Paulo", "Ibovespa", "^BVSP", None, "BRL", "America/Sao_Paulo", "Americas"),
    Market("XBUE", "Bolsas y Mercados Argentinos", "AR", "Buenos Aires", "S&P Merval", "^MERV", None, "ARS", "America/Argentina/Buenos_Aires", "Americas"),
    Market("XSGO", "Bolsa de Santiago", "CL", "Santiago", "S&P IPSA", "^IPSA", None, "CLP", "America/Santiago", "Americas"),
    # Europe
    Market("XLON", "London Stock Exchange", "GB", "London", "FTSE 100", "^FTSE", "^ukx", "GBP", "Europe/London", "Europe"),
    Market("XETR", "Deutsche Börse Xetra", "DE", "Frankfurt", "DAX", "^GDAXI", "^dax", "EUR", "Europe/Berlin", "Europe"),
    Market("XPAR", "Euronext Paris", "FR", "Paris", "CAC 40", "^FCHI", "^cac", "EUR", "Europe/Paris", "Europe"),
    Market("XAMS", "Euronext Amsterdam", "NL", "Amsterdam", "AEX", "^AEX", "^aex", "EUR", "Europe/Amsterdam", "Europe"),
    Market("XBRU", "Euronext Brussels", "BE", "Brussels", "BEL 20", "^BFX", "^bel20", "EUR", "Europe/Brussels", "Europe"),
    Market("XMIL", "Borsa Italiana", "IT", "Milan", "FTSE MIB", "FTSEMIB.MI", "^fmib", "EUR", "Europe/Rome", "Europe"),
    Market("XMAD", "Bolsa de Madrid", "ES", "Madrid", "IBEX 35", "^IBEX", "^ibex", "EUR", "Europe/Madrid", "Europe"),
    Market("XSWX", "SIX Swiss Exchange", "CH", "Zurich", "SMI", "^SSMI", "^smi", "CHF", "Europe/Zurich", "Europe"),
    Market("XSTO", "Nasdaq Stockholm", "SE", "Stockholm", "OMX Stockholm 30", "^OMX", "^omxs30", "SEK", "Europe/Stockholm", "Europe"),
    Market("XCSE", "Nasdaq Copenhagen", "DK", "Copenhagen", "OMX Copenhagen 25", "^OMXC25", None, "DKK", "Europe/Copenhagen", "Europe"),
    Market("XHEL", "Nasdaq Helsinki", "FI", "Helsinki", "OMX Helsinki 25", "^OMXH25", None, "EUR", "Europe/Helsinki", "Europe"),
    Market("XOSL", "Oslo Børs", "NO", "Oslo", "OBX", "OBX.OL", None, "NOK", "Europe/Oslo", "Europe"),
    Market("XWAR", "Warsaw Stock Exchange", "PL", "Warsaw", "WIG20", "WIG20.WA", "^wig20", "PLN", "Europe/Warsaw", "Europe"),
    Market("XWBO", "Wiener Börse", "AT", "Vienna", "ATX", "^ATX", "^atx", "EUR", "Europe/Vienna", "Europe"),
    Market("XLIS", "Euronext Lisbon", "PT", "Lisbon", "PSI", "PSI20.LS", None, "EUR", "Europe/Lisbon", "Europe"),
    Market("XATH", "Athens Exchange", "GR", "Athens", "Athens General Composite", "GD.AT", None, "EUR", "Europe/Athens", "Europe"),
    Market("XIST", "Borsa İstanbul", "TR", "Istanbul", "BIST 100", "XU100.IS", None, "TRY", "Europe/Istanbul", "Europe"),
    Market("MISX", "Moscow Exchange", "RU", "Moscow", "MOEX Russia", "IMOEX.ME", None, "RUB", "Europe/Moscow", "Europe"),
    # Asia-Pacific
    Market("XJPX", "Japan Exchange Group (Tokyo)", "JP", "Tokyo", "Nikkei 225", "^N225", "^nkx", "JPY", "Asia/Tokyo", "Asia-Pacific"),
    Market("XHKG", "Hong Kong Exchanges", "HK", "Hong Kong", "Hang Seng", "^HSI", "^hsi", "HKD", "Asia/Hong_Kong", "Asia-Pacific"),
    Market("XSHG", "Shanghai Stock Exchange", "CN", "Shanghai", "SSE Composite", "000001.SS", "^shc", "CNY", "Asia/Shanghai", "Asia-Pacific"),
    Market("XSHE", "Shenzhen Stock Exchange", "CN", "Shenzhen", "SZSE Component", "399001.SZ", None, "CNY", "Asia/Shanghai", "Asia-Pacific"),
    Market("XKRX", "Korea Exchange", "KR", "Seoul", "KOSPI", "^KS11", "^kospi", "KRW", "Asia/Seoul", "Asia-Pacific"),
    Market("XTAI", "Taiwan Stock Exchange", "TW", "Taipei", "TAIEX", "^TWII", "^twse", "TWD", "Asia/Taipei", "Asia-Pacific"),
    Market("XBOM", "BSE (Bombay Stock Exchange)", "IN", "Mumbai", "S&P BSE SENSEX", "^BSESN", None, "INR", "Asia/Kolkata", "Asia-Pacific"),
    Market("XNSE", "National Stock Exchange of India", "IN", "Mumbai", "NIFTY 50", "^NSEI", None, "INR", "Asia/Kolkata", "Asia-Pacific"),
    Market("XSES", "Singapore Exchange", "SG", "Singapore", "Straits Times Index", "^STI", None, "SGD", "Asia/Singapore", "Asia-Pacific"),
    Market("XKLS", "Bursa Malaysia", "MY", "Kuala Lumpur", "FTSE Bursa Malaysia KLCI", "^KLSE", None, "MYR", "Asia/Kuala_Lumpur", "Asia-Pacific"),
    Market("XIDX", "Indonesia Stock Exchange", "ID", "Jakarta", "IDX Composite", "^JKSE", None, "IDR", "Asia/Jakarta", "Asia-Pacific"),
    Market("XBKK", "Stock Exchange of Thailand", "TH", "Bangkok", "SET", "^SET.BK", None, "THB", "Asia/Bangkok", "Asia-Pacific"),
    Market("XPHS", "Philippine Stock Exchange", "PH", "Manila", "PSEi", "PSEI.PS", None, "PHP", "Asia/Manila", "Asia-Pacific"),
    Market("XSTC", "Ho Chi Minh Stock Exchange", "VN", "Ho Chi Minh City", "VN-Index", "^VNINDEX.VN", None, "VND", "Asia/Ho_Chi_Minh", "Asia-Pacific"),
    Market("XASX", "Australian Securities Exchange", "AU", "Sydney", "S&P/ASX 200", "^AXJO", None, "AUD", "Australia/Sydney", "Asia-Pacific"),
    Market("XASX", "Australian Securities Exchange", "AU", "Sydney", "All Ordinaries", "^AORD", None, "AUD", "Australia/Sydney", "Asia-Pacific"),
    Market("XNZE", "NZX", "NZ", "Wellington", "S&P/NZX 50", "^NZ50", None, "NZD", "Pacific/Auckland", "Asia-Pacific"),
    Market("XKAR", "Pakistan Stock Exchange", "PK", "Karachi", "KSE 100", "^KSE", None, "PKR", "Asia/Karachi", "Asia-Pacific"),
    Market("XDHA", "Dhaka Stock Exchange", "BD", "Dhaka", "DSEX", "DSEX.DH", None, "BDT", "Asia/Dhaka", "Asia-Pacific"),
    # Middle East & Africa
    Market("XSAU", "Saudi Exchange (Tadawul)", "SA", "Riyadh", "TASI", "^TASI.SR", None, "SAR", "Asia/Riyadh", "Middle East & Africa"),
    Market("XDFM", "Dubai Financial Market", "AE", "Dubai", "DFM General", "DFMGI.AE", None, "AED", "Asia/Dubai", "Middle East & Africa"),
    Market("XTAE", "Tel Aviv Stock Exchange", "IL", "Tel Aviv", "TA-125", "^TA125.TA", None, "ILS", "Asia/Jerusalem", "Middle East & Africa"),
    Market("XJSE", "Johannesburg Stock Exchange", "ZA", "Johannesburg", "FTSE/JSE All Share", "^J203.JO", None, "ZAR", "Africa/Johannesburg", "Middle East & Africa"),
    Market("XCAI", "Egyptian Exchange", "EG", "Cairo", "EGX 30", "^CASE30", None, "EGP", "Africa/Cairo", "Middle East & Africa"),
    Market("XNAI", "Nairobi Securities Exchange", "KE", "Nairobi", "NSE 20", "^NSE20.NR", None, "KES", "Africa/Nairobi", "Middle East & Africa"),
    Market("XNSA", "Nigerian Exchange", "NG", "Lagos", "NGX All Share", "^NGSEINDX", None, "NGN", "Africa/Lagos", "Middle East & Africa"),
    # Cross-asset reference series (not exchanges, but every trader watches them)
    Market("XCEC", "COMEX (CME Group)", "US", "New York", "Gold futures (front)", "GC=F", None, "USD", "America/New_York", "Americas"),
    Market("XNYM", "NYMEX (CME Group)", "US", "New York", "WTI crude futures (front)", "CL=F", None, "USD", "America/New_York", "Americas"),
    Market("XCBT", "CBOT (CME Group)", "US", "Chicago", "10-year US Treasury yield", "^TNX", None, "USD", "America/Chicago", "Americas"),
    Market("XXXX", "Crypto (24/7, no venue)", "XX", "-", "Bitcoin / USD", "BTC-USD", None, "USD", "UTC", "Global"),
    Market("XXXX", "FX (24/5, no venue)", "XX", "-", "US Dollar Index", "DX-Y.NYB", None, "USD", "UTC", "Global"),
    Market("XXXX", "FX (24/5, no venue)", "XX", "-", "AUD/USD", "AUDUSD=X", None, "USD", "UTC", "Global"),
)


def universe(region: str | None = None) -> list[Market]:
    return [m for m in UNIVERSE if region is None or m.region == region]


def exchanges() -> list[str]:
    """Distinct exchanges in the universe, in listed order."""
    seen: list[str] = []
    for m in UNIVERSE:
        if m.exchange not in seen:
            seen.append(m.exchange)
    return seen


def to_records(markets: Iterable[Market]) -> list[dict]:
    return [asdict(m) for m in markets]


def parse_mic_registry(csv_text: str, operating_only: bool = True, active_only: bool = True) -> list[dict]:
    """Parses the ISO 10383 CSV into dicts. Column names follow the 2022+ layout."""
    reader = csv.DictReader(io.StringIO(csv_text))
    rows: list[dict] = []
    for r in reader:
        r = {(k or "").strip().upper(): (v or "").strip() for k, v in r.items()}
        if operating_only and r.get("OPRT/SGMT", "OPRT") != "OPRT":
            continue
        if active_only and r.get("STATUS", "ACTIVE") != "ACTIVE":
            continue
        rows.append({
            "mic": r.get("MIC", ""), "name": r.get("MARKET NAME-INSTITUTION DESCRIPTION", ""),
            "legal_entity": r.get("LEGAL ENTITY NAME", ""), "country": r.get("ISO COUNTRY CODE (ISO 3166)", ""),
            "city": r.get("CITY", ""), "website": r.get("WEBSITE", ""), "category": r.get("MARKET CATEGORY CODE", ""),
        })
    return rows


def fetch_mic_registry(timeout: int = 60) -> list[dict]:
    """Downloads the live ISO 10383 register. Needs internet; see docs/MARKETS.md."""
    import requests

    res = requests.get(ISO10383_CSV_URL, timeout=timeout)
    res.raise_for_status()
    return parse_mic_registry(res.content.decode("utf-8-sig"))
