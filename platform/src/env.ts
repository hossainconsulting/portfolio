export type Env = {
  DB: D1Database;
  APP_NAME: string;
  APP_URL: string;
  OWNER_EMAIL: string;
  MAIL_FROM: string;
  CURRENCY: string;
  // Secrets (wrangler secret put ...)
  STRIPE_SECRET_KEY?: string;
  STRIPE_WEBHOOK_SECRET?: string;
  ANTHROPIC_API_KEY?: string;
  RESEND_API_KEY?: string;
};
