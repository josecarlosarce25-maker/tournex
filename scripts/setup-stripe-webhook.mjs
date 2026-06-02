#!/usr/bin/env node
// Creates the Stripe webhook endpoint pointing at <CLOUDFLARE_URL>/api/webhooks/stripe
// and returns the signing secret.
//
// Usage:
//   STRIPE_SECRET_KEY=sk_test_... DEPLOY_URL=https://tournex.x.workers.dev \
//     node scripts/setup-stripe-webhook.mjs

import Stripe from "stripe";
import fs from "node:fs";
import path from "node:path";

const SECRET = process.env.STRIPE_SECRET_KEY;
const URL_BASE = process.env.DEPLOY_URL;

if (!SECRET || !URL_BASE) {
  console.error(
    "✗ Need STRIPE_SECRET_KEY and DEPLOY_URL env vars.",
  );
  process.exit(1);
}

const stripe = new Stripe(SECRET);

const ENDPOINT = `${URL_BASE.replace(/\/$/, "")}/api/webhooks/stripe`;
const EVENTS = [
  "checkout.session.completed",
  "customer.subscription.created",
  "customer.subscription.updated",
  "customer.subscription.deleted",
  "invoice.payment_succeeded",
  "invoice.payment_failed",
];

async function main() {
  console.log("─────────────────────────────────────");
  console.log(" Stripe webhook setup");
  console.log("─────────────────────────────────────");
  console.log(`Endpoint: ${ENDPOINT}\n`);

  // Reuse existing endpoint if it has the same URL.
  const existing = await stripe.webhookEndpoints.list({ limit: 100 });
  const match = existing.data.find((e) => e.url === ENDPOINT);

  let webhook;
  if (match) {
    console.log(`✓ Existing endpoint found (${match.id}) — updating events`);
    webhook = await stripe.webhookEndpoints.update(match.id, {
      enabled_events: EVENTS,
    });
    // Stripe doesn't expose the secret on existing endpoints. Caller needs
    // to retrieve it from the dashboard or recreate. We'll recreate to be safe.
    console.log(
      "⚠ Existing endpoint's secret cannot be retrieved. Deleting and recreating.",
    );
    await stripe.webhookEndpoints.del(match.id);
    webhook = await stripe.webhookEndpoints.create({
      url: ENDPOINT,
      enabled_events: EVENTS,
      description: "Tournex production webhook (auto-created)",
    });
  } else {
    webhook = await stripe.webhookEndpoints.create({
      url: ENDPOINT,
      enabled_events: EVENTS,
      description: "Tournex production webhook (auto-created)",
    });
  }

  console.log(`+ Webhook ${webhook.id}`);
  console.log(`+ Signing secret: ${webhook.secret}`);

  const outDir = path.resolve(process.cwd(), ".deploy");
  fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(
    path.join(outDir, "stripe-webhook.json"),
    JSON.stringify(
      { id: webhook.id, url: webhook.url, secret: webhook.secret },
      null,
      2,
    ),
  );
  console.log(`\n→ Saved to .deploy/stripe-webhook.json`);
}

main().catch((err) => {
  console.error("✗ Webhook setup failed:", err.message);
  process.exit(1);
});
