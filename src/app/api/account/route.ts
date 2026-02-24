import { NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { getStripe } from "@/lib/stripe";

export const runtime = "nodejs";

export async function DELETE() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const service = createServiceClient();

  // Cancel Stripe subscription if active
  const { data: profile } = await service
    .from("profiles")
    .select("stripe_subscription_id, stripe_customer_id")
    .eq("id", user.id)
    .single();

  if (profile?.stripe_subscription_id) {
    try {
      const stripe = getStripe();
      await stripe.subscriptions.cancel(profile.stripe_subscription_id);
    } catch {
      // Non-fatal — proceed with deletion
    }
  }

  // Delete all spells (cascade handles app_count trigger)
  await service.from("spells").delete().eq("user_id", user.id);

  // Delete profile (cascade from auth.users via trigger)
  await service.from("profiles").delete().eq("id", user.id);

  // Delete auth user
  await service.auth.admin.deleteUser(user.id);

  return NextResponse.json({ success: true });
}
