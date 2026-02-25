import { redirect } from "next/navigation";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import TopNav from "@/components/TopNav";
import AccountClient from "./AccountClient";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Account — Incant" };
export const runtime = "nodejs";

export default async function AccountPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/auth/login?redirect=/account");

  const service = createServiceClient();
  const { data: profile } = await service
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  return (
    <>
      <TopNav variant="light" />
      <AccountClient profile={profile} />
    </>
  );
}
