import { Suspense } from "react";
import { notFound } from "next/navigation";
import { createServiceClient } from "@/lib/supabase/server";
import SpellRenderer from "./SpellRenderer";
import type { Metadata } from "next";

interface Props {
  params: Promise<{ username: string; slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { username, slug } = await params;
  const supabase = createServiceClient();

  const { data: spell } = await supabase
    .from("spells")
    .select("name, config, profiles!inner(username)")
    .eq("slug", slug)
    .eq("profiles.username", username)
    .eq("is_public", true)
    .single();

  if (!spell) return { title: "Incant" };

  return {
    title: `${spell.name} — Incant`,
    description: (spell.config as { description?: string }).description || `A micro-app made with Incant`,
    openGraph: {
      title: spell.name,
      description: (spell.config as { description?: string }).description || "Cast with Incant",
      siteName: "Incant",
    },
  };
}

export default async function SpellPage({ params }: Props) {
  const { username, slug } = await params;
  const supabase = createServiceClient();

  const { data: spell } = await supabase
    .from("spells")
    .select("*, profiles!inner(username)")
    .eq("slug", slug)
    .eq("profiles.username", username)
    .single();

  if (!spell || (!spell.is_public)) {
    notFound();
  }

  // Increment view count (fire and forget)
  supabase
    .from("spells")
    .update({ view_count: spell.view_count + 1 })
    .eq("id", spell.id)
    .then(() => {});

  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50 flex items-center justify-center"><div className="text-gray-400">Loading...</div></div>}>
      <SpellRenderer spell={spell} />
    </Suspense>
  );
}
