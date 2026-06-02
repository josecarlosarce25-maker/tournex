#!/usr/bin/env node
// Automated Stripe setup for Tournex.
// Creates the 2 products + 4 prices, returns the IDs in JSON.
//
// Usage:
//   STRIPE_SECRET_KEY=sk_test_... node scripts/setup-stripe.mjs
//
// The script is idempotent: if a product with the same metadata.tournex_plan
// already exists, it's reused rather than duplicated.

import Stripe from "stripe";
import fs from "node:fs";
import path from "node:path";

const SECRET = process.env.STRIPE_SECRET_KEY;
if (!SECRET) {
  console.error("✗ Missing STRIPE_SECRET_KEY env var.");
  process.exit(1);
}

const stripe = new Stripe(SECRET);

const PRODUCTS = [
  {
    plan: "pro",
    name: "Tournex Pro",
    description:
      "Plan Pro — torneos ilimitados, parejas ilimitadas, resultados en vivo, base de contactos, liga semanal, IA assistant (preventa).",
    prices: [
      { billing: "monthly", amount: 9900, interval: "month" },
      { billing: "annual", amount: 95000, interval: "year" },
    ],
  },
  {
    plan: "club",
    name: "Tournex Club",
    description:
      "Plan Club — todo lo de Pro + cobro integrado (MercadoPago), exportar brackets, tu logo en todo, soporte prioritario, IA assistant (preventa).",
    prices: [
      { billing: "monthly", amount: 24900, interval: "month" },
      { billing: "annual", amount: 238800, interval: "year" },
    ],
  },
];

async function ensureProduct(def) {
  // Try to find an existing one by metadata.
  const existing = await stripe.products.search({
    query: `metadata['tournex_plan']:'${def.plan}'`,
    limit: 1,
  });
  if (existing.data.length > 0) {
    console.log(`✓ Reusing product ${def.name} (${existing.data[0].id})`);
    return existing.data[0];
  }
  const product = await stripe.products.create({
    name: def.name,
    description: def.description,
    metadata: { tournex_plan: def.plan },
  });
  console.log(`+ Created product ${def.name} (${product.id})`);
  return product;
}

async function ensurePrice(productId, billing, amount, interval) {
  // Look for matching price (same product + interval + amount).
  const existing = await stripe.prices.list({
    product: productId,
    active: true,
    limit: 100,
  });
  const match = existing.data.find(
    (p) =>
      p.unit_amount === amount &&
      p.recurring?.interval === interval &&
      p.currency === "mxn",
  );
  if (match) {
    console.log(`✓ Reusing price ${billing} (${match.id})`);
    return match;
  }
  const price = await stripe.prices.create({
    product: productId,
    currency: "mxn",
    unit_amount: amount,
    recurring: { interval },
    metadata: { tournex_billing: billing },
  });
  console.log(`+ Created price ${billing} (${price.id})`);
  return price;
}

async function main() {
  console.log("─────────────────────────────────────");
  console.log(" Stripe setup for Tournex");
  console.log("─────────────────────────────────────\n");

  const result = {
    publishable_key_hint:
      "Get pk_test_... from Stripe Dashboard → Developers → API keys",
    prices: {},
  };

  for (const def of PRODUCTS) {
    const product = await ensureProduct(def);
    for (const p of def.prices) {
      const price = await ensurePrice(
        product.id,
        p.billing,
        p.amount,
        p.interval,
      );
      result.prices[`${def.plan}_${p.billing}`] = price.id;
    }
  }

  console.log("\n─ Done ─────────────────────────────");
  console.log(JSON.stringify(result.prices, null, 2));

  // Persist for the deploy script to pick up.
  const outDir = path.resolve(process.cwd(), ".deploy");
  fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(
    path.join(outDir, "stripe-prices.json"),
    JSON.stringify(result.prices, null, 2),
  );
  console.log(`\n→ Saved to .deploy/stripe-prices.json`);
}

main().catch((err) => {
  console.error("✗ Stripe setup failed:", err.message);
  process.exit(1);
});
