# Platform roadmap

The weekly digest and the Monday check-in agent read this file. Unchecked items
(`- [ ]`) are "next", in order. Tick them as they ship. Add a line
`auto-build: yes` under an item if the check-in agent may implement it without
asking first; otherwise it only proposes.

## Phase 0: foundation (this pull request)

- [x] Catalogue of agents, projects and services in D1, seeded from `seed/catalogue.json`
- [x] Magic-link sign-in, sessions, API keys
- [x] Stripe Checkout, Customer Portal and webhooks writing entitlements
- [x] Metered agent runtime with monthly quotas per offering
- [x] Owner reminders, daily reminder email, weekly digest email
- [x] Admin page with MRR, usage and configuration status

## Phase 1: first paying customer

- [ ] Create the D1 database, set the four secrets, deploy, run migrations and seed (README "Going live")
- [ ] Run `npm run stripe:sync` in test mode and complete one end-to-end test purchase
- [ ] Verify a domain in Resend so magic links deliver to real inboxes
- [ ] Record a 60-second demo of each agent from the dashboard and embed it in home-services-ai
- [ ] Replace placeholder prices in `seed/catalogue.json` with real ones and re-sync
- [ ] Switch Stripe to live mode and make the first real sale

## Phase 2: product depth

- [ ] Streaming responses for the agent API (SSE) so long outputs feel instant
- [ ] Per-customer rates table upload for Notes to Invoice, stored in D1
- [ ] Booking write-path for After-Hours Triage via the Jobs MCP server from home-services-ai
- [ ] Eval harness results published on each agent card (accuracy, cost per call)
- [ ] Usage-based overage pricing through Stripe meters once any customer hits a quota

## Phase 3: agency operations

- [ ] Client portal for project customers: milestones, deliverables, weekly status
- [ ] Proposal generator for quoted offerings, drafted from a discovery-call transcript
- [ ] Referral and annual-plan discounts
