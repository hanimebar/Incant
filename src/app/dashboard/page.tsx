import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/server";
import SpellbookClient from "./SpellbookClient";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Spellbook — Incant" };
export const runtime = "nodejs";

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/auth/login?redirect=/dashboard");

  const service = createServiceClient();

  const [{ data: profile }, { data: spells }] = await Promise.all([
    service.from("profiles").select("*").eq("id", user.id).single(),
    service.from("spells").select("*").eq("user_id", user.id).order("created_at", { ascending: false }),
  ]);

  return <SpellbookClient profile={profile} spells={spells || []} />;
}
