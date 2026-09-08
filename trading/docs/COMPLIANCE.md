# Compliance: what can be sold, to whom, and what needs a licence

This is a researched summary to take to a lawyer, not legal advice.

## Australia (home market)

- Trading signals, automated recommendations and copy-trading are **financial
  product advice** (Corporations Act 2001, s766B). Offering them to retail
  clients is a financial service that needs an **Australian Financial Services
  Licence** or authorisation as a representative under one (s911A). ASIC's
  guidance on licence requirements is linked in `RESEARCH.md`.
- Advice that does not consider a person's circumstances is **general advice**
  and still needs a licence, plus the general advice warning.
- **Factual information and education** are outside the line: historical
  statistics, how a backtest works, what a drawdown is, a journal tool, a
  course on discipline. Presenting "the system says buy X now" to subscribers
  is on the licensed side, whatever the disclaimer says.
- Managing other people's money is a separate, heavier licence category. Not
  on the roadmap.

**Design consequence:** the subscription product is (1) tools that run on the
subscriber's own data and decisions, (2) education, (3) a published, audited
record of the owner's own trading. Signals are off the table until an AFSL
route (own licence, or authorised representative of a licensee) is chosen and
paid for.

## Elsewhere

- **United States:** investment advice for compensation is regulated by the
  SEC and states (Investment Advisers Act); a publisher's exemption exists for
  impersonal, general-circulation content. Broker connections for others
  require registration.
- **United Kingdom / EU:** FCA / MiFID II treat signals as investment advice or
  a regulated recommendation; similar general-versus-personal distinctions.
- Tax: trading profits are assessable income or capital gains depending on the
  ATO's trader-versus-investor tests; keep the journal, it is also the tax record.

## Consumer-protection rules the product will follow regardless

- No performance claims that are not from a live, timestamped, unedited record.
- Every backtest shown carries costs, the out-of-sample split and the
  benchmark, or it is not shown.
- The base-rate statistics from `RESEARCH.md` section 1 appear on the sign-up
  page. People deserve to know the odds before paying.
