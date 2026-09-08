# Finance Dashboard

Ten finance dashboards in one dependency-free page. Open `index.html` in a
browser, or serve the folder as static files. Sample data for a fictional
Sydney trades business loads first; replace it with your own CSV in one click.

| Tab | What it answers |
|---|---|
| Overview | Revenue, expenses, profit, cash flow, cash balance, budget used, best and worst month, monthly trends, expense breakdown, recent transactions |
| Transactions | Totals, monthly averages, biggest categories, sortable and searchable table with date, category, account and type filters |
| P&L | Revenue, COGS, gross profit, opex, operating profit, net profit, gross and net margin; current vs previous month and actual vs budget with variance indicators; 12-month trends |
| Cash flow | Opening cash, inflows, operating, debt, investments, taxes, other, net, ending; 12-month trends; biggest drains; 3-month forecast flagged against a minimum cash floor |
| Budget vs actual | Per category budget, actual, variance in dollars and percent, remaining, utilisation bar and green/amber/red status; total utilisation; monthly spend vs budget; biggest overspends; end-of-month forecast |
| CFO one-pager | Revenue, growth, gross profit, gross margin, opex, net profit, net margin, cash, burn, runway; each vs last month, last-quarter average and target; three-point summary of what improved, what worsened, what needs attention |
| Runway | Cash, revenue, expenses, payroll, other costs and growth in; burn, net burn, runway months, zero-cash month and break-even revenue out; 12-month projection with base, best and worst cases |
| Insights | Rule-based findings with exact numbers: unusual expenses, falling revenue, fast-growing costs, best and worst profit months, cash-flow risks |
| Net worth | Assets and liabilities, net worth, debt ratio, savings rate, allocation, debt breakdown, savings progress toward a goal, implied trend |
| Analyst audit | The five questions the dashboard answers with live numbers, three gaps, three recommended upgrades, and the analyst-level feature list |

## Your own data

Click **Import CSV**. The header row is required; column order and case do
not matter:

```
DATE, DESCRIPTION, CATEGORY, INCOME, EXPENSE, ACCOUNT, BALANCE
```

- `INCOME` and `EXPENSE` are positive numbers; `$`, commas and `(430.00)`
  negatives are handled. A single `AMOUNT` column (positive income, negative
  expense) with an optional `TYPE` column also works.
- Dates as `YYYY-MM-DD` or `DD/MM/YYYY`.
- `BALANCE` is optional; without it, enter an opening cash balance and the
  page computes the running balance.
- `ACCOUNT` is optional and becomes a filter.

`sample-data.csv` shows the format. Data never leaves your browser; it is
kept in local storage along with budgets, targets and net-worth inputs.
**Reset to sample** clears it.

### Categories and the P&L

Every category maps to a group: revenue, other income, cost of goods sold,
operating expenses, debt, investments, taxes, other outflows. The mapping is
`DEFAULT_GROUPS` in `lib.js`; unknown income categories count as revenue and
unknown expense categories as operating expenses, so any CSV produces a P&L on
first import. Rename your categories to match, or edit the map.

Budgets are seeded at each category's monthly average on import; edit them on
the Budget tab. P&L budget lines and CFO targets are edited on their tabs.

## Design rules

- One data model, every view. Filters sit in one row above the content and scope everything below them; month-based views (P&L, cash flow, budget, CFO) use the **Month** selector and the account filter.
- Charts are inline SVG with a validated colourblind-safe palette, legends on every multi-series chart, hover and keyboard tooltips, and a table twin for every number.
- Status colour never carries meaning alone: every red, amber or green has an icon and a label.
- No client framework, no build step, no external requests. Works from `file://`, from any static host, and offline.

## Development

```bash
node --test test/lib.test.mjs      # 14 tests on the calculation library
```

`lib.js` holds every calculation as pure functions (also loadable from Node);
`app.js` is the UI; `index.html` the shell and styles.

## Deploying

Copy `index.html`, `app.js` and `lib.js` to any static host. On Cloudflare,
a `wrangler.jsonc` with `"assets": { "directory": "." }` in this folder is
enough, the same way `../public` is served.
