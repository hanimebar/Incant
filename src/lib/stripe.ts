import Stripe from "stripe";

let stripeInstance: Stripe | null = null;

export function getStripe(): Stripe {
  if (!stripeInstance) {
    stripeInstance = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: "2026-01-28.clover",
    });
  }
  return stripeInstance;
}

export const PLANS = {
  apprentice: {
    priceId: process.env.STRIPE_APPRENTICE_PRICE_ID!,
    name: "Apprentice",
    price: 3,
    currency: "eur",
    mode: "payment" as const,   // one-time purchase
  },
  caster: {
    priceId: process.env.STRIPE_CASTER_PRICE_ID!,
    name: "Caster",
    price: 7,
    currency: "eur",
    mode: "subscription" as const,
  },
  wizard: {
    priceId: process.env.STRIPE_WIZARD_PRICE_ID!,
    name: "Wizard",
    price: 14,
    currency: "eur",
    mode: "subscription" as const,
  },
} as const;
