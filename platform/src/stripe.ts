import Stripe from "stripe";
import type { Env } from "./env";
import { Db, type Offering, type User } from "./db";

export function getStripe(env: Env): Stripe | null {
  if (!env.STRIPE_SECRET_KEY) return null;
  // Workers have fetch and WebCrypto but no Node http; tell stripe-node so.
  return new Stripe(env.STRIPE_SECRET_KEY, { httpClient: Stripe.createFetchHttpClient(), maxNetworkRetries: 2, timeout: 20_000 });
}

export async function resolvePriceId(stripe: Stripe, offering: Offering): Promise<string | null> {
  if (offering.stripe_price_id) return offering.stripe_price_id;
  if (!offering.stripe_lookup_key) return null;
  const prices = await stripe.prices.list({ lookup_keys: [offering.stripe_lookup_key], active: true, limit: 1 });
  return prices.data[0]?.id ?? null;
}

async function ensureCustomer(stripe: Stripe, db: Db, user: User): Promise<string> {
  if (user.stripe_customer_id) return user.stripe_customer_id;
  const customer = await stripe.customers.create({ email: user.email, metadata: { user_id: user.id } });
  await db.setStripeCustomer(user.id, customer.id);
  return customer.id;
}

/** Creates a hosted Checkout session and returns its URL. */
export async function createCheckout(env: Env, stripe: Stripe, db: Db, user: User, offering: Offering): Promise<{ url: string } | { error: string }> {
  if (offering.interval === "quote") return { error: "This offering is quoted, not bought online." };
  const price = await resolvePriceId(stripe, offering);
  if (!price) return { error: `No Stripe price for ${offering.slug}. Run \`npm run stripe:sync\`.` };
  const customer = await ensureCustomer(stripe, db, user);
  const recurring = offering.interval === "month" || offering.interval === "year";
  const session = await stripe.checkout.sessions.create({
    mode: recurring ? "subscription" : "payment",
    customer,
    line_items: [{ price, quantity: 1 }],
    success_url: `${env.APP_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${env.APP_URL}/#${offering.kind}s`,
    client_reference_id: user.id,
    metadata: { user_id: user.id, offering_slug: offering.slug },
    ...(recurring ? { subscription_data: { metadata: { user_id: user.id, offering_slug: offering.slug } } } : { invoice_creation: { enabled: true } }),
    allow_promotion_codes: true,
  });
  return session.url ? { url: session.url } : { error: "Stripe returned no checkout URL." };
}

export async function createPortal(env: Env, stripe: Stripe, customerId: string): Promise<string> {
  const session = await stripe.billingPortal.sessions.create({ customer: customerId, return_url: `${env.APP_URL}/dashboard` });
  return session.url;
}

function periodEndOf(sub: Stripe.Subscription): string | null {
  // Since API version 2025-03-31 the period lives on the subscription item.
  const item = sub.items?.data?.[0] as (Stripe.SubscriptionItem & { current_period_end?: number }) | undefined;
  const legacy = (sub as unknown as { current_period_end?: number }).current_period_end;
  const ts = item?.current_period_end ?? legacy;
  return ts ? new Date(ts * 1000).toISOString() : null;
}

export type WebhookOutcome = { status: number; body: string };

/**
 * Verifies the signature, records the event id (so retries are no-ops), and
 * applies the subset of events that change what a customer is entitled to.
 */
export async function handleStripeWebhook(env: Env, stripe: Stripe, db: Db, rawBody: string, signature: string | undefined): Promise<WebhookOutcome> {
  if (!env.STRIPE_WEBHOOK_SECRET) return { status: 500, body: "STRIPE_WEBHOOK_SECRET not set" };
  if (!signature) return { status: 400, body: "missing stripe-signature" };

  let event: Stripe.Event;
  try {
    event = await stripe.webhooks.constructEventAsync(rawBody, signature, env.STRIPE_WEBHOOK_SECRET, undefined, Stripe.createSubtleCryptoProvider());
  } catch (err) {
    return { status: 400, body: `signature verification failed: ${(err as Error).message}` };
  }

  const fresh = await db.recordWebhookEvent(event.id, event.type);
  if (!fresh) return { status: 200, body: "duplicate" };

  switch (event.type) {
    case "checkout.session.completed": {
      const s = event.data.object;
      const userId = s.metadata?.user_id ?? s.client_reference_id ?? null;
      const slug = s.metadata?.offering_slug ?? null;
      if (!userId || !slug) return { status: 200, body: "no metadata; ignored" };
      const customer = typeof s.customer === "string" ? s.customer : s.customer?.id;
      if (customer) await db.setStripeCustomer(userId, customer);
      if (s.mode === "subscription" && s.subscription) {
        const subId = typeof s.subscription === "string" ? s.subscription : s.subscription.id;
        await db.upsertSubscription({ id: subId, user_id: userId, offering_slug: slug, status: "active", stripe_checkout_session_id: s.id, current_period_end: null });
      } else if (s.mode === "payment" && s.payment_status === "paid") {
        await db.upsertSubscription({ id: s.id, user_id: userId, offering_slug: slug, status: "paid", stripe_checkout_session_id: s.id, current_period_end: null });
      }
      return { status: 200, body: "ok" };
    }
    case "customer.subscription.created":
    case "customer.subscription.updated":
    case "customer.subscription.deleted": {
      const sub = event.data.object;
      const status = event.type === "customer.subscription.deleted" ? "canceled" : sub.status;
      const existing = await db.getSubscription(sub.id);
      if (existing) {
        await db.updateSubscriptionStatus(sub.id, status, periodEndOf(sub));
      } else {
        // Subscription events can arrive before checkout.session.completed.
        const userId = sub.metadata?.user_id;
        const slug = sub.metadata?.offering_slug;
        if (userId && slug) {
          await db.upsertSubscription({ id: sub.id, user_id: userId, offering_slug: slug, status, stripe_checkout_session_id: null, current_period_end: periodEndOf(sub) });
        }
      }
      return { status: 200, body: "ok" };
    }
    case "invoice.paid": {
      const inv = event.data.object as Stripe.Invoice & { subscription?: string | Stripe.Subscription | null; parent?: { subscription_details?: { subscription?: string | Stripe.Subscription | null } | null } | null };
      const ref = inv.parent?.subscription_details?.subscription ?? inv.subscription ?? null;
      const subId = typeof ref === "string" ? ref : ref?.id;
      if (subId && (await db.getSubscription(subId))) await db.updateSubscriptionStatus(subId, "active", null);
      return { status: 200, body: "ok" };
    }
    default:
      return { status: 200, body: `ignored ${event.type}` };
  }
}
