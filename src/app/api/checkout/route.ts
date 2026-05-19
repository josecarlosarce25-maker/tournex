// POST /api/checkout
// Creates a Stripe Checkout Session for the signed-in organizer and returns
// the URL so the client can redirect.

import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getStripe, priceIdFor } from "@/lib/stripe";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  const plan = body.plan as "pro" | "club" | undefined;
  const billing = body.billing as "monthly" | "annual" | undefined;

  if (
    (plan !== "pro" && plan !== "club") ||
    (billing !== "monthly" && billing !== "annual")
  ) {
    return NextResponse.json(
      { error: "Plan o billing inválidos." },
      { status: 400 },
    );
  }

  const price = priceIdFor(plan, billing);
  if (!price) {
    return NextResponse.json(
      { error: "Price ID no configurado en el servidor." },
      { status: 500 },
    );
  }

  // Need the organizer to be signed in.
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json(
      { error: "Inicia sesión primero." },
      { status: 401 },
    );
  }

  const stripe = getStripe();
  const origin = request.headers.get("origin") ?? new URL(request.url).origin;

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    line_items: [{ price, quantity: 1 }],
    customer_email: user.email,
    client_reference_id: user.id,
    metadata: {
      organizer_id: user.id,
      plan,
      billing,
    },
    subscription_data: {
      metadata: {
        organizer_id: user.id,
        plan,
        billing,
      },
    },
    allow_promotion_codes: true,
    success_url: `${origin}/dashboard?subscription=success`,
    cancel_url: `${origin}/dashboard?subscription=cancel`,
  });

  if (!session.url) {
    return NextResponse.json(
      { error: "No se pudo crear la sesión de pago." },
      { status: 500 },
    );
  }

  return NextResponse.json({ url: session.url });
}
