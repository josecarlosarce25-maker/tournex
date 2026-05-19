// POST /api/webhooks/stripe
// Stripe llama a este endpoint cada vez que cambia una suscripción. Nosotros
// actualizamos la tabla `subscriptions` y la columna espejo en `organizers`.

import { NextResponse, type NextRequest } from "next/server";
import type Stripe from "stripe";
import { getStripe, planFromPriceId } from "@/lib/stripe";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs"; // Stripe SDK requires Node, not Edge.

export async function POST(request: NextRequest) {
  const stripe = getStripe();
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) {
    return NextResponse.json(
      { error: "STRIPE_WEBHOOK_SECRET no configurado." },
      { status: 500 },
    );
  }

  const signature = request.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ error: "Sin firma." }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    const body = await request.text();
    event = stripe.webhooks.constructEvent(body, signature, secret);
  } catch (err) {
    const msg = err instanceof Error ? err.message : "firma inválida";
    return NextResponse.json({ error: msg }, { status: 400 });
  }

  const supabase = createAdminClient();

  // Pull data on the subscription / customer that triggered the event.
  async function upsertFromSubscription(sub: Stripe.Subscription) {
    const organizerId =
      (sub.metadata?.organizer_id as string | undefined) ?? null;
    if (!organizerId) return;

    const priceId = sub.items.data[0]?.price.id;
    const planInfo = priceId ? planFromPriceId(priceId) : null;
    const plan = planInfo?.plan ?? sub.metadata?.plan ?? "pro";
    const billing = planInfo?.billing ?? sub.metadata?.billing ?? "monthly";
    const periodEnd = sub.items.data[0]?.current_period_end;

    await supabase.from("subscriptions").upsert(
      {
        organizer_id: organizerId,
        stripe_customer_id:
          typeof sub.customer === "string" ? sub.customer : sub.customer.id,
        stripe_subscription_id: sub.id,
        plan,
        billing,
        status: sub.status,
        current_period_end: periodEnd
          ? new Date(periodEnd * 1000).toISOString()
          : null,
        cancel_at_period_end: sub.cancel_at_period_end,
      },
      { onConflict: "stripe_subscription_id" },
    );

    // Mirror current plan/status into the organizers row for quick reads.
    const isActive = sub.status === "active" || sub.status === "trialing";
    await supabase
      .from("organizers")
      .update({
        subscription_plan: isActive ? plan : "free",
        subscription_status: sub.status,
      })
      .eq("id", organizerId);
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      if (session.mode === "subscription" && session.subscription) {
        const subId =
          typeof session.subscription === "string"
            ? session.subscription
            : session.subscription.id;
        const sub = await stripe.subscriptions.retrieve(subId);
        await upsertFromSubscription(sub);
      }
      break;
    }
    case "customer.subscription.created":
    case "customer.subscription.updated":
    case "customer.subscription.deleted": {
      await upsertFromSubscription(event.data.object as Stripe.Subscription);
      break;
    }
    case "invoice.payment_succeeded":
    case "invoice.payment_failed": {
      const invoice = event.data.object as Stripe.Invoice;
      // The `subscription` field on invoices is available at runtime but
      // not in the strict types — pull it via a relaxed cast.
      const subRef = (invoice as unknown as { subscription?: string | Stripe.Subscription })
        .subscription;
      if (subRef) {
        const subId = typeof subRef === "string" ? subRef : subRef.id;
        const sub = await stripe.subscriptions.retrieve(subId);
        await upsertFromSubscription(sub);
      }
      break;
    }
    default:
      // Ignore events we don't care about.
      break;
  }

  return NextResponse.json({ received: true });
}
