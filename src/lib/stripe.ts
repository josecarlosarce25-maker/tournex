// Server-side Stripe SDK singleton + the 4 Price IDs we use.
import Stripe from "stripe";

let _stripe: Stripe | null = null;

export function getStripe(): Stripe {
  if (_stripe) return _stripe;
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("Falta STRIPE_SECRET_KEY");
  _stripe = new Stripe(key);
  return _stripe;
}

/** Maps a (plan, billing) tuple to the Price ID configured in env vars. */
export function priceIdFor(
  plan: "pro" | "club",
  billing: "monthly" | "annual",
): string | undefined {
  if (plan === "pro" && billing === "monthly")
    return process.env.NEXT_PUBLIC_STRIPE_PRICE_PRO_MONTHLY;
  if (plan === "pro" && billing === "annual")
    return process.env.NEXT_PUBLIC_STRIPE_PRICE_PRO_ANNUAL;
  if (plan === "club" && billing === "monthly")
    return process.env.NEXT_PUBLIC_STRIPE_PRICE_CLUB_MONTHLY;
  if (plan === "club" && billing === "annual")
    return process.env.NEXT_PUBLIC_STRIPE_PRICE_CLUB_ANNUAL;
  return undefined;
}

/** Inverse: given a Price ID coming back in a webhook, identify plan + billing. */
export function planFromPriceId(
  priceId: string,
): { plan: "pro" | "club"; billing: "monthly" | "annual" } | null {
  const map: Record<string, { plan: "pro" | "club"; billing: "monthly" | "annual" }> = {};
  const a = process.env.NEXT_PUBLIC_STRIPE_PRICE_PRO_MONTHLY;
  const b = process.env.NEXT_PUBLIC_STRIPE_PRICE_PRO_ANNUAL;
  const c = process.env.NEXT_PUBLIC_STRIPE_PRICE_CLUB_MONTHLY;
  const d = process.env.NEXT_PUBLIC_STRIPE_PRICE_CLUB_ANNUAL;
  if (a) map[a] = { plan: "pro", billing: "monthly" };
  if (b) map[b] = { plan: "pro", billing: "annual" };
  if (c) map[c] = { plan: "club", billing: "monthly" };
  if (d) map[d] = { plan: "club", billing: "annual" };
  return map[priceId] ?? null;
}
