import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/server";
import { getStripe, PLANS } from "@/lib/stripe";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { plan } = await req.json();
  if (!plan || !(plan in PLANS)) {
    return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
  }

  const stripe = getStripe();
  const service = createServiceClient();
  const { data: profile } = await service.from("profiles").select("stripe_customer_id").eq("id", user.id).single();

  let customerId = profile?.stripe_customer_id;
  if (!customerId) {
    const customer = await stripe.customers.create({
      email: user.email,
      metadata: { supabase_uid: user.id },
    });
    customerId = customer.id;
    await service.from("profiles").update({ stripe_customer_id: customerId }).eq("id", user.id);
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://incant.app";
  const selectedPlan = PLANS[plan as keyof typeof PLANS];

  const baseParams = {
    customer: customerId,
    line_items: [{ price: selectedPlan.priceId, quantity: 1 }],
    success_url: `${appUrl}/dashboard?upgraded=1`,
    cancel_url: `${appUrl}/pricing`,
    metadata: { supabase_uid: user.id, plan },
  };

  const session = selectedPlan.mode === "payment"
    ? await stripe.checkout.sessions.create({ ...baseParams, mode: "payment" })
    : await stripe.checkout.sessions.create({
        ...baseParams,
        mode: "subscription",
        subscription_data: { metadata: { supabase_uid: user.id, plan } },
      });

  return NextResponse.json({ url: session.url });
}
