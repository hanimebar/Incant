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
  caster: {
    priceId: process.env.STRIPE_CASTER_PRICE_ID!,
    name: "Caster",
    price: 7,
    currency: "eur",
  },
  wizard: {
    priceId: process.env.STRIPE_WIZARD_PRICE_ID!,
    name: "Wizard",
    price: 14,
    currency: "eur",
  },
} as const;
