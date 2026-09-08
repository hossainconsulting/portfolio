# Markets: hunting down every exchange on earth

## The registry that already exists

The list of "all trading venues in the world" is not something to compile by
hand: it is **ISO 10383**, the Market Identifier Code standard, maintained for
ISO by SWIFT and republished monthly. It carries roughly 2,600 codes: operating
exchanges, their market segments, MTFs, dark pools, systematic internalisers and
crypto venues, each with country, city, website and status.

```bash
tradelab markets --mic       # downloads the CSV and writes data/markets_iso10383.json (active, operating MICs only)
```

## The curated universe

`tradelab.markets.UNIVERSE` maps the headline index of each major exchange to a
free daily series. It covers 60 series across 50+ venues on every continent,
plus gold, oil, the US 10-year yield, Bitcoin, the dollar index and AUD/USD.

| Region | Venues |
|---|---|
| Americas | NYSE, Nasdaq, Cboe, Toronto, Mexico, B3 São Paulo, Buenos Aires, Santiago, COMEX, NYMEX, CBOT |
| Europe | London, Xetra, Euronext (Paris, Amsterdam, Brussels, Lisbon), Milan, Madrid, SIX, Nasdaq Nordic (Stockholm, Copenhagen, Helsinki), Oslo, Warsaw, Vienna, Athens, Istanbul, Moscow |
| Asia-Pacific | Tokyo, Hong Kong, Shanghai, Shenzhen, Korea, Taiwan, BSE, NSE, Singapore, Bursa Malaysia, Indonesia, Thailand, Philippines, Ho Chi Minh, ASX, NZX, Pakistan, Dhaka |
| Middle East & Africa | Saudi Tadawul, Dubai, Tel Aviv, Johannesburg, Egypt, Nairobi, Nigeria |

Run `tradelab markets` to print it. Yahoo tickers for smaller exchanges change
without notice; the collector records failures rather than crashing, and the
Stooq symbols are the fallback where they exist.

## How far back the free data goes

| Series | Free daily history starts |
|---|---|
| S&P 500 (^GSPC) | 1927-12-30 (monthly from 1871 via Shiller) |
| Dow Jones (^DJI) | 1992 on Yahoo (1896 in other sources) |
| Nasdaq Composite | 1971 |
| FTSE 100 | 1984 |
| Nikkei 225 | 1965 |
| DAX | 1987 |
| Hang Seng | 1986 |
| S&P/ASX 200 | 1992 (All Ordinaries 1984) |
| Most emerging-market indices | 1990s |
| Bitcoin | 2014 |

`tradelab coverage` prints the real numbers once collected. The JST
Macrohistory database fills the pre-1980 gap for 17 economies with annual data
from 1870, including every banking crisis.

## The collapses every trader should know by heart

The report generator finds these from the data; the names are for orientation.

| Episode | Peak | Trough | Index depth (approx.) | Time to recover |
|---|---|---|---|---|
| 1929 crash and Depression | Sep 1929 | Jul 1932 | -86% (Dow) | 25 years nominal |
| 1973-74 oil shock bear | Jan 1973 | Dec 1974 | -48% (S&P) | ~7 years |
| Black Monday | Aug 1987 | Dec 1987 | -34% (S&P), -23% in one day | ~2 years |
| Japan bubble | Dec 1989 | Mar 2009 | -82% (Nikkei) | 34 years (new high Feb 2024) |
| Asian financial crisis | 1997 | 1998 | -60% to -80% (Thailand, Indonesia, Korea) | years to decades |
| Dot-com bust | Mar 2000 | Oct 2002 | -49% (S&P), -78% (Nasdaq) | 7 years / 15 years |
| Global financial crisis | Oct 2007 | Mar 2009 | -57% (S&P) | ~5.5 years |
| COVID crash | Feb 2020 | Mar 2020 | -34% (S&P) in 33 days | ~5 months |
| 2022 rate shock | Jan 2022 | Oct 2022 | -25% (S&P), -36% (Nasdaq) | ~2 years |

Two lessons the numbers teach without commentary: recoveries range from months
to a working lifetime, and the deepest collapses came after the longest calm.
