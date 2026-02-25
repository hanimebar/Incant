import { NextRequest, NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import { createServiceClient } from "@/lib/supabase/server";
import type Stripe from "stripe";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const stripe = getStripe();
  const body = await req.text();
  const sig = req.headers.get("stripe-signature")!;

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const service = createServiceClient();

  const updateTier = async (customerId: string, tier: "free" | "apprentice" | "caster" | "wizard", subscriptionId?: string) => {
    await service
      .from("profiles")
      .update({ tier, stripe_subscription_id: subscriptionId || null })
      .eq("stripe_customer_id", customerId);
  };

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      const plan = session.metadata?.plan as "apprentice" | "caster" | "wizard" | undefined;
      // One-time payments (apprentice) have no subscription; subscriptions have subId
      const subId = typeof session.subscription === "string" ? session.subscription : session.subscription?.id;
      if (session.customer && plan) {
        await updateTier(session.customer as string, plan, subId);
      }
      break;
    }

    case "customer.subscription.updated": {
      const sub = event.data.object as Stripe.Subscription;
      const plan = sub.metadata?.plan as "caster" | "wizard" | undefined;
      if (plan) {
        await updateTier(sub.customer as string, plan, sub.id);
      }
      break;
    }

    case "customer.subscription.deleted": {
      const sub = event.data.object as Stripe.Subscription;
      await updateTier(sub.customer as string, "free");
      break;
    }

    case "invoice.payment_failed": {
      const invoice = event.data.object as Stripe.Invoice;
      // Could send email here via Resend
      console.log("Payment failed for customer:", invoice.customer);
      break;
    }
  }

  return NextResponse.json({ received: true });
}
