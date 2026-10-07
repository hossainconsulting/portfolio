-- Platform schema. SQLite (Cloudflare D1). Times are ISO-8601 UTC strings.

CREATE TABLE users (
  id                 TEXT PRIMARY KEY,
  email              TEXT NOT NULL UNIQUE COLLATE NOCASE,
  name               TEXT,
  role               TEXT NOT NULL DEFAULT 'customer',   -- 'customer' | 'owner'
  stripe_customer_id TEXT UNIQUE,
  created_at         TEXT NOT NULL
);

-- Magic-link tokens. Only the hash is stored; the raw token lives in the email.
CREATE TABLE login_tokens (
  token_hash TEXT PRIMARY KEY,
  email      TEXT NOT NULL COLLATE NOCASE,
  expires_at TEXT NOT NULL,
  used_at    TEXT
);

CREATE TABLE sessions (
  id         TEXT PRIMARY KEY,
  user_id    TEXT NOT NULL REFERENCES users(id),
  expires_at TEXT NOT NULL,
  created_at TEXT NOT NULL
);
CREATE INDEX sessions_user ON sessions(user_id);

-- Long-lived keys for calling agents from code. Hash only, plus a display prefix.
CREATE TABLE api_keys (
  id         TEXT PRIMARY KEY,
  user_id    TEXT NOT NULL REFERENCES users(id),
  key_hash   TEXT NOT NULL UNIQUE,
  prefix     TEXT NOT NULL,
  label      TEXT NOT NULL,
  created_at TEXT NOT NULL,
  revoked_at TEXT
);
CREATE INDEX api_keys_user ON api_keys(user_id);

-- The catalogue: everything that can be bought or subscribed to.
--   kind      'project' | 'agent' | 'service'
--   interval  'month' | 'year' | 'once' | 'quote'
CREATE TABLE offerings (
  slug               TEXT PRIMARY KEY,
  kind               TEXT NOT NULL,
  name               TEXT NOT NULL,
  tagline            TEXT NOT NULL,
  description        TEXT NOT NULL,
  price_cents        INTEGER NOT NULL DEFAULT 0,
  currency           TEXT NOT NULL DEFAULT 'aud',
  interval           TEXT NOT NULL,
  stripe_lookup_key  TEXT UNIQUE,
  stripe_price_id    TEXT,
  monthly_call_quota INTEGER,            -- agents only
  agent_slugs        TEXT,               -- JSON array of agent registry slugs this offering unlocks
  repo_url           TEXT,
  sort               INTEGER NOT NULL DEFAULT 100,
  active             INTEGER NOT NULL DEFAULT 1
);

-- One row per Stripe subscription or one-off purchase.
CREATE TABLE subscriptions (
  id                         TEXT PRIMARY KEY,   -- Stripe subscription id, or checkout session id for one-off
  user_id                    TEXT NOT NULL REFERENCES users(id),
  offering_slug              TEXT NOT NULL REFERENCES offerings(slug),
  status                     TEXT NOT NULL,      -- Stripe status, or 'paid' for one-off
  stripe_checkout_session_id TEXT,
  current_period_end         TEXT,
  created_at                 TEXT NOT NULL,
  updated_at                 TEXT NOT NULL
);
CREATE INDEX subscriptions_user ON subscriptions(user_id);

-- Every agent call, for quotas, cost reporting and the weekly digest.
CREATE TABLE usage_events (
  id                TEXT PRIMARY KEY,
  user_id           TEXT NOT NULL REFERENCES users(id),
  offering_slug     TEXT NOT NULL,
  agent_slug        TEXT NOT NULL,
  model             TEXT NOT NULL,
  input_tokens      INTEGER NOT NULL,
  output_tokens     INTEGER NOT NULL,
  cache_read_tokens INTEGER NOT NULL DEFAULT 0,
  cost_micros       INTEGER NOT NULL,   -- USD micro-dollars, estimated from list prices
  stop_reason       TEXT,
  created_at        TEXT NOT NULL
);
CREATE INDEX usage_events_user_month ON usage_events(user_id, offering_slug, created_at);

-- Reminders. Owner's own build/business reminders and, later, customer reminders.
CREATE TABLE reminders (
  id         TEXT PRIMARY KEY,
  user_id    TEXT NOT NULL REFERENCES users(id),
  title      TEXT NOT NULL,
  notes      TEXT,
  due_at     TEXT NOT NULL,
  done_at    TEXT,
  created_at TEXT NOT NULL
);
CREATE INDEX reminders_due ON reminders(user_id, done_at, due_at);

-- Stripe delivers webhooks at least once. Record each event id so a retry is a no-op.
CREATE TABLE webhook_events (
  id          TEXT PRIMARY KEY,
  type        TEXT NOT NULL,
  received_at TEXT NOT NULL
);
