// Creates or updates one Stripe Product and one Price per sellable offering,
// keyed by `stripe_lookup_key` so re-running is safe. Run from a machine with
// STRIPE_SECRET_KEY exported. Quote-only offerings are skipped.
//
//   STRIPE_SECRET_KEY=sk_test_... npm run stripe:sync
import Stripe from "stripe";
import { readFileSync } from "node:fs";

const key = process.env.STRIPE_SECRET_KEY;
if (!key) { console.error("STRIPE_SECRET_KEY is not set"); process.exit(1); }
const stripe = new Stripe(key);
const { offerings } = JSON.parse(readFileSync(new URL("../seed/catalogue.json", import.meta.url), "utf8"));

for (const o of offerings) {
  if (o.interval === "quote" || o.active === false) continue;
  const lookup = `${o.slug}_${o.interval}`;
  const currency = o.currency ?? "aud";

  // Product: search by metadata.slug so renames don't create duplicates.
  const found = await stripe.products.search({ query: `metadata['slug']:'${o.slug}'` });
  const product = found.data[0]
    ? await stripe.products.update(found.data[0].id, { name: o.name, description: o.tagline })
    : await stripe.products.create({ name: o.name, description: o.tagline, metadata: { slug: o.slug, kind: o.kind } });

  // Price: Stripe prices are immutable, so if the amount changed we create a
  // new one and move the lookup key across (transfer_lookup_key).
  const existing = await stripe.prices.list({ lookup_keys: [lookup], limit: 1 });
  const cur = existing.data[0];
  const same = cur && cur.unit_amount === o.price_cents && cur.currency === currency &&
    ((o.interval === "once" && !cur.recurring) || (cur.recurring && cur.recurring.interval === o.interval));
  if (same) { console.log(`= ${lookup} ${cur.id}`); continue; }

  const price = await stripe.prices.create({
    product: product.id, currency, unit_amount: o.price_cents, lookup_key: lookup, transfer_lookup_key: true,
    ...(o.interval === "once" ? {} : { recurring: { interval: o.interval } }),
    metadata: { slug: o.slug },
  });
  if (cur) await stripe.prices.update(cur.id, { active: false });
  console.log(`+ ${lookup} ${price.id}`);
}
console.log("done. Checkout resolves prices by lookup key, so nothing to paste anywhere.");
